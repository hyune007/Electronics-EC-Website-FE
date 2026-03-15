import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Step from "./steps/Step";
import Stepper from "./Stepper";
import InforStep from "./steps/InforStep/InforStep";
import CompleteStep from "./steps/CompleteStep/CompleteStep";
import ShoppingCartStep from "./steps/ShoppingCartStep/ShoppingCartStep";
import PaymentStep from "./steps/PaymentStep/PaymentStep";
import { useAuth } from "../../hooks/useAuth";

export default function CheckoutLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shippingInfo, setShippingInfo] = useState(null);
  const { isAuthenticated, isCustomer } = useAuth();

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

  return (
    <div className="bg-transparent">
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full">
          <Stepper
            view={view}
            // khách chưa đăng nhập không được bấm đổi step
            onSelectView={isAuthenticated && isCustomer ? setView : undefined}
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
    </div>
  );
}
