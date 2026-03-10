const ADMIN_TOAST_EVENT = "admin:toast";

export function showToast(message, type = "info", duration = 2800) {
  if (!message || typeof window === "undefined") {
    return;
  }

  const detail = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    type,
    duration,
  };

  window.dispatchEvent(new CustomEvent(ADMIN_TOAST_EVENT, { detail }));
}

export function subscribeToast(listener) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event) => {
    listener(event.detail);
  };

  window.addEventListener(ADMIN_TOAST_EVENT, handler);
  return () => window.removeEventListener(ADMIN_TOAST_EVENT, handler);
}
