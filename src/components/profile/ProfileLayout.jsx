import React from "react";

export default function ProfileLayout({ children }) {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-10  ">
        <div>{children}</div>
      </div>
    </div>
  );
}
