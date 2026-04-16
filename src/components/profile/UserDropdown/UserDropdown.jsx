import { AnimatePresence, motion } from "framer-motion";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
export default function UserDropdown({ open, onClose, onLogout, user }) {
  const isAdmin = user?.roleId === "ROLE_ADMIN";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full z-50 mt-3 w-52 origin-top-right"
        >
          <div className="card-default overflow-hidden rounded-xl border bg-[var(--color-surface)] text-[var(--color-text)] shadow-md">
            <div className="border-b border-[var(--color-border)] px-4 py-3">
              <p className="text-sm font-semibold">Tài khoản</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Quản lý thông tin cá nhân
              </p>
            </div>

            <div className="py-1">
              {!isAdmin && (
                <NavLink
                  to="/profile?tab=information"
                  onClick={onClose}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm motion-default hover:bg-[var(--color-muted)]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>{" "}
                  Hồ sơ cá nhân
                </NavLink>
              )}

              {isAdmin && (
                <NavLink
                  to="/admin/dashboard"
                  onClick={onClose}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm motion-default hover:bg-[var(--color-muted)]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    dashboard
                  </span>{" "}
                  Vào trang quản lí
                </NavLink>
              )}

              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--color-danger)] motion-default hover:bg-[color-mix(in_oklab,var(--color-danger)_10%,white)]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  logout
                </span>{" "}
                Đăng xuất
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

UserDropdown.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.shape({
    roleId: PropTypes.string,
  }),
};
