import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ROUTE_MAP } from "../../../routes/routesConfig/customer/routeMap";
import { useFavorites } from "../../../hooks/useFavorites";
import { useProductCache } from "../../../contexts/ProductCacheContext";
import ProductCard from "../../../components/customer/product/ProductCard/ProductCard.jsx";
import {
  requestComparisonSuggestion,
  requestProductTechnicalSpecs,
} from "../../../services/aiService";

const COMPARE_SCOPE = {
  FAVORITES: "favorites",
  ALL_PRODUCTS: "all-products",
};

const CORE_TECH_SPEC_LABELS = [
  "CPU",
  "GPU",
  "Màn hình",
  "Độ phân giải",
  "Tần số quét",
  "RAM",
  "Bộ nhớ trong",
  "Camera sau",
  "Camera trước",
  "Pin",
  "Sạc",
  "Hệ điều hành",
  "Kết nối",
  "Kháng nước",
  "SIM",
  "Kích thước",
  "Trọng lượng",
  "Chất liệu",
  "Cổng kết nối",
  "Âm thanh",
  "Cảm biến",
];

function getProductCategoryKey(product) {
  if (!product) return "";
  return String(product?.category?.id || product?.category?.name || "").trim();
}

function getProductCategoryLabel(product) {
  return product?.category?.name || "Chưa phân loại";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toCurrencyVnd(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

function getShortDescription(value) {
  const text = String(value || "")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (!text) return "-";
  if (text.length <= 80) return text;
  return `${text.slice(0, 80)}...`;
}

function formatAiSuggestion(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return "Chưa có dữ liệu gợi ý từ AI.";

  // Tách và format lại dữ liệu nếu viết liền
  let lines = text
    .split(/\n|(?<=[.!?])\s+/g)
    .map((l) => l.trim())
    .filter(Boolean);

  // Nếu chỉ có 1 dòng dài, cắt thành các phần hợp lý
  if (lines.length === 1 && lines[0].length > 150) {
    lines = lines[0]
      .split(/([.!?*]+)/)
      .filter((l) => l.trim().length > 0)
      .join("\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  return lines.join("\n");
}

function renderAiSuggestionContent({
  loadingAiSuggestion,
  aiSuggestionError,
  aiSuggestion,
}) {
  if (loadingAiSuggestion) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        AI đang phân tích 2 sản phẩm dựa trên thông số kỹ thuật chi tiết, vui
        lòng chờ...
      </p>
    );
  }

  if (aiSuggestionError) {
    return (
      <p className="text-sm text-[var(--color-danger)]">{aiSuggestionError}</p>
    );
  }

  const formatted = formatAiSuggestion(aiSuggestion);
  return (
    <p className="whitespace-pre-line text-sm leading-6 text-[var(--color-text-muted)]">
      {formatted}
    </p>
  );
}

function resolveCrossColumnConflict({
  selectedProduct,
  oppositeSelectedProduct,
  oppositeSelectedId,
  resetOppositeColumn,
  resetMessage,
  noPairMessage,
  sameCategoryCandidates,
}) {
  if (!selectedProduct) {
    return { shouldResetOpposite: false, warning: "" };
  }

  if (
    oppositeSelectedId &&
    getProductCategoryKey(selectedProduct) !==
      getProductCategoryKey(oppositeSelectedProduct)
  ) {
    return {
      shouldResetOpposite: resetOppositeColumn,
      warning: resetMessage,
    };
  }

  if (sameCategoryCandidates <= 0) {
    return {
      shouldResetOpposite: false,
      warning: noPairMessage,
    };
  }

  return { shouldResetOpposite: false, warning: "" };
}

function buildSpecs(product) {
  if (!product) return [];
  const fullPrice = Number(product?.price || 0);
  const discountedPrice = Number(product?.discountedPrice || fullPrice);
  const discountPercent =
    fullPrice > 0 && discountedPrice < fullPrice
      ? `${Math.round(((fullPrice - discountedPrice) / fullPrice) * 100)}%`
      : "0%";

  return [
    { label: "Loại sản phẩm", value: getProductCategoryLabel(product) },
    { label: "Thương hiệu", value: product?.brand?.name || "-" },
    { label: "Mã sản phẩm", value: product?.id || "-" },
    { label: "Giá niêm yết", value: toCurrencyVnd(product?.price) },
    { label: "Giá hiện tại", value: toCurrencyVnd(product?.discountedPrice) },
    { label: "Mức giảm", value: discountPercent },
    { label: "Tồn kho", value: `${Number(product?.stock || 0)} sản phẩm` },
    { label: "Mô tả ngắn", value: getShortDescription(product?.description) },
  ];
}

function buildSuggestionPrompt(
  leftProduct,
  rightProduct,
  leftSpecs = [],
  rightSpecs = [],
) {
  const formatSpecsForPrompt = (specs) =>
    (specs || [])
      .slice(0, 8)
      .map((s) => `${s.label}: ${s.value}`)
      .join(" | ");

  return [
    `Dựa vào thông số kỹ thuật chi tiết của 2 sản phẩm, sản phẩm nào đáng mua hơn?`,
    "",
    `${leftProduct?.name || "Sản phẩm A"}: Giá ${toCurrencyVnd(leftProduct?.discountedPrice || leftProduct?.price)}. Thông số: ${formatSpecsForPrompt(leftSpecs)}`,
    "",
    `${rightProduct?.name || "Sản phẩm B"}: Giá ${toCurrencyVnd(rightProduct?.discountedPrice || rightProduct?.price)}. Thông số: ${formatSpecsForPrompt(rightSpecs)}`,
    "",
    "Hãy gợi ý sản phẩm nào đáng mua hơn? Trả lời ngắn gọn 2-3 dòng, rõ ràng lý do chọn.",
  ].join("\n");
}

function buildTechnicalSpecsPrompt(product) {
  const categoryLabel = getProductCategoryLabel(product);
  const isPhoneLike = normalizeText(categoryLabel).includes("dien thoai");
  const requiredLabels = isPhoneLike
    ? [
        "CPU",
        "GPU",
        "Màn hình",
        "Kích thước màn hình",
        "Độ phân giải",
        "Tần số quét",
        "RAM",
        "Bộ nhớ trong",
        "Camera sau",
        "Camera trước",
        "Pin",
        "Sạc",
        "Hệ điều hành",
        "Kết nối",
        "Kháng nước",
        "SIM",
        "Kích thước",
        "Trọng lượng",
        "Chất liệu",
        "Cổng kết nối",
        "Âm thanh",
        "Cảm biến",
      ]
    : CORE_TECH_SPEC_LABELS;

  const labelList = requiredLabels.join(", ");
  return [
    `Liệt kê chi tiết các thông số kỹ thuật của sản phẩm: ${product?.name}`,
    `Loại: ${getProductCategoryLabel(product)}, Hãng: ${product?.brand?.name}`,
    "",
    'Trả về JSON array, mỗi item có format: {"label":"tên thông số","value":"giá trị cụ thể"}',
    "",
    `Thông số bắt buộc: ${labelList}`,
    "",
    "Chỉ trả JSON array. Không thêm text, markdown hay giải thích.",
  ].join("\n");
}

function toSpecMap(specRows) {
  const map = new Map();
  (specRows || []).forEach((item) => {
    const label = String(item?.label || "").trim();
    const value = String(item?.value || "").trim();
    if (label && value) {
      map.set(label, value);
    }
  });
  return map;
}

function mergeSpecsRows({
  leftBaseSpecs,
  rightBaseSpecs,
  leftAiSpecs,
  rightAiSpecs,
}) {
  const leftMap = toSpecMap(leftBaseSpecs);
  const rightMap = toSpecMap(rightBaseSpecs);

  toSpecMap(leftAiSpecs).forEach((value, label) => {
    leftMap.set(label, value);
  });

  toSpecMap(rightAiSpecs).forEach((value, label) => {
    rightMap.set(label, value);
  });

  const orderedLabels = [
    ...leftMap.keys(),
    ...CORE_TECH_SPEC_LABELS,
    ...rightMap.keys(),
  ].filter((label, index, arr) => arr.indexOf(label) === index);

  const result = orderedLabels.map((label) => ({
    label,
    leftValue: leftMap.get(label) || "Chưa rõ",
    rightValue: rightMap.get(label) || "Chưa rõ",
  }));
  return result;
}

function mapSpecsResponsesToCache(prevCache, responses) {
  const next = { ...prevCache };
  responses.forEach((item) => {
    if (!item?.productId) return;
    if (Array.isArray(item.specs) && item.specs.length > 0) {
      next[item.productId] = item.specs;
      return;
    }
    delete next[item.productId];
  });
  return next;
}

function CompareProductsPanel({
  compareScope,
  compareSourceProducts,
  handleChangeScope,
  compareWarning,
  leftKeyword,
  setLeftKeyword,
  fixedCategoryKey,
  leftSelectedId,
  handleSelectLeft,
  searchableLeftProducts,
  rightKeyword,
  setRightKeyword,
  rightSelectedId,
  handleSelectRight,
  searchableRightProducts,
  leftProduct,
  rightProduct,
  allSpecs,
  hasBothAiSpecs,
  loadingAiSpecs,
  aiSpecsError,
  loadingAiSuggestion,
  aiSuggestionError,
  aiSuggestion,
}) {
  return (
    <section className="card-default mb-7 overflow-hidden rounded-lg border border-[var(--color-border)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
        <h2 className="text-base font-semibold">Bảng so sánh sản phẩm</h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Chọn 2 sản phẩm cùng loại. Khi chọn đủ 2 sản phẩm, bảng thông số sẽ tự
          động hiển thị.
        </p>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleChangeScope(COMPARE_SCOPE.FAVORITES)}
            className={`rounded border px-3 py-1.5 text-xs font-semibold transition-all ${
              compareScope === COMPARE_SCOPE.FAVORITES
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
            }`}
          >
            So sánh trong ưu thích
          </button>
          <button
            type="button"
            onClick={() => handleChangeScope(COMPARE_SCOPE.ALL_PRODUCTS)}
            className={`rounded border px-3 py-1.5 text-xs font-semibold transition-all ${
              compareScope === COMPARE_SCOPE.ALL_PRODUCTS
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
            }`}
          >
            So sánh với tất cả
          </button>
          <span className="text-xs text-[var(--color-text-muted)]">
            Nguồn dữ liệu: {compareSourceProducts.length} sản phẩm
          </span>
        </div>

        {compareWarning ? (
          <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {compareWarning}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2 rounded border border-[var(--color-border)] p-3">
            <h3 className="text-sm font-semibold">Sản phẩm 1</h3>
            <input
              type="text"
              value={leftKeyword}
              onChange={(event) => setLeftKeyword(event.target.value)}
              placeholder={
                fixedCategoryKey
                  ? "Tìm trong cùng loại đã khóa"
                  : "Tìm theo tên, hãng, mã"
              }
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
            <select
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              value={leftSelectedId}
              onChange={(event) => handleSelectLeft(event.target.value)}
            >
              <option value="">Chọn sản phẩm cột 1</option>
              {searchableLeftProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.brand?.name || "Không rõ hãng"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 rounded border border-[var(--color-border)] p-3">
            <h3 className="text-sm font-semibold">Sản phẩm 2</h3>
            <input
              type="text"
              value={rightKeyword}
              onChange={(event) => setRightKeyword(event.target.value)}
              placeholder={
                fixedCategoryKey
                  ? "Tìm trong cùng loại đã khóa"
                  : "Tìm theo tên, hãng, mã"
              }
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
            <select
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              value={rightSelectedId}
              onChange={(event) => handleSelectRight(event.target.value)}
            >
              <option value="">Chọn sản phẩm cột 2</option>
              {searchableRightProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.brand?.name || "Không rõ hãng"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded bg-[var(--color-surface)] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Sản phẩm 1 đã chọn
            </p>
            {leftProduct ? (
              <div className="space-y-3">
                {leftProduct?.image ? (
                  <img
                    src={`http://localhost:8080${leftProduct.image}`}
                    alt={leftProduct?.name || "Sản phẩm 1"}
                    className="h-72 w-full rounded object-contain bg-white p-2 sm:h-80"
                  />
                ) : (
                  <div className="flex h-72 w-full items-center justify-center rounded bg-white text-[var(--color-text-muted)] sm:h-80">
                    <span className="material-symbols-outlined text-3xl">
                      image
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                Chưa chọn sản phẩm.
              </p>
            )}
          </div>

          <div className="rounded bg-[var(--color-surface)] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Sản phẩm 2 đã chọn
            </p>
            {rightProduct ? (
              <div className="space-y-3">
                {rightProduct?.image ? (
                  <img
                    src={`http://localhost:8080${rightProduct.image}`}
                    alt={rightProduct?.name || "Sản phẩm 2"}
                    className="h-72 w-full rounded object-contain bg-white p-2 sm:h-80"
                  />
                ) : (
                  <div className="flex h-72 w-full items-center justify-center rounded bg-white text-[var(--color-text-muted)] sm:h-80">
                    <span className="material-symbols-outlined text-3xl">
                      image
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                Chưa chọn sản phẩm.
              </p>
            )}
          </div>
        </div>

        {leftProduct && rightProduct ? (
          <div className="space-y-4 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
            {loadingAiSpecs || !hasBothAiSpecs ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                Đang tải thông số kỹ thuật cho sản phẩm...
              </p>
            ) : null}

            {aiSpecsError ? (
              <p className="text-sm text-amber-700">{aiSpecsError}</p>
            ) : null}

            {hasBothAiSpecs ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 min-w-[170px] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Thông số
                      </th>
                      <th className="min-w-[230px] border-b border-[var(--color-border)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {leftProduct.name}
                      </th>
                      <th className="min-w-[230px] border-b border-[var(--color-border)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {rightProduct.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSpecs.map((item) => (
                      <tr key={item.label}>
                        <td className="sticky left-0 z-[1] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-medium">
                          {item.label}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-3 py-2 text-[var(--color-text-muted)]">
                          {item.leftValue}
                        </td>
                        <td className="border-b border-[var(--color-border)] px-3 py-2 text-[var(--color-text-muted)]">
                          {item.rightValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="rounded border border-[var(--color-border)] bg-white/40 px-4 py-3">
              <h4 className="mb-2 text-sm font-semibold">Tóm gọn tham khảo</h4>
              {renderAiSuggestionContent({
                loadingAiSuggestion,
                aiSuggestionError,
                aiSuggestion,
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            Hãy chọn sản phẩm ở cột còn lại để tự động hiển thị thông số kỹ
            thuật.
          </p>
        )}
      </div>
    </section>
  );
}

CompareProductsPanel.propTypes = {
  compareScope: PropTypes.string.isRequired,
  compareSourceProducts: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleChangeScope: PropTypes.func.isRequired,
  compareWarning: PropTypes.string,
  leftKeyword: PropTypes.string.isRequired,
  setLeftKeyword: PropTypes.func.isRequired,
  fixedCategoryKey: PropTypes.string,
  leftSelectedId: PropTypes.string.isRequired,
  handleSelectLeft: PropTypes.func.isRequired,
  searchableLeftProducts: PropTypes.arrayOf(PropTypes.object).isRequired,
  rightKeyword: PropTypes.string.isRequired,
  setRightKeyword: PropTypes.func.isRequired,
  rightSelectedId: PropTypes.string.isRequired,
  handleSelectRight: PropTypes.func.isRequired,
  searchableRightProducts: PropTypes.arrayOf(PropTypes.object).isRequired,
  leftProduct: PropTypes.object,
  rightProduct: PropTypes.object,
  allSpecs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      leftValue: PropTypes.string,
      rightValue: PropTypes.string,
    }),
  ).isRequired,
  hasBothAiSpecs: PropTypes.bool.isRequired,
  loadingAiSpecs: PropTypes.bool.isRequired,
  aiSpecsError: PropTypes.string,
  loadingAiSuggestion: PropTypes.bool.isRequired,
  aiSuggestionError: PropTypes.string,
  aiSuggestion: PropTypes.string,
};

CompareProductsPanel.defaultProps = {
  compareWarning: "",
  fixedCategoryKey: "",
  leftProduct: null,
  rightProduct: null,
  aiSpecsError: "",
  aiSuggestionError: "",
  aiSuggestion: "",
};

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { allProducts, loadingAll, prefetchAllProducts } = useProductCache();
  const comparePanelRef = useRef(null);
  const [favoritedProducts, setFavoritedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [compareScope, setCompareScope] = useState(COMPARE_SCOPE.FAVORITES);
  const [leftSelectedId, setLeftSelectedId] = useState("");
  const [rightSelectedId, setRightSelectedId] = useState("");
  const [leftKeyword, setLeftKeyword] = useState("");
  const [rightKeyword, setRightKeyword] = useState("");
  const [compareWarning, setCompareWarning] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAiSuggestion, setLoadingAiSuggestion] = useState(false);
  const [aiSuggestionError, setAiSuggestionError] = useState("");
  const [aiSpecsByProductId, setAiSpecsByProductId] = useState({});
  const [loadingAiSpecs, setLoadingAiSpecs] = useState(false);
  const [aiSpecsError, setAiSpecsError] = useState("");



  useEffect(() => {
    if (loading) return;
    try {
      const raw = sessionStorage.getItem("favorites_scroll");
      if (raw) {
        const top = Number(raw);
        if (Number.isFinite(top)) {
          window.scrollTo({ top, behavior: "smooth" });
        }
        sessionStorage.removeItem("favorites_scroll");
      }
    } catch {
      // ignore
    }
  }, [loading]);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      if (!allProducts || allProducts.length === 0) {
        await prefetchAllProducts();
      }
      setLoading(false);
    };

    loadFavorites();
  }, [allProducts, prefetchAllProducts]);

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      const products = allProducts.filter((p) => favorites.includes(p.id));
      setFavoritedProducts(products);
    }
  }, [favorites, allProducts]);

  const compareSourceProducts = useMemo(() => {
    const source =
      compareScope === COMPARE_SCOPE.FAVORITES
        ? favoritedProducts
        : allProducts || [];

    const uniqueMap = new Map();
    source.forEach((item) => {
      if (item?.id && !uniqueMap.has(String(item.id))) {
        uniqueMap.set(String(item.id), item);
      }
    });

    return Array.from(uniqueMap.values());
  }, [compareScope, favoritedProducts, allProducts]);

  const leftProduct = useMemo(
    () =>
      compareSourceProducts.find(
        (item) => String(item.id) === String(leftSelectedId),
      ) || null,
    [compareSourceProducts, leftSelectedId],
  );

  const rightProduct = useMemo(
    () =>
      compareSourceProducts.find(
        (item) => String(item.id) === String(rightSelectedId),
      ) || null,
    [compareSourceProducts, rightSelectedId],
  );

  const fixedCategoryKey = useMemo(() => {
    if (leftProduct) return getProductCategoryKey(leftProduct);
    if (rightProduct) return getProductCategoryKey(rightProduct);
    return "";
  }, [leftProduct, rightProduct]);

  const categoryFilteredProducts = useMemo(() => {
    if (!fixedCategoryKey) return compareSourceProducts;
    return compareSourceProducts.filter(
      (product) => getProductCategoryKey(product) === fixedCategoryKey,
    );
  }, [compareSourceProducts, fixedCategoryKey]);

  const searchableLeftProducts = useMemo(() => {
    const keyword = normalizeText(leftKeyword);
    return categoryFilteredProducts
      .filter((item) => String(item.id) !== String(rightSelectedId))
      .filter((item) => {
        if (!keyword) return true;
        const candidate = normalizeText(
          `${item?.name || ""} ${item?.brand?.name || ""} ${item?.id || ""}`,
        );
        return candidate.includes(keyword);
      });
  }, [categoryFilteredProducts, leftKeyword, rightSelectedId]);

  const searchableRightProducts = useMemo(() => {
    const keyword = normalizeText(rightKeyword);
    return categoryFilteredProducts
      .filter((item) => String(item.id) !== String(leftSelectedId))
      .filter((item) => {
        if (!keyword) return true;
        const candidate = normalizeText(
          `${item?.name || ""} ${item?.brand?.name || ""} ${item?.id || ""}`,
        );
        return candidate.includes(keyword);
      });
  }, [categoryFilteredProducts, rightKeyword, leftSelectedId]);

  const allSpecs = useMemo(() => {
    if (!leftProduct || !rightProduct) return [];
    const leftBaseSpecs = buildSpecs(leftProduct);
    const rightBaseSpecs = buildSpecs(rightProduct);
    const leftAiSpecs = aiSpecsByProductId[String(leftProduct.id)] || [];
    const rightAiSpecs = aiSpecsByProductId[String(rightProduct.id)] || [];

    return mergeSpecsRows({
      leftBaseSpecs,
      rightBaseSpecs,
      leftAiSpecs,
      rightAiSpecs,
    });
  }, [leftProduct, rightProduct, aiSpecsByProductId]);

  const hasBothAiSpecs = useMemo(() => {
    if (!leftProduct || !rightProduct) return false;
    const leftSpecs = aiSpecsByProductId[String(leftProduct.id)] || [];
    const rightSpecs = aiSpecsByProductId[String(rightProduct.id)] || [];
    return leftSpecs.length > 0 && rightSpecs.length > 0;
  }, [leftProduct, rightProduct, aiSpecsByProductId]);

  useEffect(() => {
    if (!leftSelectedId || !rightSelectedId || !leftProduct || !rightProduct) {
      setAiSpecsError("");
      return;
    }

    const missingProducts = [leftProduct, rightProduct].filter((product) => {
      const key = String(product?.id || "");
      if (!key) return false;
      const cachedSpecs = aiSpecsByProductId[key];
      return !Array.isArray(cachedSpecs) || cachedSpecs.length === 0;
    });

    if (missingProducts.length === 0) {
      setAiSpecsError("");
      return;
    }

    let active = true;

    const fetchTechnicalSpecs = async () => {
      setLoadingAiSpecs(true);
      setAiSpecsError("");
      try {
        const responses = await Promise.all(
          missingProducts.map(async (product) => {
            const prompt = buildTechnicalSpecsPrompt(product);
            const specs = await requestProductTechnicalSpecs(prompt);
            return { productId: String(product.id), specs };
          }),
        );

        if (!active) return;


        // Kiểm tra xem AI có trả về specs đầy đủ không
        const hasEmptySpecs = responses.some(
          (r) => !r.specs || r.specs.length === 0,
        );
        if (hasEmptySpecs) {
          setAiSpecsError(
            "AI chưa có thể lấy đầy đủ thông số kỹ thuật chi tiết. Đang hiển thị các thông số sơ bộ. Hãy cập nhật thông số thêm thủ công nếu cần.",
          );
        }

        setAiSpecsByProductId((prev) => {
          const next = mapSpecsResponsesToCache(prev, responses);
          return next;
        });
      } catch (error) {
        if (!active) return;
        setAiSpecsError(
          "⚠ Không thể tải thông số kỹ thuật từ AI. Sử dụng dữ liệu có sẵn.",
        );
        console.error("Technical specs AI failed", error);
      } finally {
        if (active) {
          setLoadingAiSpecs(false);
        }
      }
    };

    fetchTechnicalSpecs();

    return () => {
      active = false;
    };
  }, [
    leftSelectedId,
    rightSelectedId,
    leftProduct,
    rightProduct,
    aiSpecsByProductId,
  ]);

  useEffect(() => {
    if (!leftSelectedId || !rightSelectedId) {
      setAiSuggestion("");
      setAiSuggestionError("");
      return;
    }

    if (!leftProduct || !rightProduct) {
      setAiSuggestion("");
      setAiSuggestionError("");
      return;
    }

    // Chờ specs được fetch xong trước khi gọi suggestion
    const leftSpecs = aiSpecsByProductId[String(leftProduct.id)] || [];
    const rightSpecs = aiSpecsByProductId[String(rightProduct.id)] || [];
    const hasMissingSpecs = !leftSpecs.length || !rightSpecs.length;

    if (hasMissingSpecs) {
      // Specs chưa ready, dừng lại
      return;
    }

    let active = true;

    const fetchAiSuggestion = async () => {
      setLoadingAiSuggestion(true);
      setAiSuggestionError("");
      try {
        const prompt = buildSuggestionPrompt(
          leftProduct,
          rightProduct,
          leftSpecs,
          rightSpecs,
        );
        const result = await requestComparisonSuggestion(prompt);
        if (!active) return;
        setAiSuggestion(result || "AI chưa trả về nội dung gợi ý.");
      } catch (error) {
        if (!active) return;
        setAiSuggestion("");
        setAiSuggestionError(
          "Không thể lấy gợi ý từ AI lúc này. Vui lòng thử lại sau.",
        );
        console.error("AI suggestion failed", error);
      } finally {
        if (active) {
          setLoadingAiSuggestion(false);
        }
      }
    };

    fetchAiSuggestion();

    return () => {
      active = false;
    };
  }, [
    leftSelectedId,
    rightSelectedId,
    leftProduct,
    rightProduct,
    aiSpecsByProductId,
  ]);

  useEffect(() => {
    if (!showComparePanel) return;

    const pairByCategory = new Map();
    compareSourceProducts.forEach((item) => {
      const key = getProductCategoryKey(item);
      pairByCategory.set(key, (pairByCategory.get(key) || 0) + 1);
    });

    const hasComparablePair = Array.from(pairByCategory.values()).some(
      (count) => count >= 2,
    );

    if (!hasComparablePair) {
      setCompareWarning(
        compareScope === COMPARE_SCOPE.FAVORITES
          ? "Danh sách yêu thích chưa có 2 sản phẩm cùng loại để so sánh."
          : "Hiện chưa có 2 sản phẩm cùng loại trong danh sách để so sánh.",
      );
      return;
    }

    if (fixedCategoryKey) {
      const sameCategoryCount = categoryFilteredProducts.length;
      if (sameCategoryCount < 2) {
        setCompareWarning(
          "Không tìm thấy sản phẩm cùng loại để ghép cặp so sánh. Vui lòng chọn sản phẩm khác.",
        );
        return;
      }
    }

    setCompareWarning("");
  }, [
    showComparePanel,
    compareScope,
    compareSourceProducts,
    fixedCategoryKey,
    categoryFilteredProducts.length,
  ]);

  useEffect(() => {
    if (
      leftSelectedId &&
      !compareSourceProducts.some(
        (item) => String(item.id) === String(leftSelectedId),
      )
    ) {
      setLeftSelectedId("");
    }

    if (
      rightSelectedId &&
      !compareSourceProducts.some(
        (item) => String(item.id) === String(rightSelectedId),
      )
    ) {
      setRightSelectedId("");
    }
  }, [compareSourceProducts, leftSelectedId, rightSelectedId]);

  useEffect(() => {
    if (!showComparePanel || !comparePanelRef.current) return;

    comparePanelRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [showComparePanel]);

  const handleChangeScope = (scope) => {
    setCompareScope(scope);
    setLeftSelectedId("");
    setRightSelectedId("");
    setLeftKeyword("");
    setRightKeyword("");
    setCompareWarning("");
    setAiSuggestion("");
    setAiSuggestionError("");
    setAiSpecsError("");
  };

  const handleBackClick = () => {
    try {
      sessionStorage.setItem("favorites_scroll", String(window.scrollY || 0));
    } catch {
      // ignore
    }
    navigate(ROUTE_MAP.home || "/");
  };

  const handleSelectLeft = (productId) => {
    setLeftSelectedId(productId);
    const selected = compareSourceProducts.find(
      (item) => String(item.id) === String(productId),
    );
    const conflictResult = resolveCrossColumnConflict({
      selectedProduct: selected,
      oppositeSelectedProduct: rightProduct,
      oppositeSelectedId: rightSelectedId,
      resetOppositeColumn: true,
      resetMessage:
        "Đã đặt lại cột phải vì cần cùng loại sản phẩm với cột trái.",
      noPairMessage:
        "Không có sản phẩm cùng loại để so sánh với lựa chọn hiện tại.",
      sameCategoryCandidates: categoryFilteredProducts.filter(
        (item) => String(item.id) !== String(productId),
      ).length,
    });

    if (conflictResult.shouldResetOpposite) {
      setRightSelectedId("");
    }

    setCompareWarning(conflictResult.warning);
  };

  const handleSelectRight = (productId) => {
    setRightSelectedId(productId);
    const selected = compareSourceProducts.find(
      (item) => String(item.id) === String(productId),
    );
    const conflictResult = resolveCrossColumnConflict({
      selectedProduct: selected,
      oppositeSelectedProduct: leftProduct,
      oppositeSelectedId: leftSelectedId,
      resetOppositeColumn: true,
      resetMessage:
        "Đã đặt lại cột trái vì cần cùng loại sản phẩm với cột phải.",
      noPairMessage:
        "Không có sản phẩm cùng loại để so sánh với lựa chọn hiện tại.",
      sameCategoryCandidates: categoryFilteredProducts.filter(
        (item) => String(item.id) !== String(productId),
      ).length,
    });

    if (conflictResult.shouldResetOpposite) {
      setLeftSelectedId("");
      setCompareWarning(conflictResult.warning);
      return;
    }

    setCompareWarning(conflictResult.warning);
  };

  if (loading || loadingAll) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-5 pb-20 sm:px-6 lg:px-8">
        <div className="card-default flex min-h-[400px] items-center justify-center rounded-lg">
          <span className="text-sm text-[var(--color-text-muted)]">
            Đang tải danh sách yêu thích...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-5 pb-20 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sản phẩm yêu thích</h1>
          <div className="flex items-center gap-3">
            {favoritedProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowComparePanel((prev) => !prev)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                {showComparePanel ? "Ẩn so sánh" : "So sánh sản phẩm"}
              </button>
            )}
            <button
              onClick={handleBackClick}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      {favoritedProducts.length === 0 ? (
        <div className="card-default flex min-h-[400px] flex-col items-center justify-center gap-4">
          <span className="material-symbols-outlined text-5xl text-[var(--color-text-muted)]">
            favorite_border
          </span>
          <span className="text-center">
            <p className="text-lg font-semibold">Chưa có sản phẩm yêu thích</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Hãy thêm sản phẩm yêu thích để xem chúng ở đây
            </p>
          </span>
          <button
            onClick={() => navigate("/products")}
            className="btn-primary mt-4 px-6 py-2 text-sm"
          >
            Xem sản phẩm
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-7 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {favoritedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {showComparePanel ? (
            <div ref={comparePanelRef}>
              <CompareProductsPanel
                compareScope={compareScope}
                compareSourceProducts={compareSourceProducts}
                handleChangeScope={handleChangeScope}
                compareWarning={compareWarning}
                leftKeyword={leftKeyword}
                setLeftKeyword={setLeftKeyword}
                fixedCategoryKey={fixedCategoryKey}
                leftSelectedId={leftSelectedId}
                handleSelectLeft={handleSelectLeft}
                searchableLeftProducts={searchableLeftProducts}
                rightKeyword={rightKeyword}
                setRightKeyword={setRightKeyword}
                rightSelectedId={rightSelectedId}
                handleSelectRight={handleSelectRight}
                searchableRightProducts={searchableRightProducts}
                leftProduct={leftProduct}
                rightProduct={rightProduct}
                allSpecs={allSpecs}
                hasBothAiSpecs={hasBothAiSpecs}
                loadingAiSpecs={loadingAiSpecs}
                aiSpecsError={aiSpecsError}
                loadingAiSuggestion={loadingAiSuggestion}
                aiSuggestionError={aiSuggestionError}
                aiSuggestion={aiSuggestion}
              />
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
