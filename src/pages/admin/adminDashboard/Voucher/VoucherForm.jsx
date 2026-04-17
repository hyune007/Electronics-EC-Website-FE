import { useMemo, useState } from "react";
import { X, Ticket, FileText, Percent, Calendar, Loader2, Hash, Layers, Package, Tags, Search } from "lucide-react";

export default function VoucherForm({ open, onClose, onSubmit }) {
    const [applySearch, setApplySearch] = useState("");

    const {
        form,
        setForm,
        handleSubmit,
        isSubmitting,
        quickApply,
        setQuickApply,
        isLoadingApplyData,
        productOptions,
        brandOptions,
        categoryOptions,
    } = onSubmit;

    if (!open) return null;

    const applyMode = quickApply?.mode || "none";
    const keyword = applySearch.toLowerCase().trim();

    const visibleProducts = useMemo(() => {
        const list = Array.isArray(productOptions) ? productOptions : [];
        if (!keyword) return list;
        return list.filter((item) => (
            String(item?.id || "").toLowerCase().includes(keyword)
            || String(item?.name || "").toLowerCase().includes(keyword)
        ));
    }, [keyword, productOptions]);

    const visibleBrands = useMemo(() => {
        const list = Array.isArray(brandOptions) ? brandOptions : [];
        if (!keyword) return list;
        return list.filter((item) => (
            String(item?.hang_id || "").toLowerCase().includes(keyword)
            || String(item?.hang_name || "").toLowerCase().includes(keyword)
        ));
    }, [brandOptions, keyword]);

    const visibleCategories = useMemo(() => {
        const list = Array.isArray(categoryOptions) ? categoryOptions : [];
        if (!keyword) return list;
        return list.filter((item) => (
            String(item?.dm_id || "").toLowerCase().includes(keyword)
            || String(item?.dm_name || "").toLowerCase().includes(keyword)
        ));
    }, [categoryOptions, keyword]);

    const selectAllVisible = () => {
        if (applyMode === "product") {
            setQuickApply((prev) => ({
                ...prev,
                productIds: Array.from(new Set(visibleProducts.map((item) => item.id).filter(Boolean))),
            }));
            return;
        }
        if (applyMode === "brand") {
            setQuickApply((prev) => ({
                ...prev,
                brandIds: Array.from(new Set(visibleBrands.map((item) => item.hang_id).filter(Boolean))),
            }));
            return;
        }
        if (applyMode === "category") {
            setQuickApply((prev) => ({
                ...prev,
                categoryIds: Array.from(new Set(visibleCategories.map((item) => item.dm_id).filter(Boolean))),
            }));
        }
    };

    const clearSelected = () => {
        if (applyMode === "product") {
            setQuickApply((prev) => ({ ...prev, productIds: [] }));
            return;
        }
        if (applyMode === "brand") {
            setQuickApply((prev) => ({ ...prev, brandIds: [] }));
            return;
        }
        if (applyMode === "category") {
            setQuickApply((prev) => ({ ...prev, categoryIds: [] }));
        }
    };

    const selectedCount = applyMode === "product"
        ? (quickApply?.productIds || []).length
        : applyMode === "brand"
            ? (quickApply?.brandIds || []).length
            : applyMode === "category"
                ? (quickApply?.categoryIds || []).length
                : 0;

    const toggleSelected = (key) => {
        if (!key) return;

        if (applyMode === "product") {
            setQuickApply((prev) => ({
                ...prev,
                productIds: prev.productIds.includes(key)
                    ? prev.productIds.filter((id) => id !== key)
                    : [...prev.productIds, key],
            }));
            return;
        }

        if (applyMode === "brand") {
            setQuickApply((prev) => ({
                ...prev,
                brandIds: prev.brandIds.includes(key)
                    ? prev.brandIds.filter((id) => id !== key)
                    : [...prev.brandIds, key],
            }));
            return;
        }

        if (applyMode === "category") {
            setQuickApply((prev) => ({
                ...prev,
                categoryIds: prev.categoryIds.includes(key)
                    ? prev.categoryIds.filter((id) => id !== key)
                    : [...prev.categoryIds, key],
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Ticket className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">
                                {form.km_id ? "Cập nhật voucher" : "Thêm voucher mới"}
                            </h2>
                            <p className="text-sm text-neutral-600">
                                {form.km_id ? "Chỉnh sửa thông tin voucher" : "Tạo voucher khuyến mãi mới"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Thông tin voucher</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Mã voucher
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="text"
                                        value={form.km_id || ""}
                                        readOnly
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 disabled:opacity-100"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Tên voucher <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Nhập tên voucher"
                                        value={form.km_name}
                                        onChange={e =>
                                            setForm({ ...form, km_name: e.target.value })
                                        }
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Mô tả
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-neutral-400" size={18} />
                                    <textarea
                                        placeholder="Nhập mô tả voucher"
                                        value={form.km_description}
                                        onChange={e =>
                                            setForm({ ...form, km_description: e.target.value })
                                        }
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Phần trăm giảm (%) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={form.km_percent}
                                        onChange={e =>
                                            setForm({ ...form, km_percent: e.target.value })
                                        }
                                        min="0"
                                        max="100"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Thời gian áp dụng</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Ngày bắt đầu <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="date"
                                        value={form.km_start_date}
                                        onChange={e =>
                                            setForm({ ...form, km_start_date: e.target.value })
                                        }
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Ngày kết thúc <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="date"
                                        value={form.km_end_date}
                                        onChange={e =>
                                            setForm({ ...form, km_end_date: e.target.value })
                                        }
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Áp dụng nhanh</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Phạm vi áp dụng voucher</label>
                                <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <select
                                        value={applyMode}
                                        onChange={(e) => setQuickApply((prev) => ({ ...prev, mode: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                    >
                                        <option value="none">Không chọn nhanh (chỉ lưu voucher)</option>
                                        <option value="all">Toàn bộ sản phẩm</option>
                                        <option value="product">Theo sản phẩm</option>
                                        <option value="brand">Theo loại hàng (hãng)</option>
                                        <option value="category">Theo danh mục</option>
                                    </select>
                                </div>
                            </div>

                            {applyMode !== "none" && applyMode !== "all" && (
                                <>
                                    <div className="md:col-span-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                            <input
                                                type="text"
                                                value={applySearch}
                                                onChange={(e) => setApplySearch(e.target.value)}
                                                placeholder={applyMode === "product" ? "Tìm sản phẩm theo mã hoặc tên" : applyMode === "brand" ? "Tìm loại hàng/hãng" : "Tìm danh mục"}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex flex-wrap items-center gap-2 text-sm">
                                        <button
                                            type="button"
                                            onClick={selectAllVisible}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all duration-200"
                                        >
                                            Chọn tất cả đang lọc
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearSelected}
                                            className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all duration-200"
                                        >
                                            Bỏ chọn hết
                                        </button>
                                        <span className="text-neutral-500">Đã chọn: {selectedCount}</span>
                                    </div>

                                    <div className="md:col-span-2 border border-neutral-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-neutral-100">
                                        {isLoadingApplyData ? (
                                            <div className="p-4 text-sm text-neutral-500 flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Đang tải dữ liệu áp dụng nhanh...
                                            </div>
                                        ) : (
                                            <>
                                                {applyMode === "product" && visibleProducts.map((item) => (
                                                    <label key={item.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={(quickApply?.productIds || []).includes(item.id)}
                                                            onChange={() => toggleSelected(item.id)}
                                                        />
                                                        <Package size={16} className="text-neutral-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-neutral-900">{item.name}</div>
                                                            <div className="text-neutral-500">{item.id}</div>
                                                        </div>
                                                    </label>
                                                ))}

                                                {applyMode === "brand" && visibleBrands.map((item) => (
                                                    <label key={item.hang_id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={(quickApply?.brandIds || []).includes(item.hang_id)}
                                                            onChange={() => toggleSelected(item.hang_id)}
                                                        />
                                                        <Tags size={16} className="text-neutral-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-neutral-900">{item.hang_name}</div>
                                                            <div className="text-neutral-500">{item.hang_id}</div>
                                                        </div>
                                                    </label>
                                                ))}

                                                {applyMode === "category" && visibleCategories.map((item) => (
                                                    <label key={item.dm_id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={(quickApply?.categoryIds || []).includes(item.dm_id)}
                                                            onChange={() => toggleSelected(item.dm_id)}
                                                        />
                                                        <Layers size={16} className="text-neutral-500" />
                                                        <div className="text-sm">
                                                            <div className="font-medium text-neutral-900">{item.dm_name}</div>
                                                            <div className="text-neutral-500">{item.dm_id}</div>
                                                        </div>
                                                    </label>
                                                ))}

                                                {((applyMode === "product" && visibleProducts.length === 0)
                                                    || (applyMode === "brand" && visibleBrands.length === 0)
                                                    || (applyMode === "category" && visibleCategories.length === 0)) && (
                                                    <div className="p-4 text-sm text-neutral-500">Không có dữ liệu phù hợp với từ khóa tìm kiếm.</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            {applyMode === "all" && (
                                <div className="md:col-span-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
                                    Voucher sẽ được gán cho toàn bộ sản phẩm hiện có và gỡ khỏi các sản phẩm không còn thuộc phạm vi này khi cập nhật.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-100 bg-neutral-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-neutral-700 bg-white border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Ticket size={18} />
                                {form.km_id ? "Cập nhật" : "Thêm voucher"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

