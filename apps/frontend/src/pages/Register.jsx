import { useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthSwitch, SecurityNote } from "../components/auth/AuthFooter";
import { Field } from "../components/auth/Field";
import { GoogleButton } from "../components/auth/GoogleButton";
import { PrimaryButton } from "../components/auth/PrimaryButton";

export function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setMessage("Please agree to the terms and privacy policy.");
      return;
    }

    setMessage("Form submitted. Backend registration is not connected yet.");
  }

  return (
    <AuthLayout>
      <form className="login-form" onSubmit={handleSubmit}>
        <AuthHeader
          tag="CREATE ACCOUNT"
          title="Create your account"
          subtitle="Enter your details to get started with MessWise."
        />

        <div className="name-row">
          <Field
            id="firstName"
            label="First name"
            icon={User}
            autoComplete="given-name"
            value={firstName}
            onChange={setFirstName}
            placeholder="Enter first name"
          />
          <Field
            id="lastName"
            label="Last name"
            icon={User}
            autoComplete="family-name"
            value={lastName}
            onChange={setLastName}
            placeholder="Enter last name"
          />
        </div>

        <Field
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
        />

        <Field
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
        />
        <Field
          id="confirmPassword"
          label="Confirm password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm your password"
        />

        <label className="remember terms">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          I agree to the terms and privacy policy
        </label>

        <PrimaryButton>Register</PrimaryButton>

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}

        <div className="divider">or continue with</div>
        <GoogleButton />
        <AuthSwitch prompt="Already have an account?" to="/" label="Login" />
        <SecurityNote />
      </form>
    </AuthLayout>
  );
}
