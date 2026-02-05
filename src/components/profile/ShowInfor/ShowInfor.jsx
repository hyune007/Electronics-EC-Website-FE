import React from "react";

export default function ShowInfor({ children }) {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-10">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
