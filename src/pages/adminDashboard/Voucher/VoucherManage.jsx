import { Plus, Pencil, Trash2, Search, Percent } from "lucide-react";
import { useVoucherLogic } from "./VoucherLogic.js";
import VoucherForm from "./VoucherForm.jsx";
import "./Voucher.css";

export default function VoucherManage() {
    const vm = useVoucherLogic();

    return (
        <div className="customer-manage">
            {/* TOOLBAR */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        placeholder="Tìm theo tên voucher..."
                        value={vm.search}
                        onChange={(e) => vm.setSearch(e.target.value)}
                    />
                </div>

                <button className="btn-add" onClick={vm.openAdd}>
                    <Plus size={16} /> Thêm voucher
                </button>
            </div>

            {/* TABLE */}
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Giảm</th>
                        <th>Thời gian</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {vm.filteredVouchers.map(v => (
                        <tr key={v.km_id}>
                            <td>{v.km_id}</td>
                            <td>{v.km_name}</td>
                            <td>
                                    <span className="role user">
                                        <Percent size={12} /> {v.km_percent}%
                                    </span>
                            </td>
                            <td>
                                {v.km_start_date} → {v.km_end_date}
                            </td>
                            <td className="action">
                                <button onClick={() => vm.openEdit(v)}>
                                    <Pencil size={14} />
                                </button>
                                <button
                                    className="danger"
                                    onClick={() => vm.handleDelete(v.km_id)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}

                    {vm.filteredVouchers.length === 0 && (
                        <tr>
                            <td colSpan="5" className="empty">
                                Không có voucher
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <VoucherForm
                open={vm.openForm}
                onClose={() => vm.setOpenForm(false)}
                onSubmit={{
                    form: vm.form,
                    setForm: vm.setForm,
                    handleSubmit: vm.handleSubmit
                }}
            />
        </div>
    );
}
