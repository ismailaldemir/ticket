import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import AccessDenied from "./pages/auth/AccessDenied";
import NotificationCenter from "./pages/notification/NotificationCenter";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationCenter />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
