import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import store from "./redux/store"; // default import olmalı
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

//window.store = store; // Debug için store'u global yap

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <CssBaseline />
      <App />
      <ToastContainer position="bottom-right" autoClose={5000} />
    </BrowserRouter>
  </Provider>
);
