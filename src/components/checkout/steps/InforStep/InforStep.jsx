import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useCart } from "../../../../contexts/CartContext";
import { decodeJwtPayload } from "../../../../utils/jwt";
import { getCustomerById } from "../../../../services/customer/customerService";
import { getAddresses } from "../../../../services/customer/addressService";
import Warning from "../../../common/Warning";

export default function InforStep({ onSubmit }) {
  const { cart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressId: "",
    note: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressWarning, setShowAddressWarning] = useState(false);

  const inputStyle = "input-default h-12 px-4";

  const formatCurrency = (v) => v.toLocaleString("vi-VN") + "₫";

  const handleChange = ({ target: { name, value } }) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const id = token ? decodeJwtPayload(token)?.sub : null;
    if (!id) return;

    const cacheKey = `customerInfo_${id}`;

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
          getCustomerById(id),
          getAddresses(id),
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

    if (!formData.addressId) {
      setShowAddressWarning(true);
      return;
    }

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
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="card-default rounded-2xl p-6 sm:p-8 lg:col-span-7">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Thông tin giao hàng</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Vui lòng nhập chính xác để đảm bảo giao hàng thành công.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="checkout-full-name"
                className="text-sm font-medium mb-1 block"
              >
                Họ và tên
              </label>
              <input
                id="checkout-full-name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Trường Huy"
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label
                htmlFor="checkout-phone"
                className="text-sm font-medium mb-1 block"
              >
                Số điện thoại
              </label>
              <input
                id="checkout-phone"
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
            <label
              htmlFor="checkout-address"
              className="block text-sm font-medium"
            >
              Chọn địa chỉ giao hàng
            </label>
            <select
              id="checkout-address"
              name="addressId"
              value={formData.addressId}
              onChange={handleChange}
              className="select-default mt-1 block w-full p-3"
            >
              {addresses.length === 0 ? (
                <option>Chưa có địa chỉ - vui lòng thêm ở trang hồ sơ</option>
              ) : (
                <>
                  <option value="">Chọn địa chỉ</option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {`${a.detailAddress} - ${a.ward} - ${a.district} - ${a.city}`}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="checkout-note"
              className="text-sm font-medium mb-1 block"
            >
              Ghi chú
            </label>
            <textarea
              id="checkout-note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              placeholder="Yêu cầu đặc biệt nếu có"
              className={`${inputStyle} h-auto resize-none py-3`}
            />
          </div>

          <button type="submit" className="btn-primary h-12 w-full rounded-xl">
            Tiếp tục thanh toán
          </button>
        </form>
      </div>
      <aside className="lg:col-span-5 lg:sticky lg:top-24">
        <div className="card-default rounded-xl">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h2 className="text-lg font-bold">Chi tiết đơn hàng</h2>
          </div>

          <div className="max-h-[400px] space-y-4 overflow-y-auto border-b border-[var(--color-border)] p-6">
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
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Số lượng: {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-[var(--color-primary)]">
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

            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-lg font-bold">
              <span>Tổng cộng</span>
              <span className="text-[var(--color-primary)]">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <Warning
        open={showAddressWarning}
        onClose={() => setShowAddressWarning(false)}
        title="Thông báo"
        message="Vui lòng chọn địa chỉ giao hàng để chúng tôi thuận tiên hơn trong việc giao hàng cho bạn"
        buttonText="Đã hiểu"
      />
    </div>
  );
}

InforStep.propTypes = {
  onSubmit: PropTypes.func,
};
