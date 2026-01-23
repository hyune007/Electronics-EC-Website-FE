import { Plus, Pencil, Trash2, Search } from "lucide-react";
import ProductForm from "./ProductForm.jsx";
import { useProductManageLogic } from "./Productlogic.js";
import "./Product.css";

export default function ProductManage() {
    const pm = useProductManageLogic();

    return (
        <div className="product-manage">
            {/* TOOLBAR */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        placeholder="Tìm kiếm sản phẩm..."
                        value={pm.search}
                        onChange={(e) => pm.setSearch(e.target.value)}
                    />
                </div>

                <button className="btn-add" onClick={pm.openAdd}>
                    <Plus size={16} /> Thêm sản phẩm
                </button>
            </div>

            {/* TABLE */}
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Kho</th>
                        <th>Danh mục</th>
                        <th>Hãng</th>
                        <th>Image</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pm.filteredProducts.map(p => (
                        <tr key={p.sp_id}>
                            <td>{p.sp_id}</td>
                            <td>{p.sp_name}</td>
                            <td>{p.sp_price}</td>
                            <td>{p.sp_stock}</td>
                            <td>{p.sp_category_id}</td>
                            <td>{p.sp_brand_id}</td>
                            <td></td>
                            <td className="action">
                                <button onClick={() => pm.openEdit(p)}>
                                    <Pencil size={14} />
                                </button>
                                <button
                                    className="danger"
                                    onClick={() => pm.handleDelete(p.sp_id)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}

                    {pm.filteredProducts.length === 0 && (
                        <tr>
                            <td colSpan="7" className="empty">
                                Không có sản phẩm
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            <ProductForm
                open={pm.openForm}
                onClose={() => pm.setOpenForm(false)}
                initialData={pm.editing}
                onSubmit={{
                    form: pm.form,
                    setForm: pm.setForm,
                    handleSubmit: pm.handleSubmit
                }}
            />
        </div>
    );
}
