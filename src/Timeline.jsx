import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { assignLanes } from "./assignLanes";
import { hexToRgba } from "./ThemeSelector";

const LANE_HEIGHT = 40;
const LANE_GAP = 8;
const MIN_ITEM_WIDTH = 30;
const DEFAULT_VISIBLE_DAYS = 150;
const MIN_VISIBLE_DAYS = 30;
const MAX_VISIBLE_DAYS = 1500;
const ZOOM_STEP = 1.15;
const EDGE_ZONE = 8;


function getDragCursor(e, itemEl) {
  if (!itemEl) return "grab";
  const rect = itemEl.getBoundingClientRect();
  const offset = e.clientX - rect.left;
  if (offset <= EDGE_ZONE || offset >= rect.width - EDGE_ZONE)
    return "ew-resize";
  return "grab";
}

function daysToPx(days, totalDays, timelineWidth) {
  return (days / totalDays) * timelineWidth;
}

function Timeline({ items, onItemUpdate, onItemDelete, theme = "default", colors }) {
  const scrollRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleDays, setVisibleDays] = useState(DEFAULT_VISIBLE_DAYS);
  const [drag, setDrag] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { minDate, maxDate, totalDays } = useMemo(() => {
    const dates = items.flatMap((item) => [dayjs(item.start), dayjs(item.end)]);
    const min = dates.reduce((a, b) => (a.isBefore(b) ? a : b));
    const max = dates.reduce((a, b) => (a.isAfter(b) ? a : b));
    return {
      minDate: min,
      maxDate: max,
      totalDays: max.diff(min, "day") + 1,
    };
  }, [items]);

  const dayWidth = containerWidth > 0 ? containerWidth / visibleDays : 1;
  const timelineWidth = Math.max(totalDays * dayWidth, containerWidth);

  const lanes = useMemo(() => assignLanes(items), [items]);

  const months = useMemo(() => {
    const result = [];
    let current = minDate.startOf("month");
    while (current.isBefore(maxDate) || current.isSame(maxDate, "month")) {
      result.push(current);
      current = current.add(1, "month");
    }
    return result;
  }, [minDate, maxDate]);

  const getItemStyle = useCallback(
    (item) => {
      const startOffset = dayjs(item.start).diff(minDate, "day");
      const duration = dayjs(item.end).diff(dayjs(item.start), "day") + 1;
      const left = daysToPx(startOffset, totalDays, timelineWidth);
      const width = Math.max(daysToPx(duration, totalDays, timelineWidth), MIN_ITEM_WIDTH);
      return { left: `${left}px`, width: `${width}px` };
    },
    [minDate, totalDays, timelineWidth]
  );

  const getMonthStyle = useCallback(
    (month) => {
      const monthStart = month.isBefore(minDate) ? minDate : month;
      const monthEnd = month.endOf("month");
      const effectiveEnd = monthEnd.isAfter(maxDate) ? maxDate : monthEnd;
      const startOffset = monthStart.diff(minDate, "day");
      const duration = effectiveEnd.diff(monthStart, "day") + 1;
      const left = daysToPx(startOffset, totalDays, timelineWidth);
      const width = daysToPx(duration, totalDays, timelineWidth);
      return { left: `${left}px`, width: `${width}px` };
    },
    [minDate, maxDate, totalDays, timelineWidth]
  );

  // --- Zoom via Ctrl+Wheel ---
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left + el.scrollLeft;
      const ratio = mouseX / timelineWidth;

      setVisibleDays((prev) => {
        const next =
          e.deltaY > 0
            ? Math.min(prev * ZOOM_STEP, MAX_VISIBLE_DAYS)
            : Math.max(prev / ZOOM_STEP, MIN_VISIBLE_DAYS);
        const newDayWidth = containerWidth / next;
        const newTotalWidth = Math.max(totalDays * newDayWidth, containerWidth);
        el.scrollLeft = ratio * newTotalWidth - (e.clientX - rect.left);
        return next;
      });
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [containerWidth, totalDays, timelineWidth]);

  const handleZoom = (direction) => {
    setVisibleDays((prev) =>
      direction === "in"
        ? Math.max(prev / ZOOM_STEP, MIN_VISIBLE_DAYS)
        : Math.min(prev * ZOOM_STEP, MAX_VISIBLE_DAYS)
    );
  };

  // --- Drag helpers ---
  const pxToDay = useCallback(
    (px) => Math.round(px / dayWidth),
    [dayWidth]
  );

  const handlePointerDown = useCallback(
    (e, item) => {
      if (editingId) return;
      e.preventDefault();
      const itemEl = e.currentTarget;
      const rect = itemEl.getBoundingClientRect();
      const offsetInItem = e.clientX - rect.left;
      const isLeftEdge = offsetInItem <= EDGE_ZONE;
      const isRightEdge = offsetInItem >= rect.width - EDGE_ZONE;

      let mode = "move";
      if (isLeftEdge) mode = "resize-start";
      else if (isRightEdge) mode = "resize-end";

      setDrag({
        itemId: item.id,
        mode,
        startX: e.clientX,
        origStart: item.start,
        origEnd: item.end,
      });
      itemEl.setPointerCapture(e.pointerId);
    },
    [editingId]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!drag) return;
      const deltaPx = e.clientX - drag.startX;
      const deltaDays = pxToDay(deltaPx);
      if (deltaDays === 0) return;

      const origStart = dayjs(drag.origStart);
      const origEnd = dayjs(drag.origEnd);

      let newStart, newEnd;
      if (drag.mode === "move") {
        newStart = origStart.add(deltaDays, "day").format("YYYY-MM-DD");
        newEnd = origEnd.add(deltaDays, "day").format("YYYY-MM-DD");
      } else if (drag.mode === "resize-start") {
        newStart = origStart.add(deltaDays, "day");
        if (newStart.isAfter(origEnd)) newStart = origEnd;
        newStart = newStart.format("YYYY-MM-DD");
        newEnd = drag.origEnd;
      } else {
        newEnd = origEnd.add(deltaDays, "day");
        if (newEnd.isBefore(origStart)) newEnd = origStart;
        newEnd = newEnd.format("YYYY-MM-DD");
        newStart = drag.origStart;
      }
      onItemUpdate(drag.itemId, { start: newStart, end: newEnd });
    },
    [drag, pxToDay, onItemUpdate]
  );

  const handlePointerUp = useCallback(() => {
    setDrag(null);
  }, []);

  // --- Inline editing ---
  const handleDoubleClick = useCallback((e, item) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditValue(item.name);
  }, []);

  const commitEdit = useCallback(() => {
    if (editingId != null && editValue.trim()) {
      onItemUpdate(editingId, { name: editValue.trim() });
    }
    setEditingId(null);
  }, [editingId, editValue, onItemUpdate]);

  const handleEditKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") commitEdit();
      if (e.key === "Escape") setEditingId(null);
    },
    [commitEdit]
  );

  return (
    <div className="timeline-container">
      <div className="timeline-toolbar">
        <button onClick={() => handleZoom("in")} title="Zoom in">+</button>
        <button onClick={() => handleZoom("out")} title="Zoom out">−</button>
        <span className="timeline-zoom-label">
          {Math.round(containerWidth / dayWidth)} days in view
        </span>
        <span className="timeline-hints">
          Ctrl + Scroll to zoom &middot; Drag to move &middot; Drag edges to resize &middot; Double-click to rename
        </span>
      </div>
      <div className="timeline-scroll" ref={scrollRef}>
        <div className="timeline-header" style={{ width: timelineWidth }}>
          {months.map((month) => (
            <div
              key={month.format("YYYY-MM")}
              className="timeline-month"
              style={getMonthStyle(month)}
            >
              {month.format("MMM YYYY")}
            </div>
          ))}
        </div>
        <div
          className="timeline-lanes"
          style={{
            width: timelineWidth,
            height: lanes.length * (LANE_HEIGHT + LANE_GAP) + LANE_GAP,
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {lanes.map((lane, laneIndex) => (
            <div
              key={laneIndex}
              className="timeline-lane"
              style={{
                top: laneIndex * (LANE_HEIGHT + LANE_GAP) + LANE_GAP,
                height: LANE_HEIGHT,
              }}
            >
              {lane.map((item) => (
                <div
                  key={item.id}
                  className={`timeline-item${drag?.itemId === item.id ? " dragging" : ""}`}
                  style={{
                    ...getItemStyle(item),
                    backgroundColor: (() => {
                      const ci = item.colorIndex != null ? item.colorIndex : item.id % colors.length;
                      const color = colors[ci % colors.length];
                      return theme === "glass" ? hexToRgba(color, 0.35) : color;
                    })(),
                  }}
                  title={editingId === item.id ? undefined : `${item.name}\n${item.start} → ${item.end}`}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                  onDoubleClick={(e) => handleDoubleClick(e, item)}
                  onPointerMoveCapture={(e) => {
                    e.currentTarget.style.cursor = getDragCursor(e, e.currentTarget);
                  }}
                >
                  {editingId === item.id ? (
                    <input
                      className="timeline-item-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleEditKeyDown}
                      onPointerDown={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="timeline-item-name">{item.name}</span>
                      <button
                        className="timeline-item-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemDelete(item.id);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        title="Remove event"
                      >
                        &times;
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
