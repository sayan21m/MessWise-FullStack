import { CalendarDays, IndianRupee, Sandwich, Utensils } from "lucide-react";

export function BrandPanel() {
  return (
    <section className="brand-panel">
      <header className="brand">
        <div className="brand-icon">
          <Utensils size={22} aria-hidden="true" />
        </div>

        <div>
          <div className="brand-name">
            Mess<span>Wise</span>
          </div>
          <div className="brand-subtitle">Smart Mess Management</div>
        </div>
      </header>

      <div className="brand-content">
        <div className="eyebrow">YOUR MESS, SIMPLIFIED</div>

        <h1>
          Good Food.
          <br />
          <span>Brighter Days.</span>
        </h1>

        <p>
          Manage your meals, keep track of payments, and stay updated with your mess — all in one
          place.
        </p>

        <div className="features">
          <Feature icon={CalendarDays} title="Daily Menu" description="Know what's cooking" />
          <Feature icon={Sandwich} title="Meal Tracking" description="Track your meals" />
          <Feature icon={IndianRupee} title="Payments" description="Manage your bills" />
        </div>
      </div>

      <footer className="brand-footer">© 2026 MessWise · Made for better living.</footer>
    </section>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="feature">
      <div className="feature-icon">
        <Icon size={18} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
