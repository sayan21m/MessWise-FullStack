export function Field({
  id,
  label,
  icon: Icon,
  type = "text",
  autoComplete,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <Icon className="input-icon" size={18} aria-hidden="true" />
        <input
          type={type}
          id={id}
          name={id}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
      </div>
    </div>
  );
}
