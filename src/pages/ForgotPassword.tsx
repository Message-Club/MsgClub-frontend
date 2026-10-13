import { useState } from "react";
import { forgotPassword } from "../api/auth";
import {
  AuthAlert,
  AuthButton,
  AuthCard,
  AuthFooterLink,
  AuthInput,
  AuthLayout,
} from "../components/auth/AuthForm";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await forgotPassword({ email });
      setMessage("Password reset instructions have been sent to your email.");
    } catch {
      setError("Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot Password"
        subtitle="reset your access"
        onSubmit={handleForgotPassword}
      >
        <AuthInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && <AuthAlert tone="success">{message}</AuthAlert>}
        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <AuthButton disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</AuthButton>

        <AuthFooterLink text="Remember your password?" linkText="Login" to="/login" />
      </AuthCard>
    </AuthLayout>
  );
}

export default ForgotPassword;
