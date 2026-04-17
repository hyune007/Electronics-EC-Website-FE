import React, { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Step from "./steps/Step";
import Stepper from "./Stepper";
import InforStep from "./steps/InforStep/InforStep";
import CompleteStep from "./steps/CompleteStep/CompleteStep";
import ShoppingCartStep from "./steps/ShoppingCartStep/ShoppingCartStep";
import PaymentStep from "./steps/PaymentStep/PaymentStep";
import Warning from "../common/Warning";
import { useAuth } from "../../hooks/useAuth";

export default function CheckoutLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shippingInfo, setShippingInfo] = useState(null);
  const [showBlockedCheckoutWarning, setShowBlockedCheckoutWarning] =
    useState(false);
  const { isAuthenticated, isCustomer } = useAuth();
  const blockedClicksRef = useRef({ count: 0, startedAt: 0 });

  const rawView = searchParams.get("tab") || "cart";
  const view = !isAuthenticated || !isCustomer ? "cart" : rawView;

  const setView = (v) => {
    // khách chưa đăng nhập chỉ được xem giỏ hàng
    if (!isAuthenticated || !isCustomer) {
      setSearchParams({ tab: "cart" });
      return;
    }
    setSearchParams({ tab: v });
  };

  const handleBlockedCheckoutClick = () => {
    const now = Date.now();
    const windowMs = 3500;
    const threshold = 3;

    if (now - blockedClicksRef.current.startedAt > windowMs) {
      blockedClicksRef.current = { count: 1, startedAt: now };
      return;
    }

    blockedClicksRef.current.count += 1;

    if (blockedClicksRef.current.count >= threshold) {
      setShowBlockedCheckoutWarning(true);
      blockedClicksRef.current = { count: 0, startedAt: 0 };
    }
  };

  return (
    <div className="bg-transparent">
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full">
          <Stepper
            view={view}
            // khách chưa đăng nhập không được bấm đổi step
            onSelectView={isAuthenticated && isCustomer ? setView : undefined}
            onBlockedClick={handleBlockedCheckoutClick}
          />
          <Step view={view} setView={setView}>
            {view === "cart" && (
              <ShoppingCartStep onProceed={() => setView("infor")} />
            )}
            {view === "infor" && (
              <InforStep
                onSubmit={(data) => {
                  setShippingInfo(data);
                  setView("payment");
                }}
              />
            )}
            {view === "payment" && (
              <PaymentStep
                shippingInfo={shippingInfo}
                onEditShipping={() => setView("infor")}
                onComplete={() => setView("complete")}
              />
            )}
            {view === "complete" && <CompleteStep />}
          </Step>
        </div>
      </main>

      <Warning
        open={showBlockedCheckoutWarning}
        onClose={() => setShowBlockedCheckoutWarning(false)}
        title="Thông báo"
        message="click nhiều hư chuột, đặt hàng đi rồi chúng mình gặp nhau"
        buttonText="Đã hiểu"
      />
    </div>
  );
}
