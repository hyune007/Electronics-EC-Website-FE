import BrandLogo from "../../../common/BrandLogo.jsx";
import { Link } from "react-router-dom";
import vi from "../../../../i18n/vi.js";
export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <BrandLogo />
            </div>
            <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {vi.layout.footer.description}
            </p>
            <div className="flex gap-4">
              <button className="icon-btn size-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
                <span className="material-symbols-outlined text-[20px]">
                  public
                </span>
              </button>
              <button className="icon-btn size-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
                <span className="material-symbols-outlined text-[20px]">
                  share
                </span>
              </button>
              <button className="icon-btn size-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
                <i className="fa-brands fa-facebook-f text-[18px]"></i>
              </button>
            </div>
          </div>
          <div>
            <h4 className="mb-5 text-base font-semibold uppercase tracking-[0.06em] text-[var(--color-text)]">
              {vi.layout.footer.productTitle}
            </h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.products.laptop}
                </button>
              </li>
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.products.phone}
                </button>
              </li>
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.products.monitor}
                </button>
              </li>
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.products.headphone}
                </button>
              </li>
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.products.keyboard_mouse}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-base font-semibold uppercase tracking-[0.06em] text-[var(--color-text)]">
              {vi.layout.footer.policyTitle}
            </h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.policies.warranty}
                </button>
              </li>
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.policies.return}
                </button>
              </li>
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.policies.shipping}
                </button>
              </li>
              <li>
                <button className="motion-default w-full text-left hover:text-[var(--color-primary)]">
                  {vi.layout.footer.policies.payment}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-base font-semibold uppercase tracking-[0.06em] text-[var(--color-text)]">
              {vi.layout.footer.contactTitle}
            </h4>
            <div className="space-y-4 text-sm text-[var(--color-text-muted)]">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[var(--color-primary)]">
                  location_on
                </span>
                <p
                  className="text-sm"
                  data-location="Ho Chi Minh City, Vietnam"
                >
                  {vi.layout.footer.address}
                </p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[var(--color-primary)]">
                  call
                </span>
                <p className="text-sm">{vi.layout.footer.phone}</p>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-[var(--color-primary)]">
                  mail
                </span>
                <p className="text-sm">{vi.layout.footer.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6 md:flex-row">
          <p className="text-xs text-[var(--color-text-muted)]">
            {vi.layout.footer.copyright.replace(
              "{year}",
              new Date().getFullYear(),
            )}
          </p>
          <div className="flex gap-8 text-xs text-[var(--color-text-muted)]">
            <Link
              className="motion-default hover:text-[var(--color-primary)]"
              to="/terms"
            >
              {vi.layout.footer.terms}
            </Link>
            <button className="motion-default hover:text-[var(--color-primary)]">
              {vi.layout.footer.privacy}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
