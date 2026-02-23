import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  getCustomerById,
  updateCustomerInfor,
} from "../../../services/customer/customerService";
import { getAddresses, setDefault } from "../../../services/customer/addressService";
import vi from "../../../i18n/vi";
import LoadingCircle from "../../common/LoadScreen";

export default function Information() {
  const [customerId, setCustomerId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const decoded = jwtDecode(token);
    setCustomerId(decoded.sub);
  }, []);

  useEffect(() => {
    if (!customerId) return;

    const cacheKey = `customerInfo_${customerId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      setFullName(parsed.name || "");
      setEmail(parsed.email || "");
      setPhone(parsed.phone || "");
      setAddresses(parsed.addresses || []);
      setDefaultAddress(parsed.defaultAddressId || "");
    }

    const fetchData = async () => {
      try {
        const [freshCustomer, addrRes] = await Promise.all([
          getCustomerById(customerId),
          getAddresses(customerId),
        ]);

        setFullName(freshCustomer.name || "");
        setEmail(freshCustomer.email || "");
        setPhone(freshCustomer.phone || "");

        const addresses = addrRes.data || [];
        setAddresses(addresses);

        const def = addresses.find(a => a.default);
        const defaultAddressId = def ? def.id : "";
        setDefaultAddress(defaultAddressId);

        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            ...freshCustomer,
            addresses,
            defaultAddressId,
          })
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editMode) {
      setEditMode(true);
      return;
    }
    try {
      setLoading(true);
      await updateCustomerInfor(customerId, {
        kh_name: fullName,
        kh_mail: email,
        kh_phone: phone,
      });

      const cacheKey = `customerInfo_${customerId}`;

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          name: fullName,
          email: email,
          phone: phone,
        }),
      );

      if (defaultAddress) {
        await setDefault(defaultAddress);
      }

      setEditMode(false);

      alert("Cập nhật thành công");
    } catch (error) {
      console.error(error);

      alert("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingCircle show={loading} />
      <div className="rounded-2xl shadow-lg border p-6 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-lg bg-[var(--accent-light)] dark:bg-slate-700 dark:text-slate-100">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {vi.profile.information.title}
            </h1>
            <p className="text-sm mt-1 dark:text-slate-300">
              {vi.profile.information.desc}
            </p>
          </div>
        </div>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-medium dark:text-slate-200">
              {vi.profile.information.labels.fullName}
            </label>
            <input
              name="fullName"
              placeholder={vi.profile.information.placeholders.fullName}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] "
              disabled={!editMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-slate-200">
              {vi.profile.information.labels.phone}
            </label>
            <input
              name="phone"
              placeholder={vi.profile.information.placeholders.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              disabled={!editMode}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium dark:text-slate-200">
              {vi.profile.information.labels.email}
            </label>
            <input
              name="email"
              placeholder={vi.profile.information.placeholders.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              disabled={!editMode}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium dark:text-slate-200">
              {vi.profile.information.labels.defaultAddress}
            </label>
            <select
              name="defaultAddress"
              value={defaultAddress}
              onChange={(e) => setDefaultAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 p-3 shadow-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              disabled={!editMode}
            >
              {addresses.length === 0 ? (
                <option>Đang tải địa chỉ...</option>
              ) : (
                <>
                  <option value="">
                    {vi.profile.information.placeholders.selectAddress}
                  </option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {`${a.city} - ${a.ward} - ${a.detailAddress}`}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-md font-semibold shadow hover:opacity-95"
            >
              {editMode ? "Lưu" : vi.profile.information.updateInfor}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
