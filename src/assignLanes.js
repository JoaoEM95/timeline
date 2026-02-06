import dayjs from "dayjs";

/**
 * Takes an array of items and assigns them to lanes based on start/end dates.
 * @returns an array of arrays containing items.
 */
export function assignLanes(items) {
  const sortedItems = [...items].sort(
    (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
  );
  const lanes = [];

  function assignItemToLane(item) {
    for (const lane of lanes) {
      const lastItem = lane[lane.length - 1];
      if (dayjs(lastItem.end).isBefore(dayjs(item.start))) {
        lane.push(item);
        return;
      }
    }
    lanes.push([item]);
  }

  for (const item of sortedItems) {
    assignItemToLane(item);
  }
  return lanes;
}
