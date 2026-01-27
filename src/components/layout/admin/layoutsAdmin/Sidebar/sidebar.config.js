export const SIDEBAR_ITEMS = [
    { key: "home", title: "Trang chủ" },
    { key: "customers", title: "Quản lí khách hàng" },
    { key: "orders", title: "Quản lí đơn hàng" },
    { key: "products", title: "Quản lí sản phẩm" },
    { key: "brands", title: "Quản lí hãng" },
    { key: "staff", title: "Quản lí nhân viên" },
];

export const getTitleByKey = (key) =>
    SIDEBAR_ITEMS.find(i => i.key === key)?.title || "";
