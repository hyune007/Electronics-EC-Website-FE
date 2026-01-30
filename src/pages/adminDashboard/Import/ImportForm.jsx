export default function ImportForm({ open, onClose, onSubmit }) {
    if (!open) return null;

    const { form, setForm, handleSubmit } = onSubmit;

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>
                    {form.ip_id ? "Cập nhật nhập kho" : "Thêm nhập kho"}
                </h3>

                <div className="form-grid">
                    <input
                        placeholder="Mã nhập kho"
                        value={form.ip_id}
                        disabled={!!form.ip_id}
                        onChange={e =>
                            setForm({ ...form, ip_id: e.target.value })
                        }
                    />

                    <input
                        placeholder="Mã sản phẩm"
                        value={form.sp_id}
                        onChange={e =>
                            setForm({ ...form, sp_id: e.target.value })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Số lượng nhập kho"
                        value={form.ip_quantity}
                        onChange={e =>
                            setForm({ ...form, ip_quantity: e.target.value })
                        }
                    />

                    <input
                        type="date"
                        value={form.ip_date}
                        onChange={e =>
                            setForm({ ...form, ip_date: e.target.value })
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
