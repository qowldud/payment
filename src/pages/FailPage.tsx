import { useSearchParams } from "react-router-dom";

export const FailPage = () => {
  const [searchParams] = useSearchParams();

  return (
    <div>
      <h2>❌ 결제 실패</h2>
      <p>code: {searchParams.get("code")}</p>
      <p>message: {searchParams.get("message")}</p>
    </div>
  );
};
