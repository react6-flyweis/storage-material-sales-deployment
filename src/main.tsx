import "./instrument.ts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";


import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/query-client";

// Global event listeners to auto-select value for number inputs on focus/click
if (typeof window !== "undefined") {
  const handleNumberInputSelection = (event: Event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === "number") {
      // Use setTimeout to ensure selection runs after browser's default cursor placement
      setTimeout(() => {
        if (document.activeElement === target) {
          target.select();
        }
      }, 0);
    }
  };

  document.addEventListener("focus", handleNumberInputSelection, true);
  document.addEventListener("click", handleNumberInputSelection, true);
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container, {
  // Callback called when an error is thrown and not caught by an ErrorBoundary.
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn("Uncaught error", error, errorInfo.componentStack);
  }),
  // Callback called when React catches an error in an ErrorBoundary.
  onCaughtError: Sentry.reactErrorHandler(),
  // Callback called when React automatically recovers from errors.
  onRecoverableError: Sentry.reactErrorHandler(),
})

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

