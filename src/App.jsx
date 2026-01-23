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
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerManage />} />
                <Route path="/orders" element={<OrderManage />} />
                <Route path="/products" element={<ProductManage />} />
                <Route path="/brands" element={<BrandManage />} />
                <Route path="/staff" element={<EmployeeManage />} />
            </Routes>
        </AdminLayout>
    );
}

export default App;
