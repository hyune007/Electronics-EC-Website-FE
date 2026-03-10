import { Plus, Pencil, Trash2, Search, Percent, Calendar, Tag, Gift, ArrowUpDown, Sparkles, TimerOff, CircleDot, Clock } from "lucide-react";
import { useVoucherLogic } from "./VoucherLogic.js";
import VoucherForm from "./VoucherForm.jsx";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Voucher.css";

export default function VoucherManage() {
    const vm = useVoucherLogic();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.roleId === "ROLE_ADMIN";
    const isEmployee = user?.roleId === "ROLE_EMPLOYEE";

    useEffect(() => {
        setMounted(true);
    }, []);

    // Theo BE security: ADMIN + EMPLOYEE
    if (!isAdmin && !isEmployee) {
        return <Navigate to="/unauthorized" replace />;
    }

    const getStatusText = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return 'Sắp diễn ra';
        if (now > end) return 'Đã kết thúc';
        return 'Đang hoạt động';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("vi-VN");
    };

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Voucher</h1>
                        <p className="text-neutral-600">Quản lý mã giảm giá và chương trình khuyến mãi</p>
                    </div>
                    <button 
                        onClick={vm.openAdd}
                        className="btn-primary flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Thêm Voucher</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Voucher Sau Lọc</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.stats.total}</p>
                                <p className="text-xs text-neutral-500 mt-1">Theo bộ lọc hiện tại</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Gift className="text-primary-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Đang Hoạt Động</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.stats.activeCount}</p>
                                <p className="text-xs text-neutral-500 mt-1">Hiệu lực ngay</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Tag className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Sắp Diễn Ra</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.stats.upcomingCount}</p>
                                <p className="text-xs text-neutral-500 mt-1">Đang chờ kích hoạt</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Hiệu Suất % Giảm</p>
                                <p className="text-2xl font-bold text-neutral-900">{vm.stats.avgPercent}%</p>
                                <p className="text-xs text-neutral-500 mt-1">Cao nhất: {vm.stats.maxPercent}%</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Sparkles className="text-red-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
                    <div className="flex-1 search-box">
                        <Search className="text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo mã, tên hoặc mô tả voucher..."
                            value={vm.search}
                            onChange={(e) => vm.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-xl bg-white">
                            <CircleDot size={16} className="text-neutral-500" />
                            <select
                                value={vm.statusFilter}
                                onChange={(e) => vm.setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm text-neutral-700 outline-none"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="upcoming">Sắp diễn ra</option>
                                <option value="expired">Đã kết thúc</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-xl bg-white">
                            <ArrowUpDown size={16} className="text-neutral-500" />
                            <select
                                value={vm.sortBy}
                                onChange={(e) => vm.setSortBy(e.target.value)}
                                className="bg-transparent text-sm text-neutral-700 outline-none"
                            >
                                <option value="latest_start">Mới nhất theo ngày bắt đầu</option>
                                <option value="oldest_start">Cũ nhất theo ngày bắt đầu</option>
                                <option value="highest_percent">% giảm cao nhất</option>
                                <option value="lowest_percent">% giảm thấp nhất</option>
                                <option value="name_az">Tên A-Z</option>
                                <option value="name_za">Tên Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="px-4 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Mã Voucher
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Tên Voucher
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Giảm Giá
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Thời Gian
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Thời Lượng
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Trạng Thái
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Hành Động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {vm.paginatedVouchers.map((v, index) => (
                                <tr key={v.km_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-4 py-4 text-center">
                                        <span className="inline-flex items-center justify-center min-w-7 h-7 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                                            {v.rank}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                                            {v.km_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <Tag className="text-primary-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{v.km_name}</p>
                                                <p className="text-xs text-neutral-500 max-w-[280px] truncate">{v.km_description || "Không có mô tả"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Percent className="text-emerald-600" size={16} />
                                                <span className="font-semibold text-emerald-600">{v.km_percent}%</span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${Math.min(100, Number(v.km_percent || 0))}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2 text-neutral-700 font-medium">
                                                <Calendar className="text-neutral-400" size={14} />
                                                <span>{formatDate(v.km_start_date)} - {formatDate(v.km_end_date)}</span>
                                            </div>
                                            <div className="mt-1 text-xs text-neutral-500">
                                                Hiệu lực {v.durationDays} ngày
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-2 text-sm text-neutral-700">
                                            <TimerOff size={14} className="text-neutral-500" />
                                            <span>{v.durationDays} ngày</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-2">
                                            <CircleDot className="text-red-500" size={14} />
                                            <span className="text-sm font-medium text-neutral-700">{getStatusText(v.km_start_date, v.km_end_date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => vm.openEdit(v)}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => vm.handleDelete(v.km_id)}
                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {vm.paginatedVouchers.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Gift className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có voucher</h3>
                                            <p className="text-neutral-600">
                                                {vm.search ? 'Không tìm thấy voucher nào' : 'Bắt đầu bằng cách thêm voucher đầu tiên'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {vm.totalVisible > 0 && (
                <PaginationComponent
                    currentPage={vm.currentPage}
                    totalPages={vm.totalPages}
                    itemsPerPage={vm.itemsPerPage}
                    totalItems={vm.totalVisible}
                    onPageChange={vm.handlePageChange}
                    onPreviousPage={vm.handlePreviousPage}
                    onNextPage={vm.handleNextPage}
                    itemLabel="voucher"
                />
            )}

            {/* MODAL */}
            <VoucherForm
                open={vm.openForm}
                onClose={() => vm.setOpenForm(false)}
                onSubmit={{
                    form: vm.form,
                    setForm: vm.setForm,
                    handleSubmit: vm.handleSubmit,
                    isSubmitting: vm.isSubmitting
                }}
                editing={vm.editing}
            />
        </div>
    );
}
