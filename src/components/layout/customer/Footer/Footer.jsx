import BrandLogo from "../../../common/BrandLogo.jsx";
import { Link } from "react-router-dom";
import vi from "../../../../i18n/vi.js";
export default function Footer() {
  return (
    <div>
      <footer className="bg-background-dark dark:bg-onyx-black text-gray-900 dark:text-white py-20">
        <div class="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div class="col-span-1 md:col-span-1">
            <div class="flex items-center gap-3 mb-6">
              <BrandLogo />
            </div>
            <p class="text-gray-400 text-sm leading-relaxed mb-6">
              {vi.layout.footer.description}
            </p>
            <div class="flex gap-4">
              <div class="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-[20px] text-white">
                  public
                </span>
              </div>
              <div class="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-[20px] text-white">
                  share
                </span>
              </div>
              <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <i className="fa-brands fa-facebook-f text-[18px] text-white"></i>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-6 text-white">
              {vi.layout.footer.productTitle}
            </h4>
            <ul class="space-y-4 text-gray-400 text-sm">
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.laptop}
                </button>
              </li>
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.phone}
                </button>
              </li>
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.monitor}
                </button>
              </li>
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.headphone}
                </button>
              </li>
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.products.keyboard_mouse}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-6 text-white">
              {vi.layout.footer.policyTitle}
            </h4>
            <ul class="space-y-4 text-gray-400 text-sm">
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.policies.warranty}
                </button>
              </li>
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.policies.return}
                </button>
              </li>
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.policies.shipping}
                </button>
              </li>
              <li>
                <button class="hover:text-white transition-colors text-left w-full">
                  {vi.layout.footer.policies.payment}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-6 text-white">
              {vi.layout.footer.contactTitle}
            </h4>
            <div class="space-y-4">
              <div class="flex gap-3">
                <span class="material-symbols-outlined text-gray-500">
                  location_on
                </span>
                <p
                  class="text-sm text-gray-400"
                  data-location="Ho Chi Minh City, Vietnam"
                >
                  {vi.layout.footer.address}
                </p>
              </div>
              <div class="flex gap-3">
                <span class="material-symbols-outlined text-gray-500">
                  call
                </span>
                <p class="text-sm text-gray-400">{vi.layout.footer.phone}</p>
              </div>
              <div class="flex gap-3">
                <span class="material-symbols-outlined text-gray-500">
                  mail
                </span>
                <p class="text-sm text-gray-400">{vi.layout.footer.email}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="max-w-[1440px] mx-auto px-6 mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-500 text-xs">
            {vi.layout.footer.copyright.replace(
              "{year}",
              new Date().getFullYear(),
            )}
          </p>
          <div class="flex gap-8 text-gray-500 text-xs">
            <Link class="hover:text-white transition-colors" to="/terms">
              {vi.layout.footer.terms}
            </Link>
            <button class="hover:text-white transition-colors">
              {vi.layout.footer.privacy}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
