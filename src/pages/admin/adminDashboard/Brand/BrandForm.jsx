import { X, Building2 } from "lucide-react";

export default function BrandForm({ open, onClose, onSubmit }) {
    if (!open) return null;

    const { form, setForm, handleSubmit } = onSubmit;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Building2 className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">
                                {form.hang_id ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
                            </h2>
                            <p className="text-sm text-neutral-600">
                                {form.hang_id ? "Chỉnh sửa thông tin thương hiệu" : "Tạo thương hiệu mới trong hệ thống"}
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
                    {/* Brand Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Thông tin thương hiệu</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Tên thương hiệu <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Nhập tên thương hiệu"
                                        value={form.hang_name}
                                        onChange={e =>
                                            setForm({ ...form, hang_name: e.target.value })
                                        }
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
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
                        className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl font-medium hover:bg-indigo-700 transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
                    >
                        <Building2 size={18} />
                        {form.hang_id ? "Cập nhật" : "Thêm thương hiệu"}
                    </button>
                </div>
            </div>
        </div>
    );
}
