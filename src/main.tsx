import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n"; // i18n initialization — must be before App
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
