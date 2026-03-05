import { Search, Package, User, Calendar, DollarSign, CheckCircle, Clock, XCircle, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useOrderLogic } from "./OrderLogic.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import { useState, useEffect } from "react";
import "./Order.css";

export default function OrderManage() {
    const om = useOrderLogic();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return 'badge-warning';
            case 'COMPLETED':
                return 'badge-success';
            case 'CANCELLED':
                return 'badge-danger';
            default:
                return 'badge-primary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock size={14} />;
            case 'COMPLETED':
                return <CheckCircle size={14} />;
            case 'CANCELLED':
                return <XCircle size={14} />;
            default:
                return <Package size={14} />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xử lý';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    return (
        <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Quản Lý Đơn Hàng</h1>
                        <p className="text-neutral-600">Theo dõi và quản lý các đơn hàng của khách hàng</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Tổng Đơn Hàng</p>
                                <p className="text-2xl font-bold text-neutral-900">{om.filteredOrders.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Package className="text-primary-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Chờ Xử Lý</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {om.filteredOrders.filter(o => o.status === 'PENDING').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Hoàn Thành</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {om.filteredOrders.filter(o => o.status === 'COMPLETED').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-600 text-sm font-medium mb-1">Đã Hủy</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {om.filteredOrders.filter(o => o.status === 'CANCELLED').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <XCircle className="text-red-600" size={24} />
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
                            placeholder="Tìm theo mã đơn / khách hàng..."
                            value={om.search}
                            onChange={(e) => om.setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none ml-3 text-neutral-900 placeholder-neutral-400"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                        <select
                            value={om.statusFilter}
                            onChange={(e) => om.setStatusFilter(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
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
                                    Mã Đơn Hàng
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Khách Hàng
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Ngày Tạo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Tổng Tiền
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                    Trạng Thái
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {om.paginatedOrders.map((order, index) => (
                                <tr key={order.order_id} className="table-row" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <Package className="text-primary-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="font-mono text-sm font-medium text-neutral-900">{order.order_id}</p>
                                                <p className="text-xs text-neutral-500">Đơn hàng</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                                                <User className="text-neutral-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{order.customer_name}</p>
                                                <p className="text-xs text-neutral-500">Khách hàng</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-neutral-400" size={16} />
                                            <span className="text-neutral-900">{order.created_at}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="text-neutral-400" size={16} />
                                            <span className="font-semibold text-neutral-900">
                                                {order.total_amount?.toLocaleString('vi-VN')} ₫
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={getStatusBadge(order.status)}>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(order.status)}
                                                <span>{getStatusText(order.status)}</span>
                                            </div>
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {om.paginatedOrders.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="text-center">
                                            <Package className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có đơn hàng</h3>
                                            <p className="text-neutral-600">
                                                {om.search || om.statusFilter !== 'ALL' 
                                                    ? 'Không tìm thấy đơn hàng nào' 
                                                    : 'Chưa có đơn hàng nào được tạo'
                                                }
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
            {om.filteredOrders.length > 0 && (
                <PaginationComponent
                    currentPage={om.currentPage}
                    totalPages={om.totalPages}
                    itemsPerPage={om.itemsPerPage}
                    totalItems={om.filteredOrders.length}
                    onPageChange={om.handlePageChange}
                    onPreviousPage={om.handlePreviousPage}
                    onNextPage={om.handleNextPage}
                    itemLabel="đơn hàng"
                />
            )}
        </div>
    );
}
