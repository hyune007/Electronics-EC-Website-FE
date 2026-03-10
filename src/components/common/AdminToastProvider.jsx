import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Info, XCircle } from "lucide-react";
import { subscribeToast } from "../../utils/adminToast.js";
import { AnimatePresence, motion } from "framer-motion";

function getToastTheme(type) {
  if (type === "success") {
    return {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      progress: "bg-emerald-500",
      icon: <CheckCircle2 size={16} className="text-emerald-600" />,
    };
  }

  if (type === "error") {
    return {
      container: "bg-rose-50 border-rose-200 text-rose-900",
      progress: "bg-rose-500",
      icon: <XCircle size={16} className="text-rose-600" />,
    };
  }

  if (type === "warning") {
    return {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      progress: "bg-amber-500",
      icon: <CircleAlert size={16} className="text-amber-600" />,
    };
  }

  return {
    container: "bg-sky-50 border-sky-200 text-sky-900",
    progress: "bg-sky-500",
    icon: <Info size={16} className="text-sky-600" />,
  };
}

export default function AdminToastProvider() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((toast) => {
      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, toast.duration || 2800);
    });

    return unsubscribe;
  }, []);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-[9999] flex w-[min(90vw,380px)] flex-col gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => {
          const theme = getToastTheme(toast.type);

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 18, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, y: -4, scale: 0.985 }}
              transition={{
                duration: 0.24,
                ease: [0.22, 0.61, 0.36, 1],
                layout: { duration: 0.26, ease: [0.22, 0.61, 0.36, 1] },
              }}
              className={`relative overflow-hidden rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm will-change-transform ${theme.container}`}
              whileHover={{ y: -1 }}
            >
              <div className="flex items-start gap-2">
                <motion.div
                  className="mt-0.5"
                  initial={{ rotate: -6, scale: 0.94 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  {theme.icon}
                </motion.div>
                <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
              </div>

              <motion.div
                className={`absolute bottom-0 left-0 h-[2px] origin-left ${theme.progress}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (toast.duration || 2800) / 1000, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
