import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/app/App";
import "@/app/styles/index.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root was not found.");
}

createRoot(app).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
