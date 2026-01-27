import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function EmployeeForm({ open, onClose, onSubmit }) {
  if (!open) return null;

  const { form, setForm, handleSubmit } = onSubmit;
  const [showPassword, setShowPassword] = useState;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Thông tin nhân viên</h3>

        <div className="form-grid">
          <input
            placeholder="Mã nhân viên"
            value={form.nv_id}
            onChange={(e) => setForm({ ...form, nv_id: e.target.value })}
            disabled={!!form.nv_id}
          />

          <input
            placeholder="Họ tên"
            value={form.nv_name}
            onChange={(e) => setForm({ ...form, nv_name: e.target.value })}
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={form.nv_password}
              onChange={(e) =>
                setForm({ ...form, nv_password: e.target.value })
              }
            />
            <button
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            placeholder="Số điện thoại"
            value={form.nv_phone}
            onChange={(e) => setForm({ ...form, nv_phone: e.target.value })}
          />

          <input
            placeholder="Email"
            value={form.nv_mail}
            onChange={(e) => setForm({ ...form, nv_mail: e.target.value })}
          />

          <input
            placeholder="Địa chỉ"
            value={form.nv_address}
            onChange={(e) => setForm({ ...form, nv_address: e.target.value })}
          />

          <input
            type="date"
            value={form.nv_birth}
            onChange={(e) => setForm({ ...form, nv_birth: e.target.value })}
          />

          <select
            value={form.nv_role}
            onChange={(e) => setForm({ ...form, nv_role: e.target.value })}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
          </select>
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
