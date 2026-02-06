import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import timelineItems from "./timelineItems.js";
import Timeline from "./Timeline.jsx";

function App() {
  const [items, setItems] = useState(timelineItems);

  const handleItemUpdate = (id, changes) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  };

  return (
    <div className="app">
      <h1>Project Timeline</h1>
      <Timeline items={items} onItemUpdate={handleItemUpdate} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
