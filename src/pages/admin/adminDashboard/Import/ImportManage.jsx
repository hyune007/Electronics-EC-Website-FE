import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useImportLogic } from "./ImportLogic";
import ImportForm from "./ImportForm";
import "./Import.css";

export default function ImportManage() {
    const ip = useImportLogic();

    return (
        <div className="customer-manage">
            {/* TOOLBAR */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        placeholder="Tìm theo mã nhập kho hoặc SP..."
                        value={ip.search}
                        onChange={(e) => ip.setSearch(e.target.value)}
                    />
                </div>

                <button className="btn-add" onClick={ip.openAdd}>
                    <Plus size={16} /> Thêm nhập kho
                </button>
            </div>

            {/* TABLE */}
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Mã nhập kho</th>
                        <th>Mã SP</th>
                        <th>Số lượng</th>
                        <th>Ngày nhập kho</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ip.filteredList.map(i => (
                        <tr key={i.ip_id}>
                            <td>{i.ip_id}</td>
                            <td>{i.sp_id}</td>
                            <td>{i.ip_quantity}</td>
                            <td>{i.ip_date}</td>
                            <td className="action">
                                <button onClick={() => ip.openEdit(i)}>
                                    <Pencil size={14} />
                                </button>
                                <button
                                    className="danger"
                                    onClick={() => ip.handleDelete(i.ip_id)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}

                    {ip.filteredList.length === 0 && (
                        <tr>
                            <td colSpan="5" className="empty">
                                Không có dữ liệu Import
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <ImportForm
                open={ip.openForm}
                onClose={() => ip.setOpenForm(false)}
                onSubmit={{
                    form: ip.form,
                    setForm: ip.setForm,
                    handleSubmit: ip.handleSubmit
                }}
            />
        </div>
    );
}
