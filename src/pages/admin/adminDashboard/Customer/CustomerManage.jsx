import { Plus, Pencil, Trash2, Search, Users, Phone, Mail, Shield } from "lucide-react";
import { useCustomerLogic } from "./CustomerLogic.js";
import CustomerForm from "./CustomerForm.jsx";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import "./Customer.css";

export default function CustomerManage() {
    const cm = useCustomerLogic();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.roleId === "ROLE_ADMIN";
    const isEmployee = user?.roleId === "ROLE_EMPLOYEE";

    useEffect(() => {
        setMounted(true);
    }, []);

    // Theo BE security: ADMIN + EMPLOYEE truy cập, nhưng delete customer chỉ ADMIN
    if (!isAdmin && !isEmployee) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Khách Hàng</h1>
                        <p className="text-neutral-600">Quản lý thông tin khách hàng và tài khoản</p>
                    </div>
                    <button 
                        onClick={cm.openAdd}
                        className="btn-primary flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Thêm Khách Hàng</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Khách Hàng</p>
                                <p className="text-2xl font-bold text-neutral-900">{cm.stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Users className="text-primary-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Kết Quả Lọc</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {cm.stats.matched}
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
                                <p className="text-neutral-600 text-sm font-medium mb-1">Hồ Sơ Đầy Đủ</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {cm.stats.completionRate}%
                                </p>
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
                            value={cm.search}
                            onChange={(e) => cm.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>

                    <div className="sm:w-64">
                        <select
                            value={cm.sortBy}
                            onChange={(e) => cm.setSortBy(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        >
                            <option value="newest">Sắp xếp: Mới nhất</option>
                            <option value="oldest">Sắp xếp: Cũ nhất</option>
                            <option value="name_az">Sắp xếp: Tên A-Z</option>
                            <option value="name_za">Sắp xếp: Tên Z-A</option>
                            <option value="email_az">Sắp xếp: Email A-Z</option>
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
                                    Mã Khách Hàng
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Họ Tên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    SĐT
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Vai Trò
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Hành Động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {cm.paginatedCustomers.map((c, index) => (
                                <tr key={c.kh_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg">
                                            {c.kh_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <Users className="text-primary-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{c.kh_name}</p>
                                                <p className="text-xs text-neutral-500">Khách hàng</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Phone className="text-neutral-400" size={16} />
                                            <span className="text-neutral-900">{c.kh_phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="text-neutral-400" size={16} />
                                            <span className="text-neutral-900">{c.kh_mail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="badge-primary">Khách hàng</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => cm.openEdit(c)}
                                                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => cm.handleDelete(c.kh_id)}
                                                    className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {cm.paginatedCustomers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Users className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có khách hàng</h3>
                                            <p className="text-neutral-600">
                                                {cm.search ? 'Không tìm thấy khách hàng nào' : 'Bắt đầu bằng cách thêm khách hàng đầu tiên'}
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
            {cm.filteredCustomers.length > 0 && (
                <PaginationComponent
                    currentPage={cm.currentPage}
                    totalPages={cm.totalPages}
                    itemsPerPage={cm.itemsPerPage}
                    totalItems={cm.filteredCustomers.length}
                    onPageChange={cm.handlePageChange}
                    onPreviousPage={cm.handlePreviousPage}
                    onNextPage={cm.handleNextPage}
                    itemLabel="khách hàng"
                />
            )}

            {/* MODAL */}
            <CustomerForm
                open={cm.openForm}
                onClose={() => cm.setOpenForm(false)}
                onSubmit={{
                    form: cm.form,
                    setForm: cm.setForm,
                    handleSubmit: cm.handleSubmit
                }}
                editing={cm.editing}
            />
        </div>
    );
}
