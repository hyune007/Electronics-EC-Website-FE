import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./styles/theme/themeColor.css"

// import App from './App.jsx'
// import Login from './pages/auth/Login/Login.jsx'
// import Register from './pages/auth/Register/Register.jsx'
// import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword'
// import ChangePassword from './pages/auth/ChangePassword/ChangePassword.jsx'
import Header from './components/layout/Header/Header'

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <div className="bg-background-light dark:bg-background-dark font-sans transition-colors duration-200 h-screen">
        {/* <Login /> */}
        {/* <Register /> */}
        {/* <ForgotPassword /> */}
        {/* <ChangePassword /> */}
        <Header />
    </div>
    {/* <App /> */}
   
  </StrictMode>,
)
