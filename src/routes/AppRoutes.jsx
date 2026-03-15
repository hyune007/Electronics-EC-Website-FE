import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login/Login.jsx";
import Register from "../pages/auth/Register/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword.jsx";
import ChangePassword from "../pages/auth/ChangePassword/ChangePassword.jsx";
import TestLogin from "../pages/auth/TestLogin/TestLogin.jsx";
import TestRegister from "../pages/auth/TestRegister/TestRegister.jsx";
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
const ProductFilter = lazy(
  () =>
    import("../components/customer/product/ProductFilter/ProductFilter.jsx"),
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
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
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
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4">
          Đang tải trang...
        </div>
      }
    >
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
          {/* Dashboard - ADMIN + EMPLOYEE */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Customers - ADMIN + EMPLOYEE (delete action admin-only in UI/API) */}
          <Route
            path="customers"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]}>
                <CustomerManage />
              </ProtectedRoute>
            }
          />

          {/* Orders - ADMIN + EMPLOYEE */}
          <Route path="orders" element={<OrderManage />} />

          {/* Products - ADMIN + EMPLOYEE */}
          <Route
            path="products"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]}>
                <ProductManage />
              </ProtectedRoute>
            }
          />

          {/* Brands - ADMIN + EMPLOYEE */}
          <Route
            path="brands"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]}>
                <BrandManage />
              </ProtectedRoute>
            }
          />

          {/* Staff - ADMIN ONLY */}
          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <EmployeeManage />
              </ProtectedRoute>
            }
          />

          {/* Imports - ADMIN + EMPLOYEE */}
          <Route
            path="imports"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]}>
                <ImportManage />
              </ProtectedRoute>
            }
          />

          {/* Vouchers - ADMIN + EMPLOYEE */}
          <Route
            path="vouchers"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EMPLOYEE]}>
                <VoucherManage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
