import vi from "../../../i18n/vi.js";
export default function Contact() {
//   const INFO = {
//     email: "UBrainTech@gmail.com",
//     phone: "0394 000 000",
//     address: "Tầng 6, UBrain Tech Building, TP. Hồ Chí Minh",
//     workingTime: "Thứ 2 - Thứ 7 | 08:30 - 20:00",
//   };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-14">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Thông tin liên hệ & hỗ trợ
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Mọi thắc mắc về sản phẩm, bảo hành hoặc đơn hàng, vui lòng liên hệ
            với chúng tôi qua các kênh bên dưới.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-primary">
              call
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Hotline bán hàng
            </h3>
            <p className="mt-2 text-slate-600">{vi.contact.infor.phone}</p>
            <p className="mt-1 text-sm text-slate-500">
              Hỗ trợ tư vấn & đặt hàng
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-primary">
              mail
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Email hỗ trợ
            </h3>
            <p className="mt-2 text-slate-600">{vi.contact.infor.email}</p>
            <p className="mt-1 text-sm text-slate-500">
              Phản hồi trong vòng 24 giờ
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-primary">
              location_on
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Cửa hàng / Văn phòng
            </h3>
            <p className="mt-2 text-slate-600">{vi.contact.infor.address}</p>
            <p className="mt-1 text-sm text-slate-500">
              Giờ mở cửa: {vi.contact.infor.workingTime}
            </p>
          </div>
        </div>

        <div className="mt-14 bg-white rounded-2xl shadow-sm p-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Hỗ trợ & cam kết khách hàng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary">
                verified
              </span>
              <div>
                <p className="font-medium">Sản phẩm chính hãng</p>
                <p className="text-sm text-slate-600">
                  Cam kết hàng mới 100%, đầy đủ hóa đơn và bảo hành.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary">
                local_shipping
              </span>
              <div>
                <p className="font-medium">Giao hàng toàn quốc</p>
                <p className="text-sm text-slate-600">
                  Nhận hàng nhanh, kiểm tra trước khi thanh toán.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary">
                support_agent
              </span>
              <div>
                <p className="font-medium">Hỗ trợ kỹ thuật</p>
                <p className="text-sm text-slate-600">
                  Tư vấn cấu hình, cài đặt và sử dụng sản phẩm.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} UBrain Tech. Chuyên cung cấp thiết bị
          điện tử & giải pháp công nghệ.
        </div>
      </div>
    </div>
  );
}
