import { X, Package, Calendar, Loader2, Hash } from "lucide-react";

export default function ImportForm({ open, onClose, onSubmit }) {
    if (!open) return null;

    const { form, setForm, handleSubmit, products, isSubmitting } = onSubmit;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Package className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">
                                {form.nk_id ? "Cập nhật nhập kho" : "Thêm nhập kho"}
                            </h2>
                            <p className="text-sm text-neutral-600">
                                {form.nk_id ? "Chỉnh sửa thông tin phiếu nhập" : "Tạo phiếu nhập kho mới"}
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

                {/* Form */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                            <select
                                value={form.sp_id}
                                onChange={(e) =>
                                    setForm({ ...form, sp_id: e.target.value })
                                }
                                className="w-full pl-10 pr-10 py-3 bg-white border border-neutral-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                required
                            >
                                <option value="">-- Chọn sản phẩm --</option>
                                {Array.isArray(products) && products.length > 0 ? (
                                    products.map((product) => (
                                        <option key={product.sp_id} value={product.sp_id}>
                                            {product.sp_name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        {products === null ? "Đang tải sản phẩm..." : "Không có sản phẩm nào"}
                                    </option>
                                )}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Số lượng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={form.nk_quantity}
                            onChange={(e) =>
                                setForm({ ...form, nk_quantity: e.target.value })
                            }
                            min="1"
                            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                            placeholder="Nhập số lượng"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                                className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-100 bg-neutral-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-neutral-700 bg-white border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-all duration-200 active:scale-[0.98]"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Package size={18} />
                                {form.nk_id ? "Cập nhật" : "Lưu"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
