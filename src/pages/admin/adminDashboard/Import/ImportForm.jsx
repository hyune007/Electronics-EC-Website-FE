import { X, Package, Calendar, Loader2, Hash, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ImportForm({ open, onClose, onSubmit }) {
    const { form, setForm, editing, handleSubmit, products, isSubmitting, groupedByDateMap } = onSubmit;
    const [categorySearch, setCategorySearch] = useState("");
    const [brandSearch, setBrandSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");

    const selectedBrand = form.sp_brand || "";
    const selectedCategory = form.sp_category || "";

    const brandOptions = Array.from(
        new Set(
            (products || [])
                .filter((p) => !selectedCategory || p.sp_category === selectedCategory)
                .map((p) => p.sp_brand)
                .filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b, "vi"));

    const categoryOptions = Array.from(
        new Set((products || []).map((p) => p.sp_category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "vi"));

    const visibleCategoryOptions = useMemo(() => {
        const keyword = String(categorySearch || "").trim().toLowerCase();
        if (!keyword) return categoryOptions.slice(0, 6);

        return categoryOptions
            .filter((category) => category.toLowerCase().includes(keyword))
            .slice(0, 6);
    }, [categoryOptions, categorySearch]);

    const filteredProducts = (products || []).filter((p) => {
        if (selectedBrand && p.sp_brand !== selectedBrand) return false;
        if (selectedCategory && p.sp_category !== selectedCategory) return false;
        return true;
    });

    const visibleBrandOptions = useMemo(() => {
        const keyword = String(brandSearch || "").trim().toLowerCase();
        if (!keyword) return brandOptions.slice(0, 6);

        return brandOptions
            .filter((brand) => brand.toLowerCase().includes(keyword))
            .slice(0, 6);
    }, [brandOptions, brandSearch]);

    const quickSearchProducts = useMemo(() => {
        const keyword = String(productSearch || "").trim().toLowerCase();
        if (!keyword) return filteredProducts.slice(0, 8);

        const scored = filteredProducts
            .map((p) => {
                const id = String(p.sp_id || "").toLowerCase();
                const name = String(p.sp_name || "").toLowerCase();
                const brand = String(p.sp_brand || "").toLowerCase();
                const category = String(p.sp_category || "").toLowerCase();

                let score = 0;
                if (name.startsWith(keyword)) score += 50;
                if (name.includes(keyword)) score += 30;
                if (id.startsWith(keyword)) score += 25;
                if (id.includes(keyword)) score += 15;
                if (brand.includes(keyword)) score += 8;
                if (category.includes(keyword)) score += 8;

                return { p, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12)
            .map((item) => item.p);

        return scored;
    }, [filteredProducts, productSearch]);

    useEffect(() => {
        if (open) {
            setCategorySearch(form.sp_category || "");
            setBrandSearch(form.sp_brand || "");
            setProductSearch("");
        }
    }, [open, form.sp_brand, form.sp_category]);

    const sameDateImports = groupedByDateMap?.[form.nk_date] || [];
    const sameDateTotalQty = sameDateImports.reduce((sum, item) => sum + Number(item.nk_quantity || 0), 0);
    const selectedProduct = (products || []).find((product) => product.sp_id === form.sp_id) || null;
    const currentStock = Number(selectedProduct?.sp_stock ?? 0);
    const importQty = Number(form.nk_quantity || 0);
    const isEditing = Boolean(editing?.nk_id);
    const oldQty = Number(editing?.nk_quantity || 0);
    const oldProductId = String(editing?.sp_id || "").trim();
    const newProductId = String(form.sp_id || "").trim();
    const stockDelta = isEditing
        ? (oldProductId && oldProductId === newProductId ? (importQty - oldQty) : importQty)
        : importQty;
    const projectedStock = Math.max(0, currentStock + (Number.isFinite(stockDelta) ? stockDelta : 0));

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 fade-in">
            <div className="bg-gradient-to-br from-white via-white to-slate-50 rounded-[18px] shadow-2xl w-full max-w-4xl max-h-[90vh] slide-up overflow-hidden border border-neutral-200/90 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-white/90 shrink-0 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                            <Package className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-semibold mb-1">
                                Import Management
                            </p>
                            <h2 className="text-lg font-semibold text-neutral-900">
                                {isEditing ? "Chỉnh sửa phiếu nhập" : "Thêm phiếu nhập"}
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-600">
                                {isEditing
                                    ? "Sửa trực tiếp phiếu hiện tại: số lượng có thể tăng hoặc giảm."
                                    : "Thêm phiếu mới. Nếu cùng sản phẩm và cùng ngày, hệ thống sẽ cộng dồn số lượng."}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[11px]">
                                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">Smart Filter</span>
                                <span className="px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-semibold">One-Column Flow</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-all duration-200 border border-transparent hover:border-neutral-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-5 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                                    Mã phiếu nhập
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="text"
                                        value={form.nk_id || ""}
                                        readOnly
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 disabled:opacity-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                                    Danh mục
                                </label>
                                <div className={`rounded-xl p-2.5 transition-all ${
                                    selectedCategory
                                    ? "border border-blue-200 bg-blue-50/70 shadow-sm"
                                        : "border border-neutral-200 bg-white"
                                }`}>
                                    <div className="relative">
                                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${selectedCategory ? "text-blue-500" : "text-neutral-400"}`} size={16} />
                                        <input
                                            type="text"
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            placeholder="Tìm danh mục hoặc để trống tất cả"
                                            className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 ${
                                                selectedCategory ? "bg-white border-blue-200" : "bg-white border-neutral-200"
                                            }`}
                                        />
                                        {selectedCategory ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCategorySearch("");
                                                    setBrandSearch("");
                                                    setProductSearch("");
                                                    setForm({ ...form, sp_category: "", sp_brand: "", sp_id: "" });
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700"
                                            >
                                                <X size={14} />
                                            </button>
                                        ) : null}
                                    </div>

                                    {visibleCategoryOptions.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {visibleCategoryOptions.map((category) => {
                                                const isActive = selectedCategory === category;
                                                return (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        onClick={() => {
                                                            setCategorySearch(category);
                                                            setBrandSearch("");
                                                            setProductSearch("");
                                                            setForm({ ...form, sp_category: category, sp_brand: "", sp_id: "" });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                            isActive
                                                                ? "bg-slate-900 text-white border-slate-900"
                                                                : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                                                        }`}
                                                    >
                                                        {category}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-neutral-500">Không có danh mục phù hợp.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                                    Hãng
                                </label>
                                <div className={`rounded-xl p-2.5 transition-all ${
                                    selectedBrand
                                    ? "border border-blue-200 bg-blue-50/70 shadow-sm"
                                        : "border border-neutral-200 bg-white"
                                }`}>
                                    <div className="relative">
                                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${selectedBrand ? "text-blue-500" : "text-neutral-400"}`} size={16} />
                                        <input
                                            type="text"
                                            value={brandSearch}
                                            onChange={(e) => setBrandSearch(e.target.value)}
                                            placeholder="Tìm hãng hoặc để trống tất cả"
                                            className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 ${
                                                selectedBrand ? "bg-white border-blue-200" : "bg-white border-neutral-200"
                                            }`}
                                        />
                                        {selectedBrand ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBrandSearch("");
                                                    setProductSearch("");
                                                    setForm({ ...form, sp_brand: "", sp_id: "" });
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700"
                                            >
                                                <X size={14} />
                                            </button>
                                        ) : null}
                                    </div>

                                    {visibleBrandOptions.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {visibleBrandOptions.map((brand) => {
                                                const isActive = selectedBrand === brand;
                                                return (
                                                    <button
                                                        key={brand}
                                                        type="button"
                                                        onClick={() => {
                                                            setBrandSearch(brand);
                                                            setProductSearch("");
                                                            setForm({ ...form, sp_brand: brand, sp_id: "" });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                            isActive
                                                                ? "bg-slate-900 text-white border-slate-900"
                                                                : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                                                        }`}
                                                    >
                                                        {brand}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-neutral-500">Không có hãng phù hợp.</p>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                                    Sản phẩm <span className="text-red-500">*</span>
                                </label>

                                {(selectedCategory || selectedBrand || selectedProduct) ? (
                                    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-neutral-700">
                                        <span className="font-semibold text-blue-700">Đang lọc:</span>
                                        <span className="rounded-full bg-white px-2.5 py-1 border border-blue-100">
                                            Danh mục: {selectedCategory || "Tất cả"}
                                        </span>
                                        <span className="rounded-full bg-white px-2.5 py-1 border border-blue-100">
                                            Hãng: {selectedBrand || "Tất cả"}
                                        </span>
                                        {selectedProduct ? (
                                            <span className="rounded-full bg-white px-2.5 py-1 border border-blue-100">
                                                Sản phẩm: {selectedProduct.sp_name}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : null}

                                <div className="grid grid-cols-1 gap-3">
                                    <div className={`rounded-2xl border p-4 shadow-sm transition-all ${
                                        selectedProduct ? "border-blue-200 bg-blue-50/30" : "border-neutral-200 bg-white"
                                    }`}>
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700">
                                                Tìm trong field sản phẩm
                                            </p>
                                            <div className="px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-700">
                                                {quickSearchProducts.length} kết quả
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${selectedProduct ? "text-blue-500" : "text-neutral-400"}`} size={16} />
                                            <input
                                                type="text"
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                placeholder="Tìm theo mã, tên, hãng hoặc danh mục"
                                                className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 ${
                                                    selectedProduct ? "bg-white border-blue-200" : "bg-white border-neutral-200"
                                                }`}
                                            />
                                            {form.sp_id ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProductSearch("");
                                                        setForm({ ...form, sp_id: "" });
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700"
                                                >
                                                    <X size={14} />
                                                </button>
                                            ) : null}
                                        </div>

                                        <div className="mt-3 max-h-44 overflow-auto space-y-2 pr-1">
                                            {quickSearchProducts.length > 0 ? (
                                                quickSearchProducts.map((product) => {
                                                    const isActive = form.sp_id === product.sp_id;
                                                    return (
                                                        <button
                                                            key={`quick-${product.sp_id}`}
                                                            type="button"
                                                            onClick={() => {
                                                                setProductSearch(product.sp_name || product.sp_id);
                                                                setForm({ ...form, sp_id: product.sp_id });
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-xl border transition-all ${
                                                                isActive
                                                                    ? "border-blue-500 bg-blue-50 text-neutral-900 shadow-sm ring-1 ring-blue-100"
                                                                    : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 hover:border-neutral-300"
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold truncate">{product.sp_name}</p>
                                                                    <p className="text-xs text-neutral-500 mt-1 truncate">
                                                                        {product.sp_id} | {product.sp_brand || "-"} | {product.sp_category || "-"}
                                                                    </p>
                                                                </div>
                                                                <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? "text-blue-700" : "text-neutral-500"}`}>
                                                                    {isActive ? "Đã chọn" : "Chọn"}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-xs text-neutral-500 py-3 px-3 bg-white rounded-xl border border-dashed border-neutral-200">
                                                    Không có sản phẩm phù hợp với bộ lọc hiện tại.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3 shadow-sm">
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <label className="block text-sm font-semibold text-blue-900">
                                                Số lượng nhập <span className="text-red-500">*</span>
                                            </label>
                                            <span className="text-xs font-semibold text-blue-700 bg-white border border-blue-100 rounded-full px-2.5 py-1">
                                                Bắt buộc
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            value={form.nk_quantity}
                                            onChange={(e) =>
                                                setForm({ ...form, nk_quantity: e.target.value })
                                            }
                                            min="1"
                                            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-base font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Nhập số lượng"
                                            required
                                        />
                                    </div>

                                        <div className={`rounded-2xl border p-3 min-h-[112px] transition-all ${
                                        selectedProduct
                                            ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm"
                                            : "border-neutral-200 bg-neutral-50"
                                    }`}>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-700 mb-3">
                                                Sản phẩm đang chọn
                                            </p>
                                            {selectedProduct ? (
                                                <div>
                                                    <p className="text-sm font-semibold text-neutral-900">{selectedProduct.sp_name}</p>
                                                    <p className="text-xs text-blue-700 mt-1 font-medium">{selectedProduct.sp_id}</p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <span className="px-2.5 py-1 rounded-full bg-white text-neutral-700 text-xs font-medium border border-blue-100">
                                                            {selectedProduct.sp_brand || "Chưa có hãng"}
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-full bg-white text-neutral-700 text-xs font-medium border border-blue-100">
                                                            {selectedProduct.sp_category || "Chưa có danh mục"}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                        <div className="rounded-xl bg-white px-3 py-2 border border-blue-100">
                                                            <p className="text-[11px] text-neutral-500">Tồn kho hiện tại</p>
                                                            <p className="text-sm font-semibold text-neutral-900">{currentStock}</p>
                                                        </div>
                                                        <div className="rounded-xl bg-white px-3 py-2 border border-blue-100">
                                                            <p className="text-[11px] text-neutral-500">{isEditing ? "Số lượng mới" : "Số lượng nhập"}</p>
                                                            <p className="text-sm font-semibold text-neutral-900">{importQty || 0}</p>
                                                        </div>
                                                        <div className="rounded-xl bg-blue-600 px-3 py-2 border border-blue-600">
                                                            <p className="text-[11px] text-blue-100">{isEditing ? "Tồn kho sau chỉnh sửa" : "Sau khi nhập"}</p>
                                                            <p className="text-sm font-semibold text-white">{projectedStock}</p>
                                                        </div>
                                                    </div>
                                                    {isEditing ? (
                                                        <p className="text-[11px] mt-2 text-neutral-600">
                                                            Chênh lệch tồn kho áp dụng: <span className="font-semibold">{stockDelta >= 0 ? `+${stockDelta}` : stockDelta}</span>
                                                        </p>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-neutral-500">
                                                    Chưa chọn sản phẩm. Tìm trực tiếp trong field sản phẩm ở trên để chọn nhanh.
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                                    Ngày nhập <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="date"
                                        value={form.nk_date}
                                        onChange={(e) =>
                                            setForm({ ...form, nk_date: e.target.value })
                                        }
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-neutral-50 to-white px-4 py-3">
                                <p className="text-sm font-semibold text-neutral-900">Gom phiếu theo ngày</p>
                                <p className="text-sm text-neutral-600 mt-1">
                                    Ngày {form.nk_date || "--"} hiện có <span className="font-semibold">{sameDateImports.length}</span> phiếu, tổng số lượng <span className="font-semibold">{sameDateTotalQty}</span>.
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Quy tắc: chỉ khi <span className="font-semibold">Thêm phiếu mới</span> và trùng sản phẩm + ngày thì hệ thống mới cộng dồn.
                                    Chế độ <span className="font-semibold">Chỉnh sửa</span> luôn cập nhật trực tiếp phiếu hiện tại.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-100 bg-white rounded-b-2xl shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-neutral-700 bg-white border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-all duration-200 active:scale-[0.98]"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-white bg-blue-600 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Package size={18} />
                                {isEditing ? "Lưu chỉnh sửa" : "Thêm phiếu"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
