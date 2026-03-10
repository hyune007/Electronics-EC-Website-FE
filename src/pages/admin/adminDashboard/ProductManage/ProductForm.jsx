import { X, Package, DollarSign, Image as ImageIcon, Tag, Building2, FileText, Loader2 } from "lucide-react";

export default function ProductForm({ open, onClose, onSubmit, editing, isSubmitting, brands = [], categories = [] }) {
    if (!open) return null;

    const { form, setForm, handleSubmit } = onSubmit;

    const change = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto slide-up relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Package className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">
                                {editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                            </h2>
                            <p className="text-sm text-neutral-600">
                                {editing ? "Chỉnh sửa thông tin sản phẩm" : "Tạo sản phẩm mới trong hệ thống"}
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

                {isSubmitting && (
                    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-neutral-100">
                            <Loader2 size={18} className="animate-spin text-indigo-600" />
                            <span className="text-sm font-medium text-neutral-700">Đang lưu sản phẩm...</span>
                        </div>
                    </div>
                )}

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Thông tin cơ bản</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={change}
                                        placeholder="Nhập tên sản phẩm"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Giá sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={change}
                                        placeholder="0"
                                        min="0"
                                        step="1000"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Số lượng tồn kho <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={change}
                                        placeholder="0"
                                        min="0"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Phân loại</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none z-10" size={18} />
                                    <select
                                        name="categoryId"
                                        value={form.categoryId}
                                        onChange={change}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                                        required
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Thương hiệu <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none z-10" size={18} />
                                    <select
                                        name="brandId"
                                        value={form.brandId}
                                        onChange={(e) => {
                                            console.log("Brand selected:", e.target.value);
                                            change(e);
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                                        required
                                    >
                                        <option value="">-- Chọn thương hiệu --</option>
                                        {brands.map(brand => {
                                            console.log("Brand option:", brand.hang_id, brand.hang_name);
                                            return (
                                                <option key={brand.hang_id} value={brand.hang_id}>
                                                    {brand.hang_name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Mô tả sản phẩm</h3>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Mô tả chi tiết
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-neutral-400" size={18} />
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={change}
                                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Hình ảnh</h3>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                URL hình ảnh <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3 text-neutral-400" size={18} />
                                <textarea
                                    name="image"
                                    value={form.image}
                                    onChange={change}
                                    rows="3"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
                                    required
                                />
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                💡 Chấp nhận đường link ảnh (URL) hoặc tên file.
                            </p>
                            {form.image && (
                                <div className="mt-3">
                                    <p className="text-xs text-neutral-600 mb-2">Xem trước hình ảnh:</p>
                                    <img
                                        src={form.image}
                                        alt="Preview"
                                        className="w-24 h-24 object-cover rounded-lg border border-neutral-200"
                                        onError={(e) => {
                                            e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                                        }}
                                    />
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
                        className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Package size={18} />
                                {editing ? "Cập nhật" : "Thêm sản phẩm"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
