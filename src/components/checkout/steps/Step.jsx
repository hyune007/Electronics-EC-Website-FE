import React from "react";
import Stepper from "../Stepper";

export default function Step({ children}) {
  return (
    <div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}
