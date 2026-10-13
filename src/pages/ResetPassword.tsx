import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import {
  AuthAlert,
  AuthButton,
  AuthCard,
  AuthFooterLink,
  AuthInput,
  AuthLayout,
} from "../components/auth/AuthForm";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [uid, setUid] = useState(searchParams.get("uid") || "");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await resetPassword({ uid, token, password });
      setMessage("Password reset successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setError("Unable to reset password. Please check your reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Reset Password" subtitle="choose a new one" onSubmit={handleResetPassword}>
        <AuthInput
          placeholder="UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          required
        />

        <AuthInput
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />

        <AuthInput
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {message && <AuthAlert tone="success">{message}</AuthAlert>}
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <AuthButton disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</AuthButton>

        <AuthFooterLink text="Back to" linkText="Login" to="/login" />
      </AuthCard>
    </AuthLayout>
  );
}

export default ResetPassword;
