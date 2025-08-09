import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const accessToken = searchParams.get("accessToken");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !orderId || !amount || !accessToken) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_APP_URL}/payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        if (!res.ok) {
          const errorRes = await res.json();
          throw new Error(errorRes.message || "결제 승인에 실패했어요.");
        }

        setIsConfirmed(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, accessToken]);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center px-4 text-center">
      {error ? (
        <>
          <h2 className="text-xl font-semibold text-red-500">{error}</h2>
        </>
      ) : isConfirmed ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100vw",
            height: "100vh",
          }}
        >
          <h2 className="text-xl font-semibold mb-4">결제를 완료했어요 🎉</h2>
        </div>
      ) : (
        <h2 className="text-xl">결제 요청까지 성공했어요. 승인 중입니다...</h2>
      )}
    </div>
  );
};
