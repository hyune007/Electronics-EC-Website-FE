export function formatNumberVi(value) {
    const number = Number(value || 0);
    if (!Number.isFinite(number)) return "0";
    return number.toLocaleString("vi-VN");
}

export function formatVnd(value, options = {}) {
    const { withSuffix = true } = options;
    const formatted = formatNumberVi(value);
    return withSuffix ? `${formatted} VND` : formatted;
}
