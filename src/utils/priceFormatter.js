export function formatVND(value, withSuffix = true) {
    const num = Number(value || 0);
    const formatted = num.toLocaleString("vi-VN");
    return withSuffix ? `${formatted} VNĐ` : formatted;
}

export default formatVND;
