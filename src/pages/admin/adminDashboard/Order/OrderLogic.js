import { useMemo, useState } from "react";
import { mockOrder } from "../../../../mocks/mockOrder.js";

export function useOrderLogic() {
  const [orders] = useState(mockOrder);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.order_id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredOrders,
  };
}
