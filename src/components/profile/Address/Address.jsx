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
        district: addr.district,
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
      <div className="card-default rounded-2xl border p-6 sm:p-7">
        <div className="flex items-start gap-4 mb-6">
          <div className="rounded-lg bg-[var(--accent-light)] p-3 text-[var(--color-primary)]">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {vi.profile.address.title}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {vi.profile.address.desc}
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Số địa chỉ
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Đang có {addresses.length} địa chỉ đã lưu
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="btn-primary px-5 py-2"
          >
            {vi.profile.address.addButton}
          </button>
        </div>

        {addresses.length > 0 && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {addresses.map((a, index) => (
              <div
                key={a.id}
                className="flex items-start justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
              >
                <div className="space-y-2">
                  <p className="inline-flex rounded-md bg-[var(--color-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    Địa chỉ #{index + 1}
                  </p>
                  <div className="text-sm font-semibold leading-relaxed">
                    {`${a.detailAddress} - ${a.ward} - ${a.district} - ${a.city}`}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAddress(a.id)}
                  className="text-sm font-semibold text-[var(--color-danger)] motion-default hover:opacity-80"
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
