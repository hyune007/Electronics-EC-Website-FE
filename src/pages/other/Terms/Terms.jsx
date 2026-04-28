import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Muc dich su dung",
    content:
      "Hệ thống được xây dựng nhằm phục vụ mục đích học tập, nghiên cứu và trình bày trong khuôn khổ dự án tốt nghiệp. Ứng dụng không được thiết kế để phục vụ giao dịch thương mại thực tế.",
  },
  {
    title: "2. Tinh chat du lieu",
    content:
      "Toàn bộ dữ liệu hiển thị trong hệ thống đều là dữ liệu giả lập và không phản ánh thông tin thực tế.",
    bullets: [
      "Không có giá trị pháp lý",
      "Không dùng cho mục đích thực tế",
      "Chỉ phục vụ minh họa, học tập",
    ],
  },
  {
    title: "3. Gioi han trach nhiem",
    content:
      "Nhóm phát triển không chịu bất kỳ trách nhiệm nào phát sinh từ việc người dùng hiểu nhầm hoặc sử dụng sai mục đích hệ thống.",
  },
  {
    title: "4. Quyen thay doi",
    content:
      "Nội dung và chức năng có thể được chỉnh sửa hoặc gỡ bỏ bất kỳ lúc nào mà không cần thông báo trước.",
  },
  {
    title: "5. Dong y dieu khoan",
    content:
      "Việc truy cập và sử dụng hệ thống đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý với các điều khoản trên.",
  },
];

export default function TermsOfService() {
  return (
    <div className="page-ambient min-h-screen bg-transparent px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="card-default rounded-2xl border p-7 md:p-10">
          <h1 className="text-3xl font-bold text-[var(--color-text)] md:text-4xl">
            Điều khoản Dịch vụ
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Cập nhật lần cuối: 2026
          </p>

          <div className="mt-6 rounded-xl border border-[var(--color-warning)]/40 bg-[color-mix(in_oklab,var(--color-warning)_12%,white)] px-4 py-4 text-sm text-[var(--color-warning)] md:px-5">
            <p className="font-semibold">LƯU Ý QUAN TRỌNG</p>
            <p className="mt-2 leading-relaxed">
              Đây là sản phẩm thuộc dự án tốt nghiệp. Mọi thông tin, nội dung,
              chức năng và dữ liệu hiển thị trong hệ thống đều mang tính mô
              phỏng. Vui lòng không sử dụng hoặc đưa vào các nội dung này cho
              bất kỳ giao dịch thực tế nào.
            </p>
          </div>
        </div>

        <div className="card-default divide-y divide-[var(--color-border)] rounded-2xl border p-0">
          {sections.map((section) => (
            <section key={section.title} className="px-7 py-6 md:px-8">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
                {section.content}
              </p>
              {section.bullets ? (
                <ul className="mt-3 space-y-2 pl-5 text-sm text-[var(--color-text-muted)] md:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="list-disc">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/home"
            className="btn-primary inline-flex items-center justify-center px-6 py-2.5"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
