import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export function AuthSwitch({ prompt, to, label }) {
  return (
    <div className="auth-switch">
      {prompt} <Link to={to}>{label}</Link>
    </div>
  );
}

export function SecurityNote() {
  return (
    <div className="security-note">
      <Lock size={12} aria-hidden="true" />
      Your information stays secure.
    </div>
  );
}
