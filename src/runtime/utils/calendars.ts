import type { CalendarDefinition } from '../types'

export function hiddenCalendarIdsFor(calendars: CalendarDefinition[], visibleCalendarIds: readonly string[]): string[] {
  const visibleIds = new Set(visibleCalendarIds)
  return calendars.filter(calendar => !visibleIds.has(calendar.id)).map(calendar => calendar.id)
}
