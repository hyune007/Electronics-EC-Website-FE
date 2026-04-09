import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Package,
  Boxes,
  TrendingUp,
  Search,
  Download,
  FileText,
  Loader2,
  ChevronDown,
  Percent,
  BarChart3,
  PieChart,
  DollarSign,
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
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";
import { getAllProducts } from "../../../../services/productService.js";
import TablePagination from "../../../../components/admin/analytics/TablePagination.jsx";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
const DEFAULT_DETAIL_PAGE_SIZE = 8;

function formatVND(value) {
  const num = Number(value || 0);
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function shortName(value, max = 16) {
  const text = String(value || "").trim();
  if (!text) return "N/A";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function BrandStatistics({ brands }) {
  const [keyword, setKeyword] = useState("");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(DEFAULT_DETAIL_PAGE_SIZE);

  const now = new Date();

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setProductLoading(true);
      try {
        const data = await getAllProducts(false);
        if (mounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Không tải được dữ liệu sản phẩm cho thống kê thương hiệu:", error);
        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setProductLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // Tính toán metrics chuyên nghiệp cho từng brand
  const brandMetrics = useMemo(() => {
    const metrics = {};

    (Array.isArray(products) ? products : []).forEach((item) => {
      // Lấy tên brand từ brand object hoặc fallback
      const brandName = item?.brand?.name || item?.brand?.id || "Không xác định";
      
      if (!metrics[brandName]) {
        metrics[brandName] = {
          brandName,
          productCount: 0,
          totalStock: 0,
          stockValue: 0,
          minPrice: Infinity,
          maxPrice: 0,
          sumPrice: 0,
          activeSKUs: 0,
          outOfStockSKUs: 0,
        };
      }

      const price = Number(item?.price || 0);
      const stock = Number(item?.stock || 0);

      metrics[brandName].productCount += 1;
      metrics[brandName].totalStock += stock;
      metrics[brandName].stockValue += price * stock;
      metrics[brandName].sumPrice += price;
      metrics[brandName].minPrice = Math.min(metrics[brandName].minPrice, price);
      metrics[brandName].maxPrice = Math.max(metrics[brandName].maxPrice, price);
      if (stock > 0) metrics[brandName].activeSKUs += 1;
      if (stock === 0) metrics[brandName].outOfStockSKUs += 1;
    });

    return Object.values(metrics)
      .map((m) => ({
        ...m,
        avgPrice: m.productCount > 0 ? Math.round(m.sumPrice / m.productCount) : 0,
        minPrice: m.minPrice === Infinity ? 0 : m.minPrice,
      }))
      .filter((b) => {
        const q = keyword.toLowerCase().trim();
        if (!q) return true;
        return String(b.brandName).toLowerCase().includes(q);
      })
      .sort((a, b) => b.stockValue - a.stockValue);
  }, [products, keyword]);

  // Professional KPIs
  const professionalKPIs = useMemo(() => {
    if (brandMetrics.length === 0) {
      return {
        totalBrands: 0,
        totalSKUs: 0,
        totalStock: 0,
        totalValue: 0,
        concentrationRatio: 0,
        averageStock: 0,
        averageValue: 0,
        outOfStockRate: 0,
        activeBrands: 0,
        herfindahlIndex: 0,
        brandDiversity: 0,
      };
    }

    const totalSKUs = brandMetrics.reduce((sum, b) => sum + b.productCount, 0);
    const totalStock = brandMetrics.reduce((sum, b) => sum + b.totalStock, 0);
    const totalValue = brandMetrics.reduce((sum, b) => sum + b.stockValue, 0);
    const activeBrands = brandMetrics.filter((b) => b.stockValue > 0).length;

    // Market Concentration: Top 3 brands / Total
    const top3Value = brandMetrics.slice(0, 3).reduce((sum, b) => sum + b.stockValue, 0);
    const concentrationRatio = totalValue > 0 ? ((top3Value / totalValue) * 100).toFixed(1) : 0;

    // Herfindahl-Hirschman Index (HHI) - đo độ tập trung
    const hhi = brandMetrics.reduce((sum, b) => {
      const share = totalValue > 0 ? (b.stockValue / totalValue) * 100 : 0;
      return sum + share * share;
    }, 0);

    const outOfStockTotal = brandMetrics.reduce((sum, b) => sum + b.outOfStockSKUs, 0);
    const outOfStockRate = totalSKUs > 0 ? ((outOfStockTotal / totalSKUs) * 100).toFixed(1) : 0;

    // Brand Diversity: Số brand có giá trị đủ lớn (>1% của tổng)
    const diverseCount = brandMetrics.filter((b) => totalValue > 0 && (b.stockValue / totalValue) * 100 >= 1).length;

    return {
      totalBrands: brandMetrics.length,
      totalSKUs,
      totalStock,
      totalValue,
      concentrationRatio: Number(concentrationRatio),
      averageStock: brandMetrics.length > 0 ? Math.round(totalStock / brandMetrics.length) : 0,
      averageValue: brandMetrics.length > 0 ? Math.round(totalValue / brandMetrics.length) : 0,
      outOfStockRate: Number(outOfStockRate),
      activeBrands,
      herfindahlIndex: hhi.toFixed(1),
      brandDiversity: diverseCount,
    };
  }, [brandMetrics]);

  // Dữ liệu biểu đồ
  const topBrandsByValue = useMemo(() => {
    return brandMetrics.slice(0, 10).map((b) => ({
      name: shortName(b.brandName, 14),
      value: Math.round(b.stockValue / 1000000),
      full: b.stockValue,
    }));
  }, [brandMetrics]);

  const marketShareData = useMemo(() => {
    const totalValue = professionalKPIs.totalValue;
    return brandMetrics
      .slice(0, 8)
      .map((b) => ({
        name: shortName(b.brandName, 12),
        value: totalValue > 0 ? Math.round((b.stockValue / totalValue) * 100) : 0,
      }));
  }, [brandMetrics, professionalKPIs.totalValue]);

  const productDistribution = useMemo(() => {
    const ranges = {
      "Không hàng": 0,
      "1-10 SKU": 0,
      "11-50 SKU": 0,
      "51-100 SKU": 0,
      "100+ SKU": 0,
    };

    brandMetrics.forEach((b) => {
      if (b.productCount === 0) ranges["Không hàng"]++;
      else if (b.productCount <= 10) ranges["1-10 SKU"]++;
      else if (b.productCount <= 50) ranges["11-50 SKU"]++;
      else if (b.productCount <= 100) ranges["51-100 SKU"]++;
      else ranges["100+ SKU"]++;
    });

    return Object.entries(ranges).map(([label, count]) => ({
      name: label,
      value: count,
    }));
  }, [brandMetrics]);

  const detailTableData = useMemo(() => {
    return brandMetrics.map((b, idx) => ({
      rank: idx + 1,
      brandName: b.brandName,
      productCount: b.productCount,
      totalStock: b.totalStock,
      avgPrice: b.avgPrice,
      minPrice: b.minPrice,
      maxPrice: b.maxPrice,
      stockValue: b.stockValue,
      activeRate: b.productCount > 0 ? ((b.activeSKUs / b.productCount) * 100).toFixed(0) : 0,
      marketShare: professionalKPIs.totalValue > 0 
        ? ((b.stockValue / professionalKPIs.totalValue) * 100).toFixed(1)
        : 0,
    }));
  }, [brandMetrics, professionalKPIs.totalValue]);

  const pagedDetailRows = useMemo(() => {
    const start = (detailPage - 1) * detailPageSize;
    return detailTableData.slice(start, start + detailPageSize);
  }, [detailTableData, detailPage, detailPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(detailTableData.length / detailPageSize));
    if (detailPage > totalPages) {
      setDetailPage(totalPages);
    }
  }, [detailTableData.length, detailPage, detailPageSize]);

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("brand-statistics-pdf");
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

      pdf.save(`ThongKe_ThuongHieu_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.pdf`);
    } catch (error) {
      console.error("Lỗi xuất PDF thống kê thương hiệu:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const aoa = [
      ["STT", "Tên Thương Hiệu", "Số SKU", "Tồn Kho", "Giá TB", "Giá Min", "Giá Max", "Giá Trị Hàng (VNĐ)", "% Còn", "Thị Phần %"],
      ...detailTableData.map((item) => [
        item.rank,
        item.brandName,
        item.productCount,
        item.totalStock.toLocaleString("vi-VN"),
        item.avgPrice.toLocaleString("vi-VN"),
        item.minPrice.toLocaleString("vi-VN"),
        item.maxPrice.toLocaleString("vi-VN"),
        item.stockValue.toLocaleString("vi-VN"),
        item.activeRate,
        item.marketShare,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 24 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Thống Kê Thương Hiệu");
    XLSX.writeFile(
      workbook,
      `ThongKe_ThuongHieu_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.xlsx`
    );
  };

  return (
    <div id="brand-statistics-pdf" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 uppercase">Trung Tâm Thống Kê Thương Hiệu</h2>
          <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">
              <Building2 size={14} /> Phân Tích Kinh Tế
            </span>
            <span>Cập nhật cơ cấu hãng, phân bố sản phẩm và phân tích chuyên nghiệp.</span>
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
            <span className="hidden sm:inline">{isExportingPDF ? "Đang kết xuất..." : "Trích xuất Báo Cáo"}</span>
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
                PDF (Giao diện Quản lý)
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
                Excel (Data Thô Xử Lý)
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

      {/* Search */}
      <div className="relative w-full lg:max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm thương hiệu..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      {/* KPI Cards - Professional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-white">
          <p className="text-sm text-slate-500">Tổng Thương Hiệu</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{professionalKPIs.totalBrands}</p>
          <p className="text-xs text-slate-500 mt-2">{professionalKPIs.activeBrands} có hàng</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Building2 size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-green-50 to-white">
          <p className="text-sm text-slate-500">Tổng SKU</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{professionalKPIs.totalSKUs}</p>
          <p className="text-xs text-slate-500 mt-2">{professionalKPIs.outOfStockRate}% hết hàng</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <Package size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-white">
          <p className="text-sm text-slate-500">Tổng Tồn Kho</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{professionalKPIs.totalStock.toLocaleString("vi-VN")}</p>
          <p className="text-xs text-slate-500 mt-2">TB: {professionalKPIs.averageStock}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Boxes size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white">
          <p className="text-sm text-slate-500">Giá Trị Hàng Tồn</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatVND(professionalKPIs.totalValue)}</p>
          <p className="text-xs text-slate-500 mt-2">{(professionalKPIs.totalValue / 1000000000).toFixed(1)}B VNĐ</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-red-50 to-white">
          <p className="text-sm text-slate-500">Tập Trung (HHI)</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{professionalKPIs.herfindahlIndex}</p>
          <p className="text-xs text-slate-500 mt-2">Top 3: {professionalKPIs.concentrationRatio}%</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Percent size={18} />
          </div>
        </div>
      </div>

      {productLoading && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-700 text-sm flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Đang đồng bộ dữ liệu để tính toán thống kê...
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-slate-600" /> Top 10 Thương Hiệu Theo Giá Trị
          </h3>
          {topBrandsByValue.length > 0 ? (
            <div className="h-[320px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBrandsByValue} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `${value}M VNĐ`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-slate-600" /> Thị Phần Thương Hiệu (%)
          </h3>
          {marketShareData.length > 0 ? (
            <div className="h-[320px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie
                  data={marketShareData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {marketShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </div>
      </div>

      {/* Distribution */}
      <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
        <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Boxes size={16} className="text-slate-600" /> Phân Bố Số SKU Theo Thương Hiệu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {productDistribution.map((item, idx) => (
            <div key={idx} className="p-4 border border-slate-100 rounded-lg bg-slate-50 text-center">
              <p className="text-[13px] font-medium text-slate-700 mb-2">{item.name}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500 mt-1">
                {professionalKPIs.totalBrands > 0 
                  ? ((item.value / professionalKPIs.totalBrands) * 100).toFixed(0)
                  : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Table */}
      <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
        <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Building2 size={16} className="text-slate-600" /> Danh Sách Chi Tiết Top 15
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-center font-bold text-slate-700">STT</th>
                <th className="px-4 py-3 text-left font-bold text-slate-700">Tên Thương Hiệu</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">SKU</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">Tồn Kho</th>
                <th className="px-4 py-3 text-right font-bold text-slate-700">Giá TB</th>
                <th className="px-4 py-3 text-right font-bold text-slate-700">Min-Max</th>
                <th className="px-4 py-3 text-right font-bold text-slate-700">Giá Trị (VNĐ)</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">% Còn</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">Thị Phần</th>
              </tr>
            </thead>
            <tbody>
              {detailTableData.length > 0 ? (
                pagedDetailRows.map((item, idx) => (
                  <tr key={idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{item.rank}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{shortName(item.brandName, 20)}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.productCount}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.totalStock.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.avgPrice.toLocaleString("vi-VN")} ₫</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-[12px]">
                      {item.minPrice.toLocaleString("vi-VN")}-{item.maxPrice.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatVND(item.stockValue)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-[12px] font-semibold ${
                        item.activeRate >= 75 ? 'bg-green-100 text-green-700'
                        : item.activeRate >= 50 ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {item.activeRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.marketShare}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-6 text-center text-slate-400">
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {detailTableData.length > 0 && (
          <TablePagination
            page={detailPage}
            totalItems={detailTableData.length}
            pageSize={detailPageSize}
            onPageChange={setDetailPage}
            onPageSizeChange={(nextSize) => {
              setDetailPage(1);
              setDetailPageSize(nextSize);
            }}
          />
        )}
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div className="h-full flex items-center justify-center text-[13px] font-medium text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
      Chưa có dữ liệu
    </div>
  );
}
