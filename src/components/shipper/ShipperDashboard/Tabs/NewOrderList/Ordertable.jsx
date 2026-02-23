import React from "react";
import orders from "../../../../../mocks/mockOrderShipper";
const ordersList = orders.newOrder;
export default function OrderTable({ onSelectOrder, selectedOrder }) {
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
                <td className="p-3">{order.name}</td>
                <td className="p-3">{order.address}</td>
                <td className="p-3 font-bold">{order.price}</td>
                <td className="p-3">
                  <button className="bg-primary text-white px-3 py-1 rounded-md shadow-sm hover:opacity-95">
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
                {order.id} • {order.name}
              </div>
              <div className="text-xs text-slate-400">{order.address}</div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-bold">{order.price}</div>
              <button className="mt-2 w-full bg-primary text-white px-3 py-1 rounded-md text-sm">
                Nhận
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
