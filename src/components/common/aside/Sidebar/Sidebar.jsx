import React from "react";
import ThemeToggleButton from "../../ThemeToggleButton.jsx";
import useTheme from "../../../../hooks/useTheme.js";

export default function Sidebar({
  name = "Alex Thompson",
  memberSince = "2023",
  avatarSrc,
  onSelectView,
}) {
  const { toggleTheme } = useTheme();

  const handleSelect = (view) => (e) => {
    e.preventDefault();
    if (onSelectView) onSelectView(view);
  };

  return (
    <aside className="w-64 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={
                avatarSrc ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAVdC_pRmyog9qDJlaeR-B61tCdwzRznoxjoxVWUdm5l_r6zaw4HPmmkk57gRfgZMwsQiYFI5HW1FzzokUbeDTZw-Kk8A-zP_2QRRtsRY0A8y1nfwS6SU80kZ8yi-xGiotONS06n2hxzOZYanQKX1xYHPNURX_AM_08nBkmsJM2Pxk2fC2Orv7Xiv6EtYSZs6JzGu8B1glceiI7lAGCiXKs_l26_OowlDF76zgmlLhn0QYTTxVPkQbKGiX84EheK8Tg9VNcFlLNA9c"
              }
            />
          </div>
          <div>
            <p className="font-semibold text-sm">{name}</p>
            <p className="text-xs text-slate-500">
              Thành viên từ {memberSince}
            </p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <a
            onClick={handleSelect("information")}
            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">info</span>
            <span className="text-sm font-medium">Thông tin</span>
          </a>
          <a
            onClick={handleSelect("myorder")}
            className="flex items-center gap-3 px-3 py-2 bg-[var(--accent-light)] text-[var(--primary-navy)] rounded-lg font-medium"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              package_2
            </span>
            <span className="text-sm">Đơn hàng của tôi</span>
          </a>
          <a
            onClick={handleSelect("address")}
            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              location_on
            </span>
            <span className="text-sm font-medium">Địa chỉ</span>
          </a>
          <a
            onClick={handleSelect("setting")}
            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border-t border-slate-100 pt-3"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
            <span className="text-sm font-medium">Cài đặt</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            <span className="text-sm font-medium">Đăng xuất</span>
          </a>
        </nav>

        <div className="p-4 border-t border-slate-100 flex items-center gap-2">
          <ThemeToggleButton onToggle={toggleTheme} />
          <span className="text-sm font-medium">Giao diện</span>
        </div>
      </div>
    </aside>
  );
}
