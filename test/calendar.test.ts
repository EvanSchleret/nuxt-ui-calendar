import { describe, expect, it } from 'bun:test'
import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import { resolve } from 'node:path'
import { daysForView, formatCalendarTitle, localDateTime, monthViewFocusDate, stepDate, weekIndexForDate } from '../src/runtime/utils/dates'
import { hiddenCalendarIdsFor } from '../src/runtime/utils/calendars'
import { layoutDay } from '../src/runtime/utils/layout'
import { translateCalendar } from '../src/runtime/utils/i18n'
import type { CalendarDefinition, CalendarEvent } from '../src/runtime/types'

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

  it('returns every day in the selected year', () => {
    const leapYear = daysForView(new Date(2024, 9, 22), 'year')
    const regularYear = daysForView(new Date(2026, 9, 22), 'year')

    expect(leapYear).toHaveLength(366)
    expect(leapYear[0]).toEqual(new Date(2024, 0, 1))
    expect(leapYear.at(-1)).toEqual(new Date(2024, 11, 31))
    expect(regularYear).toHaveLength(365)
  })

  it('steps and labels the year view', () => {
    expect(stepDate(new Date(2024, 1, 29), 'year', 1)).toEqual(new Date(2025, 1, 28))
    expect(formatCalendarTitle(new Date(2026, 9, 22), 'year')).toEqual({ months: '2026', year: '' })
  })

  it('locates the week containing the selected date', () => {
    const firstWeek = new Date(2026, 9, 5)

    expect(weekIndexForDate(new Date(2026, 9, 22), firstWeek, 10)).toBe(2)
    expect(weekIndexForDate(new Date(2026, 9, 3), firstWeek, 10)).toBe(0)
  })

  it('anchors today to the start of its month in the month view', () => {
    const today = new Date(2026, 9, 22)

    expect(monthViewFocusDate(today, today)).toEqual(new Date(2026, 9, 1))
    expect(monthViewFocusDate(new Date(2026, 9, 12), today)).toEqual(new Date(2026, 9, 12))
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

describe('calendar translations', () => {
  it('uses the base language from a regional locale', () => {
    expect(translateCalendar('fr-CH', 'day')).toBe('Jour')
    expect(translateCalendar('fr-CH', 'allDay')).toBe('toute la journée')
    expect(translateCalendar('fr-CH', 'allDayCheckbox')).toBe('Toute la journée')
    expect(translateCalendar('fr-CH', 'week')).toBe('Semaine')
    expect(translateCalendar('fr-CH', 'month')).toBe('Mois')
    expect(translateCalendar('fr-CH', 'year')).toBe('Année')
    expect(translateCalendar('fr-CH', 'today')).toBe('Aujourd’hui')
  })

  it('interpolates localized accessible labels', () => {
    expect(translateCalendar('fr-CH', 'openDate', { date: 'jeudi 22 octobre 2026' })).toBe('Ouvrir le jeudi 22 octobre 2026')
    expect(translateCalendar('fr-CH', 'openMonth', { month: 'octobre' })).toBe('Ouvrir octobre')
  })

  it('falls back to English when a language has no calendar translations', () => {
    expect(translateCalendar('ja-JP', 'today')).toBe('Today')
  })
})

describe('calendar integration styles', () => {
  const stylesheetPath = resolve(import.meta.dir, '../src/runtime/assets/calendar.css')
  const stylesheet = Bun.file(stylesheetPath)

  it('follows the consuming Nuxt UI theme in light mode when the system is dark', async () => {
    const calendarCss = await stylesheet.text()
    const nuxtUiCss = await Bun.file(resolve(import.meta.dir, '../node_modules/@nuxt/ui/dist/runtime/index.css')).text()

    expect(nuxtUiCss).toMatch(/\.light[^{}]*\{[^}]*--ui-bg:#fff/)
    expect(calendarCss).toContain('var(--ui-bg)')
    expect(calendarCss).not.toContain('prefers-color-scheme')
  })

  it('follows the consuming Nuxt UI theme in dark mode when the system is light', async () => {
    const calendarCss = await stylesheet.text()
    const nuxtUiCss = await Bun.file(resolve(import.meta.dir, '../node_modules/@nuxt/ui/dist/runtime/index.css')).text()

    expect(nuxtUiCss).toMatch(/\.dark\{[^}]*--ui-bg:var\(--ui-color-neutral-900\)/)
    expect(calendarCss).toContain('var(--ui-bg)')
    expect(calendarCss).not.toContain('prefers-color-scheme')
  })

  it('compiles package utilities with a prefix and confines every selector to the calendar', async () => {
    const compiler = await compile(await stylesheet.text(), {
      base: resolve(import.meta.dir, '../src/runtime/assets'),
      from: stylesheetPath,
      onDependency() {}
    })
    const compiledCss = compiler.build(new Scanner({ sources: compiler.sources }).scan())
    const selectorLines = compiledCss.split('\n').filter(line => /^\s*(?:\.|:where\(|:is\()/.test(line))
    const classNames = selectorLines.flatMap(line => [...line.matchAll(/\.((?:\\.|[a-zA-Z0-9_-])+)/g)].map(match => match[1]!))

    expect(compiledCss).toContain('.uical\\:cal\\:flex:where(.ui-calendar, .ui-calendar *)')
    expect(compiledCss).toContain('.uical\\:cal\\:bg-default:where(.ui-calendar, .ui-calendar *)')
    expect(compiledCss).not.toContain(':root')
    expect(compiledCss).not.toContain(':host')
    expect(compiledCss).not.toContain('@property')
    expect(compiledCss).not.toContain('prefers-color-scheme')
    expect(compiledCss).not.toMatch(/\n\s*(?:\*|::before|::after|::backdrop)\s*\{/)
    expect(classNames.length).toBeGreaterThan(0)

    for (const className of classNames) {
      expect(className === 'ui-calendar' || className.startsWith('uical\\:cal\\:') || className.startsWith('uical-')).toBe(true)
    }
  })

  it('does not alter the consuming app Nuxt UI defaults', async () => {
    const moduleSource = await Bun.file(resolve(import.meta.dir, '../src/module.ts')).text()

    expect(moduleSource).not.toContain('appConfig.ui')
  })
})
