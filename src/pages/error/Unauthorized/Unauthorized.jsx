import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-transparent px-4 py-10">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
        <div className="card-default w-full rounded-2xl border p-8 text-center md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Forbidden
          </p>
          <h1 className="mt-3 text-5xl font-bold text-[var(--color-danger)] md:text-6xl">
            403
          </h1>
          <h2 className="mt-3 text-xl font-semibold text-[var(--color-text)] md:text-2xl">
            Không có quyền truy cập
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
            Bạn không có quyền truy cập trang này.
          </p>
          <Link to="/" className="btn-primary mt-7 inline-flex px-6 py-2.5">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
