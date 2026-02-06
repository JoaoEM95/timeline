export const THEME_COLORS = {
  default: [
  "#4299e1", "#48bb78", "#ed8936", "#9f7aea",
  "#f56565", "#38b2ac", "#ed64a6", "#ecc94b",
  ],
  glass: [
    "#60a5fa", "#f97316", "#f472b6",
    "#3b82f6", "#fb923c", "#ec4899",
    "#818cf8", "#f59e0b",
  ],
};

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
