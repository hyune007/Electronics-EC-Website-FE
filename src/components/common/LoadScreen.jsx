import React from "react";

export default function LoadingCircle({ show, className = "", size = 8 }) {
  if (!show) return null;
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`w-${size} h-${size} border-4 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin`}
        style={{ width: size * 4, height: size * 4 }}
      ></div>
    </div>
  );
}
