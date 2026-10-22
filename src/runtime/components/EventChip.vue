<script setup lang="ts">
import { computed } from 'vue'
import { useCalendar } from '#imports'
import type { CalendarColor, CalendarEvent } from '../types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  event: CalendarEvent
  showTime?: boolean
}>(), {
  showTime: false
})

const calendar = useCalendar()

const eventBlockClasses: Record<CalendarColor, string> = {
  primary: 'bg-primary/15 hover:bg-primary/25 data-active:bg-primary/25 text-primary border-primary',
  secondary: 'bg-secondary/15 hover:bg-secondary/25 data-active:bg-secondary/25 text-secondary border-secondary',
  info: 'bg-info/15 hover:bg-info/25 data-active:bg-info/25 text-info border-info',
  success: 'bg-success/15 hover:bg-success/25 data-active:bg-success/25 text-success border-success',
  warning: 'bg-warning/15 hover:bg-warning/25 data-active:bg-warning/25 text-warning border-warning',
  error: 'bg-error/15 hover:bg-error/25 data-active:bg-error/25 text-error border-error'
}

const eventChipCompactClasses: Record<CalendarColor, string> = {
  primary: 'max-lg:bg-primary/15 max-lg:text-primary',
  secondary: 'max-lg:bg-secondary/15 max-lg:text-secondary',
  info: 'max-lg:bg-info/15 max-lg:text-info',
  success: 'max-lg:bg-success/15 max-lg:text-success',
  warning: 'max-lg:bg-warning/15 max-lg:text-warning',
  error: 'max-lg:bg-error/15 max-lg:text-error'
}

const calendarDotClasses: Record<CalendarColor, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error'
}

const eventOutlineClasses: Record<CalendarColor, string> = {
  primary: 'outline-primary/25',
  secondary: 'outline-secondary/25',
  info: 'outline-info/25',
  success: 'outline-success/25',
  warning: 'outline-warning/25',
  error: 'outline-error/25'
}

const calendarColor = computed(() => calendar.calendars.value.find(item => item.id === props.event.calendarId)?.color ?? 'primary')
const time = computed(() => new Intl.DateTimeFormat(calendar.locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(props.event.start)))
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    data-event
    class="flex min-w-0 items-center gap-1.5 rounded-full px-1.5 py-0.5 text-start text-xs transition-colors select-none focus-visible:outline-3"
    :class="[
      eventOutlineClasses[calendarColor],
      event.allDay
        ? eventBlockClasses[calendarColor]
        : ['text-default hover:bg-(--control-bg) data-active:bg-(--control-bg)', eventChipCompactClasses[calendarColor]]
    ]"
    :aria-label="event.allDay ? event.title : `${event.title}, ${time}`"
    @click.stop="calendar.openEvent(event)"
    @dblclick.stop
  >
    <span
      v-if="event.allDay"
      class="-mx-0.75 flex items-center justify-center rounded-full p-0.5"
      :class="calendarDotClasses[calendarColor]"
    >
      <UIcon name="i-lucide-calendar" class="size-2.5 shrink-0 text-inverted" />
    </span>
    <span v-else class="size-2 shrink-0 rounded-full max-lg:hidden" :class="calendarDotClasses[calendarColor]" />
    <span class="min-w-0 truncate font-medium">{{ event.title }}</span>
    <span v-if="showTime && !event.allDay" data-time class="ms-auto shrink-0 text-[11px] text-muted tabular-nums">
      {{ time }}
    </span>
  </button>
</template>
