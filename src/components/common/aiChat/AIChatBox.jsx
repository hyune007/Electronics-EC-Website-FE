import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { requestAiChatPrompt } from "../../../services/aiService";
import UBrainTechLogo from "../../../assets/logo/UBrainTech_white_logo.png";
import Warning from "../Warning";

function nowId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AIChatBox({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: "assistant-welcome",
      role: "assistant",
      text: "Mình là trợ lý Ubraintech AI, bạn cần tư vấn gì về sản phẩm hôm nay?",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const canSend = useMemo(
    () => draft.trim().length > 0 && !loading,
    [draft, loading],
  );

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || loading) return;

    const userMessage = { id: nowId("user"), role: "user", text: content };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setError("");
    setLoading(true);

    queueMicrotask(scrollToBottom);

    try {
      const answer = await requestAiChatPrompt(content);
      const assistantMessage = {
        id: nowId("assistant"),
        role: "assistant",
        text:
          answer || "Hiện chưa có phản hồi từ AI, bạn thử lại giúp mình nhé.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      queueMicrotask(scrollToBottom);
    } catch (error) {
      if (error?.status === 429) {
        const title = error?.title || "Quá nhiều yêu cầu";
        const message =
          error?.backendMessage ||
          "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau một vài phút.";
        setError(`${title}: ${message}`);
      } else {
        setError("Không thể kết nối AI lúc này. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <section
      className="ai-chat-box"
      aria-label="UBrainTech chat"
      role="dialog"
      aria-modal="false"
    >
      <header className="ai-chat-header">
        <div className="ai-chat-title-wrap">
          <img
            src={UBrainTechLogo}
            alt="UBrainTech"
            className="ai-chat-brand-logo"
          />
          <div>
            <h3 className="ai-chat-title">UBrainTech Chat</h3>
            <p className="ai-chat-subtitle">Hỗ trợ nhanh thông tin sản phẩm</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ai-chat-close"
          aria-label="Đóng chat"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <div ref={listRef} className="ai-chat-messages">
        {messages.map((item) => (
          <article
            key={item.id}
            className={`ai-chat-bubble ${item.role === "assistant" ? "assistant" : "user"}`}
          >
            {item.text}
          </article>
        ))}
        {loading ? (
          <p className="ai-chat-loading" role="status" aria-live="polite">
            AI đang soạn câu trả lời...
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="ai-chat-error" role="alert">
          {error}
        </p>
      ) : null}

      <footer className="ai-chat-input-wrap">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Nhập câu hỏi của bạn..."
          className="ai-chat-input"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="ai-chat-send"
          aria-label="Gửi"
          title="Gửi"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            send
          </span>
          <span className="sr-only">Gửi</span>
        </button>
      </footer>
    </section>
  );
}

AIChatBox.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

AIChatBox.defaultProps = {
  isOpen: false,
};
