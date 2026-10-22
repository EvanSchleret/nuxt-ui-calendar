# Nuxt UI Calendar

A Nuxt module that provides the Calendar template's core UI and interactions as reusable components and composables. It includes day, week and month views, a responsive sidebar with a mini calendar, event editing and search overlays, drag and resize gestures, keyboard shortcuts, calendar visibility filters, optimistic updates, and an offline mutation queue.

The module provides client-side UI. The host application owns event loading and persistence through props and an optional adapter.

Based on the [Nuxt UI Calendar template](https://github.com/nuxt-ui-templates/calendar), distributed under the MIT license.

## Install

```sh
bun add @evanschleret/nuxt-ui-calendar @nuxt/ui
```

```ts
export default defineNuxtConfig({
  modules: ['@evanschleret/nuxt-ui-calendar']
})
```

The module registers components with the `Calendar` prefix and includes its styles. Configure the prefix in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@evanschleret/nuxt-ui-calendar'],
  uiCalendar: {
    prefix: 'Calendar'
  }
})
```

`CalendarApp` provides a `UApp` boundary for its overlays and toast feedback.

Use `v-model:date` and `v-model:view` when the host router should control the selected range. The `initialDate` and `initialView` props set an uncontrolled starting point.

## Use

```vue
<script setup lang="ts">
import type { CalendarDefinition, CalendarEvent } from '@evanschleret/nuxt-ui-calendar/runtime/types'

const calendars: CalendarDefinition[] = [
  { id: 'personal', name: 'Personal', color: 'primary' },
  { id: 'work', name: 'Work', color: 'info' }
]

const events = ref<CalendarEvent[]>([
  {
    id: 'planning',
    calendarId: 'work',
    title: 'Weekly planning',
    start: '2026-10-22T09:00:00',
    end: '2026-10-22T09:45:00'
  }
])

const adapter = {
  async create(event: CalendarEvent) {
    await $fetch('/api/events', { method: 'POST', body: event })
  },
  async update(event: CalendarEvent) {
    await $fetch(`/api/events/${event.id}`, { method: 'PATCH', body: event })
  },
  async delete(id: string) {
    await $fetch(`/api/events/${id}`, { method: 'DELETE' })
  }
}
</script>

<template>
  <CalendarApp
    v-model:events="events"
    :calendars="calendars"
    :adapter="adapter"
  />
</template>
```

When no `adapter` is provided, changes update `v-model:events` immediately and emit `create`, `update` and `delete` events for the host to persist. With an adapter, mutations are optimistic, queued in local storage while offline, and replayed when the browser reconnects.

Events use floating local datetime strings in `YYYY-MM-DDTHH:mm:ss` form. Their displayed wall-clock time is the same in each viewer's timezone. For all-day events, `end` is exclusive and should be the following midnight.

## Components and composables

The module auto-registers these components with the configured prefix:

- `CalendarApp` composes the full responsive calendar interface.
- `CalendarSidebar` provides the mini calendar and calendar visibility toggles.
- `CalendarToolbar` provides view switching, range navigation, search and event creation.
- `CalendarWeekView` and `CalendarMonthView` render the calendar grids.
- `CalendarEventBlock` is the reusable event button used by both views.

`useCalendar()` returns the current date, view, visible events, calendars, navigation actions, event mutations and overlay actions inside `CalendarApp`. `useCalendarEvents()` provides visible events and an `eventsForDay` selector.

Keyboard shortcuts are `T` for today, `D`, `W` and `M` for views, `N` for a new event, `⌘K` / `Ctrl+K` for search and the arrow keys for previous and next ranges.

## Development

The `playground/` directory exercises the module against a small sample calendar. Use Bun for package management and `bun test` for the utility tests.
