import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import {
  requestComparisonSuggestion,
  requestProductTechnicalSpecs,
} from "../../../../services/aiService";

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
    "Dựa vào thông số kỹ thuật chi tiết của 2 sản phẩm, sản phẩm nào đáng mua hơn?",
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

  return [
    `Liệt kê chi tiết các thông số kỹ thuật của sản phẩm: ${product?.name}`,
    `Loại: ${getProductCategoryLabel(product)}, Hãng: ${product?.brand?.name}`,
    "",
    'Trả về JSON array, mỗi item có format: {"label":"tên thông số","value":"giá trị cụ thể"}',
    "",
    `Thông số bắt buộc: ${requiredLabels.join(", ")}`,
    "",
    "Chỉ trả JSON array. Không thêm text, markdown hay giải thích.",
  ].join("\n");
}

function toSpecMap(specRows) {
  const map = new Map();
  (specRows || []).forEach((item) => {
    const label = String(item?.label || "").trim();
    const value = String(item?.value || "").trim();
    if (label && value) map.set(label, value);
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

  toSpecMap(leftAiSpecs).forEach((value, label) => leftMap.set(label, value));
  toSpecMap(rightAiSpecs).forEach((value, label) => rightMap.set(label, value));

  const orderedLabels = [
    ...leftMap.keys(),
    ...CORE_TECH_SPEC_LABELS,
    ...rightMap.keys(),
  ].filter((label, index, arr) => arr.indexOf(label) === index);

  return orderedLabels.map((label) => ({
    label,
    leftValue: leftMap.get(label) || "Chưa rõ",
    rightValue: rightMap.get(label) || "Chưa rõ",
  }));
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

function formatAiSuggestion(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return "Chưa có dữ liệu gợi ý từ AI.";

  let lines = text
    .split(/\n|(?<=[.!?])\s+/g)
    .map((l) => l.trim())
    .filter(Boolean);

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

function renderSuggestionContent({
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

  return (
    <p className="whitespace-pre-line text-sm leading-6 text-[var(--color-text-muted)]">
      {formatAiSuggestion(aiSuggestion)}
    </p>
  );
}

function productImageSrc(product) {
  if (!product?.image) return "";
  return product.image.startsWith("http")
    ? product.image
    : `http://localhost:8080${product.image}`;
}

export default function ProductCompareModal({
  open,
  onClose,
  currentProduct,
  allProducts,
  loadingProducts,
}) {
  const [rightKeyword, setRightKeyword] = useState("");
  const [rightSelectedId, setRightSelectedId] = useState("");
  const [compareWarning, setCompareWarning] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAiSuggestion, setLoadingAiSuggestion] = useState(false);
  const [aiSuggestionError, setAiSuggestionError] = useState("");
  const [aiSpecsByProductId, setAiSpecsByProductId] = useState({});
  const [loadingAiSpecs, setLoadingAiSpecs] = useState(false);
  const [aiSpecsError, setAiSpecsError] = useState("");

  const sameCategoryProducts = useMemo(() => {
    if (!currentProduct) return [];
    const categoryKey = getProductCategoryKey(currentProduct);
    return (allProducts || []).filter(
      (item) =>
        String(item?.id) !== String(currentProduct?.id) &&
        getProductCategoryKey(item) === categoryKey,
    );
  }, [allProducts, currentProduct]);

  const searchableRightProducts = useMemo(() => {
    const keyword = normalizeText(rightKeyword);
    return sameCategoryProducts.filter((item) => {
      if (!keyword) return true;
      const candidate = normalizeText(
        `${item?.name || ""} ${item?.brand?.name || ""} ${item?.id || ""}`,
      );
      return candidate.includes(keyword);
    });
  }, [sameCategoryProducts, rightKeyword]);

  const rightProduct = useMemo(
    () =>
      searchableRightProducts.find(
        (item) => String(item.id) === String(rightSelectedId),
      ) ||
      sameCategoryProducts.find(
        (item) => String(item.id) === String(rightSelectedId),
      ) ||
      null,
    [rightSelectedId, searchableRightProducts, sameCategoryProducts],
  );

  const allSpecs = useMemo(() => {
    if (!currentProduct || !rightProduct) return [];
    const leftBaseSpecs = buildSpecs(currentProduct);
    const rightBaseSpecs = buildSpecs(rightProduct);
    const leftAiSpecs = aiSpecsByProductId[String(currentProduct.id)] || [];
    const rightAiSpecs = aiSpecsByProductId[String(rightProduct.id)] || [];

    return mergeSpecsRows({
      leftBaseSpecs,
      rightBaseSpecs,
      leftAiSpecs,
      rightAiSpecs,
    });
  }, [currentProduct, rightProduct, aiSpecsByProductId]);

  const hasBothAiSpecs = useMemo(() => {
    if (!currentProduct || !rightProduct) return false;
    const leftSpecs = aiSpecsByProductId[String(currentProduct.id)] || [];
    const rightSpecs = aiSpecsByProductId[String(rightProduct.id)] || [];
    return leftSpecs.length > 0 && rightSpecs.length > 0;
  }, [currentProduct, rightProduct, aiSpecsByProductId]);

  useEffect(() => {
    if (!open) return;
    if (!sameCategoryProducts.length) {
      setCompareWarning("Hiện chưa có sản phẩm cùng loại để so sánh.");
      return;
    }
    setCompareWarning("");
  }, [open, sameCategoryProducts.length]);

  useEffect(() => {
    if (!open || !currentProduct || !rightProduct) {
      setAiSpecsError("");
      return;
    }

    const missingProducts = [currentProduct, rightProduct].filter((product) => {
      const key = String(product?.id || "");
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

        const hasEmptySpecs = responses.some(
          (r) => !r.specs || r.specs.length === 0,
        );
        if (hasEmptySpecs) {
          setAiSpecsError(
            "AI chưa thể lấy đầy đủ thông số kỹ thuật chi tiết. Đang hiển thị thông số sơ bộ.",
          );
        }

        setAiSpecsByProductId((prev) =>
          mapSpecsResponsesToCache(prev, responses),
        );
      } catch {
        if (!active) return;
        setAiSpecsError(
          "Không thể tải thông số kỹ thuật từ AI. Sử dụng dữ liệu có sẵn.",
        );
      } finally {
        if (active) setLoadingAiSpecs(false);
      }
    };

    fetchTechnicalSpecs();

    return () => {
      active = false;
    };
  }, [open, currentProduct, rightProduct, aiSpecsByProductId]);

  useEffect(() => {
    if (!open || !currentProduct || !rightProduct) {
      setAiSuggestion("");
      setAiSuggestionError("");
      return;
    }

    const leftSpecs = aiSpecsByProductId[String(currentProduct.id)] || [];
    const rightSpecs = aiSpecsByProductId[String(rightProduct.id)] || [];
    if (!leftSpecs.length || !rightSpecs.length) return;

    let active = true;

    const fetchAiSuggestion = async () => {
      setLoadingAiSuggestion(true);
      setAiSuggestionError("");
      try {
        const prompt = buildSuggestionPrompt(
          currentProduct,
          rightProduct,
          leftSpecs,
          rightSpecs,
        );
        const result = await requestComparisonSuggestion(prompt);
        if (!active) return;
        setAiSuggestion(result || "AI chưa trả về nội dung gợi ý.");
      } catch {
        if (!active) return;
        setAiSuggestion("");
        setAiSuggestionError(
          "Không thể lấy gợi ý từ AI lúc này. Vui lòng thử lại sau.",
        );
      } finally {
        if (active) setLoadingAiSuggestion(false);
      }
    };

    fetchAiSuggestion();

    return () => {
      active = false;
    };
  }, [open, currentProduct, rightProduct, aiSpecsByProductId]);

  useEffect(() => {
    if (!open) return;
    setRightKeyword("");
    setRightSelectedId("");
    setAiSuggestion("");
    setAiSuggestionError("");
    setAiSpecsError("");
  }, [open, currentProduct?.id]);

  if (!open) return null;

  if (typeof document === "undefined") return null;

  const modalContent = (
    <dialog
      open
      className="fixed inset-0 z-[2147483646] m-0 flex h-full w-full items-center justify-center overflow-hidden border-0 bg-black/45 px-3 py-4 sm:px-5"
      aria-label="So sánh sản phẩm"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button
        type="button"
        aria-label="Đóng popup so sánh"
        className="fixed inset-0 h-full w-full bg-transparent"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-6xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-2xl sm:max-h-[calc(100dvh-2.5rem)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
          <div>
            <h2 className="text-base font-semibold">So sánh sản phẩm</h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Cột 1 cố định theo sản phẩm đang xem, chọn cột 2 trong cùng loại.
            </p>
          </div>
          <button
            type="button"
            className="icon-btn h-9 w-9 p-0"
            onClick={onClose}
            aria-label="Đóng so sánh sản phẩm"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
          {compareWarning ? (
            <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {compareWarning}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2 rounded border border-[var(--color-border)] p-3">
              <h3 className="text-sm font-semibold">Sản phẩm đang xem</h3>
              <input
                value={currentProduct?.name || ""}
                readOnly
                className="w-full rounded border border-[var(--color-border)] bg-gray-50 px-3 py-2 text-sm text-[var(--color-text-muted)]"
              />
            </div>

            <div className="space-y-2 rounded border border-[var(--color-border)] p-3">
              <h3 className="text-sm font-semibold">Sản phẩm so sánh</h3>
              <input
                type="text"
                value={rightKeyword}
                onChange={(event) => setRightKeyword(event.target.value)}
                placeholder="Tìm theo tên, hãng, mã"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <select
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                value={rightSelectedId}
                onChange={(event) => setRightSelectedId(event.target.value)}
                disabled={loadingProducts || !sameCategoryProducts.length}
              >
                <option value="">Chọn sản phẩm cột 2</option>
                {searchableRightProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.brand?.name || "Không rõ hãng"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded bg-[var(--color-surface-2)] p-3">
              {productImageSrc(currentProduct) ? (
                <img
                  src={productImageSrc(currentProduct)}
                  alt={currentProduct?.name || "Sản phẩm hiện tại"}
                  className="h-56 w-full rounded object-contain bg-white p-2 sm:h-64"
                />
              ) : null}
            </div>

            <div className="rounded bg-[var(--color-surface-2)] p-3">
              {productImageSrc(rightProduct) ? (
                <img
                  src={productImageSrc(rightProduct)}
                  alt={rightProduct?.name || "Sản phẩm so sánh"}
                  className="h-56 w-full rounded object-contain bg-white p-2 sm:h-64"
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center rounded bg-white text-[var(--color-text-muted)] sm:h-64">
                  Chọn sản phẩm để bắt đầu so sánh.
                </div>
              )}
            </div>
          </div>

          {currentProduct && rightProduct ? (
            <div className="mt-4 space-y-4 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
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
                          {currentProduct.name}
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
                <h4 className="mb-2 text-sm font-semibold">
                  Tóm gọn tham khảo
                </h4>
                {renderSuggestionContent({
                  loadingAiSuggestion,
                  aiSuggestionError,
                  aiSuggestion,
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );

  return createPortal(modalContent, document.body);
}

ProductCompareModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  currentProduct: PropTypes.object,
  allProducts: PropTypes.arrayOf(PropTypes.object),
  loadingProducts: PropTypes.bool,
};

ProductCompareModal.defaultProps = {
  open: false,
  currentProduct: null,
  allProducts: [],
  loadingProducts: false,
};
