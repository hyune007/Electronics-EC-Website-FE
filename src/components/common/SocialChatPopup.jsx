import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MESSENGER_URL = import.meta.env.VITE_MESSENGER_URL || "https://m.me/";
const ZALO_URL = import.meta.env.VITE_ZALO_URL || "https://zalo.me/";
const HINT_VISIBLE_MS = 5000;
const HINT_HIDDEN_MS = 20000;

export default function SocialChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const onEsc = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowHint(false);
      return;
    }

    setShowHint(true);

    let cycleHideTimer;

    const initialHideTimer = window.setTimeout(() => {
      setShowHint(false);
    }, HINT_VISIBLE_MS);

    const cycleTimer = window.setInterval(() => {
      setShowHint(true);

      cycleHideTimer = window.setTimeout(() => {
        setShowHint(false);
      }, HINT_VISIBLE_MS);
    }, HINT_VISIBLE_MS + HINT_HIDDEN_MS);

    return () => {
      window.clearTimeout(initialHideTimer);
      window.clearInterval(cycleTimer);
      window.clearTimeout(cycleHideTimer);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-end gap-2"
          >
            <motion.a
              href={MESSENGER_URL}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: 14, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 14, scale: 0.96 }}
              transition={{ duration: 0.2, delay: 0.02 }}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface"
              aria-label="Open Messenger"
              title="Messenger"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2C6.48 2 2 6.15 2 11.27c0 2.92 1.46 5.52 3.74 7.21V22l3.26-1.8c.95.26 1.96.4 3 .4 5.52 0 10-4.15 10-9.27S17.52 2 12 2Z"
                  fill="currentColor"
                  fillOpacity="0.98"
                />
                <path
                  d="m8.62 13.48 2.86-3.03 2.02 1.62 2.85-3.02-2.86 4.62-2.01-1.62-2.86 1.43Z"
                  fill="var(--color-primary)"
                />
              </svg>
            </motion.a>

            <motion.a
              href={ZALO_URL}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: 14, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 14, scale: 0.96 }}
              transition={{ duration: 0.2, delay: 0.07 }}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface"
              aria-label="Open Zalo"
              title="Zalo"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-surface text-[10px] font-extrabold italic tracking-tight text-primary">
                Zalo
              </span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-end">
        <AnimatePresence>
          {!isOpen && showHint && (
            <motion.div
              initial={{ opacity: 0, x: 18, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 14, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mr-6 hidden sm:flex"
            >
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 1.1,
                  }}
                  className="relative flex min-h-[36px] items-center gap-2 rounded-[999px] border border-border bg-card px-3.5 py-1.5 pr-4 text-[11px] font-semibold tracking-[0.01em] text-foreground shadow-lg"
                  aria-label="Open chat support"
                >
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary/15 text-primary">
                    <span className="material-symbols-outlined text-[11px]">
                      forum
                    </span>
                  </span>
                  <span>Bạn cần hỗ trợ gì ạ?</span>
                  <span className="ml-0.5 inline-flex items-center gap-1 align-middle">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={{ opacity: [0.35, 1, 0.35], y: [0, -1.5, 0] }}
                        transition={{
                          duration: 1.05,
                          repeat: Infinity,
                          delay: dot * 0.18,
                          ease: "easeInOut",
                        }}
                        className="h-[5px] w-[5px] rounded-full bg-primary/75"
                      />
                    ))}
                  </span>
                  <span className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-b border-border bg-card" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          animate={
            isOpen
              ? { rotate: 0, scale: 1 }
              : { rotate: 0, scale: [1, 1.06, 1] }
          }
          transition={
            isOpen
              ? { duration: 0.15 }
              : { duration: 1.8, repeat: Infinity, repeatDelay: 1.2 }
          }
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary text-white shadow-xl transition-colors hover:bg-primary/90"
          aria-expanded={isOpen}
          aria-label="Toggle chat menu"
        >
          {!isOpen && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
          )}
          <span className="material-symbols-outlined relative text-[30px]">
            {isOpen ? "close" : "chat"}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
