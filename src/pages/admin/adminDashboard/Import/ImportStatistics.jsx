import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  TrendingUp,
  Calendar,
  DollarSign,
  Search,
  Download,
  FileText,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAllImports } from "../../../../services/importService.js";
import TablePagination from "../../../../components/admin/analytics/TablePagination.jsx";

const PIE_COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
const DEFAULT_TOP_PRODUCT_PAGE_SIZE = 6;
const DEFAULT_DETAIL_PAGE_SIZE = 10;

function shortName(value, max = 16) {
  const text = String(value || "").trim();
  if (!text) return "N/A";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function formatVND(value) {
  const num = Number(value || 0);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

export default function ImportStatistics({ imports }) {
  const [keyword, setKeyword] = useState("");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [topProductPage, setTopProductPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);
  const [topProductPageSize, setTopProductPageSize] = useState(DEFAULT_TOP_PRODUCT_PAGE_SIZE);
  const [detailPageSize, setDetailPageSize] = useState(DEFAULT_DETAIL_PAGE_SIZE);

  const now = new Date();

  const validImports = useMemo(() => (Array.isArray(imports) ? imports : []), [imports]);

  const filteredImports = useMemo(() => {
    const q = keyword.toLowerCase().trim();
    if (!q) return validImports;

    return validImports.filter((item) => (
      String(item?.nk_id || "").toLowerCase().includes(q)
      || String(item?.sp_name || "").toLowerCase().includes(q)
      || String(item?.sp_brand || "").toLowerCase().includes(q)
      || String(item?.sp_category || "").toLowerCase().includes(q)
    ));
  }, [validImports, keyword]);

  const stats = useMemo(() => {
    const totalRecords = filteredImports.length;
    const uniqueDates = new Set(filteredImports.map((item) => item.nk_date));
    const totalDays = uniqueDates.size;

    const totalQty = filteredImports.reduce((sum, item) => sum + Number(item.nk_quantity || 0), 0);
    const totalValue = filteredImports.reduce((sum, item) => {
      const unitPrice = Number(item.sp_price || 0);
      const qty = Number(item.nk_quantity || 0);
      return sum + unitPrice * qty;
    }, 0);

    const avgValuePerDay = totalDays > 0 ? Math.round(totalValue / totalDays) : 0;

    return {
      totalRecords,
      totalDays,
      totalQty,
      totalValue,
      avgValuePerDay,
    };
  }, [filteredImports]);

  const topProductsByQty = useMemo(() => {
    const map = {};
    filteredImports.forEach((item) => {
      const key = String(item.sp_name || "");
      if (!key) return;
      if (!map[key]) {
        map[key] = { name: key, quantity: 0, totalValue: 0 };
      }
      const qty = Number(item.nk_quantity || 0);
      const value = qty * Number(item.sp_price || 0);
      map[key].quantity += qty;
      map[key].totalValue += value;
    });

    return Object.values(map)
      .sort((a, b) => b.quantity - a.quantity);
  }, [filteredImports]);

  const topProductChartData = useMemo(() => {
    return topProductsByQty.map((item) => ({
      name: shortName(item.name, 14),
      sl: item.quantity,
    }));
  }, [topProductsByQty]);

  const valueByBrand = useMemo(() => {
    const map = {};
    filteredImports.forEach((item) => {
      const brand = String(item.sp_brand || "Khong co hang");
      if (!map[brand]) {
        map[brand] = 0;
      }
      const value = Number(item.nk_quantity || 0) * Number(item.sp_price || 0);
      map[brand] += value;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredImports]);

  const valueByCategory = useMemo(() => {
    const map = {};
    filteredImports.forEach((item) => {
      const category = String(item.sp_category || "Khong co danh muc");
      if (!map[category]) {
        map[category] = 0;
      }
      const value = Number(item.nk_quantity || 0) * Number(item.sp_price || 0);
      map[category] += value;
    }, {});

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredImports]);

  const detailRows = useMemo(() => {
    return [...filteredImports]
      .sort((a, b) => {
        const dateA = new Date(a.nk_date || "").getTime();
        const dateB = new Date(b.nk_date || "").getTime();
        return dateB - dateA;
      });
  }, [filteredImports]);

  const pagedTopProducts = useMemo(() => {
    const start = (topProductPage - 1) * topProductPageSize;
    return topProductsByQty.slice(start, start + topProductPageSize);
  }, [topProductPage, topProductsByQty, topProductPageSize]);

  const pagedDetailRows = useMemo(() => {
    const start = (detailPage - 1) * detailPageSize;
    return detailRows.slice(start, start + detailPageSize);
  }, [detailPage, detailRows, detailPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(topProductsByQty.length / topProductPageSize));
    if (topProductPage > totalPages) {
      setTopProductPage(totalPages);
    }
  }, [topProductPage, topProductsByQty.length, topProductPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(detailRows.length / detailPageSize));
    if (detailPage > totalPages) {
      setDetailPage(totalPages);
    }
  }, [detailPage, detailRows.length, detailPageSize]);

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");

    const summaryRows = [
      ["", "BAO CAO THONG KE NHAP KHO"],
      ["", `Thoi gian xuat: ${now.toLocaleString("vi-VN")}`],
      ["", ""],
      ["", "Tong phieu nhap", stats.totalRecords],
      ["", "Tong ngay nhap", stats.totalDays],
      ["", "Tong so luong nhap", stats.totalQty],
      ["", "Tong gia tri nhap", `${stats.totalValue.toLocaleString("vi-VN")} VND`],
      ["", "Gia tri trung binh/ngay", `${stats.avgValuePerDay.toLocaleString("vi-VN")} VND`],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 5 }, { wch: 38 }, { wch: 28 }];

    const detailExportRows = filteredImports.map((item, index) => {
      const unitPrice = Number(item.sp_price || 0);
      const qty = Number(item.nk_quantity || 0);
      const totalValue = unitPrice * qty;

      return {
        STT: index + 1,
        MaNhapKho: item.nk_id,
        SanPham: item.sp_name,
        Brand: item.sp_brand || "N/A",
        DanhMuc: item.sp_category || "N/A",
        SoLuong: qty,
        GiaNhap: unitPrice,
        TongGiaTri: totalValue,
        NgayNhap: item.nk_date,
        NguoiTao: item.nk_creator || "N/A",
      };
    });

    const detailSheet = XLSX.utils.json_to_sheet(detailExportRows);
    detailSheet["!cols"] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 32 },
      { wch: 15 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "TONG_QUAN");
    XLSX.utils.book_append_sheet(workbook, detailSheet, "CHI_TIET_NHAP_KHO");
    XLSX.writeFile(
      workbook,
      `ThongKe_NhapKho_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.xlsx`,
    );
  };

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("import-statistics-pdf");
    if (!reportElement) return;

    setIsExportingPDF(true);
    try {
      const dataUrl = await toPng(reportElement, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let position = 0;
      let heightLeft = pdfHeight;

      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ThongKe_NhapKho_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.pdf`);
    } catch (error) {
      console.error("Loi xuat PDF thong ke nhap kho:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div id="import-statistics-pdf" className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 uppercase">Trung Tâm Thống Kê Nhập Kho</h2>
          <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100"><Package size={14}/> Lịch Sử Nhập Hàng</span>
            <span>Cập nhật lịch sử nhập kho, giá trị hàng hóa và quản lý tồn kho.</span>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportMenuOpen((s) => !s)}
            disabled={isExportingPDF}
            className={`bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 px-4 h-[38px] rounded shadow-sm text-[13px] font-semibold transition-colors border border-slate-900 ${isExportingPDF ? 'opacity-70 cursor-wait' : ''}`}
          >
            <FileText size={15} />
            <span className="hidden sm:inline">{isExportingPDF ? "Dang ket xuat..." : "Trich xuat Bao Cao"}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded shadow-lg z-50 overflow-hidden py-1">
              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  handleExportPDF();
                }}
                disabled={isExportingPDF}
                className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2 disabled:opacity-60"
              >
                {isExportingPDF ? <Loader2 size={15} className="animate-spin text-slate-500" /> : <FileText size={15} className="text-slate-500" />}
                PDF (Giao dien Quan ly)
              </button>
              <div className="h-[1px] bg-slate-100 mx-2"></div>
              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  handleExportExcel();
                }}
                className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Download size={15} className="text-slate-500" />
                Excel (Data Tho Xu Ly)
              </button>
            </div>
          )}

          {isExportMenuOpen && (
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsExportMenuOpen(false)}
            ></div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full lg:max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo sản phẩm, hãng, danh mục..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-sky-50 to-white">
          <p className="text-sm text-slate-500">Tong phieu nhap</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalRecords}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Package size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-sm text-slate-500">Tong ngay nhap</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalDays}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Calendar size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-white">
          <p className="text-sm text-slate-500">Tong so luong</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalQty.toLocaleString("vi-VN")}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-fuchsia-50 to-white">
          <p className="text-sm text-slate-500">Tong gia tri (VND)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatVND(stats.totalValue)}</p>
          <p className="text-xs text-slate-500 mt-1">{(stats.totalValue / 1000000).toFixed(1)}M</p>
          <div className="mt-2 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-rose-50 to-white">
          <p className="text-sm text-slate-500">Gia tri TB/ngay</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatVND(stats.avgValuePerDay)}</p>
          <p className="text-xs text-slate-500 mt-1">{(stats.avgValuePerDay / 1000000).toFixed(1)}M</p>
          <div className="mt-2 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <DollarSign size={18} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-300 bg-white p-4">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Top san pham nhap nhieu nhat</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sl" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white p-4">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Ty le gia tri nhap theo hang</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={valueByBrand}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  label
                >
                  {valueByBrand.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-300 bg-white p-4">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Gia tri nhap theo danh muc</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={valueByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  label
                >
                  {valueByCategory.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-300 bg-slate-50">
            <h3 className="text-base font-semibold text-slate-900">Top san pham nhap theo gia tri</h3>
          </div>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left border-b border-slate-300">San pham</th>
                  <th className="px-4 py-3 text-left border-b border-slate-300">So luong</th>
                  <th className="px-4 py-3 text-left border-b border-slate-300">Gia tri</th>
                </tr>
              </thead>
              <tbody>
                {pagedTopProducts.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 font-semibold">{row.quantity.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3">{formatVND(row.totalValue)}</td>
                  </tr>
                ))}

                {topProductsByQty.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">Khong co du lieu.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {topProductsByQty.length > 0 && (
              <div className="px-4 pb-4">
                <TablePagination
                  page={topProductPage}
                  totalItems={topProductsByQty.length}
                  pageSize={topProductPageSize}
                  onPageChange={setTopProductPage}
                  onPageSizeChange={(nextSize) => {
                    setTopProductPage(1);
                    setTopProductPageSize(nextSize);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-300 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-900">Bang chi tiet nhap kho</h3>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left border-b border-slate-300">Ma nhap</th>
                <th className="px-4 py-3 text-left border-b border-slate-300">San pham</th>
                <th className="px-4 py-3 text-left border-b border-slate-300">Brand</th>
                <th className="px-4 py-3 text-left border-b border-slate-300">So luong</th>
                <th className="px-4 py-3 text-left border-b border-slate-300">Gia nhap</th>
                <th className="px-4 py-3 text-left border-b border-slate-300">Tong gia tri</th>
                <th className="px-4 py-3 text-left border-b border-slate-300">Ngay nhap</th>
              </tr>
            </thead>
            <tbody>
              {pagedDetailRows.map((row, idx) => {
                const unitPrice = Number(row.sp_price || 0);
                const qty = Number(row.nk_quantity || 0);
                const totalValue = unitPrice * qty;
                
                return (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="px-4 py-3 font-mono text-slate-600">{row.nk_id}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{row.sp_name}</td>
                    <td className="px-4 py-3">{row.sp_brand || "N/A"}</td>
                    <td className="px-4 py-3 font-semibold">{qty.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3">{unitPrice.toLocaleString("vi-VN")} đ</td>
                    <td className="px-4 py-3 font-semibold">{totalValue.toLocaleString("vi-VN")} đ</td>
                    <td className="px-4 py-3 text-slate-500">{row.nk_date}</td>
                  </tr>
                );
              })}

              {detailRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">Khong co du lieu nhap kho.</td>
                </tr>
              )}
            </tbody>
          </table>
          {detailRows.length > 0 && (
            <div className="px-4 pb-4">
              <TablePagination
                page={detailPage}
                totalItems={detailRows.length}
                pageSize={detailPageSize}
                onPageChange={setDetailPage}
                onPageSizeChange={(nextSize) => {
                  setDetailPage(1);
                  setDetailPageSize(nextSize);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
