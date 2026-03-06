import React, { useState, useEffect } from "react";
import { getAllBills, updateBill } from "../../../../../services/billService";
import { jwtDecode } from "jwt-decode";
export default function OrderTable({ onSelectOrder, selectedOrder }) {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  const [ordersList, setOrdersList] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const decoded = jwtDecode(token);
    setEmployeeId(decoded.sub);
  }, []);

  useEffect(() => {
    const fetchBills = async () => {
      const res = await getAllBills();
      setOrdersList(res.data.filter(b => b.status === "Đơn đang chờ giao"));
    };
    fetchBills();
  }, []);

  const handleAccept = async (e, orderId) => {
    e.stopPropagation();
    try {
      await updateBill(orderId, "Đang giao", employeeId);
      setOrdersList((prev) =>
        prev.filter((order) => order.id !== orderId)
      );
      alert("Đã nhận đơn hàng");
    } catch (err) {
      console.error(err);
      alert("Không thể nhận đơn hàng");
    }
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-neutral-200">
      <div className="p-4 font-bold flex items-center justify-between">
        <div>Đơn hàng mới</div>
        <div className="text-xs text-slate-400">{ordersList.length} đơn</div>
      </div>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <tbody>
            {ordersList.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`border-t cursor-pointer transition hover:bg-neutral-100 ${selectedOrder?.id === order.id ? "bg-blue-50 dark:bg-slate-800" : ""}`}
              >
                <td className="p-3 text-primary font-bold">{order.id}</td>
                <td className="p-3">{order.customer.name}</td>
                <td className="p-3">{order.address.detailAddress}, {order.address.ward}, {order.address.city}</td>
                <td className="p-3 font-bold">{formatCurrency(order.totalAmount)}</td>
                <td className="p-3">
                  <button
                    onClick={(e) => handleAccept(e, order.id)}
                    className="bg-primary text-white px-3 py-1 rounded-md shadow-sm hover:opacity-95">
                    Nhận
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="block lg:hidden divide-y">
        {ordersList.map((order) => (
          <div
            key={order.id}
            onClick={() => onSelectOrder(order)}
            className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition ${selectedOrder?.id === order.id ? "bg-blue-50 dark:bg-slate-800" : "bg-white dark:bg-slate-900"}`}
          >
            <div className="flex-1">
              <div className="text-sm font-semibold text-primary">
                {order.id} • {order.customer.name}
              </div>
              <div className="text-xs text-slate-400">{order.address.detailAddress}, {order.address.ward}, {order.address.city}</div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-bold">{formatCurrency(order.totalAmount)}</div>
              <button
                onClick={(e) => handleAccept(e, order.id)}
                className="mt-2 w-full bg-primary text-white px-3 py-1 rounded-md text-sm">
                Nhận
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
