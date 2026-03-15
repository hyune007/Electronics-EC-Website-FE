import AppRoutes from "./routes/AppRoutes.jsx";
import AdminToastProvider from "./components/common/AdminToastProvider.jsx";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary.jsx";

function App() {
  return (
    <>
      <RouteErrorBoundary>
        <AppRoutes />
      </RouteErrorBoundary>
      <AdminToastProvider />
    </>
  );
}

export default App;
