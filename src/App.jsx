import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layoutsAdmin/AdminLayout";

import Dashboard from "./pages/adminDashboard/Dashboard/Dashboard";
import CustomerManage from "./pages/adminDashboard/Customer/CustomerManage";
import OrderManage from "./pages/adminDashboard/Order/OrderManage";
import ProductManage from "./pages/adminDashboard/ProductManage/ProductManage";
import BrandManage from "./pages/adminDashboard/Brand/BrandManage";
import EmployeeManage from "./pages/adminDashboard/Staff/EmployeeManage";

function App() {
    return (
        <AdminLayout>
            <Routes>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/customers" element={<CustomerManage />} />
                <Route path="/admin/orders" element={<OrderManage />} />
                <Route path="/admin/products" element={<ProductManage />} />
                <Route path="/admin/brands" element={<BrandManage />} />
                <Route path="/admin/staff" element={<EmployeeManage />} />
            </Routes>
        </AdminLayout>
    );
}

export default App;
