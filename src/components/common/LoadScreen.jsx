import React from "react";

export default function LoadingCircle({ show, className = "", size = 8 }) {
  if (!show) return null;
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="animate-spin rounded-full border-4 border-border border-t-primary"
        style={{ width: size * 4, height: size * 4 }}
        aria-label="Loading"
      ></div>
    </div>
  );
}
