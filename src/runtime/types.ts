import type { Component, Ref, VNode } from 'vue'
import type { CalendarMessageKey, CalendarMessageParams } from './utils/i18n'

export type CalendarView = 'day' | 'week' | 'month'
export type CalendarColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'

export interface CalendarToolbarSlotProps {
  date: Date
  view: CalendarView
  views: readonly CalendarView[]
  setView: (view: CalendarView) => void
  goToPrevious: () => void
  goToToday: () => void
  goToNext: () => void
}

export interface CalendarAppSlots {
  'view-switcher'?: (props: CalendarToolbarSlotProps) => VNode[]
  previous?: (props: CalendarToolbarSlotProps) => VNode[]
  today?: (props: CalendarToolbarSlotProps) => VNode[]
  next?: (props: CalendarToolbarSlotProps) => VNode[]
}

export interface CalendarSidebarSlots {
  header?: (props: { calendar: CalendarController, close: () => void }) => VNode[]
  content?: (props: { calendar: CalendarController }) => VNode[]
  search?: (props: { calendar: CalendarController, openSearch: () => Promise<void>, shortcuts: boolean }) => VNode[]
  'calendars-header'?: (props: { calendars: CalendarDefinition[], visibleCount: number, totalCount: number }) => VNode[]
  'calendar-list'?: (props: { calendars: CalendarDefinition[], visibleCalendarIds: string[], isVisible: (id: string) => boolean, toggleCalendar: (id: string) => void }) => VNode[]
  calendar?: (props: { item: CalendarDefinition, selected: boolean, toggle: () => void }) => VNode[]
  'mini-calendar'?: (props: { date: Date, locale: string, setDate: (date: Date) => void }) => VNode[]
  footer?: (props: { calendar: CalendarController }) => VNode[]
}

export interface CalendarDefinition {
  id: string
  name: string
  color: CalendarColor
}

export interface CalendarEvent {
  id: string
  calendarId?: string
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
  visibleCalendarIds?: string[]
  adapter?: CalendarMutationAdapter
  eventModal?: CalendarEventModalComponent
  date?: Date | string
  view?: CalendarView
  viewSwitcherPlacement?: 'center' | 'right'
  initialDate?: Date | string
  initialView?: CalendarView
  storageKey?: string
  locale?: string
  shortcuts?: boolean
  infiniteScroll?: boolean
}

export type CalendarAppEmits = {
  (event: 'update:events', events: CalendarEvent[]): void
  (event: 'update:visibleCalendarIds', ids: string[]): void
  (event: 'update:date', date: Date): void
  (event: 'update:view', view: CalendarView): void
  (event: 'create' | 'update', eventData: CalendarEvent): void
  (event: 'delete', id: string): void
}

export interface CalendarController {
  date: Ref<Date>
  view: Ref<CalendarView>
  events: Ref<CalendarEvent[]>
  calendars: Ref<CalendarDefinition[]>
  visibleCalendarIds: Ref<string[]>
  visibleEvents: Ref<CalendarEvent[]>
  hiddenCalendarIds: Ref<string[]>
  online: Ref<boolean>
  pendingCount: Ref<number>
  error: Ref<string | null>
  monthLabelsVisible: Ref<boolean>
  locale: string
  t: (key: CalendarMessageKey, params?: CalendarMessageParams) => string
  shortcuts: boolean
  infiniteScroll: boolean
  setDate: (date: Date) => void
  setView: (view: CalendarView) => void
  move: (direction: -1 | 1) => void
  goToToday: () => void
  toggleCalendar: (id: string) => void
  setVisibleCalendarIds: (ids: string[]) => void
  eventsForDay: (date: Date) => CalendarEvent[]
  createEvent: (event: CalendarEvent) => Promise<void>
  updateEvent: (event: CalendarEvent) => Promise<void>
  removeEvent: (id: string) => Promise<void>
  openEvent: (event?: CalendarEvent, start?: Date, allDay?: boolean) => Promise<void>
  openSearch: () => Promise<void>
}

export interface CalendarAppExpose {
  calendar: CalendarController | undefined
}

export interface PositionedCalendarEvent {
  event: CalendarEvent
  top: number
  height: number
  left: number
  width: number
}

export interface AllDayPositionedEvent {
  event: CalendarEvent
  colStart: number
  colSpan: number
  lane: number
}
