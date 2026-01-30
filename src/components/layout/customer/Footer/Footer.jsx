import BrandLogo from "../../../common/BrandLogo.jsx";
import { Link } from "react-router-dom";
import vi from "../../../../i18n/vi.js";
export default function Footer() {
  return (
    <div>
      <footer className="bg-background-dark dark:bg-onyx-black text-gray-900 dark:text-white py-20">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <BrandLogo />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {vi.layout.footer.description}
            </p>
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-white">
                  public
                </span>
              </div>
              <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px] text-white">
                  share
                </span>
              </div>
              <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <i className="fa-brands fa-facebook-f text-[18px] text-white"></i>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">
              {vi.layout.footer.productTitle}
            </h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.laptop}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.phone}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.monitor}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.headphone}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.keyboard_mouse}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">
              {vi.layout.footer.policyTitle}
            </h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.policies.warranty}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.policies.return}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.policies.shipping}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.policies.payment}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">
              {vi.layout.footer.contactTitle}
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-gray-500">
                  location_on
                </span>
                <p
                  className="text-sm text-gray-400"
                  data-location="Ho Chi Minh City, Vietnam"
                >
                  {vi.layout.footer.address}
                </p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-gray-500">
                  call
                </span>
                <p className="text-sm text-gray-400">
                  {vi.layout.footer.phone}
                </p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-gray-500">
                  mail
                </span>
                <p className="text-sm text-gray-400">
                  {vi.layout.footer.email}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            {vi.layout.footer.copyright.replace(
              "{year}",
              new Date().getFullYear(),
            )}
          </p>
          <div className="flex gap-8 text-gray-500 text-xs">
            <Link className="hover:text-white transition-colors" to="/terms">
              {vi.layout.footer.terms}
            </Link>
            <button className="hover:text-white transition-colors">
              {vi.layout.footer.privacy}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
