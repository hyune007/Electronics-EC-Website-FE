import { X, Ticket, FileText, Percent, Calendar, Loader2 } from "lucide-react";

export default function VoucherForm({ open, onClose, onSubmit }) {
    if (!open) return null;

    const { form, setForm, handleSubmit, isSubmitting } = onSubmit;

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

