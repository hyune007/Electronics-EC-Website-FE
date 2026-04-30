import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  ArrowLeft,
  Bell,
  Circle,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Sparkles,
  Smile,
  UserRound,
  Users,
  Video,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../services/api.js";
import AdminConversationInspector from "./liveChat/AdminConversationInspector.jsx";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "https://ec-website-be-312564370609.asia-southeast1.run.app";
const SOCKET_URL = `${API_BASE.replace(/\/$/, "")}/chat`;
const GUEST_ROOM_KEY = "live_chat_guest_room";
const GUEST_NAME_KEY = "live_chat_guest_name";
const ADMIN_ROOMS_KEY = "admin_live_chat_rooms";
const ADMIN_SELECTED_ROOM_KEY = "admin_live_chat_selected_room";
const ADMIN_NOTIFY_SETTING_KEY = "admin_live_chat_notify_enabled";
const ADMIN_SOUND_SETTING_KEY = "admin_live_chat_sound_enabled";
const ADMIN_TAB_TITLE = "UBRAINTECH - Quản lý hệ thống";

function getGuestRoomId() {
  const cached = localStorage.getItem(GUEST_ROOM_KEY);
  if (cached) return cached;

  const generated = `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(GUEST_ROOM_KEY, generated);
  return generated;
}

function normalizeMessage(raw) {
  return {
    id: raw?.id || `${raw?.roomId || "room"}-${raw?.timestamp || Date.now()}-${raw?.senderName || "user"}`,
    roomId: raw?.roomId || "",
    senderName: raw?.senderName || "Ẩn danh",
    senderType: raw?.senderType || "CUSTOMER",
    content: raw?.content || "",
    timestamp: raw?.timestamp || null,
    attachmentName: raw?.attachmentName || "",
    attachmentType: raw?.attachmentType || "",
    attachmentDataUrl: raw?.attachmentDataUrl || "",
  };
}

function getMessageKey(msg) {
  if (msg?.id) return `id:${msg.id}`;
  return `fallback:${msg?.roomId || ""}:${msg?.senderType || ""}:${msg?.senderName || ""}:${msg?.timestamp || ""}:${msg?.content || ""}`;
}

function mergeUniqueMessages(current, incoming) {
  const dedup = new Map();
  [...current, ...incoming].forEach((msg) => {
    const normalized = normalizeMessage(msg);
    dedup.set(getMessageKey(normalized), normalized);
  });

  return Array.from(dedup.values()).sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return ta - tb;
  });
}

function formatTime(value) {
  if (!value) return "vừa xong";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "vừa xong";
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatDateTime(value) {
  if (!value) return "vừa xong";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "vừa xong";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function getInitials(name) {
  return String(name || "KH")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "K")
    .join("")
    .slice(0, 2);
}

function getRoomPreview(room) {
  return room?.lastMessage || "Chưa có tin nhắn";
}

function mergeRooms(prevRooms, incoming, selectedRoomId) {
  const found = prevRooms.find((r) => r.roomId === incoming.roomId);
  const unreadInc = incoming.senderType === "CUSTOMER" && incoming.roomId !== selectedRoomId ? 1 : 0;

  const nextRoom = {
    roomId: incoming.roomId,
    customerName: incoming.senderType === "CUSTOMER" ? incoming.senderName : found?.customerName || "Khách hàng",
    lastMessage: incoming.content,
    updatedAt: incoming.timestamp || new Date().toISOString(),
    unread: incoming.roomId === selectedRoomId ? 0 : (found?.unread || 0) + unreadInc,
  };

  const rest = prevRooms.filter((r) => r.roomId !== incoming.roomId);
  return [nextRoom, ...rest].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export default function LiveChatPanel({ mode = "customer" }) {
  const { user } = useAuth();
  const isAdmin = mode === "admin";

  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState(() => localStorage.getItem(GUEST_NAME_KEY) || "");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [typingActive, setTypingActive] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [rooms, setRooms] = useState(() => {
    if (!isAdmin) return [];
    try {
      const raw = localStorage.getItem(ADMIN_ROOMS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [roomInput, setRoomInput] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(() => (isAdmin ? localStorage.getItem(ADMIN_SELECTED_ROOM_KEY) || "" : ""));
  const [adminToast, setAdminToast] = useState(null);
  const [adminUnreadBadge, setAdminUnreadBadge] = useState(0);
  const [notifyEnabled, setNotifyEnabled] = useState(() => localStorage.getItem(ADMIN_NOTIFY_SETTING_KEY) !== "false");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(ADMIN_SOUND_SETTING_KEY) !== "false");

  const clientRef = useRef(null);
  const roomSubRef = useRef(null);
  const adminSubRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const selectedRoomRef = useRef("");
  const boxRef = useRef(null);
  const seenAlertRef = useRef(new Set());
  const audioCtxRef = useRef(null);
  const defaultTitleRef = useRef(ADMIN_TAB_TITLE);

  const customerRoomId = useMemo(() => {
    if (user?.id) return `customer-${user.id}`;
    return getGuestRoomId();
  }, [user?.id]);

  const activeRoomId = isAdmin ? selectedRoomId : customerRoomId;
  const composerLocked = isAdmin && !selectedRoomId;
  const canSend = Boolean(connected && activeRoomId && (draft.trim() || pendingAttachment));
  const totalUnread = rooms.reduce((acc, room) => acc + (room.unread || 0), 0);
  const selectedRoom = useMemo(() => rooms.find((room) => room.roomId === selectedRoomId) || null, [rooms, selectedRoomId]);
  const filteredRooms = useMemo(() => {
    const query = roomSearch.trim().toLowerCase();
    if (!query) return rooms;

    return rooms.filter((room) => {
      const haystack = [room.roomId, room.customerName, room.lastMessage].map((value) => String(value || "").toLowerCase());
      return haystack.some((value) => value.includes(query));
    });
  }, [roomSearch, rooms]);

  const senderName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.email) return String(user.email).split("@")[0];
    return guestName.trim() || "Khách vãng lai";
  }, [guestName, user?.email, user?.name]);

  useEffect(() => {
    selectedRoomRef.current = selectedRoomId;
  }, [selectedRoomId]);

  useEffect(() => {
    if (!isAdmin && guestName.trim()) {
      localStorage.setItem(GUEST_NAME_KEY, guestName.trim());
    }
  }, [guestName, isAdmin]);

  useEffect(() => {
    localStorage.setItem(ADMIN_NOTIFY_SETTING_KEY, String(notifyEnabled));
  }, [notifyEnabled]);

  useEffect(() => {
    localStorage.setItem(ADMIN_SOUND_SETTING_KEY, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    if (!isAdmin || !notifyEnabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        // noop
      });
    }
  }, [isAdmin, notifyEnabled]);

  useEffect(() => {
    if (!isAdmin) return;
    const baseTitle = defaultTitleRef.current || ADMIN_TAB_TITLE;
    document.title = adminUnreadBadge > 0 ? `(${adminUnreadBadge}) ${baseTitle}` : baseTitle;

    return () => {
      document.title = baseTitle;
    };
  }, [adminUnreadBadge, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const clearBadge = () => setAdminUnreadBadge(0);
    window.addEventListener("focus", clearBadge);
    return () => window.removeEventListener("focus", clearBadge);
  }, [isAdmin]);

  useEffect(() => {
    if (!adminToast) return;
    const timer = window.setTimeout(() => setAdminToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [adminToast]);

  useEffect(() => {
    setTypingActive(Boolean(draft.trim() || pendingAttachment));
  }, [draft, pendingAttachment]);

  const notifyAdminIncoming = (incoming) => {
    if (!isAdmin || incoming.senderType !== "CUSTOMER") return;

    const alertKey = getMessageKey(incoming);
    if (seenAlertRef.current.has(alertKey)) return;
    seenAlertRef.current.add(alertKey);
    if (incoming.roomId !== selectedRoomRef.current) {
      setAdminUnreadBadge((prev) => prev + 1);
    }

    setAdminToast({
      roomId: incoming.roomId,
      senderName: incoming.senderName || "Khách hàng",
      content: incoming.content || "Tin nhắn mới",
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
          oscillator.frequency.value = 880;
          gainNode.gain.value = 0.0001;
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          const now = ctx.currentTime;
          gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
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
        new Notification(`Tin nhắn mới từ ${incoming.senderName || "Khách hàng"}`, {
          body: incoming.content || "Bạn có một tin nhắn mới",
          tag: `chat-${incoming.roomId}`,
        });
      } catch {
        // noop
      }
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    try {
      localStorage.setItem(ADMIN_ROOMS_KEY, JSON.stringify(rooms.slice(0, 80)));
    } catch {
      // noop
    }
  }, [isAdmin, rooms]);

  useEffect(() => {
    if (!isAdmin) return;
    if (selectedRoomId) {
      localStorage.setItem(ADMIN_SELECTED_ROOM_KEY, selectedRoomId);
    } else {
      localStorage.removeItem(ADMIN_SELECTED_ROOM_KEY);
    }
  }, [isAdmin, selectedRoomId]);

  useEffect(() => {
    if (!isAdmin && !isOpen) {
      setConnected(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 2000,
      debug: () => {},
      onConnect: () => {
        setConnected(true);

        if (isAdmin) {
          adminSubRef.current = client.subscribe("/topic/admin", (frame) => {
            const incoming = normalizeMessage(JSON.parse(frame.body));
            setRooms((prev) => mergeRooms(prev, incoming, selectedRoomRef.current));
            notifyAdminIncoming(incoming);

            if (incoming.roomId === selectedRoomRef.current) {
              setMessages((prev) => mergeUniqueMessages(prev, [incoming]));
            }
          });
        } else {
          roomSubRef.current = client.subscribe(`/topic/chat/${customerRoomId}`, (frame) => {
            const incoming = normalizeMessage(JSON.parse(frame.body));
            setMessages((prev) => mergeUniqueMessages(prev, [incoming]));
          });
        }
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    clientRef.current = client;
    client.activate();

    return () => {
      try {
        roomSubRef.current?.unsubscribe();
      } catch {
        // noop
      }
      try {
        adminSubRef.current?.unsubscribe();
      } catch {
        // noop
      }
      client.deactivate();
    };
  }, [customerRoomId, isAdmin, isOpen]);

  useEffect(() => {
    if (isAdmin) {
      if (!selectedRoomId && rooms.length > 0) {
        setSelectedRoomId(rooms[0].roomId);
      }
      return;
    }

    if (!connected) return;
    let cancelled = false;

    const load = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/api/chat/${encodeURIComponent(customerRoomId)}`);
        const data = Array.isArray(res.data) ? res.data : [];
        if (!cancelled) {
          setMessages(mergeUniqueMessages([], data));
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [connected, customerRoomId, isAdmin, rooms]);

  useEffect(() => {
    if (!isAdmin || !connected || !selectedRoomId) return;

    try {
      roomSubRef.current?.unsubscribe();
    } catch {
      // noop
    }

    roomSubRef.current = clientRef.current?.subscribe(`/topic/chat/${selectedRoomId}`, (frame) => {
      const incoming = normalizeMessage(JSON.parse(frame.body));
      setMessages((prev) => mergeUniqueMessages(prev, [incoming]));
      setRooms((prev) => mergeRooms(prev, incoming, selectedRoomId));
    });

    let cancelled = false;

    const load = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/api/chat/${encodeURIComponent(selectedRoomId)}`);
        const data = Array.isArray(res.data) ? res.data : [];
        if (!cancelled) {
          setMessages(mergeUniqueMessages([], data));
          setRooms((prev) => prev.map((r) => (r.roomId === selectedRoomId ? { ...r, unread: 0 } : r)));
        }

        await api.put(`/api/chat/seen/${encodeURIComponent(selectedRoomId)}`);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [connected, isAdmin, selectedRoomId]);

  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = () => {
    const content = draft.trim();
    if (!content && !pendingAttachment) return;
    if (!connected || !activeRoomId || !clientRef.current) return;

    const payload = {
      roomId: activeRoomId,
      senderName,
      senderType: isAdmin ? "STAFF" : "CUSTOMER",
      content,
      attachmentName: pendingAttachment?.name || "",
      attachmentType: pendingAttachment?.type || "",
      attachmentDataUrl: pendingAttachment?.dataUrl || "",
    };

    clientRef.current.publish({ destination: "/app/chat.send", body: JSON.stringify(payload) });
    setDraft("");
    setPendingAttachment(null);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({
        name: file.name,
        type: file.type,
        dataUrl: typeof reader.result === "string" ? reader.result : "",
      });
    };
    reader.readAsDataURL(file);
  };

  if (isAdmin) {
    return (
      <section className="flex h-full min-h-0 flex-col gap-3">
        {adminToast && (
          <div className="fixed right-5 top-5 z-[90] w-[min(92vw,22rem)] rounded-2xl border border-slate-50 bg-white p-3 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.45)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">Tin nhắn mới</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{adminToast.senderName}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{adminToast.content}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedRoomId(adminToast.roomId);
                setAdminUnreadBadge(0);
                setAdminToast(null);
              }}
              className="mt-3 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white"
            >
              Mở hội thoại
            </button>
          </div>
        )}

        <header className="overflow-hidden rounded-xl border border-transparent bg-white shadow-sm">
          <div className="bg-[linear-gradient(180deg,#111827_0%,#1f2937_100%)] px-4 py-3 text-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur">
                  <Sparkles size={12} /> Messenger Admin
                </div>
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Live chat admin</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs">
                  <MessageCircle size={14} className="text-slate-300" />
                  <span className="font-medium">{String(rooms.length)} hội thoại</span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs">
                  <Bell size={14} className={totalUnread > 0 ? "text-amber-400" : "text-slate-300"} />
                  <span className="font-medium">{String(totalUnread)} chưa đọc</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs">
                  <Circle size={8} className={connected ? "fill-emerald-400 text-emerald-400" : "fill-slate-400 text-slate-400"} />
                  <span>{connected ? "Online" : "Offline"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNotifyEnabled((prev) => !prev)}
                className="rounded-full border border-slate-50 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-100 hover:bg-slate-50"
              >
                Notification: {notifyEnabled ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="rounded-full border border-slate-50 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-100 hover:bg-slate-50"
              >
                Sound: {soundEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-2 xl:grid-cols-[280px_minmax(0,1fr)_250px]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-transparent bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <MessageCircle size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Hộp thư hỗ trợ</p>
                  <p className="truncate text-sm font-semibold text-slate-900">{filteredRooms.length} hội thoại</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRoomSearch("")}
                  className="rounded-full border border-slate-50 bg-white p-1.5 text-slate-500 transition hover:border-slate-100 hover:text-slate-800"
                  aria-label="Xóa lọc"
                >
                  <Search size={16} />
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-slate-50 bg-white px-2.5 py-1.5 shadow-sm">
                  <Search size={14} className="text-slate-400" />
                  <input
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    placeholder="Tìm khách hàng, room id, tin nhắn..."
                    className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <MiniFilter label="Tất cả" active />
                <MiniFilter label={`Chưa đọc (${totalUnread})`} />
                <MiniFilter label="Đang online" />
              </div>

              <div className="mt-3 rounded-lg border border-slate-50 bg-slate-50 p-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Mở nhanh room id</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    placeholder="Nhập room id..."
                    className="h-8 w-full rounded-md border border-slate-50 bg-white px-2.5 text-xs outline-none focus:border-slate-200"
                  />
                  <button
                    onClick={() => {
                      const next = roomInput.trim();
                      if (!next) return;
                      setSelectedRoomId(next);
                      setAdminUnreadBadge(0);
                      setRoomInput("");
                    }}
                    className="rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white transition hover:bg-slate-700"
                  >
                    Vào
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredRooms.length === 0 && (
                <div className="m-2 rounded-lg border border-dashed border-slate-50 bg-slate-50 p-3 text-xs text-slate-500">
                  Chưa có hội thoại phù hợp. Chờ tin nhắn mới hoặc nhập room id.
                </div>
              )}

              <div className="space-y-2">
                {filteredRooms.map((room) => {
                  const active = room.roomId === selectedRoomId;
                  const unread = room.unread || 0;
                  return (
                    <button
                      key={room.roomId}
                      onClick={() => {
                        setSelectedRoomId(room.roomId);
                        setAdminUnreadBadge(0);
                      }}
                      className={`group w-full rounded-lg border px-2.5 py-2 text-left transition ${
                        active
                          ? "border-slate-400 bg-slate-50 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]"
                          : "border-slate-50 bg-white hover:border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                          {getInitials(room.customerName || room.roomId)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`truncate text-xs font-semibold ${active ? "text-slate-900" : "text-slate-800"}`}>
                                {room.customerName || room.roomId}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">{room.roomId}</p>
                            </div>
                            <span className="shrink-0 text-[11px] text-slate-400">{formatDateTime(room.updatedAt)}</span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className={`inline-flex h-2 w-2 rounded-full ${unread > 0 ? "bg-slate-500" : "bg-emerald-500"}`} />
                            <p className={`line-clamp-1 text-xs ${active ? "text-slate-700" : "text-slate-600"}`}>{getRoomPreview(room)}</p>
                          </div>

                          <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5">
                              <MessageCircle size={10} />
                              {unread > 0 ? `${unread} chưa đọc` : "Đã xem"}
                            </span>
                            {unread > 0 && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-white">{unread}</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-transparent bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-50 text-slate-500 transition hover:border-slate-100 hover:text-slate-800 xl:hidden" aria-label="Quay lại danh sách">
                  <ArrowLeft size={18} />
                </button>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${selectedRoom ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {selectedRoom ? getInitials(selectedRoom.customerName || selectedRoom.roomId) : <Users size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-slate-900">
                      {selectedRoom?.customerName || (selectedRoomId ? selectedRoomId : "Chưa chọn hội thoại")}
                    </h2>
                    {selectedRoomId && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">Messenger room</span>}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <Circle size={10} className="text-emerald-500" fill="currentColor" />
                    {selectedRoom ? `${selectedRoom.roomId} · ${selectedRoom.unread || 0} chưa đọc` : "Chọn một hội thoại để bắt đầu"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <IconChip icon={Video} />
                <IconChip icon={Mail} />
                <IconChip icon={MoreHorizontal} />
              </div>
            </div>

            <div ref={boxRef} className="flex-1 space-y-2.5 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_24%,#ffffff_100%)] px-3 py-3">
              {selectedRoomId ? (
                <>
                  {loadingHistory && <p className="text-sm text-slate-500">Đang tải lịch sử...</p>}
                  {!loadingHistory && messages.length === 0 && (
                    <div className="mx-auto max-w-xl rounded-lg border border-dashed border-slate-50 bg-white p-3 text-center text-xs text-slate-500">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <MessageCircle size={20} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-800">Chưa có tin nhắn trong hội thoại này</p>
                      <p className="mt-1">Tin nhắn mới sẽ hiển thị tại đây theo kiểu bong bóng Messenger.</p>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const mine = msg.senderType === "STAFF";
                    return (
                      <div key={getMessageKey(msg)} className={`flex items-end gap-1.5 ${mine ? "justify-end" : "justify-start"}`}>
                        {!mine && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                            {getInitials(msg.senderName)}
                          </div>
                        )}
                        <div className={`max-w-[78%] rounded-lg px-3 py-2 text-xs shadow-sm ${mine ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md border border-slate-50 bg-white text-slate-800"}`}>
                          <p className="whitespace-pre-wrap leading-5">{msg.content}</p>
                          {msg.attachmentDataUrl && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-white/15 bg-white/10">
                              {msg.attachmentType?.startsWith("image/") ? (
                                <img src={msg.attachmentDataUrl} alt={msg.attachmentName || "attachment"} className="max-h-64 w-full object-cover" />
                              ) : (
                                <a
                                  href={msg.attachmentDataUrl}
                                  download={msg.attachmentName || "attachment"}
                                  className="flex items-center gap-2 px-3 py-2 text-sm underline underline-offset-2"
                                >
                                  <Paperclip size={14} />
                                  {msg.attachmentName || "Tệp đính kèm"}
                                </a>
                              )}
                            </div>
                          )}
                          <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${mine ? "text-slate-300" : "text-slate-500"}`}>
                            <span>{msg.senderName}</span>
                            <span>•</span>
                            <span>{formatTime(msg.timestamp)}</span>
                          </div>
                        </div>
                        {mine && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                            {getInitials(senderName)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="flex h-full min-h-[20rem] items-center justify-center">
                  <div className="max-w-lg rounded-lg border border-dashed border-slate-50 bg-white p-3 text-center shadow-sm">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <Sparkles size={20} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">Chọn một hội thoại để bắt đầu</p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Danh sách bên trái sẽ cập nhật theo stream admin. Bạn có thể tìm nhanh theo tên, room id hoặc nội dung gần nhất.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-white p-2.5">
              {typingActive && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  <span className="inline-flex h-2 w-2 rounded-full bg-slate-500" />
                  Đang soạn tin nhắn
                </div>
              )}
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {["Xin chào, mình có thể hỗ trợ gì?", "Mình đã kiểm tra đơn hàng giúp bạn.", "Bạn vui lòng chờ 1 phút."].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setDraft(suggestion)}
                    className="rounded-full border border-slate-50 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-100 hover:bg-slate-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {pendingAttachment && (
                <div className="mb-2.5 flex items-center justify-between gap-3 rounded-lg border border-slate-50 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{pendingAttachment.name}</p>
                    <p className="text-xs text-slate-500">{pendingAttachment.type || "attachment"}</p>
                  </div>
                  <button type="button" onClick={() => setPendingAttachment(null)} className="rounded-full p-1 text-slate-500 hover:bg-white" aria-label="Xóa đính kèm">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-1.5 rounded-lg border border-slate-50 bg-slate-50 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-800"
                  aria-label="Đính kèm"
                >
                  <Paperclip size={18} />
                </button>
                <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-800" aria-label="Emoji">
                  <Smile size={18} />
                </button>
                <input ref={attachmentInputRef} type="file" className="hidden" onChange={handleAttachmentChange} />
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={composerLocked ? "Chọn hội thoại trước khi trả lời" : "Nhập tin nhắn..."}
                  disabled={composerLocked}
                  rows={1}
                  className="max-h-28 min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-1.5 text-xs text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={!canSend}
                  className="inline-flex h-9 items-center gap-1 rounded-lg bg-slate-900 px-3 text-[11px] font-semibold text-white shadow-[0_12px_24px_-14px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <Send size={16} />
                  Gửi
                </button>
              </div>
            </div>
          </section>

          <AdminConversationInspector
            selectedRoom={selectedRoom}
            senderName={senderName}
            connected={connected}
            soundEnabled={soundEnabled}
            roomsCount={rooms.length}
          />
        </div>
      </section>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3 max-sm:inset-0 max-sm:bottom-0 max-sm:right-0 max-sm:justify-end max-sm:gap-0">
      {isOpen && (
        <div className="w-[min(92vw,24rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_65px_-28px_rgba(15,23,42,0.45)] max-sm:flex max-sm:h-[100dvh] max-sm:w-screen max-sm:flex-col max-sm:rounded-none max-sm:border-0">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-200">Hỗ trợ trực tuyến</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles size={14} /> UBrain Care
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/10" aria-label="Đóng">
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              {connected ? <Wifi size={14} className="text-emerald-600" /> : <WifiOff size={14} className="text-rose-500" />}
              {connected ? "Đang trực tuyến" : "Mất kết nối"}
            </span>
            <span className="rounded-full bg-white px-2 py-1 text-slate-500">Phản hồi 1-3 phút</span>
          </div>

          {!user?.name && (
            <div className="border-b border-slate-100 px-4 py-3">
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Tên của bạn"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>
          )}

          <div ref={boxRef} className="h-[340px] space-y-3 overflow-y-auto bg-gradient-to-b from-white via-slate-50/40 to-white px-4 py-4 max-sm:h-auto max-sm:flex-1">
            {loadingHistory && <p className="text-sm text-slate-500">Đang tải lịch sử...</p>}
            {!loadingHistory && messages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                <p className="mb-1 font-medium text-slate-700">Xin chào, mình có thể hỗ trợ gì cho bạn?</p>
                <p>Gợi ý: hỏi về bảo hành, tồn kho hoặc chương trình khuyến mãi.</p>
              </div>
            )}
            {messages.map((msg) => {
              const mine = msg.senderType === "CUSTOMER";
              return (
                <div key={getMessageKey(msg)} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-800"}`}>
                    <p>{msg.content}</p>
                    <p className={`mt-1 text-[11px] ${mine ? "text-slate-300" : "text-slate-500"}`}>
                      {msg.senderName} · {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {["Tư vấn sản phẩm", "Tra cứu đơn hàng", "Chính sách bảo hành"].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setDraft(suggestion)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                disabled={!connected}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
              />
              <button
                onClick={sendMessage}
                disabled={!connected}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white disabled:bg-slate-300"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="mr-4 hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-lg sm:flex sm:items-center sm:gap-1">
          <UserRound size={14} className="text-slate-700" />
          Cần hỗ trợ nhanh?
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_16px_34px_-16px_rgba(15,23,42,0.85)] max-sm:mb-4 max-sm:mr-4"
        aria-label="Mở chat"
      >
        {!isOpen && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/30" />}
        <MessageCircle className="relative" size={28} />
      </button>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-300">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function StatusPill({ icon: Icon, tone = "neutral", children }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "danger"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : tone === "info"
          ? "border-slate-200 bg-slate-50 text-slate-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${toneClass}`}>
      <Icon size={14} />
      {children}
    </span>
  );
}

function IconChip({ icon: Icon }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-50 bg-white text-slate-500 transition hover:border-slate-100 hover:text-slate-800">
      <Icon size={16} />
    </span>
  );
}

function MiniFilter({ label, active = false }) {
  return (
    <button
      type="button"
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
    >
      {label}
    </button>
  );
}

