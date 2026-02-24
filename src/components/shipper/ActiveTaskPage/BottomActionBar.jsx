import React from "react";
import { updateBill } from "../../../services/billService";
import { useNavigate } from "react-router-dom";

export default function BottomActionBar({ order }) {
  const navigate = useNavigate();

  const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const handleComplete = async (e, orderId) => {
    e.stopPropagation();
    try {
      await updateBill(orderId, "Đã giao");
      alert("Đã hoàn thành đơn hàng");
      navigate("/shipper-dashboard");
    } catch (err) {
      console.error(err);
      alert("Không thể hoàn thành đơn hàng");
    }
  };

  const handleReject = async (e, orderId) => {
    e.stopPropagation();
    try {
      await updateBill(orderId, "Đã hủy");
      alert("Đã hủy đơn hàng");
      navigate("/shipper-dashboard");
    } catch (err) {
      console.error(err);
      alert("Không thể hủy đơn hàng");
    }
  };

  return (
    <footer className="bg-[#111418] border-t border-slate-800 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto">
          <div className="text-xs text-slate-400">COD</div>
          <div className="font-bold text-xl">
            {formatCurrency(order?.totalAmount)}
          </div>
        </div>

        {order?.status === "Đang giao" && (
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={(e) => handleReject(e, order?.id)}
              className="w-full sm:w-auto bg-red-500 px-4 py-2 rounded-lg"
            >
              Hủy đơn hàng
            </button>

            <button
              onClick={(e) => handleComplete(e, order?.id)}
              className="w-full sm:w-auto bg-green-600 px-4 py-2 rounded-lg font-bold"
            >
              Xác nhận giao
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}