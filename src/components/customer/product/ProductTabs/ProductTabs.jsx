import React, { useState } from "react";
import DescribeProductTab from "./tab/DescribeProduct/DescribeProductTab.jsx";
import ReviewTab from "./tab/ReviewTab/ReviewTab.jsx";
import ReviewSummary from "./tab/ReviewTab/ReviewSummary.jsx";
import vi from "../../../../i18n/vi.js";

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState("desc");

  const tabClass = (tab) =>
    `px-4 py-1 border-b-2 ${
      activeTab === tab
        ? "border-primary font-bold text-primary dark:text-white"
        : "border-transparent text-slate-500 font-medium hover:text-slate-800 dark:hover:text-slate-200"
    }`;

  return (
    <>
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
        <button
          className={tabClass("desc")}
          onClick={() => setActiveTab("desc")}
        >
          {vi.product.tabs.desc}
        </button>
        <button
          className={tabClass("review")}
          onClick={() => setActiveTab("review")}
        >
          {vi.product.tabs.reviews}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === "review" ? (
          <div className="lg:col-span-3">
            <ReviewTab />
          </div>
        ) : (
          <>
            <div className="lg:col-span-2">
              <DescribeProductTab product={product} />
            </div>
            <div className="space-y-8">
              <ReviewSummary />
            </div>
          </>
        )}
      </div>
    </>
  );
}
