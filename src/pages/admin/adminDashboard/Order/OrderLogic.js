import { useMemo, useState, useEffect, useCallback } from "react";
import { mockOrder } from "../../../../mocks/mockOrder.js";

// Cache helpers
const CACHE_KEY = "order_data";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCachedOrders() {
    try {
        const data = localStorage.getItem(CACHE_KEY);
        if (!data) return null;
        
        const parsed = JSON.parse(data);
        const now = Date.now();
        
        // Check if cache is still valid
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
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            orders,
            timestamp: Date.now()
        }));
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  /* ================= LOAD DATA ================= */
  const loadOrders = useCallback(() => {
    // Try cache first
    const cachedOrders = getCachedOrders();
    if (cachedOrders) {
      setOrders(cachedOrders);
      return;
    }

    // Load from mock and cache
    setCachedOrders(mockOrder);
    setOrders(mockOrder);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;

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
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [search, statusFilter]);

  return {
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
  };
}
