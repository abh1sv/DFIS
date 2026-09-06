import React from "react";
import ReactDOM from "react-dom/client";
import ScanDetails from "./ScanDetails";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import App from "./App";
import History from "./History";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/history" element={<History />} />
        <Route path="/scan/:id" element={<ScanDetails />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);