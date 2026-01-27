import { Menu, Bell, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ROUTE_TITLE_MAP } from "../../../../routes/routesConfig/routeTitle.js";


export default function Header() {
    const location = useLocation();

    const currentTitle =
        ROUTE_TITLE_MAP[location.pathname] || "Trang quản trị";

    return (
        <header
            className="
                sticky top-0 z-30
                h-16
                bg-white
                flex items-center
                px-6
                border-b border-black/10
            "
        >
            {/* Left */}
            <div className="flex items-center gap-3">
                <button className="md:hidden p-2 rounded hover:bg-black/5 transition">
                    <Menu size={22} />
                </button>

                <h1 className="text-lg font-semibold text-black">
                    {currentTitle}
                </h1>
            </div>

            {/* Right */}
            <div className="ml-auto flex items-center gap-4">
                <button className="p-2 rounded hover:bg-black/5 transition">
                    <Bell size={20} />
                </button>

                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                        <User size={16} />
                    </div>

                    <span className="hidden md:block text-sm font-medium text-black">
                        Tên nhân viên
                    </span>
                </div>
            </div>
        </header>
    );
}
