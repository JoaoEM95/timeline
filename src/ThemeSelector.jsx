

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const THEMES = [
  { id: "default", label: "Default", className: "theme-btn-default" },
  { id: "glass", label: "Glass", className: "theme-btn-glass" },
];

function ThemeSelector({ theme, onThemeChange }) {
  return (
    <div className="theme-selector">
      <span className="theme-selector-label">Theme</span>
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`theme-btn ${t.className}${theme === t.id ? " active" : ""}`}
          onClick={() => onThemeChange(t.id)}
          title={t.label}
        />
      ))}
    </div>
  );
}

export default ThemeSelector;
