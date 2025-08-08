import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  loadPaymentWidget,
  ANONYMOUS,
  type PaymentWidgetInstance,
} from "@tosspayments/payment-widget-sdk";

const clientKey = import.meta.env.VITE_APP_KEY;
const generateRandomString = () =>
  window.btoa(Math.random().toString()).slice(0, 20);

export const CheckoutPage = () => {
  const [widgets, setWidgets] = useState<PaymentWidgetInstance | null>(null);
  const [searchParams] = useSearchParams();

  const amount = Number(searchParams.get("amount"));
  const accessToken = searchParams.get("token");

  const orderAmount = {
    currency: "KRW" as const,
    value: amount,
  };

  useEffect(() => {
    const init = async () => {
      if (!amount || !accessToken) {
        alert("잘못된 접근입니다.");
        return;
      }

      const paymentWidget = await loadPaymentWidget(clientKey, ANONYMOUS);
      await paymentWidget.renderPaymentMethods("#payment-method", orderAmount);
      await paymentWidget.renderAgreement("#agreement");
      setWidgets(paymentWidget);
    };

    init();
  }, [amount, accessToken]);

  const handlePayment = async () => {
    if (!widgets) return;

    try {
      const orderId = generateRandomString();

      await widgets.requestPayment({
        orderId,
        orderName: "코인 결제",
        customerName: "테스트 사용자",
        customerEmail: "test@example.com",
        successUrl: `${window.location.origin}/success?orderId=${orderId}&amount=${amount}&accessToken=${accessToken}`,
        failUrl: `${window.location.origin}/fail`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="wrapper">
      <div id="payment-method" />
      <div id="agreement" />
      <button onClick={handlePayment}>결제하기</button>
    </div>
  );
};
