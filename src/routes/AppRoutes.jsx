import { Routes, Route, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import LoadingCircle from "../components/common/LoadScreen.jsx";
import ProductFilter from "../components/customer/product/ProductFilter/ProductFilter.jsx";

const Login = lazy(() => import("../pages/auth/Login/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register/Register.jsx"));
const ForgotPassword = lazy(
  () => import("../pages/auth/ForgotPassword/ForgotPassword.jsx"),
);
const ChangePassword = lazy(
  () => import("../pages/auth/ChangePassword/ChangePassword.jsx"),
);
const Home = lazy(() => import("../pages/Home/Home.jsx"));
const NotFound = lazy(() => import("../pages/error/NotFound/NotFound.jsx"));
const Unauthorized = lazy(
  () => import("../pages/error/Unauthorized/Unauthorized.jsx"),
);
const Contact = lazy(() => import("../pages/other/Contact/Contact.jsx"));
const Terms = lazy(() => import("../pages/other/Terms/Terms.jsx"));
const News = lazy(() => import("../pages/other/News/News.jsx"));
const ProductDetail = lazy(
  () => import("../pages/product/ProductDetail/ProductDetail.jsx"),
);
const AdminLayout = lazy(
  () => import("../components/layout/admin/layoutsAdmin/AdminLayout.jsx"),
);
const Dashboard = lazy(
  () => import("../pages/admin/adminDashboard/Dashboard/Dashboard.jsx"),
);
const CustomerManage = lazy(
  () => import("../pages/admin/adminDashboard/Customer/CustomerManage.jsx"),
);
const OrderManage = lazy(
  () => import("../pages/admin/adminDashboard/Order/OrderManage.jsx"),
);
const ProductManage = lazy(
  () => import("../pages/admin/adminDashboard/ProductManage/ProductManage.jsx"),
);
const BrandManage = lazy(
  () => import("../pages/admin/adminDashboard/Brand/BrandManage.jsx"),
);
const EmployeeManage = lazy(
  () => import("../pages/admin/adminDashboard/Staff/EmployeeManage.jsx"),
);
const TestLogin = lazy(() => import("../pages/auth/TestLogin/TestLogin.jsx"));
const TestRegister = lazy(
  () => import("../pages/auth/TestRegister/TestRegister.jsx"),
);
const CustomerLayout = lazy(
  () =>
    import("../components/layout/customer/CustomerLayout/CustomerLayout.jsx"),
);
const Profile = lazy(() => import("../pages/user/Profile/Profile.jsx"));
const Product = lazy(() => import("../pages/product/Product/Product.jsx"));
const ImportManage = lazy(
  () => import("../pages/admin/adminDashboard/Import/ImportManage.jsx"),
);
const VoucherManage = lazy(
  () => import("../pages/admin/adminDashboard/Voucher/VoucherManage.jsx"),
);
const ShipperDashboard = lazy(
  () => import("../pages/shipper/ShipperDashboard/ShipperDashboard.jsx"),
);
const ActiveTaskPage = lazy(
  () => import("../pages/shipper/ActiveTaskPage/ActiveTaskPage.jsx"),
);
const Checkout = lazy(() => import("../pages/user/Checkout/Checkout.jsx"));
const ROLES = {
  ADMIN: "ROLE_ADMIN",
  EMPLOYEE: "ROLE_EMPLOYEE",
  CUSTOMER: "ROLE_CUSTOMER",
};

export default function AppRoutes({ location }) {
  return (
    <Suspense fallback={<LoadingCircle show={true} />}>
      <Routes
        location={location}
        key={location ? location.pathname : undefined}
      >
        <Route path="/login" element={<Login />} />
        <Route path="/test-login" element={<TestLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test-register" element={<TestRegister />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path="/terms" element={<Terms />} /> */}
        <Route path="/product-filter" element={<ProductFilter />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/loading" element={<LoadingCircle show={true} />} />
        <Route path="/shipper-dashboard" element={<ShipperDashboard />} />
        <Route path="/active-task/:orderId" element={<ActiveTaskPage />} />

        {/* Customer layout routes */}
        <Route element={<CustomerLayout />}>
          {/* Public */}
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="products" element={<Product />} />
          <Route path="product-detail/:id" element={<ProductDetail />} />
          <Route path="news" element={<News />} />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Terms />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Protected - Customer+ */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.CUSTOMER, ROLES.EMPLOYEE, ROLES.ADMIN]}
              >
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerManage />} />
          <Route path="orders" element={<OrderManage />} />
          <Route path="products" element={<ProductManage />} />
          <Route path="brands" element={<BrandManage />} />
          <Route path="staff" element={<EmployeeManage />} />
          <Route path="imports" element={<ImportManage />} />
          <Route path="vouchers" element={<VoucherManage />} />

          {/* Admin only */}
          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <EmployeeManage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
