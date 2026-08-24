interface SettingsToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function SettingsToggle({
  checked,
  disabled = false,
  label,
  onChange,
}: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`settings-toggle ${checked ? "active" : ""} ${disabled ? "disabled" : ""}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="toggle-track" />
      <span className="toggle-handle" />
    </button>
  );
}
