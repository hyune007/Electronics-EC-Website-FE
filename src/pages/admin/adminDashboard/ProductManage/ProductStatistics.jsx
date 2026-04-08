import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  XOctagon,
  Percent,
  Layers,
  Download,
  Calendar,
  Filter,
  Info,
  FileText,
  ChevronDown,
  Database,
  ArrowRight,
  Clock
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import TablePagination from "../../../../components/admin/analytics/TablePagination.jsx";

const DEFAULT_LOW_STOCK_PAGE_SIZE = 8;

export default function ProductStatistics({ products, globalStats, brands, categories }) {
  const now = new Date();
  
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockPageSize, setLowStockPageSize] = useState(DEFAULT_LOW_STOCK_PAGE_SIZE);

  // --- Thực tế không có chức năng Time-Travel (Snapshot Kho) từ Backend
  // Vận hành kho chỉ lấy dữ liệu Lưu trữ ở mốc thời gian thực hiện tại
  const validProducts = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  // --- Dynamic Stats calculation for the chosen Month/Year ---
  const dynamicStats = useMemo(() => {
    const totalProducts = validProducts.length;
    const totalValue = validProducts.reduce((s, p) => s + (Number(p.sp_discountedPrice ?? p.sp_price ?? 0) * (p.sp_stock || 0)), 0);
    const totalStock = validProducts.reduce((s, p) => s + (p.sp_stock || 0), 0);
    const lowStock = validProducts.filter(p => (p.sp_stock || 0) > 0 && (p.sp_stock || 0) < 10).length;
    const outOfStock = validProducts.filter(p => (p.sp_stock || 0) <= 0).length;
    const avgP = totalProducts > 0 ? Math.round(totalValue / totalProducts) : 0;
    const inStockRate = totalProducts > 0 ? Math.round(((totalProducts - outOfStock) / totalProducts) * 100) : 0;
    
    return {
      totalProducts,
      totalValue,
      totalStock,
      lowStock,
      outOfStock,
      averagePrice: avgP,
      inStockRate
    };
  }, [validProducts]);
  
  // 1. Tỷ trọng Tồn Kho theo Ngành Hàng
  const categoryStockData = useMemo(() => {
    const stockMap = {};
    validProducts.forEach(p => {
      const catName = p.sp_category_name || "Chưa phân loại";
      stockMap[catName] = (stockMap[catName] || 0) + (p.sp_stock || 0);
    });
    const sorted = Object.entries(stockMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    if (sorted.length > 5) {
      const top5 = sorted.slice(0, 5);
      const othersVal = sorted.slice(5).reduce((s, c) => s + c.value, 0);
      top5.push({ name: "Khác", value: othersVal });
      return top5;
    }
    return sorted;
  }, [validProducts]);

  // 2. Trạng thái Tồn Kho (Stock Health)
  const stockHealthData = useMemo(() => {
    let healthy = 0, low = 0, out = 0;
    validProducts.forEach(p => {
      const s = p.sp_stock || 0;
      if (s <= 0) out++;
      else if (s < 10) low++;
      else healthy++;
    });
    return [
      { name: "Sẵn sàng xuất kho (>10)", value: healthy, color: "#10b981" },
      { name: "Cảnh báo cạn kiệt (<10)", value: low, color: "#f59e0b" },
      { name: "Đã đứt chuỗi cung ứng (0)", value: out, color: "#ef4444" },
    ];
  }, [validProducts]);

  // 3. Phân bổ Cấu trúc Giá (Pricing Tiers)
  const priceTiersData = useMemo(() => {
    let t1 = 0, t2 = 0, t3 = 0, t4 = 0;
    validProducts.forEach(p => {
      const price = Number(p.sp_discountedPrice ?? p.sp_price ?? 0);
      if (price < 5000000) t1++;
      else if (price < 15000000) t2++;
      else if (price < 30000000) t3++;
      else t4++;
    });
    return [
      { name: "Dưới 5 Triệu", count: t1 },
      { name: "5 - 15 Triệu", count: t2 },
      { name: "15 - 30 Triệu", count: t3 },
      { name: "Trên 30 Triệu", count: t4 },
    ];
  }, [validProducts]);

  // 4. Actionable Lists: Low Stock & Out of Stock
  const actionRequiredProducts = useMemo(() => {
    return [...validProducts]
      .filter(p => (p.sp_stock || 0) < 10)
      .sort((a, b) => (a.sp_stock || 0) - (b.sp_stock || 0));
  }, [validProducts]);

  const pagedActionRows = useMemo(() => {
    const start = (lowStockPage - 1) * lowStockPageSize;
    return actionRequiredProducts.slice(start, start + lowStockPageSize);
  }, [actionRequiredProducts, lowStockPage, lowStockPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(actionRequiredProducts.length / lowStockPageSize));
    if (lowStockPage > totalPages) {
      setLowStockPage(totalPages);
    }
  }, [actionRequiredProducts.length, lowStockPage, lowStockPageSize]);

  const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#94a3b8"];

  // --- Export Excel ---
  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    
    const summaryData = [
      ["", "CÔNG TY ĐIỆN TỬ ELECTRONICS EC - BÁO CÁO NỘI BỘ (VIP)"],
      ["", "Địa chỉ: Khu Công Nghệ Cao, TP. Hồ Chí Minh"],
      ["", "Mã số thuế: 0123456789 | Email: admin@electronics.vn"],
      [""],
      ["", "BÁO CÁO VẬN HÀNH & LƯU KHO SẢN PHẨM KHỐI QUẢN TRỊ"],
      ["", `Kỳ báo cáo: Dữ liệu Tồn kho Thời Gian Thực (Real-time)`],
      ["", `Thời gian xuất: ${now.toLocaleString("vi-VN")}`],
      ["", `Người xuất: Quản Trị Viên (Admin)`],
      [""],
      ["", "1. SỐ LIỆU TỔNG QUAN HỆ THỐNG", "SỐ LƯỢNG", "ĐƠN VỊ"],
      ["", "- Tổng số mã sản phẩm hiện lưu trữ", dynamicStats.totalProducts, "Mã SP"],
      ["", "- Tổng lượng hàng vật lý tại kho", dynamicStats.totalStock, "Sản phẩm"],
      ["", "- Tổng vốn đầu tư đang đóng băng", `${dynamicStats.totalValue.toLocaleString("vi-VN")}`, "VNĐ"],
      ["", "- Vốn trung bình / Mỗi sản phẩm", `${dynamicStats.averagePrice.toLocaleString("vi-VN")}`, "VNĐ"],
      [""],
      ["", "2. CẢNH BÁO KIỂM SOÁT TỒN KHO", "SỐ LƯỢNG", "ĐƠN VỊ"],
      ["", "- Sản phẩm chạm ngưỡng tối thiểu (<10)", dynamicStats.lowStock, "Mã SP"],
      ["", "- Sản phẩm đã hết hàng (0)", dynamicStats.outOfStock, "Mã SP"],
      ["", "- Tỷ lệ đáp ứng kho (Còn hàng)", `${dynamicStats.inStockRate}%`, "%"],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 5 }, { wch: 55 }, { wch: 20 }, { wch: 15 }];

    const detailData = validProducts.map((p, index) => ({
      "STT": index + 1,
      "Mã Nội Bộ": p.sp_id,
      "Tên Sản Phẩm": p.sp_name,
      "Tuyến Danh Mục": p.sp_category_name || "N/A",
      "Thương Hiệu": p.sp_brand_name || "N/A",
      "SL Khả Dụng": p.sp_stock,
      "Trạng Thái Kiểm Kho": p.sp_stock === 0 ? "Hết hàng" : (p.sp_stock < 10 ? "Sắp hết" : "Ổn định"),
      "Giá Nhập Thô (VNĐ)": p.sp_price,
      "Giá Ưu Đãi (VNĐ)": p.sp_discountedPrice,
      "Trị Giá Chiếm Dụng (VNĐ)": (p.sp_stock || 0) * Number(p.sp_discountedPrice ?? p.sp_price ?? 0),
    }));

    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    wsDetail["!cols"] = [
      { wch: 5 }, { wch: 15 }, { wch: 65 }, { wch: 25 }, { wch: 15 }, 
      { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 22 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "TỔNG QUAN HỆ THỐNG");
    XLSX.utils.book_append_sheet(wb, wsDetail, "CHITIET_KHO_VIP");

    const monthStr = String(now.getMonth() + 1).padStart(2, "0");
    const yearStr = now.getFullYear();
    XLSX.writeFile(wb, `BaoCao_QuanTriKho_VIP_${monthStr}_${yearStr}.xlsx`);
  };

  // --- Export PDF ---
  const handleExportPDF = async () => {
    const reportElement = document.getElementById("pdf-report-capture");
    if (!reportElement) return;

    setIsExportingPDF(true);
    // Kích hoạt chế độ in VIP
    reportElement.classList.add("vip-pdf-mode");
    
    try {
      // Đợi DOM cập nhật class
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(reportElement, { 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        fontEmbedCSS: '', 
      });
      
      // Hủy chế độ in
      reportElement.classList.remove("vip-pdf-mode");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      const monthStr = String(now.getMonth() + 1).padStart(2, "0");
      const yearStr = now.getFullYear();
      pdf.save(`ThongKe_VIP_Realtime_${monthStr}_${yearStr}.pdf`);
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      reportElement.classList.remove("vip-pdf-mode");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="product-statistics pb-8">
      {/* Back-Office Header (Operations Focus) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 uppercase">Trung Tâm Thống Kê VIP</h2>
          <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100"><Database size={14}/> Node Quản Trị Hệ Thống</span>
            <span>Cập nhật số liệu lưu trữ chuyên sâu theo tháng/năm.</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
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
                  onClick={() => { setIsExportMenuOpen(false); handleExportPDF(); }}
                  className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <FileText size={15} className="text-slate-500" />
                  PDF (Giao diện Kiểm soát)
                </button>
                <div className="h-[1px] bg-slate-100 mx-2"></div>
                <button 
                  onClick={() => { setIsExportMenuOpen(false); handleExportExcel(); }}
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
      </div>

      <div id="pdf-report-capture" className="bg-slate-50/50 p-2 sm:p-4 rounded-xl xl:-mx-4 xl:px-4 relative transition-all duration-300">
        {/* VIP PDF Watermark & Header (Visually hidden unless exporting) */}
        <div className="pdf-only hidden absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
            <h1 className="text-[120px] font-black -rotate-45">ELECTRONICS VIP</h1>
        </div>
        <div className="mb-8 pdf-only hidden justify-between items-end border-b-2 border-slate-800 pb-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">CÔNG TY ELECTRONICS EC</h1>
                <p className="text-slate-500 font-medium">Báo cáo Thống Kê Vận Hành Kho - Phiên Bản Nâng Cao (VIP)</p>
            </div>
            <div className="text-right">
                <p className="text-slate-800 font-bold text-lg">Báo cáo: Thời gian thực</p>
                <p className="text-slate-500 text-sm">Ngày trích xuất: {now.toLocaleDateString("vi-VN")}</p>
            </div>
        </div>

        {/* Core Operations Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Tổng Mã Sản Phẩm" value={dynamicStats.totalProducts} icon={<Package />} color="slate" tooltip="Tổng số lượng các dòng sản phẩm khác nhau đang quản lý." />
          <StatCard label="Tổng Số Lượng Tồn" value={dynamicStats.totalStock} icon={<TrendingUp />} color="slate" tooltip="Cộng dồn tất cả số lượng từng sản phẩm rời có trong kho." />
          <StatCard label="Sản Phẩm Hết Hàng" value={dynamicStats.outOfStock} icon={<XOctagon />} color="red" tooltip="Sản phẩm đang hiển thị số lượng bằng 0. Cần nhập hàng gấp!" />
          <StatCard label="Sản Phẩm Sắp Hết" value={dynamicStats.lowStock} icon={<AlertTriangle />} color="amber" tooltip="Sản phẩm dưới 10 chiếc. Nguy cơ cháy hàng cao." />
          
          <StatCard label="Tỷ Lệ Còn Hàng" value={`${dynamicStats.inStockRate}`} icon={<Percent />} color="slate" sign="%" tooltip="Phần (%) số lượng mã mặt hàng CÒN HÀNG." />
          <StatCard label="Tổng Danh Mục" value={categories?.length || 0} icon={<Layers />} color="slate" tooltip="Số lượng nhóm danh mục/ngành hàng." />
          <StatCard label="Tổng Vốn Tồn Kho" value={`${(dynamicStats.totalValue / 1000000).toFixed(1)} Tr`} icon={<Database />} color="slate" tooltip={`Tổng: ${dynamicStats.totalValue.toLocaleString("vi-VN")} VNĐ`} sign="VNĐ" />
          <StatCard label="Vốn Trung Bình/Mã" value={`${(dynamicStats.averagePrice / 1000000).toFixed(1)} Tr`} icon={<TrendingUp />} color="slate" tooltip={`TB: ${dynamicStats.averagePrice.toLocaleString("vi-VN")} VNĐ`} sign="VNĐ" />
        </div>

        {/* Row 1: Stock Status & Action Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Action List: Low Stock Table (Operations Focus) */}
          <div className="saas-card lg:col-span-2 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
               <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                 <AlertTriangle size={16} className="text-amber-500"/> Tự Động Lọc: Các Mặt Hàng Sắp Cháy Kho
               </h3>
               <span className="text-[12px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Tồn Kho &lt; 10</span>
            </div>
            <div className="p-0 flex-1 bg-white overflow-x-auto">
              {actionRequiredProducts.length > 0 ? (
                <div>
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-5">Mã Nội Bộ</th>
                        <th className="py-3 px-5">Tên Sản Phẩm</th>
                        <th className="py-3 px-5">Tình Trạng</th>
                        <th className="py-3 px-5 text-right">Tồn Kho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagedActionRows.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-5 font-mono text-slate-400">{p.sp_id.substring(0, 8)}...</td>
                          <td className="py-3 px-5 font-medium text-slate-700 max-w-[200px] truncate">{p.sp_name}</td>
                          <td className="py-3 px-5">
                            {p.sp_stock === 0 ? (
                              <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-medium text-[11px]">
                                Hết Hàng (0)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium text-[11px]">
                                Sắp Hết
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-5 text-right font-bold text-slate-800">{p.sp_stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 pb-4">
                    <TablePagination
                      page={lowStockPage}
                      totalItems={actionRequiredProducts.length}
                      pageSize={lowStockPageSize}
                      onPageChange={setLowStockPage}
                      onPageSizeChange={(nextSize) => {
                        setLowStockPage(1);
                        setLowStockPageSize(nextSize);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                  <Database size={32} className="mb-2 opacity-20" />
                  <p className="text-[13px] font-medium">Kho hàng đang ổn định, không có mã nào thiếu hụt.</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock Health Chart */}
          <div className="saas-card p-5 lg:col-span-1 border-t-4 border-t-slate-800">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-[14px] font-bold text-slate-800">Tình Trạng Sức Khỏe Kho</h3>
               <Info size={16} className="text-slate-400 cursor-help" title="So sánh tỷ lệ hàng hóa đang ở mức an toàn so với lượng hàng sắp tiêu thụ hết." />
            </div>
            <div className="h-[210px]">
              {stockHealthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockHealthData}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {stockHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, "Sản phẩm"]} 
                      contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 12, color: "#475569", paddingTop: "5px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </div>
          </div>
        </div>

        {/* Row 2: Bar + Pie (Financial operations) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          {/* Pricing Tiers Data */}
          <div className="saas-card p-5">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-[14px] font-bold text-slate-800">Phân Bổ Theo Tầm Giá</h3>
               <Info size={16} className="text-slate-400 cursor-help" title="Mật độ lượng sản phẩm rải rác ở các mức phân khúc giá khác nhau." />
            </div>
            <div className="h-[240px]">
              {priceTiersData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceTiersData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: "#f8fafc" }}
                      formatter={(value) => [`${value} Sản phẩm`, "Số lượng"]}
                      contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                      {priceTiersData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </div>
          </div>

          {/* Capital Tying by Category */}
          <div className="saas-card p-5">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-[14px] font-bold text-slate-800">Tỷ Trọng Tồn Kho (Theo Danh Mục)</h3>
               <Info size={16} className="text-slate-400 cursor-help" title="Quan sát lưu lượng không gian và mức độ hàng hóa đang cất giữ theo từng danh mục." />
            </div>
            <div className="h-[240px]">
              {categoryStockData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStockData}
                      innerRadius={0}
                      outerRadius={85}
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {categoryStockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, "Đơn vị (Sản phẩm)"]} 
                      contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 12, color: "#475569", paddingTop: "15px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </div>
          </div>
        </div>
        
        {/* VIP PDF FOOTER (Hidden in DOM, visible in Print/PDF) */}
        <div className="pdf-only hidden justify-between items-start mt-12 pt-8 border-t border-slate-200">
             <div className="text-slate-500 text-[12px] font-medium">
                <p>Báo cáo Nội Bộ. Vui lòng bảo mật thông tin kinh doanh.</p>
                <p className="mt-1">Generated by Electronics Dashboard Engine v3.0</p>
             </div>
             <div className="text-center w-64">
                <p className="font-bold text-slate-800 mb-16">Người lập biểu</p>
                <div className="h-[2px] w-32 bg-slate-200 mx-auto"></div>
                <p className="text-slate-500 text-[13px] mt-2">Ký và Ghi rõ họ tên</p>
             </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, tooltip, sign }) {
  const statStyles = {
    slate: "text-slate-600 bg-slate-100",
    red: "text-red-600 bg-red-100 border border-red-200",
    amber: "text-amber-600 bg-amber-100 border border-amber-200",
  };

  const styleClass = statStyles[color] || statStyles.slate;

  return (
    <div className="saas-card p-4 relative group hover:border-slate-300">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider pr-6">{label}</p>
        <div className={`w-7 h-7 rounded flex items-center justify-center -mt-1 ${styleClass}`}>
           {React.cloneElement(icon, { size: 14 })}
        </div>
        {tooltip && (
          <div className="absolute top-3 right-10 text-slate-300 hover:text-slate-600 cursor-help" title={tooltip}>
            <Info size={14} />
          </div>
        )}
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">
          {value}
          {sign && <span className="text-[13px] text-slate-400 font-bold ml-1">{sign}</span>}
        </h4>
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div className="h-full flex items-center justify-center text-[13px] font-medium text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
      Chưa đủ dữ liệu hiển thị (Pending Data Sync)
    </div>
  );
}
