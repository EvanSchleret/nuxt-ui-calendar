import { describe, expect, it } from 'bun:test'
import { daysForView, localDateTime } from '../src/runtime/utils/dates'
import { hiddenCalendarIdsFor } from '../src/runtime/utils/calendars'
import { layoutDay } from '../src/runtime/utils/layout'
import type { CalendarDefinition, CalendarEvent } from '../src/runtime/types'
import { uiDefaults } from '../src/ui-config'

describe('calendar date utilities', () => {
  it('formats local datetimes without a timezone suffix', () => {
    const date = new Date(2026, 9, 22, 9, 15)

    expect(localDateTime(date)).toBe('2026-10-22T09:15:00')
  })

  it('returns a seven day week and a six week month grid', () => {
    const date = new Date(2026, 9, 22)

    expect(daysForView(date, 'week')).toHaveLength(7)
    expect(daysForView(date, 'month')).toHaveLength(42)
  })
})

describe('day event layout', () => {
  it('places overlapping events in separate columns', () => {
    const events: CalendarEvent[] = [
      { id: 'first', calendarId: 'work', title: 'First', start: '2026-10-22T09:00:00', end: '2026-10-22T10:00:00' },
      { id: 'second', calendarId: 'work', title: 'Second', start: '2026-10-22T09:30:00', end: '2026-10-22T10:30:00' }
    ]

    const positioned = layoutDay(events, new Date(2026, 9, 22))

    expect(positioned).toHaveLength(2)
    expect(positioned[0]?.left).not.toBe(positioned[1]?.left)
  })
})

describe('calendar visibility', () => {
  const calendars: CalendarDefinition[] = [
    { id: 'work', name: 'Work', color: 'info' },
    { id: 'personal', name: 'Personal', color: 'primary' }
  ]

  it('converts selected calendar ids to the hidden ids used by the controller', () => {
    expect(hiddenCalendarIdsFor(calendars, ['work'])).toEqual(['personal'])
  })

  it('supports hiding every calendar', () => {
    expect(hiddenCalendarIdsFor(calendars, [])).toEqual(['work', 'personal'])
  })
})

describe('calendar integration styles', () => {
  it('generates runtime utilities without resetting the host app styles', async () => {
    const stylesheet = await Bun.file(new URL('../src/runtime/assets/calendar.css', import.meta.url)).text()

    expect(stylesheet).toContain('@import "tailwindcss/theme.css" layer(theme)')
    expect(stylesheet).toContain('@import "tailwindcss/utilities.css" layer(utilities)')
    expect(stylesheet).toContain('@source "../components/**/*.vue"')
    expect(stylesheet).toContain('--color-primary: var(--ui-primary)')
    expect(stylesheet).not.toContain('#FF383C')
  })

  it('inherits semantic colors from the consuming Nuxt UI app', () => {
    expect(uiDefaults).not.toHaveProperty('colors')
  })
})
