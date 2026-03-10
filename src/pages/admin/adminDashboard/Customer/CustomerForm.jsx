import { X, User, Eye, EyeOff, Phone, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function CustomerForm({ open, onClose, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);
  if (!open) return null;

  const { form, setForm, handleSubmit } = onSubmit;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <User className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {form.kh_id ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
              </h2>
              <p className="text-sm text-neutral-600">
                {form.kh_id ? "Chỉnh sửa thông tin khách hàng" : "Tạo khách hàng mới trong hệ thống"}
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
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Thông tin cơ bản</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    placeholder="Nhập họ tên khách hàng"
                    value={form.kh_name}
                    onChange={e =>
                      setForm({ ...form, kh_name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={form.kh_password}
                    onChange={e =>
                      setForm({ ...form, kh_password: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={form.kh_phone}
                    onChange={e =>
                      setForm({ ...form, kh_phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    value={form.kh_mail}
                    onChange={e =>
                      setForm({ ...form, kh_mail: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vai trò
                </label>
                <input
                  type="text"
                  value="USER"
                  disabled
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
                />
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
            <User size={18} />
            {form.kh_id ? "Cập nhật" : "Thêm khách hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}

