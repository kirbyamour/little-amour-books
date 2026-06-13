import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/**
 * window.storage polyfill — the app uses this for saving studio data and
 * applications. Backed by localStorage so it persists across page reloads.
 */
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const value = localStorage.getItem(key);
        return value !== null ? { value } : null;
      } catch {
        return null;
      }
    },
    set: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* non-fatal */
      }
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
