import { addDays, addMonths, differenceInCalendarDays, differenceInCalendarWeeks, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import type { CalendarDateRange, CalendarView } from '../types'

export const HOUR_HEIGHT = 64
export const SNAP_MINUTES = 15
export const MIN_EVENT_MINUTES = 30
export const DAY_MINUTES = 24 * 60

export function localDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

export function dateFromLocalDateTime(value: string): Date {
  return new Date(value)
}

export function dateInputValue(date: Date): string {
  return localDateTime(date).slice(0, 16)
}

export function dateAtStartOfDay(date: Date): Date {
  return startOfDay(date)
}

export function daysForView(date: Date, view: CalendarView, weekStartsOn = 1): Date[] {
  if (view === 'day') {
    return [startOfDay(date)]
  }

  if (view === 'week') {
    const start = startOfWeek(date, { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }

  const start = startOfWeek(startOfMonth(date), { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

export function rangeForView(date: Date, view: CalendarView, weekStartsOn = 1): CalendarDateRange {
  const days = daysForView(date, view, weekStartsOn)
  const start = days[0] ?? startOfDay(date)

  return { start, end: addDays(start, days.length) }
}

export interface CalendarTitle {
  months: string
  year: string
}

export function formatCalendarTitle(date: Date, view: CalendarView, locale = 'en-US'): CalendarTitle {
  const months = new Intl.DateTimeFormat(locale, { month: 'long' })
  const shortMonths = new Intl.DateTimeFormat(locale, { month: 'short' })
  const shortMonthYear = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })

  if (view === 'month') {
    return { months: months.format(date), year: String(date.getFullYear()) }
  }

  const days = daysForView(date, view)
  const first = days[0] ?? date
  const last = days[days.length - 1] ?? date
  const year = String(last.getFullYear())

  if (first.getFullYear() === last.getFullYear() && first.getMonth() === last.getMonth()) {
    return { months: months.format(first), year }
  }

  const firstMonth = first.getFullYear() === last.getFullYear() ? shortMonths.format(first) : shortMonthYear.format(first)
  return { months: `${firstMonth} – ${shortMonths.format(last)}`, year }
}

export function formatMonthLabel(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)
}

export function monthGridRange(date: Date, weekStartsOn = 1): CalendarDateRange {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 })

  return { start, end: addDays(start, 42) }
}

export function weekIndexForDate(date: Date, firstWeek: Date, weekCount: number): number {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const index = differenceInCalendarWeeks(weekStart, firstWeek, { weekStartsOn: 1 })

  return Math.min(Math.max(index, 0), Math.max(weekCount - 1, 0))
}

export function stepDate(date: Date, view: CalendarView, direction: -1 | 1): Date {
  if (view === 'month') {
    return addMonths(date, direction)
  }

  return addDays(date, view === 'day' ? direction : 7 * direction)
}

export function isSameDate(left: Date, right: Date): boolean {
  return differenceInCalendarDays(left, right) === 0
}

export function monthViewFocusDate(date: Date, today = new Date()): Date {
  return isSameDate(date, today) ? startOfMonth(date) : date
}

export function eventCoversDay(event: { start: string, end: string }, date: Date): boolean {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const dayStart = startOfDay(date)
  const nextDay = addDays(dayStart, 1)

  return start < nextDay && end > dayStart
}

export function minutesFromPointer(clientY: number, rect: DOMRect): number {
  const minutes = (clientY - rect.top) / (HOUR_HEIGHT / 60)
  return Math.min(DAY_MINUTES - SNAP_MINUTES, Math.max(0, Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES))
}

export function dateAtMinutes(day: Date, minutes: number): Date {
  const result = startOfDay(day)
  result.setMinutes(minutes)
  return result
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function weekDayNames(locale = 'en-US', weekStartsOn = 1): string[] {
  const start = startOfWeek(new Date(2024, 0, 7), { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 })

  return Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(addDays(start, index)))
}

export function isDateInMonth(date: Date, reference: Date): boolean {
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear()
}
