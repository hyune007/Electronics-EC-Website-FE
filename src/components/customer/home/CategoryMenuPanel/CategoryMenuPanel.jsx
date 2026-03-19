import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CategoryMenuPanel.css";

const ALL_CATEGORIES = [
  { id: "LSP01", icon: "smartphone", label: "Điện thoại" },
  { id: "LSP02", icon: "laptop_mac", label: "Laptop" },
  { id: "LSP03", icon: "tablet_mac", label: "Máy tính bảng" },
  { id: "LSP04", icon: "watch", label: "Đồng hồ thông minh" },
  { id: "LSP05", icon: "headphones", label: "Tai nghe" },
  { id: "LSP06", icon: "keyboard", label: "Bàn phím" },
  { id: "LSP07", icon: "mouse", label: "Chuột" },
  { id: "LSP08", icon: "desktop_windows", label: "Màn hình" },
  { id: "LSP09", icon: "speaker", label: "Loa" },
  { id: "LSP10", icon: "devices_other", label: "Phụ kiện khác" },
];

const BRANDS_BY_CATEGORY = {
  LSP01: ["Apple", "Samsung", "Xiaomi", "Oppo", "Google", "Nokia"],
  LSP02: ["Dell", "HP", "Lenovo", "Asus", "Acer", "MSI"],
  LSP03: ["Apple", "Samsung", "Lenovo", "Huawei"],
  LSP04: ["Apple", "Samsung", "Garmin", "Amazfit", "Fitbit"],
  LSP05: ["Sony", "Bose", "JBL", "Sennheiser"],
  LSP06: ["Logitech", "Corsair", "Razer", "SteelSeries"],
  LSP07: ["Logitech", "Corsair", "Razer", "SteelSeries"],
  LSP08: ["LG", "Samsung", "Dell", "BenQ", "MSI", "Acer"],
  LSP09: ["JBL", "Sony", "Bose", "Marshall"],
  LSP10: ["Anker", "Logitech", "Apple", "Samsung"],
};

const PRICE_SEGMENTS = [
  { label: "0 – 5.000đ", min: 0, max: 5000 },
  { label: "5.000 – 10.000 đ", min: 5000, max: 10000 },
  { label: "10.000 – 20.000 đ", min: 10000, max: 20000 },
  { label: "Trên 20.000 đ", min: 20000, max: 100000 },
];

export default function CategoryMenuPanel({
  onClose,
  insideDrawer = false,
  hoverPanelStyle,
}) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);
  const timerRef = useRef(null);

  const cancelClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const scheduleClose = () => {
    cancelClose();
    timerRef.current = setTimeout(() => setHoveredId(null), 130);
  };

  const go = (path) => {
    onClose?.();
    navigate(path);
  };

  const active = ALL_CATEGORIES.find((c) => c.id === hoveredId);

  const CATEGORY_PANEL = {
    LSP02: {
      columns: [
        {
          title: "Thương hiệu",
          items: BRANDS_BY_CATEGORY.LSP02 || [],
        },
        {
          title: "Nhu cầu sử dụng",
          items: [
            "Văn phòng",
            "Gaming",
            "Đồ họa - kỹ thuật",
            "Sinh viên",
            "Mỏng nhẹ",
          ],
        },
        {
          title: "Dòng chip",
          items: [
            "Laptop Intel",
            "Apple M5 Series",
            "AMD Ryzen",
          ],
        },
        {
          title: "Kích thước màn hình",
          items: [
            "Laptop 13 inch",
            "Laptop 14 inch",
            "Laptop 15.6 inch",
            "Laptop 16 inch",
          ],
        },
      ],
    },
  };

  return (
    <>
      <p className="cmenu-title">Danh mục sản phẩm</p>

      <nav
        className="cmenu-list"
        aria-label="Danh mục sản phẩm"
        onMouseLeave={scheduleClose}
      >
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="cmenu-item"
            onMouseEnter={() => {
              cancelClose();
              setHoveredId(cat.id);
            }}
            onClick={() => go(`/products?p=1&category=${cat.id}`)}
          >
            <span className="material-symbols-outlined text-[18px]">
              {cat.icon}
            </span>
            <span className="line-clamp-1">{cat.label}</span>
            <span className="material-symbols-outlined !text-[13px] ml-auto opacity-35">
              chevron_right
            </span>
          </button>
        ))}
      </nav>

      <aside
        className={`cmenu-hover-panel${hoveredId ? " is-open" : ""}${insideDrawer ? " cmenu-hover-panel--drawer" : ""}`}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        aria-hidden="true"
        style={hoverPanelStyle}
      >
        {active && (
          <>
            <div className="cmenu-hover-head">
              <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]">
                {active.icon}
              </span>
              <h4>{active.label}</h4>
            </div>

            {CATEGORY_PANEL[hoveredId] ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {CATEGORY_PANEL[hoveredId].columns.map((col) => (
                  <div className="cmenu-hover-block" key={col.title}>
                    <p className="cmenu-hover-label">{col.title}</p>
                    <div className="cmenu-hover-chip-wrap">
                      {col.items.map((it) => (
                        <button
                          key={it}
                          type="button"
                          className="cmenu-hover-chip"
                          onClick={() =>
                            go(
                              `/products?p=1&category=${hoveredId}&q=${encodeURIComponent(it)}`,
                            )
                          }
                        >
                          {it}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="cmenu-hover-block">
                  <p className="cmenu-hover-label">Thương hiệu</p>
                  <div className="cmenu-hover-chip-wrap">
                    {(BRANDS_BY_CATEGORY[hoveredId] || []).map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        className="cmenu-hover-chip"
                        onClick={() =>
                          go(
                            `/products?p=1&category=${hoveredId}&brand=${encodeURIComponent(
                              brand,
                            )}`,
                          )
                        }
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cmenu-hover-block">
                  <p className="cmenu-hover-label">Phân khúc giá</p>
                  <div className="cmenu-hover-chip-wrap">
                    {PRICE_SEGMENTS.map((seg) => (
                      <button
                        key={seg.label}
                        type="button"
                        className="cmenu-hover-chip"
                        onClick={() =>
                          go(
                            `/products?p=1&category=${hoveredId}&minPrice=${seg.min}&maxPrice=${seg.max}`,
                          )
                        }
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </>
  );
}
