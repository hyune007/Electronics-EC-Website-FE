import { useEffect, useMemo, useState } from "react";
import {
    getAllImports,
    createImport,
    updateImport,
    deleteImport
} from "../../../../services/importService";
import { getAllProducts } from "../../../../services/productService";
import { showToast } from "../../../../utils/adminToast";

export function useImportLogic() {
    const [list, setList] = useState([]);
    const [products, setProducts] = useState([
        { sp_id: "SP001", sp_name: "iPhone 15 Pro Max", sp_brand: "Apple", sp_category: "Điện thoại", sp_price: 28990000, sp_stock: 25 },
        { sp_id: "SP002", sp_name: "Samsung Galaxy S24 Ultra", sp_brand: "Samsung", sp_category: "Điện thoại", sp_price: 25990000, sp_stock: 15 },
        { sp_id: "SP003", sp_name: "MacBook Pro 14\"", sp_brand: "Apple", sp_category: "Laptop", sp_price: 45990000, sp_stock: 8 },
        { sp_id: "SP004", sp_name: "iPad Air", sp_brand: "Apple", sp_category: "Tablet", sp_price: 12990000, sp_stock: 30 },
        { sp_id: "SP005", sp_name: "AirPods Pro", sp_brand: "Apple", sp_category: "Tai nghe", sp_price: 5990000, sp_stock: 50 },
        { sp_id: "SP006", sp_name: "Sony WH-1000XM5", sp_brand: "Sony", sp_category: "Tai nghe", sp_price: 8990000, sp_stock: 12 }
    ]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const emptyForm = {
        sp_id: "",
        nk_quantity: "",
        nk_date: new Date().toISOString().slice(0, 10)
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        fetchImports();
        fetchProducts();
    }, []);

    const fetchImports = async () => {
        try {
            setLoading(true);
            const data = await getAllImports();
            setList(data);
        } catch (err) {
            console.error("Lỗi tải danh sách nhập kho:", err);
            showToast("Không tải được danh sách nhập kho", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            console.log("Fetching products for import form...");
            const data = await getAllProducts();
            console.log("Products data received:", data);
            
            // If API returns data, use it (but keep mock as fallback)
            if (data && Array.isArray(data) && data.length > 0) {
                const mappedProducts = data.map(p => ({
                    sp_id: p.id || p.sp_id || "",
                    sp_name: p.name || p.sp_name || "",
                    sp_brand: p.brand?.name || p.sp_brand_name || "",
                    sp_category: p.category?.name || p.sp_category_name || "",
                    sp_price: p.price || p.sp_price || 0,
                    sp_stock: p.stock || p.sp_stock || 0
                }));
                console.log("Using API products for import:", mappedProducts);
                setProducts(mappedProducts);
            } else {
                console.log("API returned no data, keeping mock products");
            }
        } catch (err) {
            console.error("Lỗi tải danh sách sản phẩm:", err);
            console.log("API failed, keeping mock products");
        }
    };

    /* ================= FILTER ================= */
    const filteredList = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return list.filter(i =>
            i.nk_id.toLowerCase().includes(keyword) ||
            i.sp_name.toLowerCase().includes(keyword) ||
            i.sp_brand.toLowerCase().includes(keyword) ||
            i.sp_category.toLowerCase().includes(keyword)
        );
    }, [list, search]);

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (!form.sp_id || !String(form.sp_id).trim() || !form.nk_quantity || !form.nk_date || !String(form.nk_date).trim()) {
            showToast("Vui lòng điền đầy đủ thông tin", "warning");
            return;
        }

        // Validate quantity is positive number
        if (Number(form.nk_quantity) <= 0) {
            showToast("Số lượng phải lớn hơn 0", "warning");
            return;
        }

        // Log form data for debugging
        console.log("Submitting import form:", form);
        console.log("Selected product ID:", form.sp_id);
        console.log("Quantity:", form.nk_quantity);
        console.log("Date:", form.nk_date);

        setIsSubmitting(true);
        try {
            if (editing) {
                console.log("Updating import with ID:", editing.nk_id);
                await updateImport(editing.nk_id, {
                    ...form,
                    nk_id: editing.nk_id,
                });
                showToast("Cập nhật nhập kho thành công", "success");
            } else {
                const createPayload = {
                    ...form,
                    sp_id: String(form.sp_id).trim(),
                    nk_date: String(form.nk_date).trim(),
                };
                console.log("Creating new import with data:", createPayload);
                if (!createPayload.sp_id) {
                    showToast("Vui lòng chọn sản phẩm", "warning");
                    setIsSubmitting(false);
                    return;
                }

                await createImport(createPayload);
                showToast("Thêm phiếu nhập kho thành công", "success");
            }

            setOpenForm(false);
            fetchImports();
        } catch (err) {
            console.error("Lỗi lưu nhập kho:", err);
            showToast(editing ? "Cập nhật nhập kho thất bại" : "Thêm nhập kho thất bại", "error", 3400);
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!confirm("Xóa phiếu nhập kho này?")) return;

        setDeletingId(id);
        try {
            await deleteImport(id);
            showToast("Xóa phiếu nhập kho thành công", "success");
            fetchImports();
        } catch (err) {
            console.error("Lỗi xóa nhập kho:", err);
            showToast("Xóa nhập kho thất bại: " + err.message, "error", 3400);
        } finally {
            setDeletingId(null);
        }
    };

    return {
        loading,
        isSubmitting,
        deletingId,
        search,
        setSearch,
        openForm,
        setOpenForm,
        form,
        setForm,
        filteredList,
        products,
        openAdd: () => {
            setEditing(null);
            setForm({ ...emptyForm });
            setOpenForm(true);
        },
        openEdit: (item) => {
            setEditing(item);
            setForm({ ...item });
            setOpenForm(true);
        },
        handleSubmit,
        handleDelete
    };
}
