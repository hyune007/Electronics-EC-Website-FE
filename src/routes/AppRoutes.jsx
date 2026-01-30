import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login/Login.jsx";
import Register from "../pages/auth/Register/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword.jsx";
import ChangePassword from "../pages/auth/ChangePassword/ChangePassword.jsx";
import Home from "../pages/Home/Home.jsx";
import NotFound from "../pages/error/NotFound/NotFound.jsx";

import Terms from "../pages/other/Terms/Terms.jsx";
import ProductDetail from "../pages/product/ProductDetail/ProductDetail.jsx";
import AdminLayout from "../components/layout/admin/layoutsAdmin/AdminLayout.jsx";
import Dashboard from "../pages/admin/adminDashboard/Dashboard/Dashboard.jsx";
import CustomerManage from "../pages/admin/adminDashboard/Customer/CustomerManage.jsx";
import OrderManage from "../pages/admin/adminDashboard/Order/OrderManage.jsx";
import ProductManage from "../pages/admin/adminDashboard/ProductManage/ProductManage.jsx";
import BrandManage from "../pages/admin/adminDashboard/Brand/BrandManage.jsx";
import EmployeeManage from "../pages/admin/adminDashboard/Staff/EmployeeManage.jsx";
import TestLogin from "../pages/auth/TestLogin/TestLogin.jsx";
import TestRegister from "../pages/auth/TestRegister/TestRegister.jsx";
import ProductFilter from "../components/customer/product/ProductFilter/ProductFilter.jsx";
import CustomerLayout from "../components/layout/customer/CustomerLayout/CustomerLayout.jsx";
import Profile from "../pages/user/Profile/Profile.jsx";
import Product from "../pages/product/Product/Product.jsx";
import ImportManage from "../pages/admin/adminDashboard/Import/ImportManage.jsx";
import VoucherManage from "../pages/admin/adminDashboard/Voucher/VoucherManage.jsx";
// import Profile from "../pages/user/Profile/Profile.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test-login" element={<TestLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/test-register" element={<TestRegister />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/product-detail" element={<ProductDetail />} />
      <Route path="/product-filter" element={<ProductFilter />} />

      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        {/* <Route path="/news" element={<News />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
        <Route path="/products" element={<Product />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

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
