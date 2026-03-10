import { Plus, Pencil, Trash2, Search, Users, Phone, Mail, Briefcase, Shield, Loader2, ArrowDownWideNarrow, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useEmployeeLogic } from "./EmployeeLogic.js";
import EmployeeForm from "./EmployeeForm.jsx";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Employee.css";

export default function EmployeeManage() {
    const nv = useEmployeeLogic();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Kiểm tra quyền - chỉ ADMIN được phép
    if (user?.roleId !== "ROLE_ADMIN") {
        return <Navigate to="/unauthorized" replace />;
    }

    const getRoleBadge = (role) => {
        switch (role?.toLowerCase()) {
            case 'role_admin':
                return 'badge-danger';
            case 'role_manager':
                return 'badge-warning';
            case 'role_employee':
            case 'role_staff':
                return 'badge-success';
            default:
                return 'badge-primary';
        }
    };

    const getRoleName = (role) => {
        switch (role?.toLowerCase()) {
            case 'role_admin':
                return 'Admin';
            case 'role_manager':
                return 'Manager';
            case 'role_employee':
                return 'Nhân viên';
            case 'role_staff':
                return 'Staff';
            default:
                return role;
        }
    };

    const renderSortIcon = (column) => {
        if (column === "id") {
            if (nv.sortBy === "newest_id") return <ChevronDown size={14} className="text-indigo-600" />;
            if (nv.sortBy === "oldest_id") return <ChevronUp size={14} className="text-indigo-600" />;
            return <ArrowUpDown size={14} className="text-neutral-400" />;
        }

        if (column === "name") {
            if (nv.sortBy === "name_az") return <ChevronUp size={14} className="text-indigo-600" />;
            if (nv.sortBy === "name_za") return <ChevronDown size={14} className="text-indigo-600" />;
            return <ArrowUpDown size={14} className="text-neutral-400" />;
        }

        if (column === "role") {
            if (nv.sortBy === "role") return <ChevronUp size={14} className="text-indigo-600" />;
            return <ArrowUpDown size={14} className="text-neutral-400" />;
        }

        return null;
    };

    const handleSortById = () => {
        nv.setSortBy(nv.sortBy === "newest_id" ? "oldest_id" : "newest_id");
    };

    const handleSortByName = () => {
        nv.setSortBy(nv.sortBy === "name_az" ? "name_za" : "name_az");
    };

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Nhân Viên</h1>
                        <p className="text-neutral-600">Quản lý thông tin nhân viên và phân quyền</p>
                    </div>
                    <button 
                        onClick={nv.openAdd}
                        className="btn-primary flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Thêm Nhân Viên</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Nhân Viên</p>
                                <p className="text-2xl font-bold text-neutral-900">{nv.stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Users className="text-primary-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Hiển Thị Trang</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {nv.stats.onPage}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Search className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Admin / Nhân viên</p>
                                <p className="text-2xl font-bold text-neutral-900">{nv.stats.adminCount} / {nv.stats.employeeCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Shield className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 search-box">
                        <Search className="text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc SĐT..."
                            value={nv.search}
                            onChange={(e) => nv.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>

                    <div className="sort-box sm:w-80">
                        <ArrowDownWideNarrow className="text-neutral-400" size={20} />
                        <select
                            value={nv.sortBy}
                            onChange={(e) => nv.setSortBy(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900"
                        >
                            <option value="newest_id">Sắp xếp: Mã mới nhất</option>
                            <option value="oldest_id">Sắp xếp: Mã cũ nhất</option>
                            <option value="name_az">Sắp xếp: Tên A-Z</option>
                            <option value="name_za">Sắp xếp: Tên Z-A</option>
                            <option value="role">Sắp xếp: Vai trò</option>
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
                                    <button type="button" className="sortable-header" onClick={handleSortById}>
                                        <span>Mã Nhân Viên</span>
                                        {renderSortIcon("id")}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    <button type="button" className="sortable-header" onClick={handleSortByName}>
                                        <span>Họ Tên</span>
                                        {renderSortIcon("name")}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    SĐT
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    <button type="button" className="sortable-header" onClick={() => nv.setSortBy("role")}>
                                        <span>Vai Trò</span>
                                        {renderSortIcon("role")}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Hành Động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {nv.loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                            <p className="mt-4 text-neutral-600">Đang tải...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : nv.paginatedEmployees.map((e, index) => (
                                <tr key={e.nv_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                                            {e.nv_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <Briefcase className="text-primary-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{e.nv_name}</p>
                                                <p className="text-xs text-neutral-500">Nhân viên</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Phone className="text-neutral-400" size={16} />
                                            <span className="text-neutral-900">{e.nv_phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="text-neutral-400" size={16} />
                                            <span className="text-neutral-900">{e.nv_mail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={getRoleBadge(e.nv_role)}>
                                            {getRoleName(e.nv_role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => nv.openEdit(e)}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => nv.handleDelete(e.nv_id)}
                                                disabled={nv.deletingId === e.nv_id}
                                                className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Xóa"
                                            >
                                                {nv.deletingId === e.nv_id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {nv.paginatedEmployees.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Briefcase className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có nhân viên</h3>
                                            <p className="text-neutral-600">
                                                {nv.search ? 'Không tìm thấy nhân viên nào' : 'Bắt đầu bằng cách thêm nhân viên đầu tiên'}
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
            {!nv.loading && nv.filteredEmployees.length > 0 && (
                <PaginationComponent
                    currentPage={nv.currentPage}
                    totalPages={nv.totalPages}
                    itemsPerPage={nv.itemsPerPage}
                    totalItems={nv.stats.total}
                    onPageChange={nv.handlePageChange}
                    onPreviousPage={nv.handlePreviousPage}
                    onNextPage={nv.handleNextPage}
                    itemLabel="nhân viên"
                />
            )}

            {/* MODAL */}
            <EmployeeForm
                open={nv.openForm}
                onClose={() => nv.setOpenForm(false)}
                onSubmit={{
                    form: nv.form,
                    setForm: nv.setForm,
                    handleSubmit: nv.handleSubmit
                }}
                editing={nv.editing}
            />
        </div>
    );
}
