import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBills } from "../../../../../services/billService";

export default function CanceledOrderTable({ onSelectOrder, selectedOrder }) {
  const [ordersList, setOrdersList] = useState([]);
  useEffect(() => {
    const fetchBills = async () => {
      const res = await getAllBills();
      setOrdersList(res.data.filter(b => b.status === "Đơn đã hủy"));
    };
    fetchBills();
  }, []);
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-neutral-200">
      <div className="p-4 font-bold flex items-center justify-between">
        <div>Đơn hàng bị hủy</div>
        <div className="text-xs text-slate-400">{ordersList.length} đơn</div>
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="p-3 font-semibold">Mã đơn hàng</th>
              <th className="p-3 font-semibold">Họ tên</th>
              <th className="p-3 font-semibold">Số điện thoại</th>
              <th className="p-3 font-semibold">Địa chỉ</th>
              <th className="p-3 font-semibold">Giá</th>
              <th className="p-3 font-semibold">Lý do hủy đơn</th>
              <th className="p-3 font-semibold text-center">Xem chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {ordersList.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder?.(order)}
                className={`border-t cursor-pointer transition hover:bg-neutral-100 ${selectedOrder?.id === order.id ? "bg-blue-50 dark:bg-slate-800" : ""}`}
              >
                <td className="p-3 font-bold text-primary">{order.id}</td>
                <td className="p-3">{order.customer.name}</td>
                <td className="p-3">{order.customer.phone}</td>
                <td className="p-3">{order.address.detailAddress}, {order.address.ward}, {order.address.city}</td>
                <td className="p-3 font-semibold">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="p-3">
                  {order.noteFromShipper || order.noteFromCustomer}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      onSelectOrder?.(order);
                      navigate(`/active-task/${order.id}`);
                    }}
                    className="bg-primary text-white px-3 py-1 rounded-md text-xs hover:opacity-90"
                  >
                    Xem
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
            onClick={() => {
              onSelectOrder?.(order);
              navigate(`/active-task/${order.id}`);
            }}
            className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition ${selectedOrder?.id === order.id ? "bg-blue-50 dark:bg-slate-800" : "bg-white dark:bg-slate-900"}`}
          >
            <div className="flex-1">
              <div className="text-sm font-semibold text-primary">
                {order.id} • {order.customer.name}
              </div>
              <div className="text-xs text-slate-400">{order.address.detailAddress}, {order.address.ward}, {order.address.city}</div>
              <div className="text-xs text-slate-400 mt-1">
                {order.noteFromShipper || order.noteFromCustomer}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-bold">{formatCurrency(order.totalAmount)}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/active-task/${order.id}`);
                }}
                className="mt-2 w-full bg-primary text-white px-3 py-1 rounded-md text-sm"
              >
                Xem
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
