import { ArrowRight } from "lucide-react";

export function PrimaryButton({ children }) {
  return (
    <button type="submit" className="login-button">
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </button>
  );
}
