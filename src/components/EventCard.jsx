import React from "react";

function EventCard({ item, style, color, editing, editValue, onPointerDown, onDoubleClick, onDelete, onChangeEdit, onCommitEdit, onPointerMoveCapture }) {
  return (
    <div
      className={`timeline-item${/* pass-through if needed */ ''}`}
      style={style}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      onPointerMoveCapture={onPointerMoveCapture}
    >
      {editing ? (
        <input
          className="timeline-item-input"
          value={editValue}
          onChange={(e) => onChangeEdit?.(e.target.value)}
          onBlur={onCommitEdit}
          autoFocus
        />
      ) : (
        <>
          <span className="timeline-item-name">{item.name}</span>
          <button
            className="timeline-item-delete"
            aria-label="Remove event"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            &times;
          </button>
        </>
      )}
    </div>
  );
}

export default EventCard;
