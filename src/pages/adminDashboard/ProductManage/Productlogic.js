import { useState, useMemo } from "react";
import { mockProducts } from "../../../mocks/mockProducts.js";

export function useProductManageLogic() {
    const [products, setProducts] = useState(mockProducts);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        sp_id: "",
        sp_name: "",
        sp_price: "",
        sp_stock: "",
        sp_category_id: "",
        sp_brand_id: "",
        sp_desc: ""
    });

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.sp_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [products, search]);

    const openAdd = () => {
        setEditing(null);
        setForm({
            sp_id: "",
            sp_name: "",
            sp_price: "",
            sp_stock: "",
            sp_category_id: "",
            sp_brand_id: "",
            sp_desc: ""
        });
        setOpenForm(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setForm(product);
        setOpenForm(true);
    };

    const handleSubmit = () => {
        if (editing) {
            setProducts(
                products.map(p =>
                    p.sp_id === editing.sp_id ? form : p
                )
            );
        } else {
            setProducts([...products, form]);
        }
        setOpenForm(false);
    };

    const handleDelete = (id) => {
        setProducts(products.filter(p => p.sp_id !== id));
    };

    return {
        // state
        search, setSearch,
        openForm, setOpenForm,
        editing,
        form, setForm,
        filteredProducts,

        // actions
        openAdd,
        openEdit,
        handleSubmit,
        handleDelete
    };
}
