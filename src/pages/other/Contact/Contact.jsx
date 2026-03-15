import { useState } from "react";
import vi from "../../../i18n/vi.js";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (sent) setSent(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="card-default rounded-2xl border p-8 text-center md:p-10">
          <h1 className="text-3xl font-bold text-[var(--color-text)] md:text-4xl">
            Thông tin liên hệ & hỗ trợ
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
            Mọi thắc mắc về sản phẩm, bảo hành hoặc đơn hàng, vui lòng liên hệ
            với chúng tôi qua các kênh bên dưới.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="card-default rounded-2xl border p-7 text-center md:p-8">
            <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">
              call
            </span>
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
              Hotline bán hàng
            </h3>
            <p className="mt-2 text-sm font-medium text-[var(--color-text)] md:text-base">
              {vi.contact.infor.phone}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Hỗ trợ tư vấn & đặt hàng
            </p>
          </div>

          <div className="card-default rounded-2xl border p-7 text-center md:p-8">
            <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">
              mail
            </span>
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
              Email hỗ trợ
            </h3>
            <p className="mt-2 text-sm font-medium text-[var(--color-text)] md:text-base">
              {vi.contact.infor.email}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Phản hồi trong vòng 24 giờ
            </p>
          </div>

          <div className="card-default rounded-2xl border p-7 text-center md:p-8">
            <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">
              location_on
            </span>
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
              Cửa hàng / Văn phòng
            </h3>
            <p className="mt-2 text-sm font-medium text-[var(--color-text)] md:text-base">
              {vi.contact.infor.address}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Giờ mở cửa: {vi.contact.infor.workingTime}
            </p>
          </div>
        </div>

        <div className="card-default rounded-2xl border p-7 md:p-10">
          <h2 className="mb-6 text-2xl font-semibold text-[var(--color-text)]">
            Hỗ trợ & cam kết khách hàng
          </h2>

          <div className="grid grid-cols-1 gap-6 text-[var(--color-text-muted)] md:grid-cols-3">
            <div className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">
                verified
              </span>
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  Sản phẩm chính hãng
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Cam kết hàng mới 100%, đầy đủ hóa đơn và bảo hành.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">
                local_shipping
              </span>
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  Giao hàng toàn quốc
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Nhận hàng nhanh, kiểm tra trước khi thanh toán.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
              <span className="material-symbols-outlined text-[var(--color-primary)]">
                support_agent
              </span>
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  Hỗ trợ kỹ thuật
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Tư vấn cấu hình, cài đặt và sử dụng sản phẩm.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-default rounded-2xl border p-7 md:p-10">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">
              Gửi thông tin liên hệ
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)] md:text-base">
              Điền thông tin bên dưới, đội ngũ hỗ trợ sẽ phản hồi sớm nhất.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
              Họ và tên
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input-default"
                placeholder="Nguyen Van A"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-default"
                placeholder="example@email.com"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)] md:col-span-2">
              Số điện thoại
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-default"
                placeholder="09xxxxxxxx"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)] md:col-span-2">
              Nội dung
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="input-default min-h-[140px] resize-y"
                placeholder="Nội dung cần hỗ trợ..."
                required
              />
            </label>

            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-1">
              {sent ? (
                <p className="text-sm font-medium text-[var(--color-success)]">
                  Thông tin đã được ghi nhận. Chúng tôi sẽ liên hệ với bạn sớm.
                </p>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  Thông tin của bạn sẽ được bảo mật và chỉ dùng cho mục đích hỗ
                  trợ.
                </p>
              )}

              <button
                type="submit"
                className="btn-primary whitespace-nowrap px-6 py-2.5"
              >
                Gửi liên hệ
              </button>
            </div>
          </form>
        </div>

        <div className="text-center text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} UBrain Tech. Chuyên cung cấp thiết bị
          điện tử & giải pháp công nghệ.
        </div>
      </div>
    </div>
  );
}
