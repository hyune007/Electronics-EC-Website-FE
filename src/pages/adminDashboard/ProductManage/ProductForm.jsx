import { X } from "lucide-react";

export default function ProductForm({
                                        open,
                                        onClose,
                                        onSubmit,
                                        initialData
                                    }) {
    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        onSubmit.setForm({
            ...onSubmit.form,
            [name]: value
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* OVERLAY */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* MODAL */}
            <div className="relative bg-white w-[520px] rounded-2xl shadow-2xl p-6 animate-scaleIn">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* FORM */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    {/* ROW 1 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">Mã sản phẩm</label>
                            <input
                                name="sp_id"
                                value={onSubmit.form.sp_id}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Tên sản phẩm</label>
                            <input
                                name="sp_name"
                                value={onSubmit.form.sp_name}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>
                    </div>

                    {/* ROW 2 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">Giá</label>
                            <input
                                type="number"
                                name="sp_price"
                                value={onSubmit.form.sp_price}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="label">Tồn kho</label>
                            <input
                                type="number"
                                name="sp_stock"
                                value={onSubmit.form.sp_stock}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* ROW 3 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">Danh mục</label>
                            <input
                                name="sp_category_id"
                                value={onSubmit.form.sp_category_id}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="label">Hãng</label>
                            <input
                                name="sp_brand_id"
                                value={onSubmit.form.sp_brand_id}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="label">Mô tả sản phẩm</label>
                        <textarea
                            name="sp_desc"
                            value={onSubmit.form.sp_desc}
                            onChange={handleChange}
                            className="input h-24 resize-none"
                        />
                    </div>

                    {/* ACTION */}
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </div>

            {/* ANIMATION */}
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.96) translateY(6px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }

          .animate-scaleIn {
            animation: scaleIn 0.25s ease-out;
          }

          .input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            outline: none;
            transition: all 0.2s;
          }

          .input:focus {
            border-color: #000;
            box-shadow: 0 0 0 1px #000;
          }

          .label {
            display: block;
            font-size: 13px;
            margin-bottom: 4px;
            color: #374151;
            font-weight: 500;
          }
        `}
            </style>
        </div>
    );
}
