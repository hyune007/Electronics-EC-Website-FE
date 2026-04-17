import {
  Search,
  Package,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  ChevronDown,
  CreditCard,
  ChevronsDown,
  ChevronsUp,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useOrderLogic } from "./OrderLogic.js";
import { approveReturn, rejectReturn } from "../../../../services/billService.js";
import { getBillDetails } from "../../../../services/customer/billDetailServiceCustomer.js";
import PaginationComponent from "../../../../components/common/PaginationComponent.jsx";
import OrderDetailModal from "../../../../components/manage/OrderDetailModal.jsx";
import { Fragment, useState, useEffect } from "react";
import { showToast } from "../../../../utils/adminToast.js";
import "./Order.css";

export default function OrderManage() {
  const om = useOrderLogic();
  const [mounted, setMounted] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [updatingReturnId, setUpdatingReturnId] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return "badge-warning";
      case "COMPLETED":
        return "badge-success";
      case "CANCELLED":
        return "badge-danger";
      default:
        return "badge-primary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock size={14} />;
      case "COMPLETED":
        return <CheckCircle size={14} />;
      case "CANCELLED":
        return <XCircle size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const getStatusText = (status) => status || "";

  const toggleCustomer = (customerKey) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [customerKey]: !prev[customerKey],
    }));
  };

  const handleExpandVisible = () => {
    setExpandedCustomers((prev) => {
      const next = { ...prev };
      om.paginatedGroups.forEach((group) => {
        next[group.customer_key] = true;
      });
      return next;
    });
  };

  const handleCollapseVisible = () => {
    setExpandedCustomers((prev) => {
      const next = { ...prev };
      om.paginatedGroups.forEach((group) => {
        next[group.customer_key] = false;
      });
      return next;
    });
  };

  const handleApproveReturn = async (billId) => {
    if (updatingReturnId === billId) return;

    try {
      setUpdatingReturnId(billId);

      await approveReturn(billId);

      showToast("Đã duyệt trả hàng", "success");

      om.refreshOrders();
    } catch (error) {
      showToast(
        error?.response?.data?.message || error?.response?.data || "Không thể duyệt trả hàng",
        "error",
      );
    } finally {
      setUpdatingReturnId(null);
    }
  };

  const handleRejectReturn = async (billId) => {
    if (updatingReturnId === billId) return;

    try {
      setUpdatingReturnId(billId);

      await rejectReturn(billId);

      showToast("Đã từ chối trả hàng", "success");

      om.refreshOrders();
    } catch (error) {
      showToast(
        error?.response?.data?.message || error?.response?.data || "Không thể từ chối trả hàng",
        "error",
      );
    } finally {
      setUpdatingReturnId(null);
    }
  };

  const expandedVisibleCount = om.paginatedGroups.filter(
    (group) => expandedCustomers[group.customer_key],
  ).length;

  const openOrderDetails = async (order) => {
    try {
      setDetailsLoading(true);
      setOrderModalOpen(true);
      const resp = await getBillDetails(order.order_id);
      const payload = resp?.data ?? resp;

      let items = [];
      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload?.data)) {
        items = payload.data;
      } else if (Array.isArray(payload?.items)) {
        items = payload.items;
      } else if (Array.isArray(payload?.details)) {
        items = payload.details;
      } else if (Array.isArray(payload?.products)) {
        items = payload.products;
      }

      setOrderDetails({ order, items });
    } catch (err) {
      console.error("Failed to load order details", err);
      showToast("Không thể tải chi tiết đơn hàng", "error");
      setOrderDetails({ order, items: [] });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className={`fade-in min-h-full ${mounted ? "slide-up" : ""}`}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Quản Lý Đơn Hàng
            </h1>
            <p className="text-neutral-600">
              Theo dõi và quản lý các đơn hàng của khách hàng
            </p>
          </div>

          {om.isRefreshing && !om.loading && (
            <div className="order-sync-pill">
              <Loader2 size={16} className="animate-spin" />
              <span>Đang đồng bộ dữ liệu...</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium mb-1">
                  Tổng Đơn Hàng
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {om.filteredOrders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium mb-1">
                  Chờ Xử Lý
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {
                    om.filteredOrders.filter(
                      (o) => o.raw_status === "Chờ xác nhận",
                    ).length
                  }
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
                <p className="text-neutral-600 text-sm font-medium mb-1">
                  Hoàn Thành
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {
                    om.filteredOrders.filter((o) => o.raw_status === "Đã giao")
                      .length
                  }
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
                <p className="text-neutral-600 text-sm font-medium mb-1">
                  Đã Hủy
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {
                    om.filteredOrders.filter((o) => o.raw_status === "Đã hủy")
                      .length
                  }
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
        <div className="order-toolbar mb-4">
          <div className="order-toolbar-summary">
            <p className="text-sm font-semibold text-neutral-800">Bộ lọc thông minh</p>
            <p className="text-xs text-neutral-500">
              Hiển thị {om.groupedOrders.length} khách hàng, {om.filteredOrders.length} đơn hàng
            </p>
          </div>

          <div className="order-toolbar-actions">
            <button
              type="button"
              className="order-action-btn"
              onClick={handleExpandVisible}
              disabled={om.paginatedGroups.length === 0 || expandedVisibleCount === om.paginatedGroups.length}
            >
              <ChevronsDown size={15} /> Mở tất cả
            </button>

            <button
              type="button"
              className="order-action-btn"
              onClick={handleCollapseVisible}
              disabled={expandedVisibleCount === 0}
            >
              <ChevronsUp size={15} /> Thu gọn
            </button>

            <button
              type="button"
              className="order-action-btn order-action-btn-danger"
              onClick={om.clearFilters}
              disabled={!om.hasActiveFilters}
            >
              <RotateCcw size={15} /> Xóa lọc
            </button>
          </div>
        </div>

        <div className="order-filter-grid">
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
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <select
              value={om.statusFilter}
              onChange={(e) => om.setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đơn đang chờ giao">Đơn đang chờ giao</option>
              <option value="Đang giao">Đang giao</option>
              <option value="Đã giao">Hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
              <option value="Trả hàng">Trả hàng</option>
            </select>
          </div>

          <div className="relative">
            <CreditCard
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <select
              value={om.paymentFilter}
              onChange={(e) => om.setPaymentFilter(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            >
              <option value="ALL">Tất cả thanh toán</option>
              {om.paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <input
            type="date"
            value={om.dateFrom}
            onChange={(e) => om.setDateFrom(e.target.value)}
            className="px-3 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            title="Từ ngày"
          />

          <input
            type="date"
            value={om.dateTo}
            onChange={(e) => om.setDateTo(e.target.value)}
            className="px-3 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            title="Đến ngày"
          />
        </div>

        {om.hasActiveFilters && (
          <div className="order-active-filters mt-4">
            {om.search && <span className="order-filter-chip">Từ khóa: {om.search}</span>}
            {om.statusFilter !== "ALL" && <span className="order-filter-chip">Trạng thái: {om.statusFilter}</span>}
            {om.paymentFilter !== "ALL" && <span className="order-filter-chip">Thanh toán: {om.paymentFilter}</span>}
            {om.dateFrom && <span className="order-filter-chip">Từ ngày: {om.dateFrom}</span>}
            {om.dateTo && <span className="order-filter-chip">Đến ngày: {om.dateTo}</span>}
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="table-container">
        {om.loadError && !om.loading && om.orders.length === 0 && (
          <div className="order-error-state">
            <div className="order-error-icon">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="order-error-title">Không tải được danh sách đơn hàng</p>
              <p className="order-error-text">{om.loadError}</p>
            </div>
            <button
              type="button"
              className="order-action-btn"
              onClick={() => om.refreshOrders().catch(() => { })}
            >
              <RotateCcw size={15} /> Thử lại
            </button>
          </div>
        )}

        {om.loading ? (
          <div className="order-loading-state">
            <Loader2 size={28} className="animate-spin text-primary-600" />
            <p className="order-loading-title">Đang tải đơn hàng...</p>
            <p className="order-loading-text">Hệ thống đang đồng bộ dữ liệu đơn hàng mới nhất.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full order-group-table">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Khách Hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Số Đơn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Tổng Chi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Trạng Thái Đơn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                    Mở rộng
                  </th>
                </tr>
              </thead>
              <tbody>
                {om.paginatedGroups.map((group, index) => {
                  const isOpen = !!expandedCustomers[group.customer_key];

                  return (
                    <Fragment key={group.customer_key}>
                      <tr
                        className="table-row cursor-pointer order-customer-row"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => toggleCustomer(group.customer_key)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                              <User className="text-neutral-600" size={16} />
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900 order-customer-name">
                                {group.customer_name}
                              </p>
                              <p className="text-xs text-neutral-500">{group.customer_phone || "Không có SĐT"}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-neutral-900">{group.total_orders}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-neutral-900">
                            {group.total_spent.toLocaleString("vi-VN")} ₫
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 order-status-pills">
                            <span className="badge-warning">Chờ xử lý: {group.pending_count}</span>
                            <span className="badge-success">Hoàn thành: {group.completed_count}</span>
                            <span className="badge-danger">Đã hủy: {group.cancelled_count}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            className="p-2 rounded-lg hover:bg-neutral-100 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCustomer(group.customer_key);
                            }}
                          >
                            <ChevronDown
                              size={18}
                              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        </td>
                      </tr>

                      {isOpen &&
                        group.orders.map((order) => (
                          <tr
                            key={order.order_id}
                            className="order-child-row cursor-pointer"
                            onClick={() => openOrderDetails(order)}
                          >
                            <td className="px-10 py-3" colSpan={2}>
                              <div className="order-child-indent flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                  <Package className="text-primary-600" size={14} />
                                </div>
                                <div>
                                  <p className="font-mono text-sm font-medium text-neutral-900">{order.order_id}</p>
                                  <p className="text-xs text-neutral-500">{order.created_at}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-3">
                              <span className="font-semibold text-neutral-900">
                                {order.total_amount?.toLocaleString("vi-VN")} ₫
                              </span>
                            </td>

                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <span className={getStatusBadge(order.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    <span>{getStatusText(order.raw_status || order.status)}</span>
                                  </div>
                                </span>

                                {order.raw_status === "Chờ xác nhận" && (
                                  <button
                                    type="button"
                                    disabled={om.updatingOrderId === order.order_id}
                                    className="px-3 py-1 text-xs rounded-md bg-[var(--color-primary)] text-white hover:opacity-90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      om.handleUpdateStatus(order.order_id, "Đơn đang chờ giao");
                                    }}
                                  >
                                    {om.updatingOrderId === order.order_id ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Loader2 size={12} className="animate-spin" />
                                        Đang cập nhật
                                      </span>
                                    ) : (
                                      "Xác nhận đơn"
                                    )}
                                  </button>
                                )}
                                {order.raw_status === "Yêu cầu trả hàng" && (
                                  <div className="flex gap-2">
                                    {/* Approve */}
                                    <button
                                      type="button"
                                      disabled={updatingReturnId === order.order_id}
                                      className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:opacity-90"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApproveReturn(order.order_id);
                                      }}
                                    >
                                      {updatingReturnId === order.order_id ? (
                                        <span className="inline-flex items-center gap-1">
                                          <Loader2 size={12} className="animate-spin" />
                                          Đang duyệt
                                        </span>
                                      ) : (
                                        "Duyệt"
                                      )}
                                    </button>

                                    {/* Reject */}
                                    <button
                                      type="button"
                                      disabled={updatingReturnId === order.order_id}
                                      className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:opacity-90"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRejectReturn(order.order_id);
                                      }}
                                    >
                                      {updatingReturnId === order.order_id ? (
                                        <span className="inline-flex items-center gap-1">
                                          <Loader2 size={12} className="animate-spin" />
                                          Đang xử lý
                                        </span>
                                      ) : (
                                        "Từ chối"
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-3 text-xs text-neutral-500 order-detail-hint">Click để xem chi tiết</td>
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}

                {om.paginatedGroups.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-center">
                        <Package className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">Không có đơn hàng</h3>
                        <p className="text-neutral-600">
                          {om.search || om.statusFilter !== "ALL" || om.paymentFilter !== "ALL" || om.dateFrom || om.dateTo
                            ? "Không tìm thấy đơn hàng nào"
                            : "Chưa có đơn hàng nào được tạo"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {om.filteredOrders.length > 0 && (
        <PaginationComponent
          currentPage={om.currentPage}
          totalPages={om.totalPages}
          itemsPerPage={om.itemsPerPage}
          totalItems={om.groupedOrders.length}
          onPageChange={om.handlePageChange}
          onPreviousPage={om.handlePreviousPage}
          onNextPage={om.handleNextPage}
          itemLabel="khách hàng"
        />
      )}

      <OrderDetailModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        orderDetails={orderDetails}
        loading={detailsLoading}
      />
    </div>
  );
}
