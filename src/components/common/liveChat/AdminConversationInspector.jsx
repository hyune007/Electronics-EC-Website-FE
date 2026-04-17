import { Info } from "lucide-react";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] break-all text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}


export default function AdminConversationInspector({ selectedRoom, senderName, connected, soundEnabled, roomsCount }) {
  return (
    <aside className="hidden min-h-0 flex-col gap-2 xl:flex">
      <div className="rounded-xl border border-slate-50 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Info size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Thông tin hội thoại</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{selectedRoom?.customerName || "Chưa chọn"}</p>
          </div>
        </div>

        <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
          <InfoRow label="Room ID" value={selectedRoom?.roomId || "--"} />
          <InfoRow label="Cập nhật" value={selectedRoom?.updatedAt || "--"} />
          <InfoRow label="Chưa đọc" value={String(selectedRoom?.unread || 0)} />
          <InfoRow label="Nhân viên" value={senderName} />
        </div>
      </div>
    </aside>
  );
}