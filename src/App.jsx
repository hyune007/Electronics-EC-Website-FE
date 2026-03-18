import AppRoutes from "./routes/AppRoutes.jsx";
import AdminToastProvider from "./components/common/AdminToastProvider.jsx";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary.jsx";
import AdsOverlay from "./components/common/AdsOverlay.jsx";

function App() {
  return (
    <>
      <AdsOverlay />
      <RouteErrorBoundary>
        <AppRoutes />
      </RouteErrorBoundary>
      <AdminToastProvider />
    </>
  );
}

export default App;
