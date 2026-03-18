import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import "./styles/theme/themeColor.css";
import { CartProvider } from "./contexts/CartContext";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ProductCacheProvider } from "./contexts/ProductCacheContext.jsx";
import { CategoryDrawerProvider } from "./contexts/CategoryDrawerContext.jsx";

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ProductCacheProvider>
            <CategoryDrawerProvider>
              <App />
            </CategoryDrawerProvider>
          </ProductCacheProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
  // </StrictMode>,
);
