import { createPortal } from "react-dom";
import PropTypes from "prop-types";

export default function Complete({
  open,
  onClose,
  title = "Thành công",
  message,
  buttonText = "Đã hiểu",
}) {
  if (!open) return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-[92%] max-w-md rounded-2xl border border-emerald-200 bg-surface p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <span className="material-symbols-outlined">check_circle</span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary mt-6 px-5 py-2 text-sm"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

Complete.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  buttonText: PropTypes.string,
};
