import AppRoutes from "./routes/AppRoutes.jsx";
import AdminToastProvider from "./components/common/AdminToastProvider.jsx";

function App() {
    return (
            <>
                <AppRoutes />
                <AdminToastProvider />
            </>
    );
}

export default App;