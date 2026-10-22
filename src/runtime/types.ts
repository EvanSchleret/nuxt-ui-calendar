import type { Component, Ref } from 'vue'

export type CalendarView = 'day' | 'week' | 'month'
export type CalendarColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'

export interface CalendarDefinition {
  id: string
  name: string
  color: CalendarColor
}

export interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description?: string
  start: string
  end: string
  allDay?: boolean
}

export interface CalendarDateRange {
  start: Date
  end: Date
}

export type CalendarMutation =
  | { type: 'create'; event: CalendarEvent }
  | { type: 'update'; event: CalendarEvent }
  | { type: 'delete'; id: string }

export interface CalendarEventModalProps {
  event: CalendarEvent | null
  calendars: CalendarDefinition[]
  initialStart: Date
  allDay: boolean
  locale: string
}

export type CalendarEventModalResult =
  | { action: 'save'; event: CalendarEvent }
  | { action: 'delete' }
  | null

export type CalendarEventModalComponent = Component<CalendarEventModalProps>

export interface CalendarMutationAdapter {
  create: (event: CalendarEvent) => Promise<void>
  update: (event: CalendarEvent) => Promise<void>
  delete: (id: string) => Promise<void>
}

export interface CalendarAppProps {
  events?: CalendarEvent[]
  calendars?: CalendarDefinition[]
  adapter?: CalendarMutationAdapter
  eventModal?: CalendarEventModalComponent
  date?: Date | string
  view?: CalendarView
  initialDate?: Date | string
  initialView?: CalendarView
  storageKey?: string
  locale?: string
}

export type CalendarAppEmits = {
  (event: 'update:events', events: CalendarEvent[]): void
  (event: 'update:date', date: Date): void
  (event: 'update:view', view: CalendarView): void
  (event: 'create', eventData: CalendarEvent): void
  (event: 'update', eventData: CalendarEvent): void
  (event: 'delete', id: string): void
}

export interface CalendarController {
  date: Ref<Date>
  view: Ref<CalendarView>
  events: Ref<CalendarEvent[]>
  calendars: Ref<CalendarDefinition[]>
  visibleEvents: Ref<CalendarEvent[]>
  hiddenCalendarIds: Ref<string[]>
  online: Ref<boolean>
  pendingCount: Ref<number>
  error: Ref<string | null>
  locale: string
  setDate: (date: Date) => void
  setView: (view: CalendarView) => void
  move: (direction: -1 | 1) => void
  goToToday: () => void
  toggleCalendar: (id: string) => void
  eventsForDay: (date: Date) => CalendarEvent[]
  createEvent: (event: CalendarEvent) => Promise<void>
  updateEvent: (event: CalendarEvent) => Promise<void>
  removeEvent: (id: string) => Promise<void>
  openEvent: (event?: CalendarEvent, start?: Date, allDay?: boolean) => Promise<void>
  openSearch: () => Promise<void>
}

export interface PositionedCalendarEvent {
  event: CalendarEvent
  top: number
  height: number
  left: number
  width: number
}
