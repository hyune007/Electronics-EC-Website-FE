import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import "./Customer.css";

export default function CustomerForm({ open, onClose, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);
  if (!open) return null;

  const { form, setForm, handleSubmit } = onSubmit;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{form.kh_id ? "Cập nhật khách hàng" : "Thêm khách hàng"}</h3>

        <div className="form-grid">
          <input
            placeholder="Mã khách hàng"
            value={form.kh_id}
            disabled={!!form.kh_id}
            onChange={(e) => setForm({ ...form, kh_id: e.target.value })}
          />

          <input
            placeholder="Họ tên"
            value={form.kh_name}
            onChange={(e) => setForm({ ...form, kh_name: e.target.value })}
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={form.kh_password}
              onChange={(e) =>
                setForm({ ...form, kh_password: e.target.value })
              }
            />

            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            placeholder="Số điện thoại"
            value={form.kh_phone}
            onChange={(e) => setForm({ ...form, kh_phone: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            value={form.kh_mail}
            onChange={(e) => setForm({ ...form, kh_mail: e.target.value })}
          />

          <div className="form-group">
            <label>Vai trò</label>
            <input type="text" value="USER" disabled className="readonly" />
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="save" onClick={handleSubmit}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
