import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import "./styles/theme/themeColor.css"

// import App from './App.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

const savedTheme = localStorage.getItem("theme");

// Default to light theme when no preference is saved.
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <BrowserRouter>
    <div className="bg-background-light dark:bg-background-dark font-sans transition-colors duration-200 h-screen">
    <AppRoutes />
    </div>
    {/* <App /> */}
   </BrowserRouter>
  </StrictMode>,
)
