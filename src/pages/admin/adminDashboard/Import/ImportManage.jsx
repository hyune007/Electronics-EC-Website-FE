import { Plus, Pencil, Trash2, Search, Package, TrendingUp, Loader2, Printer, FileDown, Eye, X, ArrowUpDown, Wallet } from "lucide-react";
import { useImportLogic } from "./ImportLogic";
import ImportForm from "./ImportForm";
import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { showToast } from "../../../../utils/adminToast";

export default function ImportManage() {
    const ip = useImportLogic();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.roleId === "ROLE_ADMIN";
    const isEmployee = user?.roleId === "ROLE_EMPLOYEE";
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [previewItem, setPreviewItem] = useState(null);
    const [previewHtml, setPreviewHtml] = useState("");
    const [sortBy, setSortBy] = useState("latest_date");
    const itemsPerPage = 12;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Theo BE security: ADMIN + EMPLOYEE
    if (!isAdmin && !isEmployee) {
        return <Navigate to="/unauthorized" replace />;
    }

        const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");
        const formatDateTime = () => new Date().toLocaleString("vi-VN");

    const listWithMetrics = useMemo(() => {
        return ip.filteredList.map((item) => {
            const unitPrice = Number(item?.sp_price || 0);
            const quantity = Number(item?.nk_quantity || 0);
            const value = unitPrice * quantity;
            return {
                ...item,
                nk_value: value,
                nk_tier: value >= 100000000 ? "vip" : value >= 30000000 ? "high" : "normal",
            };
        });
    }, [ip.filteredList]);

    const visibleList = useMemo(() => {
        const sorted = [...listWithMetrics].sort((a, b) => {
            if (sortBy === "latest_date") return new Date(b.nk_date) - new Date(a.nk_date);
            if (sortBy === "oldest_date") return new Date(a.nk_date) - new Date(b.nk_date);
            if (sortBy === "value_desc") return (b.nk_value || 0) - (a.nk_value || 0);
            if (sortBy === "qty_desc") return (b.nk_quantity || 0) - (a.nk_quantity || 0);
            return String(a.nk_id || "").localeCompare(String(b.nk_id || ""));
        });

        return sorted.map((item, index) => ({ ...item, rank: index + 1 }));
    }, [listWithMetrics, sortBy]);

    useEffect(() => {
        setCurrentPage(0);
    }, [ip.search, sortBy]);

    const stats = useMemo(() => {
        const totalReceipts = visibleList.length;
        const totalQty = visibleList.reduce((sum, item) => sum + Number(item.nk_quantity || 0), 0);
        const totalValue = visibleList.reduce((sum, item) => sum + Number(item.nk_value || 0), 0);

        return {
            totalReceipts,
            totalQty,
            totalValue,
        };
    }, [visibleList]);

    // Tính toán phân trang
    const totalPages = Math.max(1, Math.ceil(visibleList.length / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages - 1);
    const paginatedList = visibleList.slice(
        safeCurrentPage * itemsPerPage,
        (safeCurrentPage + 1) * itemsPerPage
    );

        const buildImportInvoiceHtml = (item) => {
                const unitPrice = Number(item?.sp_price || 0);
                const quantity = Number(item?.nk_quantity || 0);
                const total = unitPrice * quantity;
                const issuerName = user?.fullname || user?.name || user?.username || "Nhân viên kho";
                const safeImportId = String(item?.nk_id || "");

                return `
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <title>Phieu nhap ${safeImportId}</title>
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
                        .title {
                            text-align: right;
                        }
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
                            min-width: 95px;
                            font-weight: 600;
                        }
                        .content {
                            padding: 20px 24px 10px;
                        }
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
                                <p>Ma phieu: ${safeImportId}</p>
                                <p>Ngay nhap: ${item?.nk_date || ""}</p>
                                <p>Xuat luc: ${formatDateTime()}</p>
                            </div>
                        </div>

                        <div class="meta">
                            <div class="meta-item"><span>Nguoi lap:</span>${issuerName}</div>
                            <div class="meta-item"><span>Thuong hieu:</span>${item?.sp_brand || ""}</div>
                            <div class="meta-item"><span>Danh muc:</span>${item?.sp_category || ""}</div>
                            <div class="meta-item"><span>Ma SP:</span>${item?.sp_id || ""}</div>
                        </div>

                        <div class="content">
                            <table>
                                <thead>
                                    <tr>
                                        <th>San pham</th>
                                        <th class="center">So luong</th>
                                        <th class="right">Don gia</th>
                                        <th class="right">Thanh tien</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${item?.sp_name || ""}</td>
                                        <td class="center">${quantity}</td>
                                        <td class="right">${formatCurrency(unitPrice)} VND</td>
                                        <td class="right">${formatCurrency(total)} VND</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="summary">
                                <div class="summary-box">
                                    <div class="summary-row"><span>Tong so luong</span><span>${quantity}</span></div>
                                    <div class="summary-row total"><span>Tong gia tri nhap</span><span>${formatCurrency(total)} VND</span></div>
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

        const handlePrintImportInvoice = (item) => {
                const printWindow = window.open("", "_blank", "width=960,height=760");
                if (!printWindow) {
                        showToast("Không mở được cửa sổ in hóa đơn", "warning");
                        return;
                }

                const html = buildImportInvoiceHtml(item);
                printWindow.document.open();
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
        };

        const handleDownloadImportInvoice = async (item) => {
                const html = buildImportInvoiceHtml(item);
                const invoiceCode = String(item?.nk_id || "hoa-don-nhap").replace(/[^a-zA-Z0-9-_]/g, "-");
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
                        await new Promise((resolve) => setTimeout(resolve, 50));

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

                        pdf.save(`${invoiceCode}.pdf`);
                        showToast("Xuất PDF hóa đơn nhập thành công", "success");
                } catch (error) {
                        console.error("Failed to generate import invoice PDF:", error);
                        showToast("Xuất PDF hóa đơn nhập thất bại", "error");
                } finally {
                        document.body.removeChild(tempContainer);
                }
        };

            const handlePreviewImportInvoice = (item) => {
                setPreviewItem(item);
                setPreviewHtml(buildImportInvoiceHtml(item));
            };

            const closePreview = () => {
                setPreviewItem(null);
                setPreviewHtml("");
            };

    const handlePageChange = (page) => setCurrentPage(page);
    const handlePreviousPage = () => setCurrentPage(p => Math.max(0, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

    return (
        <div className={`import-manage fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Nhập Kho</h1>
                        <p className="text-neutral-600">Quản lý các phiếu nhập kho và theo dõi tồn kho</p>
                    </div>
                    <button 
                        onClick={ip.openAdd}
                        className="btn-primary flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Thêm Nhập Kho</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Phiếu Sau Lọc</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats.totalReceipts}</p>
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
                                <p className="text-2xl font-bold text-neutral-900">
                                    {formatCurrency(stats.totalQty)}
                                </p>
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
                                <p className="text-2xl font-bold text-neutral-900">
                                    {formatCurrency(stats.totalValue)} ₫
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Wallet className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
                    <div className="flex-1 search-box">
                        <Search className="text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo mã NK hoặc tên sản phẩm..."
                            value={ip.search}
                            onChange={(e) => ip.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
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
                            <option value="value_desc">Giá trị nhập cao nhất</option>
                            <option value="qty_desc">Số lượng nhiều nhất</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Mã NK
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Số lượng
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Đơn giá
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Thành tiền
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Ngày nhập
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {ip.loading && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="loading-spinner w-8 h-8 mr-3"></div>
                                            <span className="text-neutral-600">Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!ip.loading && paginatedList.map((i, index) => (
                                <tr key={i.nk_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-neutral-900 bg-neutral-100 px-2 py-1 rounded-lg">
                                            {i.nk_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            {i.sp_image ? (
                                                <img
                                                    src={i.sp_image}
                                                    alt={i.sp_name}
                                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-100"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                        const fallback = e.currentTarget.nextElementSibling;
                                                        if (fallback) fallback.style.display = "flex";
                                                    }}
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : null}

                                            <div
                                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center flex-shrink-0"
                                                style={{ display: i.sp_image ? "none" : "flex" }}
                                            >
                                                <Package className="text-neutral-400" size={18} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-neutral-900 truncate">{i.sp_name}</p>
                                                <p className="text-xs text-neutral-500 mt-1">Mã SP: {i.sp_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-semibold text-neutral-900">{i.nk_quantity}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-medium text-neutral-900">
                                            {i.sp_price ? i.sp_price.toLocaleString('vi-VN') : '0'} ₫
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-indigo-700">
                                            {formatCurrency(i.nk_value)} ₫
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-neutral-600">{i.nk_date}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handlePreviewImportInvoice(i)}
                                                className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                title="Xem trước hóa đơn"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => ip.openEdit(i)}
                                                className="p-2 text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => ip.handleDelete(i.nk_id)}
                                                disabled={ip.deletingId === i.nk_id}
                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Xóa"
                                            >
                                                {ip.deletingId === i.nk_id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!ip.loading && visibleList.length === 0 && (
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

            {/* Pagination */}
            {!ip.loading && visibleList.length > 0 && (
                <PaginationComponent
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={visibleList.length}
                    onPageChange={handlePageChange}
                    onPreviousPage={handlePreviousPage}
                    onNextPage={handleNextPage}
                    itemLabel="phiếu nhập"
                />
            )}

            {/* MODAL */}
            <ImportForm
                open={ip.openForm}
                onClose={() => ip.setOpenForm(false)}
                onSubmit={{
                    form: ip.form,
                    setForm: ip.setForm,
                    handleSubmit: ip.handleSubmit,
                    products: ip.products,
                    isSubmitting: ip.isSubmitting,
                }}
            />

            {previewItem && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
                    <div className="w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
                        <div className="h-16 px-6 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500">Xem trước hóa đơn nhập kho</p>
                                <h3 className="text-base font-semibold text-neutral-900">Phiếu {previewItem.nk_id}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownloadImportInvoice(previewItem)}
                                    className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                >
                                    <span className="inline-flex items-center gap-2"><FileDown size={16} />Tải PDF</span>
                                </button>
                                <button
                                    onClick={() => handlePrintImportInvoice(previewItem)}
                                    className="px-3 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
                                >
                                    <span className="inline-flex items-center gap-2"><Printer size={16} />In hóa đơn</span>
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
