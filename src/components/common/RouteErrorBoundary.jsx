import React from "react";

export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Route render error:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-12">
          <div className="card-default w-full rounded-2xl border p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Không thể hiển thị trang
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Đã xảy ra lỗi khi tải nội dung. Vui lòng thử tải lại.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn btn-primary mt-5 px-5 py-2"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
