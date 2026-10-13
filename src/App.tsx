import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import {
  isAuthenticated,
  subscribeToAuthChanges,
} from "./api/auth";

function App() {
  const isAuth =
    useAuthState();

  return (
    <Routes>
      <Route path="/" element={isAuth ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuth ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/chat" element={isAuth ? <ChatPage /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function useAuthState() {
  const [isAuth, setIsAuth] =
    useState(
      isAuthenticated()
    );

  useEffect(() => {
    return subscribeToAuthChanges(
      () => {
        setIsAuth(
          isAuthenticated()
        );
      }
    );
  }, []);

  return isAuth;
}

export default App;
