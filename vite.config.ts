import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ← 중요: 외부 IP 접근 허용
    port: 5173, // ← 기본 포트 (원하면 변경 가능)
  },
});
