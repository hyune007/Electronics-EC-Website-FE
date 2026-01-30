import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login/Login.jsx";
import Register from "../pages/auth/Register/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword.jsx";
import ChangePassword from "../pages/auth/ChangePassword/ChangePassword.jsx";
import Home from "../pages/Home/Home.jsx";
import NotFound from "../pages/error/NotFound/NotFound.jsx";
import Header from "../components/layout/Header/Header.jsx";
import Footer from "../components/layout/Footer/Footer.jsx";
import Terms from "../pages/other/Terms/Terms.jsx";
import ProductDetail from "../pages/product/ProductDetail/ProductDetail.jsx";
import AdminLayout from "../components/layoutsAdmin/AdminLayout.jsx";
import Dashboard from "../pages/adminDashboard/Dashboard/Dashboard.jsx";
import CustomerManage from "../pages/adminDashboard/Customer/CustomerManage.jsx";
import OrderManage from "../pages/adminDashboard/Order/OrderManage.jsx";
import ProductManage from "../pages/adminDashboard/ProductManage/ProductManage.jsx";
import BrandManage from "../pages/adminDashboard/Brand/BrandManage.jsx";
import EmployeeManage from "../pages/adminDashboard/Staff/EmployeeManage.jsx";
import ImportManage from "../pages/adminDashboard/Import/ImportManage.jsx";
import VoucherManage from "../pages/adminDashboard/Voucher/VoucherManage.jsx";
// import Profile from "../pages/user/Profile/Profile.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/product-detail" element={<ProductDetail />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<CustomerManage />} />
        <Route path="orders" element={<OrderManage />} />
        <Route path="products" element={<ProductManage />} />
        <Route path="brands" element={<BrandManage />} />
        <Route path="staff" element={<EmployeeManage />} />
        <Route path="imports" element={<ImportManage />}  />
        <Route path="vouchers" element={<VoucherManage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
