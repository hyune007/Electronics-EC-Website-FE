import React from "react";
import { updateBill } from "../../../services/billService";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function BottomActionBar({ order }) {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const decoded = jwtDecode(token);
    setEmployeeId(decoded.sub);
  }, []);

  const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const handleComplete = async (e, orderId) => {
    e.stopPropagation();
    try {
      await updateBill(orderId, "Đã giao", employeeId);
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
      await updateBill(orderId, "Đơn đã hủy", employeeId);
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
            {formatCurrency(order?.paymentMethod !== "Chuyển khoản ngân hàng" ? order.totalAmount : 0)}
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
