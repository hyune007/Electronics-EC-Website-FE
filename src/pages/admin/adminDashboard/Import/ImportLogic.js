import { useEffect, useMemo, useState } from "react";
import {
    getAllImports,
    createImport,
    updateImport,
    deleteImport
} from "../../../../services/importService";
import { getAllProducts } from "../../../../services/ProductService";

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

    const emptyForm = {
        nk_id: "",
        sp_id: "",
        nk_quantity: "",
        nk_date: new Date().toISOString().slice(0, 10)
    };

    const [form, setForm] = useState(emptyForm);

    /* ================= AUTO GENERATE ID ================= */
    const generateImportId = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        return `NK${timestamp.slice(-4)}`;
    };

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
            alert("Không tải được danh sách nhập kho");
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
        if (!form.sp_id || !form.nk_quantity || !form.nk_date) {
            alert("Vui lòng điền đầy đủ thông tin");
            return;
        }

        // Validate quantity is positive number
        if (Number(form.nk_quantity) <= 0) {
            alert("Số lượng phải lớn hơn 0");
            return;
        }

        // Log form data for debugging
        console.log("Submitting import form:", form);
        console.log("Selected product ID:", form.sp_id);
        console.log("Quantity:", form.nk_quantity);
        console.log("Date:", form.nk_date);

        try {
            if (editing) {
                console.log("Updating import with ID:", editing.nk_id);
                await updateImport(editing.nk_id, form);
            } else {
                const generatedId = generateImportId();
                const newForm = {
                    ...form,
                    nk_id: generatedId
                };
                console.log("Creating new import with data:", newForm);
                console.log("Generated Import ID:", generatedId);
                console.log("Import ID being sent:", newForm.nk_id);
                console.log("Product ID being sent:", newForm.sp_id);
                
                // Validate that ID is not null/empty
                if (!newForm.nk_id || newForm.nk_id.trim() === '') {
                    alert("Lỗi: Không thể tạo ID nhập kho");
                    return;
                }
                
                // Validate that product ID is selected
                if (!newForm.sp_id || newForm.sp_id.trim() === '') {
                    alert("Lỗi: Vui lòng chọn sản phẩm");
                    return;
                }
                
                console.log("About to send newForm.sp_id:", newForm.sp_id);
                console.log("About to send newForm:", newForm);
                
                await createImport(newForm);
            }

            setOpenForm(false);
            fetchImports();
        } catch (err) {
            console.error("Lỗi lưu nhập kho:", err);
            alert(editing ? "Cập nhật nhập kho thất bại" : "Thêm nhập kho thất bại");
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!confirm("Xóa phiếu nhập kho này?")) return;

        try {
            await deleteImport(id);
            fetchImports();
        } catch (err) {
            console.error("Lỗi xóa nhập kho:", err);
            alert("Xóa nhập kho thất bại");
        }
    };

    return {
        loading,
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
