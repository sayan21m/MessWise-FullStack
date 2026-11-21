export function AuthHeader({ tag, title, subtitle }) {
  return (
    <>
      <div className="welcome-tag">{tag}</div>
      <h2>{title}</h2>
      <p className="subtitle">{subtitle}</p>
    </>
  );
}
