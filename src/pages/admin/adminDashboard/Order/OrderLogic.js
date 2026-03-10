import { useMemo, useState, useEffect, useCallback } from "react";
import { getAllBills, updateBill } from "../../../../services/billService.js";

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

export function useOrderLogic() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  /* ================= LOAD DATA ================= */
  const loadOrders = useCallback(async () => {
    // Try cache first
    const cachedOrders = getCachedOrders();
    if (cachedOrders) {
      setOrders(cachedOrders);
      return;
    }

    // Load from API
    try {
      setLoading(true);
      const response = await getAllBills();
      const bills = response.data || [];
      const mappedOrders = bills.map((bill) => {
        const rawStatus = bill.status || "";

        let status = rawStatus;
        if (rawStatus === "Chờ xác nhận") status = "PENDING";
        else if (rawStatus === "Đơn đang chờ giao") status = "PENDING";
        else if (rawStatus === "Đang giao") status = "PENDING";
        else if (rawStatus === "Đã giao") status = "COMPLETED";
        else if (rawStatus === "Đã hủy") status = "CANCELLED";

        const createdAt = bill.date
          ? new Date(bill.date).toISOString().slice(0, 10)
          : "";

        const addressParts = [
          bill.address?.detailAddress,
          bill.address?.ward,
          bill.address?.city,
        ].filter(Boolean);

        return {
          order_id: bill.id || "",
          customer_name: bill.customer?.name || "N/A",
          customer_id: bill.customer?.id || "",
          customer_phone: bill.customer?.phone || "",
          total_amount: bill.totalAmount || 0,
          status,
          raw_status: rawStatus,
          created_at: createdAt,
          payment_method: bill.paymentMethod || "",
          address_id: bill.address?.id || "",
          address_detail: addressParts.join(", "),
          employee_id: bill.employee?.id || "",
        };
      });

      setCachedOrders(mappedOrders);
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      alert("Không thể tải danh sách đơn hàng. Vui lòng kiểm tra kết nối API.");
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
      // Clear cache and reload
      clearOrderCache();
      await loadOrders();
      alert("Cập nhật trạng thái đơn hàng thành công!");
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase());

      let matchStatus = true;
      if (statusFilter && statusFilter !== "ALL") {
        matchStatus = o.raw_status === statusFilter;
      }

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  /* ================= PAGINATION ================= */
  const paginatedOrders = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [search, statusFilter]);

  return {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredOrders,
    paginatedOrders,
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
