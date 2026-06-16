import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

