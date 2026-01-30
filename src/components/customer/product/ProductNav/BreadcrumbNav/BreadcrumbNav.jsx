import React from "react";

export default function BreadcrumbNav() {
  return (
    <nav aria-label="Breadcrumb" className="flex mb-8 text-xs text-slate-500">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li>
          <a className="hover:text-primary" href="#">
            Sản phẩm
          </a>
        </li>
        <li>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
        </li>
        <li>
          <a className="hover:text-primary" href="#">
            Điện thoại
          </a>
        </li>
        <li>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
        </li>
        <li className="text-slate-900 dark:text-slate-100 font-semibold">
          Galaxy S23 Ultra
        </li>
      </ol>
    </nav>
  );
}
