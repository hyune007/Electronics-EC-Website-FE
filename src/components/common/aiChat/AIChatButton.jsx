import PropTypes from "prop-types";
import "./AIChat.css";

export default function AIChatButton({ isOpen, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      className="ai-chat-fab"
    >
      <span className="material-symbols-outlined !text-[22px]">
        {isOpen ? "close" : "chat"}
      </span>
    </button>
  );
}

AIChatButton.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

AIChatButton.defaultProps = {
  isOpen: false,
};
