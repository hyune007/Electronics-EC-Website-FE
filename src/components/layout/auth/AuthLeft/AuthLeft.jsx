import "./AuthLeft.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ROUTE_TITLE_MAP } from "../../../../routes/routesConfig/customer/routeTitle.js";
import logoWhite from "../../../../assets/logo/UBrainTech_white.png";
import logoFavicon from "../../../../assets/logo/UBrainTech_logo_title.jpg";

export default function AuthLeft() {
  const location = useLocation();

  useEffect(() => {
    const title = ROUTE_TITLE_MAP[location.pathname] || "Poly Shop";
    document.title = title;
  }, [location.pathname]);
  useEffect(() => {
    try {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = logoFavicon;
    } catch (e) {
      void e;
    }
  }, []);
  return (
    <div className="auth-left dark:bg-black">
      <div className="decorative-circle w-[500px] h-[500px] -top-24 -left-24"></div>
      <div className="decorative-circle w-[400px] h-[400px] -bottom-24 -right-24"></div>
      <div className="relative z-10 max-w-lg text-center">
        <div className="-mt-20 mb-6 flex justify-center">
          <a href="/home" className="block">
            <div className="w-[190px] h-[100px] overflow-hidden">
              <img
                src={logoWhite}
                alt="UBrain Tech"
                className="w-full h-full object-cover"
              />
            </div>
          </a>
        </div>

        <h1 className="font-display italic text-2xl md:text-3xl mb-6 text-gray-300">
          Chào mừng bạn đến với
        </h1>
        <div className="mb-12 inline-block">
          <div>
            <h2 className="text-3xl md:text-8xl font-bold tracking-tighter uppercase font-display irish-font">
              UBrain
              <br />
              Tech
            </h2>
          </div>
        </div>
        <br />
        <h1 className="font-display italic text-1xl md:text-2xl mb-6 text-gray-300">
          Nâng tầm trải nghiệm công nghệ
        </h1>
        <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed max-w-md mx-auto">
          Website bán thiết bị điện tử uy tín hàng đầu Việt Nam
        </p>
      </div>
    </div>
  );
}
