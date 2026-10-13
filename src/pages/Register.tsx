import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import {
  AuthButton,
  AuthCard,
  AuthFooterLink,
  AuthInput,
  AuthLayout,
} from "../components/auth/AuthForm";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerUser({ email, username, password });
      alert("Registered successfully!");
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Register" subtitle="create your account" onSubmit={handleRegister}>
        <AuthInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <AuthInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <AuthButton>Continue</AuthButton>

        <AuthFooterLink text="Already have an account?" linkText="Login" to="/login" />
      </AuthCard>
    </AuthLayout>
  );
}

export default Register;
