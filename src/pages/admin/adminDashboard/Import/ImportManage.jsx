import { Plus, Search, Package, Calendar, TrendingUp, Eye, X, ArrowUpDown, Wallet, BarChart3, ChevronDown, ChevronRight, Trash2, Loader2, Pencil, Printer, FileDown } from "lucide-react";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { useImportLogic } from "./ImportLogic";
import ImportForm from "./ImportForm";
import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import { formatNumberVi, formatVnd } from "../../../../utils/currency";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { showToast } from "../../../../utils/adminToast";
import "./Import.css";

export default function ImportManage() {
    const ip = useImportLogic();
    const [mounted, setMounted] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.roleId === "ROLE_ADMIN";
    const isEmployee = user?.roleId === "ROLE_EMPLOYEE";

    const [currentPage, setCurrentPage] = useState(0);
    const [previewItem, setPreviewItem] = useState(null);
    const [previewHtml, setPreviewHtml] = useState("");
    const [sortBy, setSortBy] = useState("latest_date");
    const [dateFilter, setDateFilter] = useState("all");
    const [expandedDates, setExpandedDates] = useState({});
    const [selectedIds, setSelectedIds] = useState({});
    const fileInputRef = useRef(null);
    const addMenuRef = useRef(null);
    const itemsPerPage = 12;

    const selectedCount = useMemo(
        () => Object.values(selectedIds).filter(Boolean).length,
        [selectedIds]
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleOutside = (event) => {
            if (!addMenuRef.current?.contains(event.target)) {
                ip.setShowModeDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [ip.setShowModeDropdown]);

    if (!isAdmin && !isEmployee) {
        return <Navigate to="/unauthorized" replace />;
    }

    const formatCurrency = (value, options = {}) => formatVnd(value, options);
    const formatNumber = (value) => formatNumberVi(value);
    const formatDateTime = () => new Date().toLocaleString("vi-VN");

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    const isWithinDays = (dateStr, days) => {
        const raw = new Date(dateStr);
        if (Number.isNaN(raw.getTime())) return false;
        const date = new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
        const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days + 1);
        return date >= from;
    };

    const listWithMetrics = useMemo(() => {
        return ip.filteredList.map((item) => {
            const unitPrice = Number(item?.sp_price || 0);
            const quantity = Number(item?.nk_quantity || 0);
            return {
                ...item,
                nk_value: unitPrice * quantity,
            };
        });
    }, [ip.filteredList]);

    const groupedVisibleList = useMemo(() => {
        const filteredByDate = listWithMetrics.filter((item) => {
            if (dateFilter === "all") return true;
            if (dateFilter === "today") return item.nk_date === todayKey;
            if (dateFilter === "7d") return isWithinDays(item.nk_date, 7);
            if (dateFilter === "30d") return isWithinDays(item.nk_date, 30);
            return true;
        });

        const groupedMap = filteredByDate.reduce((acc, item) => {
            const key = item.nk_date || todayKey;
            if (!acc[key]) {
                acc[key] = {
                    nk_date: key,
                    items: [],
                    totalQty: 0,
                    totalValue: 0,
                    receiptCount: 0,
                    productNames: new Set(),
                };
            }

            acc[key].items.push(item);
            acc[key].totalQty += Number(item.nk_quantity || 0);
            acc[key].totalValue += Number(item.nk_value || 0);
            acc[key].receiptCount += 1;
            if (item.sp_name) acc[key].productNames.add(item.sp_name);
            return acc;
        }, {});

        const grouped = Object.values(groupedMap).map((group) => {
            const names = Array.from(group.productNames);
            const shortNames = names.slice(0, 2).join(", ");
            const extra = names.length > 2 ? ` +${names.length - 2}` : "";
            return {
                ...group,
                productSummary: shortNames + extra,
            };
        });

        const sorted = [...grouped].sort((a, b) => {
            if (sortBy === "latest_date") return new Date(b.nk_date) - new Date(a.nk_date);
            if (sortBy === "oldest_date") return new Date(a.nk_date) - new Date(b.nk_date);
            if (sortBy === "value_desc") return (b.totalValue || 0) - (a.totalValue || 0);
            if (sortBy === "value_asc") return (a.totalValue || 0) - (b.totalValue || 0);
            if (sortBy === "qty_desc") return (b.totalQty || 0) - (a.totalQty || 0);
            if (sortBy === "qty_asc") return (a.totalQty || 0) - (b.totalQty || 0);
            return String(a.nk_date || "").localeCompare(String(b.nk_date || ""));
        });

        return sorted.map((item, index) => ({ ...item, rank: index + 1 }));
    }, [listWithMetrics, dateFilter, sortBy, todayKey]);

    useEffect(() => {
        setCurrentPage(0);
    }, [ip.search, dateFilter, sortBy]);

    const stats = useMemo(() => {
        const totalDays = groupedVisibleList.length;
        const totalQty = groupedVisibleList.reduce((sum, item) => sum + Number(item.totalQty || 0), 0);
        const totalValue = groupedVisibleList.reduce((sum, item) => sum + Number(item.totalValue || 0), 0);
        const todayValue = groupedVisibleList
            .filter((item) => item.nk_date === todayKey)
            .reduce((sum, item) => sum + Number(item.totalValue || 0), 0);
        const avgValue = totalDays > 0 ? Math.round(totalValue / totalDays) : 0;

        return {
            totalDays,
            totalQty,
            totalValue,
            todayValue,
            avgValue,
        };
    }, [groupedVisibleList, todayKey]);

    const totalPages = Math.max(1, Math.ceil(groupedVisibleList.length / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages - 1);
    const paginatedList = groupedVisibleList.slice(
        safeCurrentPage * itemsPerPage,
        (safeCurrentPage + 1) * itemsPerPage
    );

    const buildImportInvoiceHtml = (group) => {
        const issuerName = user?.fullname || user?.name || user?.username || "Nhân viên kho";
        const safeDate = String(group?.nk_date || "");
        const rows = Array.isArray(group?.items) ? group.items : [];
        const creators = Array.from(new Set(rows.map((item) => item.nk_creator).filter(Boolean)));
        const rowsHtml = rows
            .map((item) => {
                const unitPrice = Number(item?.sp_price || 0);
                const quantity = Number(item?.nk_quantity || 0);
                const total = unitPrice * quantity;
                return `
                    <tr>
                        <td>${item?.nk_id || ""}</td>
                        <td>${item?.sp_name || ""}</td>
                        <td>${item?.nk_creator || "-"}</td>
                        <td class="center">${formatNumber(quantity)}</td>
                        <td class="right">${formatCurrency(unitPrice)}</td>
                        <td class="right">${formatCurrency(total)}</td>
                    </tr>
                `;
            })
            .join("");

        return `
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <title>Phieu nhap ngay ${safeDate}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            margin: 0;
                            padding: 28px;
                            font-family: Arial, sans-serif;
                            background: radial-gradient(circle at 15% 10%, #eff6ff 0%, #f8fafc 35%, #ffffff 100%);
                            color: #111827;
                        }
                        .invoice {
                            width: 760px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 18px;
                            border: 1px solid #dbeafe;
                            overflow: hidden;
                            box-shadow: 0 18px 40px rgba(30, 64, 175, 0.12);
                        }
                        .header {
                            padding: 24px;
                            border-bottom: 1px solid #dbeafe;
                            display: flex;
                            justify-content: space-between;
                            gap: 24px;
                            background: linear-gradient(120deg, #eff6ff 0%, #ecfeff 100%);
                        }
                        .brand h2 { margin: 0; font-size: 21px; letter-spacing: 0.3px; }
                        .brand p { margin: 8px 0 0; color: #475569; }
                        .tag {
                            margin-top: 10px;
                            display: inline-flex;
                            padding: 5px 10px;
                            border-radius: 999px;
                            background: #dbeafe;
                            color: #1d4ed8;
                            font-size: 11px;
                            font-weight: 700;
                        }
                        .title { text-align: right; }
                        .title h1 {
                            margin: 0;
                            font-size: 24px;
                            color: #0f172a;
                            letter-spacing: 0.6px;
                        }
                        .title p {
                            margin: 6px 0 0;
                            color: #374151;
                            font-size: 13px;
                        }
                        .meta {
                            padding: 16px 24px;
                            background: #ffffff;
                            border-bottom: 1px solid #e2e8f0;
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px 24px;
                            font-size: 14px;
                        }
                        .meta-item span {
                            color: #6b7280;
                            display: inline-block;
                            min-width: 110px;
                            font-weight: 600;
                        }
                        .content { padding: 20px 24px 10px; }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            overflow: hidden;
                            border-radius: 12px;
                        }
                        th, td {
                            border: 1px solid #e2e8f0;
                            padding: 11px;
                            text-align: left;
                            font-size: 13px;
                        }
                        th {
                            background: #f1f5f9;
                            color: #0f172a;
                            font-weight: 700;
                        }
                        .right { text-align: right; }
                        .center { text-align: center; }
                        .summary {
                            margin-top: 14px;
                            display: flex;
                            justify-content: flex-end;
                        }
                        .summary-box {
                            width: 280px;
                            border: 1px solid #dbeafe;
                            border-radius: 10px;
                            overflow: hidden;
                        }
                        .summary-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 12px;
                            border-bottom: 1px solid #e2e8f0;
                            font-size: 13px;
                        }
                        .summary-row:last-child { border-bottom: none; }
                        .summary-row.total {
                            background: #eff6ff;
                            font-weight: 700;
                            color: #1d4ed8;
                        }
                        .note {
                            margin-top: 12px;
                            font-size: 12px;
                            color: #64748b;
                        }
                        .footer {
                            padding: 16px 24px 24px;
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                            color: #4b5563;
                            font-size: 13px;
                            gap: 18px;
                            border-top: 1px dashed #cbd5e1;
                            background: #f8fafc;
                        }
                        .sign {
                            text-align: center;
                            min-width: 220px;
                        }
                        .sign-line {
                            margin-top: 48px;
                            border-top: 1px solid #9ca3af;
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice">
                        <div class="header">
                            <div class="brand">
                                <h2>Electronics EC</h2>
                                <p>Phieu nhap kho noi bo</p>
                                <div class="tag">WAREHOUSE RECEIPT</div>
                            </div>
                            <div class="title">
                                <h1>HOA DON NHAP KHO</h1>
                                <p>Theo ngay: ${safeDate}</p>
                                <p>So phieu: ${group?.receiptCount || 0}</p>
                                <p>Xuat luc: ${formatDateTime()}</p>
                            </div>
                        </div>

                        <div class="meta">
                            <div class="meta-item"><span>Nguoi xuat:</span>${issuerName}</div>
                            <div class="meta-item"><span>Nguoi tao phieu:</span>${creators.join(", ") || "-"}</div>
                            <div class="meta-item"><span>Tong mat hang:</span>${rows.length}</div>
                        </div>

                        <div class="content">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ma NK</th>
                                        <th>San pham</th>
                                        <th>Nguoi tao</th>
                                        <th class="center">So luong</th>
                                        <th class="right">Don gia</th>
                                        <th class="right">Thanh tien</th>
                                    </tr>
                                </thead>
                                <tbody>${rowsHtml}</tbody>
                            </table>

                            <div class="summary">
                                <div class="summary-box">
                                    <div class="summary-row"><span>Tong so luong</span><span>${formatNumber(group?.totalQty || 0)}</span></div>
                                    <div class="summary-row total"><span>Tong gia tri nhap</span><span>${formatCurrency(group?.totalValue || 0, { withText: true })}</span></div>
                                </div>
                            </div>
                            <div class="note">Ghi chu: Phieu nay duoc tao tu he thong quan ly kho, dung cho doi soat noi bo.</div>
                        </div>

                        <div class="footer">
                            <div>Hoa don duoc xuat tu he thong quan ly kho.</div>
                            <div class="sign">
                                Nguoi lap phieu
                                <div class="sign-line"></div>
                                <div>${issuerName}</div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `;
    };

    const handlePreviewImportInvoice = (group) => {
        setPreviewItem(group);
        setPreviewHtml(buildImportInvoiceHtml(group));
    };

    const handlePrintImportInvoice = (group) => {
        const printWindow = window.open("", "_blank", "width=960,height=760");
        if (!printWindow) {
            showToast("Không mở được cửa sổ in hóa đơn", "warning");
            return;
        }

        const html = buildImportInvoiceHtml(group);
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleDownloadImportInvoice = async (group) => {
        const html = buildImportInvoiceHtml(group);
        const invoiceCode = String(group?.nk_date || "hoa-don-nhap").replace(/[^a-zA-Z0-9-_]/g, "-");
        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
        const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i);

        if (!styleMatch || !bodyMatch) {
            showToast("Không tạo được dữ liệu hóa đơn", "error");
            return;
        }

        const tempContainer = document.createElement("div");
        tempContainer.style.position = "fixed";
        tempContainer.style.left = "-10000px";
        tempContainer.style.top = "0";
        tempContainer.style.width = "794px";
        tempContainer.style.background = "#ffffff";
        tempContainer.style.zIndex = "-1";
        tempContainer.innerHTML = `<style>${styleMatch[1]}</style>${bodyMatch[1]}`;

        document.body.appendChild(tempContainer);

        try {
            await new Promise((resolve) => setTimeout(resolve, 60));

            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imageData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imageWidth = pageWidth;
            const imageHeight = (canvas.height * imageWidth) / canvas.width;

            let remainingHeight = imageHeight;
            let y = 0;

            pdf.addImage(imageData, "PNG", 0, y, imageWidth, imageHeight);
            remainingHeight -= pageHeight;

            while (remainingHeight > 0) {
                y = remainingHeight - imageHeight;
                pdf.addPage();
                pdf.addImage(imageData, "PNG", 0, y, imageWidth, imageHeight);
                remainingHeight -= pageHeight;
            }

            pdf.save(`hoa-don-nhap-${invoiceCode}.pdf`);
            showToast("Xuất PDF hóa đơn nhập thành công", "success");
        } catch (error) {
            console.error("Failed to generate import invoice PDF:", error);
            showToast("Xuất PDF hóa đơn nhập thất bại", "error");
        } finally {
            document.body.removeChild(tempContainer);
        }
    };

    const closePreview = () => {
        setPreviewItem(null);
        setPreviewHtml("");
    };

    const handlePageChange = (page) => setCurrentPage(page);
    const handlePreviousPage = () => setCurrentPage((p) => Math.max(0, p - 1));
    const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
    const toggleDateExpand = (dateKey) => {
        setExpandedDates((prev) => ({
            ...prev,
            [dateKey]: !prev[dateKey],
        }));
    };

    const toggleSelectItem = (importId) => {
        setSelectedIds((prev) => ({
            ...prev,
            [importId]: !prev[importId],
        }));
    };

    const toggleSelectDateItems = (items, shouldSelect) => {
        setSelectedIds((prev) => {
            const next = { ...prev };
            items.forEach((item) => {
                if (!item?.nk_id) return;
                next[item.nk_id] = shouldSelect;
            });
            return next;
        });
    };

    const clearSelectedIds = () => setSelectedIds({});

    const handleBulkDeleteSelected = async () => {
        const ids = Object.keys(selectedIds).filter((id) => selectedIds[id]);
        const result = await ip.handleBulkDelete(ids);
        if (result.successIds.length > 0) {
            setSelectedIds((prev) => {
                const next = { ...prev };
                result.successIds.forEach((id) => {
                    delete next[id];
                });
                return next;
            });
        }
    };

    const onPickFile = () => {
        if (ip.isImportingFile) return;
        fileInputRef.current?.click();
    };

    const onSelectedFile = async (file) => {
        if (!file) return;
        const ok = await ip.handleBulkImportFile(
            file,
            user?.fullname || user?.name || user?.username || "Nhân viên kho"
        );
        if (ok) {
            setShowImportModal(false);
            setIsDraggingFile(false);
        }
    };

    const onDropFile = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingFile(false);

        const file = event.dataTransfer?.files?.[0];
        await onSelectedFile(file);
    };

    return (
        <div className={`import-page fade-in min-h-full ${mounted ? "slide-up" : ""}`}>
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Nhập Kho</h1>
                        <p className="text-neutral-600">Quản lý các phiếu nhập kho và theo dõi tồn kho</p>
                    </div>
                    <div className="add-product-actions" ref={addMenuRef}>
                        <button
                            type="button"
                            onClick={() => ip.setShowModeDropdown((s) => !s)}
                            className="btn-primary shadow-lg"
                            title="Thêm nhập kho"
                        >
                            <Plus size={18} />
                            Thêm nhập kho
                            <ChevronDown size={16} />
                        </button>
                        
                        {ip.showModeDropdown && (
                            <div className="add-menu-dropdown">
                                <button
                                    type="button"
                                    onClick={() => {
                                        ip.setImportMode("single");
                                        ip.setShowModeDropdown(false);
                                        ip.openAdd();
                                    }}
                                    className="add-menu-item"
                                >
                                    <Plus size={16} />
                                    Thêm 1 phiếu (form)
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => {
                                        ip.setShowModeDropdown(false);
                                        setShowImportModal(true);
                                    }}
                                    className="add-menu-item"
                                >
                                    <FileDown size={16} />
                                    Thêm nhiều phiếu bằng file
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    className="hidden"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            await onSelectedFile(file);
                        }
                        e.target.value = "";
                    }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Ngày Sau Lọc</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats.totalDays}</p>
                                <p className="text-xs text-neutral-500 mt-1">Số ngày theo bộ lọc</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Package className="text-indigo-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Số Lượng</p>
                                <p className="text-2xl font-bold text-neutral-900">{formatNumber(stats.totalQty)}</p>
                                <p className="text-xs text-neutral-500 mt-1">Đơn vị sản phẩm</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Giá Trị Nhập</p>
                                <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalValue, { withText: true })}</p>
                                <p className="text-xs text-neutral-500 mt-1">Trung bình: {formatCurrency(stats.avgValue)}/ngày</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Wallet className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Giá Trị Nhập Hôm Nay</p>
                                <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.todayValue)}</p>
                                <p className="text-xs text-neutral-500 mt-1">Ngày {todayKey}</p>
                            </div>
                            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                <BarChart3 className="text-cyan-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-6 mb-6">
                <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
                    <div className="flex-1 search-box">
                        <Search className="text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo mã NK, tên sản phẩm..."
                            value={ip.search}
                            onChange={(e) => ip.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleBulkDeleteSelected}
                            disabled={selectedCount === 0 || ip.isBulkDeleting}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-200 rounded-xl bg-red-50 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {ip.isBulkDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            {selectedCount > 0 ? `Xóa đã chọn (${selectedCount})` : "Xóa đã chọn"}
                        </button>

                        <div className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-xl bg-white">
                            <Calendar size={16} className="text-neutral-500" />
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-transparent text-sm text-neutral-700 outline-none"
                            >
                                <option value="all">Tất cả thời gian</option>
                                <option value="today">Hôm nay</option>
                                <option value="7d">7 ngày gần đây</option>
                                <option value="30d">30 ngày gần đây</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-xl bg-white">
                            <ArrowUpDown size={16} className="text-neutral-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-sm text-neutral-700 outline-none"
                            >
                                <option value="latest_date">Ngày nhập mới nhất</option>
                                <option value="oldest_date">Ngày nhập cũ nhất</option>
                                <option value="value_desc">Giá trị nhập giảm dần</option>
                                <option value="value_asc">Giá trị nhập tăng dần</option>
                                <option value="qty_desc">Số lượng giảm dần</option>
                                <option value="qty_asc">Số lượng tăng dần</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="px-4 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Ngày nhập</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Phiếu nhập</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Mặt hàng</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Tổng số lượng</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">Giá Trị Nhập</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Số phiếu</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {ip.loading && groupedVisibleList.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="loading-spinner w-8 h-8 mr-3"></div>
                                            <span className="text-neutral-600">Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {paginatedList.map((i, index) => {
                                const isExpanded = !!expandedDates[i.nk_date];

                                return (
                                    <Fragment key={i.nk_date}>
                                        <tr className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center justify-center min-w-7 h-7 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                                                    {i.rank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleDateExpand(i.nk_date)}
                                                    className="inline-flex items-center gap-2 font-mono text-sm text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg transition-colors"
                                                    title="Mở/đóng danh sách phiếu theo ngày"
                                                >
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    <span>{i.nk_date}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-neutral-900">{i.receiptCount} phiếu</p>
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        {i.items.map((x) => x.nk_id).slice(0, 3).join(", ")}
                                                        {i.receiptCount > 3 ? " ..." : ""}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-neutral-700">{i.productSummary || "-"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-semibold text-neutral-900">{formatNumber(i.totalQty)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-indigo-700">{formatCurrency(i.totalValue)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="badge-primary">{i.receiptCount}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handlePreviewImportInvoice(i)}
                                                        className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                        title="Xem phiếu theo ngày"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr className="bg-neutral-50/70">
                                                <td colSpan="8" className="px-6 py-4">
                                                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-sm font-semibold text-neutral-900">Danh sách sản phẩm/phiếu ngày {i.nk_date}</p>
                                                            <div className="flex items-center gap-2">
                                                                <label className="inline-flex items-center gap-2 text-xs text-neutral-600 px-2 py-1 rounded-lg border border-neutral-200">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={i.items.length > 0 && i.items.every((item) => selectedIds[item.nk_id])}
                                                                        onChange={(e) => toggleSelectDateItems(i.items, e.target.checked)}
                                                                    />
                                                                    Chọn cả ngày
                                                                </label>
                                                                <button
                                                                    onClick={() => ip.openAddByDate(i.nk_date)}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                                                                >
                                                                    <Plus size={14} />
                                                                    Thêm
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {i.items.map((item) => {
                                                                const isDeleting = ip.deletingId === item.nk_id;
                                                                return (
                                                                    <div key={item.nk_id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200">
                                                                        <div className="flex items-start gap-3 min-w-0">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!selectedIds[item.nk_id]}
                                                                                onChange={() => toggleSelectItem(item.nk_id)}
                                                                                className="mt-0.5"
                                                                            />
                                                                            <div className="min-w-0">
                                                                            <p className="text-sm font-medium text-neutral-900">{item.sp_name}</p>
                                                                            <p className="text-xs text-neutral-500 mt-1">
                                                                                Mã NK: {item.nk_id} | Danh mục: {item.sp_category || "-"} | Hãng: {item.sp_brand || "-"}
                                                                            </p>
                                                                            <p className="text-xs text-neutral-500 mt-1">
                                                                                Người tạo: {item.nk_creator || "-"}
                                                                            </p>
                                                                            <p className="text-xs text-neutral-500 mt-1">
                                                                                SL: {formatNumber(item.nk_quantity)} | Đơn giá: {formatCurrency(item.sp_price || 0)} | Giá trị: {formatCurrency(item.nk_value)}
                                                                            </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => ip.openEdit(item)}
                                                                                className="p-2 text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                                                                title="Chỉnh sửa phiếu này"
                                                                            >
                                                                                <Pencil size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => ip.handleDelete(item.nk_id)}
                                                                                disabled={isDeleting}
                                                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                title="Xóa phiếu này"
                                                                            >
                                                                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {selectedCount > 0 && (
                                                            <div className="mt-3 flex items-center justify-between text-xs text-neutral-600">
                                                                <span>Đang chọn {selectedCount} phiếu</span>
                                                                <button
                                                                    onClick={clearSelectedIds}
                                                                    className="px-2 py-1 rounded border border-neutral-200 hover:bg-neutral-50"
                                                                >
                                                                    Bỏ chọn
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}

                            {!ip.loading && groupedVisibleList.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Package className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có dữ liệu nhập kho</h3>
                                            <p className="text-neutral-600">Bắt đầu bằng cách thêm phiếu nhập kho đầu tiên</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!ip.loading && groupedVisibleList.length > 0 && (
                <PaginationComponent
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={groupedVisibleList.length}
                    onPageChange={handlePageChange}
                    onPreviousPage={handlePreviousPage}
                    onNextPage={handleNextPage}
                    itemLabel="ngày nhập"
                />
            )}

            {/* ImportForm với dual-mode */}
            <ImportForm
                open={ip.openForm && ip.importMode === "single"}
                onClose={() => ip.setOpenForm(false)}
                onSubmit={{
                    form: ip.form,
                    setForm: ip.setForm,
                    editing: ip.editing,
                    handleSubmit: () => ip.handleSubmit(user?.fullname || user?.name || user?.username || "Nhân viên kho"),
                    products: ip.products,
                    isSubmitting: ip.isSubmitting,
                    groupedByDateMap: ip.groupedByDateMap,
                }}
            />

            {showImportModal && (
                <div
                    className="import-modal-backdrop"
                    onClick={() => {
                        if (!ip.isImportingFile) {
                            setShowImportModal(false);
                            setIsDraggingFile(false);
                        }
                    }}
                >
                    <div
                        className="import-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="import-modal-header">
                            <div>
                                <h3>Nhập file nhập kho</h3>
                                <p>Hỗ trợ .xlsx, .xls, .csv, .json. Khuyên dùng file mẫu .xlsx.</p>
                            </div>
                            <button
                                type="button"
                                className="import-close-btn"
                                onClick={() => {
                                    if (!ip.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={ip.isImportingFile}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="import-modal-hero">
                            <p>
                                Tải file mẫu để có sẵn cột chuẩn, mã phiếu kế tiếp và mã sản phẩm có thể import ngay.
                            </p>
                            <div className="import-field-tags">
                                <span>Mã phiếu nhập</span>
                                <span>Mã sản phẩm</span>
                                <span>Tên sản phẩm</span>
                                <span>Số lượng nhập</span>
                                <span>Ngày nhập</span>
                                <span>Ghi chú</span>
                            </div>
                        </div>

                        <div
                            className={`import-dropzone ${isDraggingFile ? "dragging" : ""} ${ip.isImportingFile ? "disabled" : ""}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (!ip.isImportingFile) {
                                    setIsDraggingFile(true);
                                }
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDraggingFile(false);
                            }}
                            onDrop={onDropFile}
                        >
                            {ip.isImportingFile ? (
                                <>
                                    <Loader2 size={28} className="animate-spin" />
                                    <p>Đang import file, vui lòng chờ...</p>
                                </>
                            ) : (
                                <>
                                    <Upload size={28} />
                                    <p>Kéo thả file vào đây hoặc chọn file từ máy</p>
                                    <small>File mẫu tải về có thể dùng để add mới ngay.</small>
                                    <button
                                        type="button"
                                        className="import-action-btn"
                                        onClick={onPickFile}
                                    >
                                        <FileSpreadsheet size={16} />
                                        Chọn file để import
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="import-modal-actions">
                            <button
                                type="button"
                                className="import-template-btn"
                                onClick={ip.downloadTemplate}
                                disabled={ip.isImportingFile}
                            >
                                <Download size={16} />
                                Tải file mẫu
                            </button>

                            <button
                                type="button"
                                className="import-cancel-btn"
                                onClick={() => {
                                    if (!ip.isImportingFile) {
                                        setShowImportModal(false);
                                        setIsDraggingFile(false);
                                    }
                                }}
                                disabled={ip.isImportingFile}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewItem && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
                    <div className="w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
                        <div className="h-16 px-6 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500">Xem trước hóa đơn nhập kho theo ngày</p>
                                <h3 className="text-base font-semibold text-neutral-900">Ngày {previewItem.nk_date}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownloadImportInvoice(previewItem)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                                    title="Tải hóa đơn PDF"
                                >
                                    <FileDown size={16} />
                                    Tải
                                </button>
                                <button
                                    onClick={() => handlePrintImportInvoice(previewItem)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                                    title="In hóa đơn"
                                >
                                    <Printer size={16} />
                                    In
                                </button>
                                <button
                                    onClick={closePreview}
                                    className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                    title="Đóng"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <iframe
                            title="Import Invoice Preview"
                            srcDoc={previewHtml}
                            className="w-full h-[calc(88vh-64px)] bg-white"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
