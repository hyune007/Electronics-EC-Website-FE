import { createPortal } from "react-dom";
import PropTypes from "prop-types";

export default function ConfirmActionModal({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận thao tác",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loading = false,
}) {
  if (!open) return null;

  const modal = (
    <dialog
      open
      className="fixed inset-0 z-[9999] m-0 h-screen w-screen max-h-none max-w-none border-0 bg-transparent p-0 flex items-center justify-center overflow-visible"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px]"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-[92%] max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <span className="material-symbols-outlined">delete</span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary min-w-24 px-4 py-2 text-sm"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary min-w-24 px-4 py-2 text-sm"
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );

  return createPortal(modal, document.body);
}

ConfirmActionModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool,
};
