import { addDays, differenceInCalendarDays, differenceInMinutes, startOfDay } from 'date-fns'
import type { AllDayPositionedEvent, CalendarEvent, PositionedCalendarEvent } from '../types'
import { HOUR_HEIGHT, MIN_EVENT_MINUTES } from './dates'

export function layoutDay(events: CalendarEvent[], day: Date): PositionedCalendarEvent[] {
  const dayStart = startOfDay(day)
  const items = events
    .filter(event => !event.allDay)
    .map((event) => {
      const start = Math.max(0, differenceInMinutes(new Date(event.start), dayStart))
      const end = Math.min(24 * 60, differenceInMinutes(new Date(event.end), dayStart))

      return { event, start, end: Math.max(end, start + MIN_EVENT_MINUTES) }
    })
    .filter(item => item.end > item.start)
    .sort((left, right) => left.start - right.start || right.end - left.end)

  const positioned: PositionedCalendarEvent[] = []
  let cluster: typeof items = []
  let clusterEnd = -1

  function flush() {
    const columns: number[] = []
    const assigned = cluster.map((item) => {
      let column = columns.findIndex(end => end <= item.start)
      if (column === -1) {
        column = columns.length
      }
      columns[column] = item.end
      return column
    })

    cluster.forEach((item, index) => {
      positioned.push({
        event: item.event,
        top: item.start * HOUR_HEIGHT / 60,
        height: (item.end - item.start) * HOUR_HEIGHT / 60,
        left: (assigned[index] ?? 0) / columns.length * 100,
        width: 100 / columns.length
      })
    })
  }

  for (const item of items) {
    if (cluster.length && item.start >= clusterEnd) {
      flush()
      cluster = []
      clusterEnd = -1
    }

    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.end)
  }

  if (cluster.length) {
    flush()
  }

  return positioned
}

export function layoutAllDay(events: CalendarEvent[], days: Date[]): AllDayPositionedEvent[] {
  const firstDay = days[0]
  const lastDay = days[days.length - 1]
  if (!firstDay || !lastDay) {
    return []
  }

  const weekEnd = addDays(lastDay, 1)
  const items = events
    .filter(event => event.allDay)
    .map((event) => {
      const start = startOfDay(new Date(event.start))
      const end = new Date(event.end)
      const endIndex = differenceInCalendarDays(end, firstDay) + (end.getHours() || end.getMinutes() || end.getSeconds() || end.getMilliseconds() ? 1 : 0)
      const colStart = Math.max(0, differenceInCalendarDays(start, firstDay))
      const colEnd = Math.min(days.length, Math.max(colStart + 1, endIndex))

      return { event, start, end, colStart, colEnd }
    })
    .filter(item => item.start < weekEnd && item.end > firstDay)
    .sort((left, right) => left.colStart - right.colStart || right.colEnd - right.colStart - (left.colEnd - left.colStart) || left.event.id.localeCompare(right.event.id))

  const lanes: Array<Array<{ start: number, end: number }>> = []

  return items.map((item) => {
    let lane = lanes.findIndex(intervals => intervals.every(interval => interval.end <= item.colStart || interval.start >= item.colEnd))
    if (lane === -1) {
      lane = lanes.length
      lanes.push([])
    }

    lanes[lane]!.push({ start: item.colStart, end: item.colEnd })

    return {
      event: item.event,
      colStart: item.colStart,
      colSpan: item.colEnd - item.colStart,
      lane
    }
  })
}
