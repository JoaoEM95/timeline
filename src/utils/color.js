export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function colorForItem(item, colors, theme) {
  const ci = item.colorIndex != null ? item.colorIndex : item.id % colors.length;
  const color = colors[ci % colors.length];
  return theme === "glass" ? hexToRgba(color, 0.35) : color;
}
