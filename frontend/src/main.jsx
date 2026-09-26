import "./i18n";
import "./style.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth } from "./auth";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Auth>
      <App />
    </Auth>
  </BrowserRouter>
);