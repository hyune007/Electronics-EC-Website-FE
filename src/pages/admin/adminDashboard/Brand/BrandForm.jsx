import "./Brand.css";

export default function BrandForm({ open, onClose, onSubmit }) {
    if (!open) return null;

    const { form, setForm, handleSubmit } = onSubmit;

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>
                    {form.hang_id ? "Cập nhật hãng" : "Thêm hãng"}
                </h3>

                <div className="form-grid">
                    <input
                        placeholder="Mã hãng"
                        value={form.hang_id}
                        disabled={!!form.hang_id}
                        onChange={e =>
                            setForm({ ...form, hang_id: e.target.value })
                        }
                    />

                    <input
                        placeholder="Tên hãng"
                        value={form.hang_name}
                        onChange={e =>
                            setForm({ ...form, hang_name: e.target.value })
                        }
                    />
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
