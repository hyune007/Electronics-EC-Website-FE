export default function AnalyticsCard({ title, subtitle, rightSlot, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`.trim()}>
      {(title || subtitle || rightSlot) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {rightSlot}
        </div>
      )}
      {children}
    </section>
  );
}
