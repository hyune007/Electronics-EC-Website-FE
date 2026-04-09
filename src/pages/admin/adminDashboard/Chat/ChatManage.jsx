import { useMemo, useState } from "react";

const CHAT_VIEWS = {
  inbox: "inbox",
  live: "live",
};

const SAMPLE_CHATS = [
  {
    id: "CHAT-001",
    customerName: "Nguyen Minh Anh",
    lastMessage: "Shop oi, cho minh hoi mau xanh navy con hang khong?",
    channel: "Website",
    unread: 2,
    updatedAt: "2 phut truoc",
    status: "dang-mo",
    messages: [
      {
        id: "m1",
        sender: "customer",
        text: "Shop oi, cho minh hoi mau xanh navy con hang khong?",
        time: "10:21",
      },
      {
        id: "m2",
        sender: "admin",
        text: "Da co hang ban nhe. Ban muon size nao de shop kiem tra nhanh cho ban?",
        time: "10:22",
      },
      {
        id: "m3",
        sender: "customer",
        text: "Minh can size 41, neu con thi gui minh link dat hang giup voi.",
        time: "10:23",
      },
    ],
  },
  {
    id: "CHAT-002",
    customerName: "Tran Gia Bao",
    lastMessage: "Bao gio ben minh giao duoc o HCM vay shop?",
    channel: "Facebook",
    unread: 1,
    updatedAt: "12 phut truoc",
    status: "dang-mo",
    messages: [
      {
        id: "m4",
        sender: "customer",
        text: "Bao gio ben minh giao duoc o HCM vay shop?",
        time: "10:09",
      },
      {
        id: "m5",
        sender: "admin",
        text: "Ben minh giao trong ngay cho noi thanh HCM ban nhe.",
        time: "10:11",
      },
    ],
  },
];

export default function ChatManage() {
  const [activeView, setActiveView] = useState(CHAT_VIEWS.inbox);
  const [activeChatId, setActiveChatId] = useState(SAMPLE_CHATS[0]?.id || null);

  const totalUnread = useMemo(
    () => SAMPLE_CHATS.reduce((sum, chat) => sum + chat.unread, 0),
    []
  );

  const activeChat = useMemo(
    () => SAMPLE_CHATS.find((chat) => chat.id === activeChatId) || SAMPLE_CHATS[0],
    [activeChatId]
  );

  const openChat = (chatId) => {
    setActiveChatId(chatId);
    setActiveView(CHAT_VIEWS.live);
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Kết nối khách hàng</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Live Chat</h1>
        <p className="mt-2 text-sm text-slate-600">Theo dõi tin nhắn mới và chuyển sang chế độ chat trực tiếp với khách hàng.</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView(CHAT_VIEWS.inbox)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeView === CHAT_VIEWS.inbox
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Trang chủ tin nhắn
          </button>
          <button
            onClick={() => setActiveView(CHAT_VIEWS.live)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeView === CHAT_VIEWS.live
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Chat trực tiếp
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Cuộc trò chuyện đang mở</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{SAMPLE_CHATS.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tin nhắn chưa đọc</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{totalUnread}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tỉ lệ phản hồi</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">96%</p>
        </div>
      </div>

      {activeView === CHAT_VIEWS.inbox ? (
        <div className="space-y-3">
          {SAMPLE_CHATS.map((chat) => (
            <article key={chat.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{chat.customerName}</p>
                  <p className="mt-1 text-sm text-slate-600">{chat.lastMessage}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                  {chat.status === "dang-mo" ? "Đang mở" : "Đã đóng"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{chat.channel}</span>
                <span>{chat.updatedAt}</span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                {chat.unread > 0 ? (
                  <div className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {chat.unread} tin nhắn chưa đọc
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Không có tin nhắn mới</span>
                )}

                <button
                  onClick={() => openChat(chat.id)}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                >
                  Vào chat
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Danh sách hội thoại</p>
            <div className="space-y-2">
              {SAMPLE_CHATS.map((chat) => {
                const isActive = chat.id === activeChat?.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-medium">{chat.customerName}</p>
                    <p className={`mt-1 line-clamp-1 text-xs ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                      {chat.lastMessage}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">{activeChat?.customerName || "Khách hàng"}</p>
              <p className="text-xs text-slate-500">{activeChat?.channel || "Website"}</p>
            </div>

            <div className="space-y-3 px-5 py-4">
              {activeChat?.messages?.map((message) => {
                const isAdmin = message.sender === "admin";
                return (
                  <div key={message.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                        isAdmin ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`mt-1 text-[11px] ${isAdmin ? "text-slate-300" : "text-slate-500"}`}>{message.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn cho khách hàng..."
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400"
                />
                <button className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Gửi
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
