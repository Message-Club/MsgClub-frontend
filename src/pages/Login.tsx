// Login.tsx

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { loginUser } from "../api/auth";

import {
  AuthButton,
  AuthCard,
  AuthFooterLink,
  AuthInput,
  AuthLayout,
  AuthTextLink,
} from "../components/auth/AuthForm";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await loginUser({
        email,
        password,
      });

      navigate("/", {
        replace: true,
      });
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Login"
        subtitle="to get started"
        onSubmit={handleLogin}
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <AuthInput
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          required
          disabled={loading}
        />

        <AuthInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          required
          disabled={loading}
        />

        <div className="pt-1">
          <AuthTextLink to="/forgot-password">
            Forgot Password?
          </AuthTextLink>
        </div>

        <AuthButton
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Continue"}
        </AuthButton>

        <AuthFooterLink
          text="New User?"
          linkText="Register"
          to="/register"
        />
      </AuthCard>
    </AuthLayout>
  );
}

export default Login;
