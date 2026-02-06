import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import timelineItems from "./timelineItems.js";
import Timeline from "./Timeline.jsx";
import ThemeSelector, { THEME_COLORS } from "./ThemeSelector.jsx";
import AddEventModal from "./AddEventModal.jsx";

function App() {
  const [items, setItems] = useState(timelineItems);
  const [theme, setTheme] = useState("default");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
  }, [theme]);

  const handleItemUpdate = (id, changes) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };
  const handleItemDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  const handleItemAdd = (newItem) => {
    const maxId = Math.max(0, ...items.map((i) => i.id));
    setItems((prev) => [...prev, { ...newItem, id: maxId + 1 }]);
  };

  return (
    <div className="app" data-theme={theme}>
      <div className="app-header">
        <h1>Project Timeline</h1>
        <div className="app-header-actions">
          <button className="add-event-btn" onClick={() => setShowAddModal(true)}>+ Add Event</button>
          <ThemeSelector theme={theme} onThemeChange={setTheme} />
        </div>
      </div>
      <Timeline
        items={items}
        onItemUpdate={handleItemUpdate}
        onItemDelete={handleItemDelete}
        theme={theme}
        colors={THEME_COLORS[theme]}
      />
      {showAddModal && (
        <AddEventModal
          colors={THEME_COLORS[theme]}
          onAdd={handleItemAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
