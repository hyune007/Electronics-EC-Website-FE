import { useEffect, useState } from "react";
import AddressModal from "./AddressModal";
import vi from "../../../i18n/vi";
import {
  getAddresses,
  createAddress,
  deleteAddress,
} from "../../../services/customer/addressService";
import { jwtDecode } from "jwt-decode";
import LoadingCircle from "../../common/LoadScreen";

export default function Address() {
  const [addresses, setAddresses] = useState([]);
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const decoded = jwtDecode(token);
    setCustomerId(decoded.sub);
  }, []);

  useEffect(() => {
    if (!customerId) return;

    getAddresses(customerId).then((res) => {
      setAddresses(res.data);
    });
  }, [customerId]);

  const handleCreateAddress = async (addr) => {
    try {
      setLoading(true);
      const payload = {
        city: addr.city,
        ward: addr.ward,
        detailAddress: addr.detail,
        customer: {
          id: customerId,
        },
      };

      await createAddress(payload);

      alert("Thêm địa chỉ thành công");
      reloadAddresses();
    } catch (err) {
      const msg = err.response?.data;
      alert(msg || "Thêm địa chỉ thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      await deleteAddress(id);
      alert("Xóa địa chỉ thành công");
      reloadAddresses();
    } catch (err) {
      alert("Xóa địa chỉ thất bại");
      console.error(err);
    }
  };

  const reloadAddresses = () => {
    getAddresses(customerId).then((res) => {
      setAddresses(res.data);
    });
  };
  return (
    <>
      <LoadingCircle show={loading} />
      <div className="rounded-2xl shadow-lg border p-6 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-lg bg-[var(--accent-light)] dark:bg-slate-700">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {vi.profile.address.title}
            </h1>
            <p className="text-sm dark:text-slate-300">
              {vi.profile.address.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setOpen(true)}
            className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-md font-semibold shadow hover:opacity-95"
          >
            {vi.profile.address.addButton}
          </button>
        </div>

        {addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border flex justify-between items-start"
              >
                <div>
                  <div className="font-semibold">
                    {`${a.detailAddress} - ${a.ward} - ${a.city}`}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAddress(a.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        <AddressModal
          open={open}
          onClose={() => setOpen(false)}
          onSave={handleCreateAddress}
        />
      </div>
    </>
  );
}
