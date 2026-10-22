<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { CalendarDefinition, CalendarEvent, CalendarView } from '../types'

const props = defineProps<{
  events: CalendarEvent[]
  calendars: CalendarDefinition[]
  locale: string
  shortcuts: boolean
  view: CalendarView
  hiddenCalendarIds: string[]
  setView: (view: CalendarView) => void
  goToToday: () => void
  toggleCalendar: (id: string) => void
}>()

const emit = defineEmits<{ close: [event: CalendarEvent | null] }>()
const open = ref(true)
const hiddenCalendarIds = ref([...props.hiddenCalendarIds])
const selectedEvent = ref<CalendarEvent | null>(null)

const views: { label: string, value: CalendarView, icon: string, key: string }[] = [
  { label: 'Day', value: 'day', icon: 'i-lucide-calendar-range', key: 'd' },
  { label: 'Week', value: 'week', icon: 'i-lucide-calendar-days', key: 'w' },
  { label: 'Month', value: 'month', icon: 'i-lucide-calendar', key: 'm' }
]

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => [{
  id: 'actions',
  items: [{
    label: 'Go to today',
    icon: 'i-lucide-calendar-check',
    kbds: props.shortcuts ? [{ value: 't', variant: 'soft' }] : undefined,
    onSelect: () => props.goToToday()
  }]
}, {
  id: 'views',
  label: 'Views',
  items: views.map(item => ({
    label: item.label,
    icon: item.icon,
    kbds: props.shortcuts ? [{ value: item.key, variant: 'soft' }] : undefined,
    active: props.view === item.value,
    onSelect: () => props.setView(item.value)
  }))
}, {
  id: 'calendars',
  label: 'Calendars',
  slot: 'calendar',
  items: props.calendars.map(item => ({
    label: item.name,
    chip: { color: item.color },
    checked: !hiddenCalendarIds.value.includes(item.id),
    onSelect: (event: Event) => {
      event.preventDefault()
      props.toggleCalendar(item.id)
      hiddenCalendarIds.value = hiddenCalendarIds.value.includes(item.id)
        ? hiddenCalendarIds.value.filter(calendarId => calendarId !== item.id)
        : [...hiddenCalendarIds.value, item.id]
    }
  }))
}, {
  id: 'events',
  label: 'Events',
  items: props.events.map(event => ({
    label: event.title,
    suffix: new Intl.DateTimeFormat(props.locale, { dateStyle: 'medium', timeStyle: event.allDay ? undefined : 'short' }).format(new Date(event.start)),
    chip: { color: props.calendars.find(item => item.id === event.calendarId)?.color },
    onSelect: () => {
      selectedEvent.value = event
    }
  }))
}])

function close() {
  emit('close', selectedEvent.value)
}
</script>

<template>
  <UModal v-model:open="open" title="Search calendar" :ui="{ content: 'sm:max-w-2xl' }" @update:open="value => !value && close()">
    <template #content>
      <UCommandPalette
        :groups="groups"
        placeholder="Search events, switch views..."
        close
        class="h-full sm:h-96"
        @update:model-value="open = false"
      >
        <template #calendar-trailing="{ item, ui }">
          <UIcon v-if="item.checked" name="i-lucide-check" :class="ui.itemTrailingIcon()" />
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
