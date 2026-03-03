import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./styles/theme/themeColor.css";
import { CartProvider } from "./contexts/CartContext";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ProductCacheProvider } from "./contexts/ProductCacheContext.jsx";

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ProductCacheProvider>
            <App />
          </ProductCacheProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  // </StrictMode>,
);
