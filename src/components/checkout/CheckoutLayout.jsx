import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Step from "./steps/Step";
import Stepper from "./Stepper";
import InforStep from "./steps/InforStep/InforStep";
import CompleteStep from "./steps/CompleteStep/CompleteStep";
import ShoppingCartStep from "./steps/ShoppingCartStep/ShoppingCartStep";
import PaymentStep from "./steps/PaymentStep/PaymentStep";

export default function CheckoutLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shippingInfo, setShippingInfo] = useState(null);

  const view = searchParams.get("tab") || "cart";

  const setView = (v) => {
    setSearchParams({ tab: v });
  };

  return (
    <div>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex-1">
          <Stepper view={view} onSelectView={setView} />
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
              />
            )}
            {view === "complete" && <CompleteStep />}
          </Step>
        </div>
      </main>
    </div>
  );
}
