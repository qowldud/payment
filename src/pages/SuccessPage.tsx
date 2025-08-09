// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";

// export const SuccessPage = () => {
//   const [searchParams] = useSearchParams();
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const paymentKey = searchParams.get("paymentKey");
//   const orderId = searchParams.get("orderId");
//   const amount = searchParams.get("amount");
//   const accessToken = searchParams.get("accessToken");

//   useEffect(() => {
//     const confirmPayment = async () => {
//       if (!paymentKey || !orderId || !amount || !accessToken) return;

//       try {
//         const res = await fetch(`${import.meta.env.VITE_APP_URL}/payment`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`,
//           },
//           body: JSON.stringify({
//             paymentKey,
//             orderId,
//             amount: Number(amount),
//           }),
//         });

//         if (!res.ok) {
//           const errorRes = await res.json();
//           throw new Error(errorRes.message || "결제 승인에 실패했어요.");
//         }

//         setIsConfirmed(true);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "알 수 없는 오류");
//       }
//     };

//     confirmPayment();
//   }, [paymentKey, orderId, amount, accessToken]);

//   const goBackToApp = () => {
//     // 예: 앱 딥링크로 이동 (iOS/Android)
//     window.location.href = "myapp://payment-complete";
//   };

//   return (
//     <div className="w-full h-screen flex flex-col justify-center items-center px-4 text-center">
//       {error ? (
//         <>
//           <h2 className="text-xl font-semibold text-red-500">{error}</h2>
//         </>
//       ) : isConfirmed ? (
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             width: "100vw",
//             height: "100vh",
//           }}
//         >
//           <h2 className="text-xl font-semibold mb-4">결제를 완료했어요 🎉</h2>
//           <button
//             onClick={goBackToApp}
//             className="bg-black text-white px-6 py-3 rounded-lg mt-4"
//           >
//             앱으로 돌아가기
//           </button>
//         </div>
//       ) : (
//         <h2 className="text-xl">결제 요청까지 성공했어요. 승인 중입니다...</h2>
//       )}
//     </div>
//   );
// };

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const accessToken = searchParams.get("accessToken");

  // ✅ 앱으로 복귀할 URL들
  const universalLink = useMemo(() => {
    // AASA에 /callback/* 혹은 /callback/payment-complete 등록되어 있어야 함
    const url = new URL(
      "https://payment-eight-neon.vercel.app/callback/payment-complete"
    );
    if (orderId) url.searchParams.set("orderId", orderId);
    if (amount) url.searchParams.set("amount", amount);
    return url.toString();
  }, [orderId, amount]);

  const customScheme = useMemo(() => {
    // 네 앱 스킴으로 교체: myapp://...
    const url = new URL("myapp://payment-complete");
    if (orderId) url.searchParams.set("orderId", orderId);
    if (amount) url.searchParams.set("amount", amount);
    return url.toString();
  }, [orderId, amount]);

  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);

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
          const errorRes = await res.json().catch(() => ({}));
          throw new Error(errorRes.message || "결제 승인에 실패했어요.");
        }

        setIsConfirmed(true);

        // ✅ 1) 앱 내 WebView일 때: iOS/Android에 신호 (네이티브에서 이 신호 받으면 WebView 닫고 상위 새로고침)
        const payload = {
          type: "paymentResult",
          success: true,
          orderId,
          amount: Number(amount),
        };
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).webkit?.messageHandlers?.paymentResult?.postMessage(
            payload
          );
        } catch (err) {
          console.log(err);
        }
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).AndroidBridge?.paymentResult?.(
            JSON.stringify(payload)
          );
        } catch (err) {
          console.log(err);
        }

        // ❗자동 이동까지 원하면 여기서 유니버설 링크 시도(선호 X, 버튼 탭이 성공률 더 좋음)
        // setTimeout(() => hiddenAnchorRef.current?.click(), 300);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, accessToken]);

  const goBackToApp = () => {
    // ✅ 2) 외부 브라우저 대비: 사용자 탭으로 유니버설 링크 먼저
    hiddenAnchorRef.current?.click();

    // ✅ 3) 폴백: 1~1.5초 후 커스텀 스킴 (웹뷰/일부 환경에서 UL이 막힐 수 있음)
    setTimeout(() => {
      window.location.href = customScheme;
    }, 1200);
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center px-4 text-center">
      {/* 사용자 탭으로 여는 a태그 (iOS가 a태그 클릭을 더 신뢰함) */}
      <a
        ref={hiddenAnchorRef}
        href={universalLink}
        style={{ display: "none" }}
      />

      {error ? (
        <h2 className="text-xl font-semibold text-red-500">{error}</h2>
      ) : isConfirmed ? (
        <div className="flex flex-col items-center justify-center w-screen h-screen">
          <h2 className="text-xl font-semibold mb-4">결제를 완료했어요 🎉</h2>
          <button
            onClick={goBackToApp}
            className="bg-black text-white px-6 py-3 rounded-lg mt-4"
          >
            앱으로 돌아가기
          </button>
          <p className="mt-3 text-sm opacity-70">
            안 열리면 <a href={universalLink}>이 링크</a>를 길게 눌러 “앱에서
            열기”를 선택해줘.
          </p>
        </div>
      ) : (
        <h2 className="text-xl">결제 요청까지 성공했어요. 승인 중입니다...</h2>
      )}
    </div>
  );
};
