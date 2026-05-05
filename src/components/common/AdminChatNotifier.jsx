import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_MAP } from "../../routes/routesConfig/admin/routeMap.js";

// const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "https://ec-website-be-312564370609.asia-southeast1.run.app";
const SOCKET_URL = `${API_BASE.replace(/\/$/, "")}/chat`;
const ADMIN_NOTIFY_SETTING_KEY = "admin_live_chat_notify_enabled";
const ADMIN_SOUND_SETTING_KEY = "admin_live_chat_sound_enabled";
const ADMIN_SELECTED_ROOM_KEY = "admin_live_chat_selected_room";
const ADMIN_TAB_TITLE = "UBRAINTECH - Quản lý hệ thống";

function getMessageKey(msg) {
  if (msg?.id) return `id:${msg.id}`;
  return `fallback:${msg?.roomId || ""}:${msg?.senderType || ""}:${msg?.senderName || ""}:${msg?.timestamp || ""}:${msg?.content || ""}`;
}

export default function AdminChatNotifier() {
  const navigate = useNavigate();
  const location = useLocation();

  const [toast, setToast] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const clientRef = useRef(null);
  const seenRef = useRef(new Set());
  const defaultTitleRef = useRef(ADMIN_TAB_TITLE);
  const audioCtxRef = useRef(null);

  const notifyEnabled = localStorage.getItem(ADMIN_NOTIFY_SETTING_KEY) !== "false";
  const soundEnabled = localStorage.getItem(ADMIN_SOUND_SETTING_KEY) !== "false";

  useEffect(() => {
    if (!notifyEnabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        // noop
      });
    }
  }, [notifyEnabled]);

  useEffect(() => {
    const onInteract = () => {
      try {
        if (!audioCtxRef.current) return;
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume().catch(() => {
            // noop
          });
        }
      } catch {
        // noop
      }
    };

    window.addEventListener("pointerdown", onInteract, true);
    return () => window.removeEventListener("pointerdown", onInteract, true);
  }, []);

  useEffect(() => {
    const baseTitle = defaultTitleRef.current || ADMIN_TAB_TITLE;
    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
    return () => {
      document.title = baseTitle;
    };
  }, [unreadCount]);

  useEffect(() => {
    const clearBadge = () => setUnreadCount(0);
    window.addEventListener("focus", clearBadge);
    return () => window.removeEventListener("focus", clearBadge);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith(ROUTE_MAP.chat)) {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 2500,
      debug: () => {},
      onConnect: () => {
        client.subscribe("/topic/admin", (frame) => {
          let incoming;
          try {
            incoming = JSON.parse(frame.body);
          } catch {
            return;
          }

          if (incoming?.senderType !== "CUSTOMER") return;

          const key = getMessageKey(incoming);
          if (seenRef.current.has(key)) return;
          seenRef.current.add(key);

          if (location.pathname.startsWith(ROUTE_MAP.chat)) return;

          setUnreadCount((prev) => prev + 1);
          setToast({
            roomId: incoming.roomId,
            senderName: incoming.senderName || "Khach hang",
            content: incoming.content || "Tin nhan moi",
          });

          if (soundEnabled) {
            try {
              const Ctx = window.AudioContext || window.webkitAudioContext;
              if (Ctx) {
                if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
                const ctx = audioCtxRef.current;
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.type = "sine";
                oscillator.frequency.value = 900;
                gainNode.gain.value = 0.0001;
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                const now = ctx.currentTime;
                gainNode.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
              }
            } catch {
              // noop
            }
          }

          if (notifyEnabled && document.hidden && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`Tin nhan moi tu ${incoming.senderName || "Khach hang"}`, {
                body: incoming.content || "Ban co mot tin nhan moi",
                tag: `chat-${incoming.roomId}`,
              });
            } catch {
              // noop
            }
          }
        });
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [location.pathname, notifyEnabled, soundEnabled]);

  if (!toast || location.pathname.startsWith(ROUTE_MAP.chat)) return null;

  return (
    <div className="fixed right-5 top-5 z-[95] w-[min(92vw,24rem)] rounded-2xl border border-cyan-200 bg-white p-3 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-cyan-700">Tin nhan moi</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{toast.senderName}</p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{toast.content}</p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(ADMIN_SELECTED_ROOM_KEY, toast.roomId);
          setUnreadCount(0);
          setToast(null);
          navigate(ROUTE_MAP.chat);
        }}
        className="mt-2 rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white"
      >
        Mo hoi thoai
      </button>
    </div>
  );
}
