import { BrandPanel } from "../Brand-panel";

export function AuthLayout({ children }) {
  return (
    <div className="login-page">
      <main className="login-container">
        <BrandPanel />
        <section className="form-panel">{children}</section>
      </main>
    </div>
  );
}
