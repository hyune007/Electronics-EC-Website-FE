import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-transparent px-4 py-10">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
        <div className="card-default w-full rounded-2xl border p-8 text-center md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Error
          </p>
          <h1 className="mt-3 text-5xl font-bold text-[var(--color-text)] md:text-6xl">
            404
          </h1>
          <h2 className="mt-3 text-xl font-semibold text-[var(--color-text)] md:text-2xl">
            Không tìm thấy trang
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
            Trang bạn đang tìm có thể đã được di chuyển, đổi đường dẫn hoặc
            không tồn tại.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/home" className="btn-primary px-5 py-2.5">
              Về trang chủ
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn-secondary px-5 py-2.5"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
