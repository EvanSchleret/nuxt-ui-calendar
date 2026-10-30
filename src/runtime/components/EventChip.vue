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
  primary: 'uical:cal:bg-primary/15 uical:cal:hover:bg-primary/25 uical:cal:data-active:bg-primary/25 uical:cal:text-primary uical:cal:border-primary',
  secondary: 'uical:cal:bg-secondary/15 uical:cal:hover:bg-secondary/25 uical:cal:data-active:bg-secondary/25 uical:cal:text-secondary uical:cal:border-secondary',
  info: 'uical:cal:bg-info/15 uical:cal:hover:bg-info/25 uical:cal:data-active:bg-info/25 uical:cal:text-info uical:cal:border-info',
  success: 'uical:cal:bg-success/15 uical:cal:hover:bg-success/25 uical:cal:data-active:bg-success/25 uical:cal:text-success uical:cal:border-success',
  warning: 'uical:cal:bg-warning/15 uical:cal:hover:bg-warning/25 uical:cal:data-active:bg-warning/25 uical:cal:text-warning uical:cal:border-warning',
  error: 'uical:cal:bg-error/15 uical:cal:hover:bg-error/25 uical:cal:data-active:bg-error/25 uical:cal:text-error uical:cal:border-error'
}

const eventChipCompactClasses: Record<CalendarColor, string> = {
  primary: 'uical:cal:max-lg:bg-primary/15 uical:cal:max-lg:text-primary',
  secondary: 'uical:cal:max-lg:bg-secondary/15 uical:cal:max-lg:text-secondary',
  info: 'uical:cal:max-lg:bg-info/15 uical:cal:max-lg:text-info',
  success: 'uical:cal:max-lg:bg-success/15 uical:cal:max-lg:text-success',
  warning: 'uical:cal:max-lg:bg-warning/15 uical:cal:max-lg:text-warning',
  error: 'uical:cal:max-lg:bg-error/15 uical:cal:max-lg:text-error'
}

const calendarDotClasses: Record<CalendarColor, string> = {
  primary: 'uical:cal:bg-primary',
  secondary: 'uical:cal:bg-secondary',
  info: 'uical:cal:bg-info',
  success: 'uical:cal:bg-success',
  warning: 'uical:cal:bg-warning',
  error: 'uical:cal:bg-error'
}

const eventOutlineClasses: Record<CalendarColor, string> = {
  primary: 'uical-outline-primary',
  secondary: 'uical-outline-secondary',
  info: 'uical-outline-info',
  success: 'uical-outline-success',
  warning: 'uical-outline-warning',
  error: 'uical-outline-error'
}

const calendarColor = computed(() => calendar.calendars.value.find(item => item.id === props.event.calendarId)?.color ?? 'primary')
const time = computed(() => new Intl.DateTimeFormat(calendar.locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(props.event.start)))
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    data-event
    class="uical:cal:flex uical:cal:min-w-0 uical:cal:items-center uical:cal:gap-1.5 uical:cal:rounded-full uical:cal:px-1.5 uical:cal:py-0.5 uical:cal:text-start uical:cal:text-xs uical-transition-colors uical:cal:select-none uical-focus-outline uical:cal:max-lg:rounded-sm uical:cal:max-lg:px-1"
    :class="[
      eventOutlineClasses[calendarColor],
      event.allDay
        ? eventBlockClasses[calendarColor]
        : ['uical:cal:text-default uical:cal:hover:bg-(--control-bg) uical:cal:data-active:bg-(--control-bg)', eventChipCompactClasses[calendarColor]]
    ]"
    :aria-label="event.allDay ? calendar.t('allDayEvent', { title: event.title }) : `${event.title}, ${time}`"
    @click.stop="calendar.openEvent(event)"
    @dblclick.stop
  >
    <span
      v-if="event.allDay"
      class="uical:cal:-mx-0.75 uical:cal:flex uical:cal:items-center uical:cal:justify-center uical:cal:rounded-full uical:cal:p-0.5"
      :class="calendarDotClasses[calendarColor]"
    >
      <UIcon name="i-lucide-calendar" class="uical:cal:size-2.5 uical:cal:shrink-0 uical:cal:text-inverted" />
    </span>
    <span v-else class="uical:cal:size-2 uical:cal:shrink-0 uical:cal:rounded-full uical:cal:max-lg:hidden" :class="calendarDotClasses[calendarColor]" />
    <span class="uical:cal:min-w-0 uical:cal:truncate uical-font-medium uical:cal:max-lg:flex-1 uical:cal:max-lg:text-clip uical:cal:max-lg:[mask-image:linear-gradient(to_right,black_calc(100%-0.75rem),transparent)]">{{ event.title }}</span>
    <span v-if="showTime && !event.allDay" data-time class="uical:cal:ms-auto uical:cal:shrink-0 uical:cal:text-[11px] uical:cal:text-muted uical-tabular-nums">
      {{ time }}
    </span>
  </button>
</template>
