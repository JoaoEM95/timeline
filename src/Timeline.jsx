import React, { useMemo } from "react";
import dayjs from "dayjs";
import { assignLanes } from "./assignLanes";

const LANE_HEIGHT = 40;
const LANE_GAP = 8;
const HEADER_HEIGHT = 30;

function Timeline({ items }) {
  const lanes = useMemo(() => assignLanes(items), [items]);

  console.log('lanes',lanes)

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

  const months = useMemo(() => {
    const result = [];
    let current = minDate.startOf("month");
    while (current.isBefore(maxDate) || current.isSame(maxDate, "month")) {
      result.push(current);
      current = current.add(1, "month");
    }
    return result;
  }, [minDate, maxDate]);

  const getItemStyle = (item) => {
    const startOffset = dayjs(item.start).diff(minDate, "day");
    const duration = dayjs(item.end).diff(dayjs(item.start), "day") + 1;

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return {
      left: `${left}%`,
      width: `${Math.max(width, 1)}%`,
    };
  };

  const getMonthStyle = (month) => {
    const monthStart = month.isBefore(minDate) ? minDate : month;
    const monthEnd = month.endOf("month");
    const effectiveEnd = monthEnd.isAfter(maxDate) ? maxDate : monthEnd;

    const startOffset = monthStart.diff(minDate, "day");
    const duration = effectiveEnd.diff(monthStart, "day") + 1;

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  const colors = [
    "#4299e1",
    "#48bb78",
    "#ed8936",
    "#9f7aea",
    "#f56565",
    "#38b2ac",
    "#ed64a6",
    "#ecc94b",
  ];

  return (
    <div className="timeline-container">
      <div className="timeline-header">
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
          height: lanes.length * (LANE_HEIGHT + LANE_GAP) + LANE_GAP,
        }}
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
                className="timeline-item"
                style={{
                  ...getItemStyle(item),
                  backgroundColor: colors[item.id % colors.length],
                }}
                title={`${item.name}\n${item.start} → ${item.end}`}
              >
                <span className="timeline-item-name">{item.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
