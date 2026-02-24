import React, { useState, useEffect } from "react";
import { useCart } from "../../../../contexts/CartContext";
import { decodeJwtPayload } from "../../../../utils/jwt";
import { getCustomerById } from "../../../../services/customer/customerService";
import { getAddresses } from "../../../../services/customer/addressService";

export default function InforStep({ onSubmit }) {
  const { cart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressId: "",
    note: "",
  });

  const [addresses, setAddresses] = useState([]);

  const inputStyle =
    "w-full h-12 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-primary transition";

  const formatCurrency = (v) => v.toLocaleString("vi-VN") + "₫";

  const handleChange = ({ target: { name, value } }) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = 0;
  const total = subtotal - discount;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const customerId = token ? decodeJwtPayload(token)?.sub : null;
    if (!customerId) return;

    const cacheKey = `customerInfo_${customerId}`;

    const applyCustomerData = (customer, addrList = []) => {
      const def = addrList.find((a) => a.default);
      const defaultAddressId = def?.id || "";

      setAddresses(addrList);

      setFormData((p) => ({
        ...p,
        fullName: customer?.name || p.fullName,
        phone: customer?.phone || p.phone,
        addressId: defaultAddressId || p.addressId,
      }));

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          ...customer,
          addresses: addrList,
          defaultAddressId,
        }),
      );
    };

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setAddresses(parsed.addresses || []);
        setFormData((p) => ({
          ...p,
          fullName: parsed.name || p.fullName,
          phone: parsed.phone || p.phone,
          addressId: parsed.defaultAddressId || p.addressId,
        }));
      }
    } catch (e) {
      console.error("fail", e);
    }

    (async () => {
      try {
        const [customer, addrRes] = await Promise.all([
          getCustomerById(customerId),
          getAddresses(customerId),
        ]);

        applyCustomerData(customer, addrRes.data || []);
      } catch (e) {
        console.error("Fail", e);
      }
    })();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    const selectedAddress =
      addresses.find((a) => String(a.id) === String(formData.addressId)) ||
      null;

    const shippingInfo = {
      fullName: formData.fullName,
      phone: formData.phone,
      note: formData.note,
      address: selectedAddress,
    };
    try {
      localStorage.setItem(
        "checkoutShippingInfo",
        JSON.stringify(shippingInfo),
      );
    } catch (err) {
      console.error("Không thể lưu checkoutShippingInfo", err);
    }

    onSubmit(shippingInfo);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 bg-white dark:bg-[#0f172a] p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Thông tin giao hàng</h1>
          <p className="text-slate-500 text-sm mt-1">
            Vui lòng nhập chính xác để đảm bảo giao hàng thành công.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Họ và tên
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Số điện thoại
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxx"
                className={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Chọn địa chỉ giao hàng
            </label>
            <select
              name="addressId"
              value={formData.addressId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {addresses.length === 0 ? (
                <option>Chưa có địa chỉ - vui lòng thêm ở trang hồ sơ</option>
              ) : (
                <>
                  <option value="">Chọn địa chỉ</option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {`${a.city} - ${a.ward} - ${a.detailAddress}`}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Ghi chú</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              placeholder="Yêu cầu đặc biệt nếu có"
              className={`${inputStyle} h-auto py-3 resize-none`}
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition"
          >
            Tiếp tục thanh toán
          </button>
        </form>
      </div>
      <aside className="lg:col-span-5 lg:sticky lg:top-24">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold">Chi tiết đơn hàng</h2>
          </div>

          <div className="p-6 space-y-4 border-b max-h-[400px] overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Số lượng: {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Mã giảm giá</span>
              <span className="text-red-500">-{formatCurrency(discount)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
