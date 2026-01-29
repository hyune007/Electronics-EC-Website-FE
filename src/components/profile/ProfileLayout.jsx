import React from "react";

export default function ProfileLayout({ children }) {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
