# Nuxt UI Calendar

A Nuxt module that provides the Calendar template's core UI and interactions as reusable components and composables. It includes day, week and month views, an optional standalone sidebar with a mini calendar, event editing and search overlays, drag and resize gestures, keyboard shortcuts, calendar visibility filters, optimistic updates, and an offline mutation queue.

The module provides client-side UI. The host application owns event loading and persistence through props and an optional adapter. `calendars` is optional; omit it to use the calendar without calendar filters or calendar assignments.

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

`CalendarApp` provides a `UApp` boundary for its overlays and toast feedback. It renders only the calendar and toolbar, and exposes its controller through a component ref. `CalendarSidebar` is a separate component that accepts this controller, so the host application can place it in its own layout.

Buttons, checkboxes, badges and tabs use Nuxt UI's default component shapes. Customize their defaults centrally with Nuxt UI's `app.config.ts`:

```ts
export default defineAppConfig({
  ui: {
    button: { slots: { base: 'rounded-lg' } },
    checkbox: { slots: { base: 'rounded-md' } },
    badge: { slots: { base: 'rounded-full' } }
  }
})
```

Use `v-model:date` and `v-model:view` when the host router should control the selected range. The `initialDate` and `initialView` props set an uncontrolled starting point.

Calendar dates and labels inherit the locale configured on the host app's `<UApp :locale="...">`. Set the `locale` prop on `CalendarApp` to override it for this calendar.

## Customize the toolbar

`CalendarApp` exposes scoped slots for the view selector and range navigation. Each slot receives the current `date` and `view`, plus `setView`, `goToPrevious`, `goToToday` and `goToNext` actions. The `view-switcher` slot also receives the supported `views` (`day`, `week` and `month`). Leaving a slot unused keeps its default control. Set `view-switcher-placement="right"` to move the default selector or your custom `view-switcher` slot after the toolbar actions; the default placement is `center`.

```vue
<CalendarApp v-model:events="events" view-switcher-placement="right">
  <template #view-switcher="{ view, views, setView }">
    <div role="group" aria-label="Calendar view" class="flex gap-1">
      <UButton
        v-for="option in views"
        :key="option"
        :variant="view === option ? 'solid' : 'ghost'"
        @click="setView(option)"
      >
        {{ option }}
      </UButton>
    </div>
  </template>

  <template #previous="{ goToPrevious }">
    <UButton icon="i-lucide-chevron-left" aria-label="Previous range" @click="goToPrevious" />
  </template>

  <template #today="{ goToToday }">
    <UButton label="Today" @click="goToToday" />
  </template>

  <template #next="{ goToNext }">
    <UButton icon="i-lucide-chevron-right" aria-label="Next range" @click="goToNext" />
  </template>
</CalendarApp>
```

The slot context is typed as `CalendarToolbarSlotProps` from `@evanschleret/nuxt-ui-calendar/runtime/types`.

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

For standalone events that do not belong to a named calendar, omit `calendarId` and `calendars`:

```vue
<CalendarApp v-model:events="events" />
```

`CalendarSidebar` is optional. When you provide calendars without the sidebar, control their visibility with `v-model:visible-calendar-ids`:

```vue
<script setup lang="ts">
const visibleCalendarIds = ref(['personal', 'work'])

function toggleCalendar(id: string) {
  visibleCalendarIds.value = visibleCalendarIds.value.includes(id)
    ? visibleCalendarIds.value.filter(visibleId => visibleId !== id)
    : [...visibleCalendarIds.value, id]
}
</script>

<template>
  <div v-for="item in calendars" :key="item.id">
    <UCheckbox
      :label="item.name"
      :model-value="visibleCalendarIds.includes(item.id)"
      @update:model-value="toggleCalendar(item.id)"
    />
  </div>

  <CalendarApp
    v-model:events="events"
    v-model:visible-calendar-ids="visibleCalendarIds"
    :calendars="calendars"
  />
</template>
```

The model contains the IDs of displayed calendars. Start it with all calendar IDs to display everything, or with an empty array to hide them all. The sidebar uses this same model internally.

Compose the optional sidebar next to the calendar with a template ref:

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import type { CalendarAppExpose } from '@evanschleret/nuxt-ui-calendar/runtime/types'

const calendarApp = useTemplateRef<CalendarAppExpose>('calendarApp')
const sidebarOpen = ref(true)
</script>

<template>
  <div class="flex h-screen min-h-0">
    <CalendarSidebar v-if="calendarApp?.calendar" v-model:open="sidebarOpen" :calendar="calendarApp.calendar" />
    <CalendarApp ref="calendarApp" v-model:events="events" :calendars="calendars" class="min-w-0 flex-1" />
  </div>
</template>
```

Control the sidebar's visibility with `v-model:open`, and customize its bottom area with the `footer` slot.
The `header`, `content`, `search`, `calendars-header`, `calendar-list`, `calendar`, `mini-calendar` and `footer` slots let you replace the corresponding areas. The calendar item slot receives `item`, `selected` and a `toggle` action; the calendar list slot receives `calendars`, `visibleCalendarIds`, `isVisible` and `toggleCalendar`.

## Custom event modal

Pass your own Vue component through `eventModal` to replace the built-in create and edit modal. The component receives `event`, `calendars`, `initialStart`, `allDay` and `locale`, and must emit the typed `close` result. This same component opens from double-clicks and the create buttons. Keyboard shortcuts are opt-in with the `shortcuts` prop.

```vue
<script setup lang="ts">
import CustomEventModal from '~/components/CustomEventModal.vue'
</script>

<template>
  <CalendarApp
    v-model:events="events"
    :calendars="calendars"
    :event-modal="CustomEventModal"
  />
</template>
```

Type the custom component against the public modal contract:

```vue
<script setup lang="ts">
import type { CalendarEventModalProps, CalendarEventModalResult } from '@evanschleret/nuxt-ui-calendar/runtime/types'

defineProps<CalendarEventModalProps>()
const emit = defineEmits<{ close: [result: CalendarEventModalResult] }>()
</script>
```

Emit `null` to cancel, `{ action: 'save', event }` to create or update an event, or `{ action: 'delete' }` to request deletion of the current event. Deletion still uses the calendar's confirmation dialog and persistence flow.

Events use floating local datetime strings in `YYYY-MM-DDTHH:mm:ss` form. Their displayed wall-clock time is the same in each viewer's timezone. For all-day events, `end` is exclusive and should be the following midnight.

## Components and composables

The module auto-registers these components with the configured prefix:

- `CalendarApp` renders the calendar and toolbar, and exposes its `CalendarController` as `calendar` on its component ref.
- `CalendarSidebar` takes that controller as a `calendar` prop and provides the mini calendar and calendar visibility toggles.
- `CalendarToolbar` provides view switching, range navigation, search and event creation.
- `CalendarWeekView` and `CalendarMonthView` render the calendar grids.
- `CalendarEventBlock` is the reusable event button used by both views.

`useCalendar()` returns the current date, view, visible events, calendars, navigation actions, event mutations and overlay actions inside `CalendarApp`. `useCalendarEvents()` provides visible events and an `eventsForDay` selector.

`shortcuts` enables `T` for today, `D`, `W` and `M` for views, `N` for a new event, `⌘K` / `Ctrl+K` for search and the arrow keys for previous and next ranges. It defaults to `false`, and the calendar does not display shortcut help. `infiniteScroll` controls month-view scrolling and defaults to `true`; set it to `false` to show the current six-week month grid without extending it while scrolling.

```vue
<CalendarApp :infinite-scroll="false" />
```

## Development

The `playground/` directory exercises the module against a small sample calendar. Use Bun for package management. Run `bun run dev:prepare` before the lint and typecheck scripts, and use `bun run verify:package` to check the built tarball in a fresh Nuxt consumer without building the consumer app.

## Versioning and support

The package is pre-1.0.0, so public APIs may change in minor releases before the first stable release. From 1.0.0 onward, releases follow Semantic Versioning: breaking API changes require a major version.

The peer dependency ranges are Nuxt `>=4.0.0` and Nuxt UI `^4.12.0`. See [SECURITY.md](SECURITY.md) for which package releases receive security fixes.

## Documentation

This README contains the installation guide, a minimal usage example, and the component and composable overview. The `playground/` directory contains a runnable example.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Use [GitHub Issues](https://github.com/evanschleret/nuxt-ui-calendar/issues) to report bugs or discuss feature requests.

## Security

See [SECURITY.md](SECURITY.md) for the supported versions and private vulnerability reporting instructions.

## License

This package is distributed under the MIT License. See [LICENSE](LICENSE) for the license text and retained upstream copyright notice.
