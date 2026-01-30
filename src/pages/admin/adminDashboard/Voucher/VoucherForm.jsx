import "./Voucher.css";

export default function VoucherForm({ open, onClose, onSubmit }) {
    if (!open) return null;

    const { form, setForm, handleSubmit } = onSubmit;

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>
                    {form.km_id ? "Cập nhật voucher" : "Thêm voucher"}
                </h3>

                <div className="form-grid">
                    <input
                        placeholder="Mã voucher"
                        value={form.km_id}
                        disabled={!!form.km_id}
                        onChange={e =>
                            setForm({ ...form, km_id: e.target.value })
                        }
                    />

                    <input
                        placeholder="Tên voucher"
                        value={form.km_name}
                        onChange={e =>
                            setForm({ ...form, km_name: e.target.value })
                        }
                    />

                    <input
                        placeholder="Mô tả"
                        value={form.km_description}
                        onChange={e =>
                            setForm({ ...form, km_description: e.target.value })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Phần trăm giảm"
                        value={form.km_percent}
                        onChange={e =>
                            setForm({ ...form, km_percent: e.target.value })
                        }
                    />

                    <input
                        type="date"
                        value={form.km_start_date}
                        onChange={e =>
                            setForm({ ...form, km_start_date: e.target.value })
                        }
                    />

                    <input
                        type="date"
                        value={form.km_end_date}
                        onChange={e =>
                            setForm({ ...form, km_end_date: e.target.value })
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
