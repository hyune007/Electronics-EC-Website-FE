export const SIDEBAR_ITEMS = [
  {
    key: "home",
    title: "Trang chủ",
    section: "overview",
    roleAccess: ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  },
  {
    key: "customers",
    title: "Khách hàng",
    section: "management",
    roleAccess: ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  },
  {
    key: "orders",
    title: "Đơn hàng",
    section: "management",
    roleAccess: ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  },
  {
    key: "products",
    title: "Sản phẩm",
    section: "management",
    roleAccess: ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  },
  {
    key: "brands",
    title: "Thương hiệu",
    section: "management",
    roleAccess: ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  },
  {
    key: "staff",
    title: "Nhân viên",
    section: "management",
    roleAccess: ["ROLE_ADMIN"],
  },
  {
    key: "imports",
    title: "Nhập kho",
    section: "management",
    roleAccess: ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  },
  {
    key: "vouchers",
    title: "Voucher",
    section: "management",
    roleAccess: ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  },
  {
    key: "chat",
    title: "Live chat",
    section: "communication",
    roleAccess: ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  },
];

export const SECTION_TITLE = {
  overview: "Tổng quan",
  management: "Vận hành",
  communication: "Kết nối",
};

export const getTitleByKey = (key) => SIDEBAR_ITEMS.find((item) => item.key === key)?.title || "";