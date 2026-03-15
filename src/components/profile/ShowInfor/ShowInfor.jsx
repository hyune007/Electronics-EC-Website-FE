import React from "react";

export default function ShowInfor({ children }) {
  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="space-y-4">{children}</div>
    </div>
  );
}
