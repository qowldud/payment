import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CheckoutPage } from "./pages/CheckoutPage";
import { SuccessPage } from "./pages/SuccessPage";
import { FailPage } from "./pages/FailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <CheckoutPage />,
  },
  {
    path: "/success",
    element: <SuccessPage />,
  },
  {
    path: "/fail",
    element: <FailPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
