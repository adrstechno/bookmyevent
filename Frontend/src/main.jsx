// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast"; 
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            color: "#000000",
            fontWeight: "500",
            borderRadius: "8px",
          },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service_worker.js")
      .then(() => console.log("✅ PWA Service Worker Registered"))
      .catch((err) => console.error("❌ SW failed", err));
  });
}
