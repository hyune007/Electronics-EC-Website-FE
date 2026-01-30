import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useBrandLogic } from "./BrandLogic.js";
import BrandForm from "./BrandForm.jsx";
import "./Brand.css";

export default function BrandManage() {
    const bm = useBrandLogic();

    return (
        <div className="brand-manage">
            {/* TOOLBAR */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        placeholder="Tìm hãng..."
                        value={bm.search}
                        onChange={(e) => bm.setSearch(e.target.value)}
                    />
                </div>

                <button className="btn-add" onClick={bm.openAdd}>
                    <Plus size={16} /> Thêm hãng
                </button>
            </div>

            {/* TABLE */}
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Mã hãng</th>
                        <th>Tên hãng</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {bm.filteredBrands.map(b => (
                        <tr key={b.hang_id}>
                            <td>{b.hang_id}</td>
                            <td>{b.hang_name}</td>
                            <td className="action">
                                <button onClick={() => bm.openEdit(b)}>
                                    <Pencil size={14} />
                                </button>
                                <button
                                    className="danger"
                                    onClick={() => bm.handleDelete(b.hang_id)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}

                    {bm.filteredBrands.length === 0 && (
                        <tr>
                            <td colSpan="3" className="empty">
                                Không có hãng
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <BrandForm
                open={bm.openForm}
                onClose={() => bm.setOpenForm(false)}
                onSubmit={{
                    form: bm.form,
                    setForm: bm.setForm,
                    handleSubmit: bm.handleSubmit
                }}
            />
        </div>
    );
}
