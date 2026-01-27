import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useCustomerLogic } from "./CustomerLogic.js";
import CustomerForm from "./CustomerForm.jsx";
import "./Customer.css";

export default function CustomerManage() {
    const cm = useCustomerLogic();

    return (
        <div className="customer-manage">
            {/* TOOLBAR */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        placeholder="Tìm theo tên hoặc SĐT..."
                        value={cm.search}
                        onChange={(e) => cm.setSearch(e.target.value)}
                    />
                </div>

                <button className="btn-add" onClick={cm.openAdd}>
                    <Plus size={16} /> Thêm khách hàng
                </button>
            </div>

            {/* TABLE */}
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Họ tên</th>
                        <th>SĐT</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cm.filteredCustomers.map(c => (
                        <tr key={c.kh_id}>
                            <td>{c.kh_id}</td>
                            <td>{c.kh_name}</td>
                            <td>{c.kh_phone}</td>
                            <td>{c.kh_mail}</td>
                            <td>
                                <span className="role user">USER</span>
                            </td>
                            <td className="action">
                                <button onClick={() => cm.openEdit(c)}>
                                    <Pencil size={14} />
                                </button>
                                <button
                                    className="danger"
                                    onClick={() => cm.handleDelete(c.kh_id)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}

                    {cm.filteredCustomers.length === 0 && (
                        <tr>
                            <td colSpan="6" className="empty">
                                Không có khách hàng
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <CustomerForm
                open={cm.openForm}
                onClose={() => cm.setOpenForm(false)}
                onSubmit={{
                    form: cm.form,
                    setForm: cm.setForm,
                    handleSubmit: cm.handleSubmit
                }}
            />
        </div>
    );
}
