import { useMemo, useState, useEffect, useCallback } from "react";
import { getAllBills, updateBill } from "../../../../services/billService.js";
import { showToast } from "../../../../utils/adminToast.js";

// Cache helpers
const CACHE_KEY = "order_data_api";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (shorter for orders)

function getCachedOrders() {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);
    const now = Date.now();
    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.orders;
  } catch (err) {
    console.error("Error reading cache:", err);
    return null;
  }
}

function setCachedOrders(orders) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        orders,
        timestamp: Date.now(),
      }),
    );
  } catch (err) {
    console.error("Error writing cache:", err);
  }
}

function clearOrderCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.error("Error clearing cache:", err);
  }
}

// Shared mapping helper – keeps loadOrders and handleUpdateStatus in sync
function mapBillsToOrders(bills) {
  return (bills || []).map((bill) => {
    const rawStatus = bill.status || "";
    let status = rawStatus;
    if (rawStatus === "Chờ xác nhận")       status = "PENDING";
    else if (rawStatus === "Đơn đang chờ giao") status = "PENDING";
    else if (rawStatus === "Đang giao")      status = "PENDING";
    else if (rawStatus === "Đã giao")        status = "COMPLETED";
    else if (rawStatus === "Đã hủy")         status = "CANCELLED";
    const createdAt = bill.date
      ? new Date(bill.date).toISOString().slice(0, 10)
      : "";
    const addressParts = [
      bill.address?.detailAddress,
      bill.address?.ward,
      bill.address?.city,
    ].filter(Boolean);
    return {
      order_id:       bill.id || "",
      customer_name:  bill.customer?.name || "N/A",
      customer_id:    bill.customer?.id || "",
      customer_phone: bill.customer?.phone || "",
      total_amount:   bill.totalAmount || 0,
      status,
      raw_status:     rawStatus,
      created_at:     createdAt,
      payment_method: bill.paymentMethod || "",
      address_id:     bill.address?.id || "",
      address_detail: addressParts.join(", "),
      employee_id:    bill.employee?.id || "",
    };
  });
}

export function useOrderLogic() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  /* ================= LOAD DATA ================= */
  const loadOrders = useCallback(async () => {
    const cachedOrders = getCachedOrders();
    if (cachedOrders) {
      setOrders(cachedOrders);
      // Refresh in background to stay current
      getAllBills()
        .then((response) => {
          const bills = response.data || [];
          const mappedOrders = mapBillsToOrders(bills);
          setCachedOrders(mappedOrders);
          setOrders(mappedOrders);
        })
        .catch((error) => {
          console.error("Background refresh orders failed:", error);
        });
      return;
    }

    try {
      setLoading(true);
      const response = await getAllBills();
      const bills = response.data || [];
      const mappedOrders = mapBillsToOrders(bills);

      setCachedOrders(mappedOrders);
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      showToast("Không thể tải danh sách đơn hàng. Vui lòng kiểm tra kết nối API.", "error", 3400);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  /* ================= UPDATE STATUS ================= */
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateBill(orderId, newStatus);
      // Fetch fresh data and update everywhere
      clearOrderCache();
      const response = await getAllBills();
      const fresh = mapBillsToOrders(response.data || []);
      setCachedOrders(fresh);
      setOrders(fresh);
      showToast("Cập nhật trạng thái đơn hàng thành công", "success");
    } catch (error) {
      console.error("Failed to update order status:", error);
      showToast("Không thể cập nhật trạng thái đơn hàng", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderId = String(o.order_id || "").toLowerCase();
      const customerName = String(o.customer_name || "").toLowerCase();
      const customerPhone = String(o.customer_phone || "").toLowerCase();
      const keyword = search.toLowerCase().trim();

      const matchSearch =
        orderId.includes(keyword) ||
        customerName.includes(keyword) ||
        customerPhone.includes(keyword);

      let matchStatus = true;
      if (statusFilter && statusFilter !== "ALL") {
        matchStatus = o.raw_status === statusFilter;
      }

      let matchPayment = true;
      if (paymentFilter && paymentFilter !== "ALL") {
        matchPayment = String(o.payment_method || "") === paymentFilter;
      }

      let matchDate = true;
      if (dateFrom) {
        matchDate = matchDate && String(o.created_at || "") >= dateFrom;
      }
      if (dateTo) {
        matchDate = matchDate && String(o.created_at || "") <= dateTo;
      }

      return matchSearch && matchStatus && matchPayment && matchDate;
    });
  }, [orders, search, statusFilter, paymentFilter, dateFrom, dateTo]);

  const groupedOrders = useMemo(() => {
    const groups = new Map();

    filteredOrders.forEach((order) => {
      const key = `${order.customer_id || "unknown"}-${order.customer_name || "Khách vãng lai"}`;

      if (!groups.has(key)) {
        groups.set(key, {
          customer_key: key,
          customer_id: order.customer_id || "",
          customer_name: order.customer_name || "Khách vãng lai",
          customer_phone: order.customer_phone || "",
          orders: [],
          total_spent: 0,
          last_order_date: "",
        });
      }

      const group = groups.get(key);
      group.orders.push(order);
      group.total_spent += Number(order.total_amount || 0);

      if (!group.last_order_date || String(order.created_at) > group.last_order_date) {
        group.last_order_date = order.created_at;
      }
    });

    return Array.from(groups.values())
      .map((g) => ({
        ...g,
        total_orders: g.orders.length,
        pending_count: g.orders.filter((o) => o.status === "PENDING").length,
        completed_count: g.orders.filter((o) => o.status === "COMPLETED").length,
        cancelled_count: g.orders.filter((o) => o.status === "CANCELLED").length,
        orders: g.orders.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))),
      }))
      .sort((a, b) => b.total_orders - a.total_orders || String(b.last_order_date).localeCompare(String(a.last_order_date)));
  }, [filteredOrders]);

  /* ================= PAGINATION ================= */
  const paginatedGroups = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return groupedOrders.slice(startIndex, endIndex);
  }, [groupedOrders, currentPage]);

  const totalPages = Math.ceil(groupedOrders.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      search.trim() ||
        statusFilter !== "ALL" ||
        paymentFilter !== "ALL" ||
        dateFrom ||
        dateTo,
    );
  }, [search, statusFilter, paymentFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(0);
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [search, statusFilter, paymentFilter, dateFrom, dateTo]);

  const paymentMethods = useMemo(() => {
    const values = new Set(
      orders
        .map((o) => String(o.payment_method || "").trim())
        .filter(Boolean),
    );

    return Array.from(values);
  }, [orders]);

  return {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    paymentMethods,
    hasActiveFilters,
    clearFilters,
    filteredOrders,
    groupedOrders,
    paginatedGroups,
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleUpdateStatus,
    reloadOrders: loadOrders,
  };
}
