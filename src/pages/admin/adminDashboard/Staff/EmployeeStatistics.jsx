import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Shield,
  TrendingUp,
  BarChart3,
  Search,
  Download,
  FileText,
  Loader2,
  ChevronDown,
  Briefcase,
  Clock,
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
  Legend,
} from "recharts";
import { getAllEmployees } from "../../../../services/employeeservice.js";
import TablePagination from "../../../../components/admin/analytics/TablePagination.jsx";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
const DEFAULT_DETAIL_PAGE_SIZE = 10;

function shortName(value, max = 16) {
  const text = String(value || "").trim();
  if (!text) return "N/A";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function EmployeeStatistics({ employees }) {
  const [keyword, setKeyword] = useState("");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(DEFAULT_DETAIL_PAGE_SIZE);

  const now = new Date();

  useEffect(() => {
    let mounted = true;

    const loadAllEmployees = async () => {
      if (employees && Array.isArray(employees) && employees.length > 0) {
        if (mounted) {
          setAllEmployees(employees);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const firstPage = await getAllEmployees(0, "");
        const mergedEmployees = Array.isArray(firstPage?.employees) ? [...firstPage.employees] : [];
        const totalPages = Number(firstPage?.totalPages || 0);

        for (let page = 1; page < totalPages; page += 1) {
          const pageData = await getAllEmployees(page, "");
          if (Array.isArray(pageData?.employees) && pageData.employees.length > 0) {
            mergedEmployees.push(...pageData.employees);
          }
        }

        if (mounted) {
          setAllEmployees(mergedEmployees);
        }
      } catch (error) {
        console.error("Không tải được dữ liệu nhân viên cho thống kê:", error);
        if (mounted) {
          setAllEmployees([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAllEmployees();

    return () => {
      mounted = false;
    };
  }, [employees]);

  const validEmployees = useMemo(() => (Array.isArray(allEmployees) ? allEmployees : []), [allEmployees]);

  const filteredEmployees = useMemo(() => {
    const q = keyword.toLowerCase().trim();
    if (!q) return validEmployees;

    return validEmployees.filter((item) => (
      String(item?.nv_id || "").toLowerCase().includes(q)
      || String(item?.nv_name || "").toLowerCase().includes(q)
      || String(item?.nv_mail || "").toLowerCase().includes(q)
      || String(item?.nv_phone || "").toLowerCase().includes(q)
      || String(item?.nv_role || "").toLowerCase().includes(q)
    ));
  }, [validEmployees, keyword]);

  const stats = useMemo(() => {
    const totalCount = filteredEmployees.length;
    
    const roleCounts = {};
    filteredEmployees.forEach((item) => {
      const role = String(item?.nv_role || "N/A").trim();
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    const adminCount = roleCounts["ROLE_ADMIN"] || 0;
    const managerCount = roleCounts["ROLE_MANAGER"] || 0;
    const employeeCount = roleCounts["ROLE_EMPLOYEE"] || 0;
    const staffCount = roleCounts["ROLE_STAFF"] || 0;

    const activeCount = filteredEmployees.filter((emp) => emp?.nv_name).length;

    return {
      totalCount,
      adminCount,
      managerCount,
      employeeCount,
      staffCount,
      activeCount,
      roleCounts,
    };
  }, [filteredEmployees]);

  const roleChartData = useMemo(() => {
    const data = [];
    Object.entries(stats.roleCounts).forEach(([role, count]) => {
      const roleLabel = role === "ROLE_ADMIN" ? "Admin" 
        : role === "ROLE_MANAGER" ? "Manager" 
        : role === "ROLE_EMPLOYEE" ? "Nhân viên"
        : role === "ROLE_STAFF" ? "Staff"
        : role;
      data.push({ name: roleLabel, value: count });
    });
    return data;
  }, [stats.roleCounts]);

  const detailTableData = useMemo(() => {
    return filteredEmployees.map((item) => ({
      nv_id: item?.nv_id || "N/A",
      nv_name: item?.nv_name || "N/A",
      nv_phone: item?.nv_phone || "---",
      nv_mail: item?.nv_mail || "---",
      nv_role: item?.nv_role === "ROLE_ADMIN" ? "Admin"
        : item?.nv_role === "ROLE_MANAGER" ? "Manager"
        : item?.nv_role === "ROLE_EMPLOYEE" ? "Nhân viên"
        : item?.nv_role === "ROLE_STAFF" ? "Staff"
        : item?.nv_role || "N/A",
    }));
  }, [filteredEmployees]);

    const pagedDetailRows = useMemo(() => {
      const start = (detailPage - 1) * detailPageSize;
      return detailTableData.slice(start, start + detailPageSize);
    }, [detailPage, detailTableData, detailPageSize]);

    useEffect(() => {
      const totalPages = Math.max(1, Math.ceil(detailTableData.length / detailPageSize));
      if (detailPage > totalPages) {
        setDetailPage(totalPages);
      }
    }, [detailPage, detailTableData.length, detailPageSize]);

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("employee-statistics-pdf");
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

      pdf.save(`ThongKe_NhanVien_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.pdf`);
    } catch (error) {
      console.error("Lỗi xuất PDF thống kê nhân viên:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const aoa = [
      ["Mã NV", "Họ tên", "SĐT", "Email", "Vai trò"],
      ...detailTableData.map((item) => [
        item.nv_id,
        item.nv_name,
        item.nv_phone,
        item.nv_mail,
        item.nv_role,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 14 },
      { wch: 24 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ThongKeNhanVien");
    XLSX.writeFile(
      workbook,
      `ThongKe_NhanVien_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.xlsx`
    );
  };

  return (
    <div id="employee-statistics-pdf" className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 uppercase">Trung Tâm Thống Kê Nhân Viên</h2>
          <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">
              <Users size={14} /> Phân Tích Nhân Sự
            </span>
            <span>Cập nhật cơ cấu nhân viên, phân bố vai trò và thống kê chi tiết.</span>
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

      {/* Search Bar */}
      <div className="relative w-full lg:max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo mã, tên, email, SĐT..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-sky-50 to-white">
          <p className="text-sm text-slate-500">Tổng Nhân Viên</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalCount}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Users size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-red-50 to-white">
          <p className="text-sm text-slate-500">Admin</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.adminCount}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Shield size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-white">
          <p className="text-sm text-slate-500">Manager</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.managerCount}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Briefcase size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-sm text-slate-500">Nhân Viên</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.employeeCount}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-white">
          <p className="text-sm text-slate-500">Staff</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.staffCount}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Pie Chart */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-slate-600" /> Phân Bố Theo Vai Trò
          </h3>
          {roleChartData.length > 0 ? (
            <div className="h-[280px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} người`, "Số lượng"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </div>

        {/* Stats Legend */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-slate-600" /> Thống Kê Chi Tiết
          </h3>
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
              <span className="text-[13px] font-medium text-slate-700">Admin</span>
              <span className="text-lg font-bold text-red-600">{stats.adminCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded border border-amber-100">
              <span className="text-[13px] font-medium text-slate-700">Manager</span>
              <span className="text-lg font-bold text-amber-600">{stats.managerCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded border border-emerald-100">
              <span className="text-[13px] font-medium text-slate-700">Nhân Viên</span>
              <span className="text-lg font-bold text-emerald-600">{stats.employeeCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-100">
              <span className="text-[13px] font-medium text-slate-700">Staff</span>
              <span className="text-lg font-bold text-purple-600">{stats.staffCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
        <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users size={16} className="text-slate-600" /> Danh Sách Chi Tiết (Top 20)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-700">Mã NV</th>
                <th className="px-4 py-3 text-left font-bold text-slate-700">Họ Tên</th>
                <th className="px-4 py-3 text-left font-bold text-slate-700">SĐT</th>
                <th className="px-4 py-3 text-left font-bold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-bold text-slate-700">Vai Trò</th>
              </tr>
            </thead>
            <tbody>
              {detailTableData.length > 0 ? (
                pagedDetailRows.map((item, idx) => (
                  <tr key={idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-4 py-3 text-slate-700 font-medium">{shortName(item.nv_id, 10)}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{shortName(item.nv_name, 18)}</td>
                    <td className="px-4 py-3 text-slate-600">{item.nv_phone}</td>
                    <td className="px-4 py-3 text-slate-600">{shortName(item.nv_mail, 20)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[12px] font-semibold ${
                        item.nv_role === "Admin" ? "bg-red-100 text-red-700"
                        : item.nv_role === "Manager" ? "bg-amber-100 text-amber-700"
                        : item.nv_role === "Nhân viên" ? "bg-emerald-100 text-emerald-700"
                        : item.nv_role === "Staff" ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-700"
                      }`}>
                        {item.nv_role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-400">
                    Chưa có dữ liệu hiển thị
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
      Chưa có dữ liệu hiển thị
    </div>
  );
}
