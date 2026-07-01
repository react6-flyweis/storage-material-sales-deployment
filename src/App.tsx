import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { salesRoutes } from "./routes/sales.routes";
import { Loading } from "./components/loading";
import * as Sentry from "@sentry/react";
import ErrorBoundary from "@/pages/error-page";



const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV7(createBrowserRouter);
const router = sentryCreateBrowserRouter(salesRoutes);

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
