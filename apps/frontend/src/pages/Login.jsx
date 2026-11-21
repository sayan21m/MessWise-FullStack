import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthSwitch, SecurityNote } from "../components/auth/AuthFooter";
import { Field } from "../components/auth/Field";
import { GoogleButton } from "../components/auth/GoogleButton";
import { PrimaryButton } from "../components/auth/PrimaryButton";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your login credentials.");
      return;
    }

    setMessage("Form submitted. Backend authentication is not connected yet.");
  }

  return (
    <AuthLayout>
      <form className="login-form" onSubmit={handleSubmit}>
        <AuthHeader
          tag="WELCOME BACK"
          title="Sign in"
          subtitle="Enter your credentials to access your account."
        />

        <Field
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="username"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
        />
        <Field
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
        />

        <div className="form-options">
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>
          <a href="/forgot-password">Forgot password?</a>
        </div>

        <PrimaryButton>Login</PrimaryButton>

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}

        <div className="divider">or continue with</div>
        <GoogleButton />
        <AuthSwitch prompt="Don't have an account?" to="/register" label="Create account" />
        <SecurityNote />
      </form>
    </AuthLayout>
  );
}
