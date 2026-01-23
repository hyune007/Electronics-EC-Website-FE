import React from "react";

export default function TermsOfService() {
  return (
    <div className="tos-page">
      <style>{`
        /* Wrapper chiếm toàn màn hình – chịu trách nhiệm background */
        .tos-page {
          min-height: 100vh;
          width: 100%;
          background: #f8fafc;
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }

        /* Dark mode (nếu có class .dark ở body hoặc html) */
        .dark .tos-page {
          background: #020617;
        }

        /* Nội dung */
        .tos-container {
          max-width: 900px;
          width: 100%;
          padding: 48px 20px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.7;
          color: #0f172a;
        }

        .dark .tos-container {
          color: #e5e7eb;
        }

        .tos-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .tos-updated {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 32px;
        }

        .tos-warning {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
          padding: 16px 20px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 40px;
        }

        .dark .tos-warning {
          background: rgba(251, 146, 60, 0.1);
          border-color: rgba(251, 146, 60, 0.3);
          color: #fed7aa;
        }

        .tos-section {
          margin-bottom: 32px;
        }

        .tos-section h2 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .tos-section p {
          margin-bottom: 10px;
          font-size: 15px;
        }

        .tos-section ul {
          padding-left: 18px;
          margin-top: 8px;
        }

        .tos-section li {
          margin-bottom: 8px;
          font-size: 15px;
        }
      `}</style>

      <div className="tos-container">
        <h1 className="tos-title">Điều khoản Dịch vụ</h1>
        <div className="tos-updated">Cập nhật lần cuối: 2026</div>

        <div className="tos-warning">
          <strong>LƯU Ý QUAN TRỌNG:</strong><br />
          Đây là <strong>sản phẩm thuộc dự án tốt nghiệp</strong>. Mọi thông tin,
          nội dung, chức năng và dữ liệu hiển thị trong hệ thống đều mang tính
          <strong> mô phỏng, tượng trưng</strong>.<br />
          <strong>
            Nghiêm cấm tin tưởng, sử dụng hoặc dựa vào dưới bất kỳ hình thức nào.
          </strong>
        </div>

        <div className="tos-section">
          <h2>1. Mục đích sử dụng</h2>
          <p>
            Hệ thống được xây dựng nhằm phục vụ mục đích học tập, nghiên cứu và
            trình bày trong khuôn khổ dự án tốt nghiệp. Ứng dụng không được thiết
            kế để phục vụ hoạt động thương mại hoặc giao dịch thực tế.
          </p>
        </div>

        <div className="tos-section">
          <h2>2. Tính chất dữ liệu</h2>
          <p>
            Toàn bộ dữ liệu hiển thị trong hệ thống đều là dữ liệu giả lập và
            không phản ánh thông tin thực tế.
          </p>
          <ul>
            <li>Không có giá trị pháp lý</li>
            <li>Không dùng cho mục đích thật</li>
            <li>Chỉ phục vụ minh họa học tập</li>
          </ul>
        </div>

        <div className="tos-section">
          <h2>3. Giới hạn trách nhiệm</h2>
          <p>
            Nhóm phát triển không chịu bất kỳ trách nhiệm nào phát sinh từ việc
            người dùng hiểu nhầm hoặc sử dụng sai mục đích hệ thống.
          </p>
        </div>

        <div className="tos-section">
          <h2>4. Quyền thay đổi</h2>
          <p>
            Nội dung và chức năng có thể được chỉnh sửa hoặc gỡ bỏ bất kỳ lúc nào
            mà không cần thông báo trước.
          </p>
        </div>

        <div className="tos-section">
          <h2>5. Đồng ý điều khoản</h2>
          <p>
            Việc truy cập và sử dụng hệ thống đồng nghĩa với việc bạn đã đọc,
            hiểu và đồng ý với các điều khoản trên.
          </p>
        </div>
        <div className="tos-section" style={{ color: "#3b82f6" }}>
          <a href="/home">Quay về trang chủ</a>
        </div>
      </div>
    </div>
  );
}
