import { useState } from "react";

function AddEventModal({ colors, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [colorIndex, setColorIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !start || !end) return;
    onAdd({ name: name.trim(), start, end, colorIndex });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Event</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="modal-label">
            Name
            <input
              className="modal-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Event name"
              autoFocus
            />
          </label>
          <div className="modal-row">
            <label className="modal-label">
              Start date
              <input
                className="modal-input"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label className="modal-label">
              End date
              <input
                className="modal-input"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
          <label className="modal-label">
            Color
            <div className="modal-colors">
              {colors.map((color, i) => (
                <button
                  key={i}
                  type="button"
                  className={`modal-color-btn${colorIndex === i ? " active" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setColorIndex(i)}
                />
              ))}
            </div>
          </label>
          <button
            type="submit"
            className="modal-submit"
            disabled={!name.trim() || !start || !end}
          >
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEventModal;
