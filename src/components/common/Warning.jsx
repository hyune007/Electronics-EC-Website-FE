import { createPortal } from "react-dom";
import PropTypes from "prop-types";

export default function Warning({
  open,
  onClose,
  title = "Thông báo",
  message,
  buttonText = "Đã hiểu",
  showIcon = true,
}) {
  if (!open) return null;

  const modal = (
    <dialog
      open
      className="fixed inset-0 z-[9999] m-0 h-screen w-screen max-h-none max-w-none border-0 bg-transparent p-0 flex items-center justify-center overflow-visible"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-[92%] max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-xl">
        {showIcon ? (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <span className="material-symbols-outlined">warning</span>
          </div>
        ) : null}

        <h3
          className={`text-lg font-bold text-foreground ${
            showIcon ? "mt-4" : "mt-0"
          }`}
        >
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="btn-primary mt-6 px-5 py-2 text-sm"
        >
          {buttonText}
        </button>
      </div>
    </dialog>
  );

  return createPortal(modal, document.body);
}

Warning.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  buttonText: PropTypes.string,
  showIcon: PropTypes.bool,
};
