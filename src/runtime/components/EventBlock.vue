<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCalendar } from '#imports'
import type { CalendarColor, CalendarEvent, PositionedCalendarEvent } from '../types'
import { addMinutes, localDateTime, SNAP_MINUTES } from '../utils/dates'

const props = defineProps<{
  event: CalendarEvent
  positioned?: PositionedCalendarEvent
}>()

const calendar = useCalendar()
const previewEnd = ref<Date | null>(null)

const eventBlockClasses: Record<CalendarColor, string> = {
  primary: 'uical:cal:bg-primary/15 uical:cal:hover:bg-primary/25 uical:cal:data-active:bg-primary/25 uical:cal:text-primary uical:cal:border-primary',
  secondary: 'uical:cal:bg-secondary/15 uical:cal:hover:bg-secondary/25 uical:cal:data-active:bg-secondary/25 uical:cal:text-secondary uical:cal:border-secondary',
  info: 'uical:cal:bg-info/15 uical:cal:hover:bg-info/25 uical:cal:data-active:bg-info/25 uical:cal:text-info uical:cal:border-info',
  success: 'uical:cal:bg-success/15 uical:cal:hover:bg-success/25 uical:cal:data-active:bg-success/25 uical:cal:text-success uical:cal:border-success',
  warning: 'uical:cal:bg-warning/15 uical:cal:hover:bg-warning/25 uical:cal:data-active:bg-warning/25 uical:cal:text-warning uical:cal:border-warning',
  error: 'uical:cal:bg-error/15 uical:cal:hover:bg-error/25 uical:cal:data-active:bg-error/25 uical:cal:text-error uical:cal:border-error'
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
const timeRange = computed(() => {
  const format = new Intl.DateTimeFormat(calendar.locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  return `${format.format(new Date(props.event.start))} – ${format.format(new Date(props.event.end))}`
})
const compact = computed(() => !!props.positioned && props.positioned.height < 40)
const eventStyle = computed(() => {
  if (!props.positioned) {
    return undefined
  }

  const height = previewEnd.value
    ? Math.max(30, (previewEnd.value.getTime() - new Date(props.event.start).getTime()) / 60_000 * 64 / 60)
    : props.positioned.height

  return {
    top: `${props.positioned.top + 2}px`,
    height: `${height - 3}px`,
    insetInlineStart: `calc(${props.positioned.left}% + 1px)`,
    width: `calc(${props.positioned.width}% - 2px)`
  }
})

function onDragStart(event: DragEvent) {
  event.dataTransfer?.setData('text/plain', props.event.id)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function startResize(event: PointerEvent) {
  if (!props.positioned || event.button !== 0) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  const initialY = event.clientY
  const initialEnd = new Date(props.event.end)

  const onMove = (pointerEvent: PointerEvent) => {
    const rawMinutes = (pointerEvent.clientY - initialY) / 64 * 60
    const snappedMinutes = Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES
    previewEnd.value = addMinutes(initialEnd, snappedMinutes)
  }

  const onUp = () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)

    const end = previewEnd.value
    previewEnd.value = null
    if (end && end > new Date(props.event.start)) {
      void calendar.updateEvent({ ...props.event, end: localDateTime(end) })
    }
  }

  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)
}
</script>

<template>
  <button
    type="button"
    data-event
    class="uical:cal:absolute uical:cal:flex uical:cal:flex-col uical:cal:items-start uical:cal:overflow-hidden uical:cal:rounded-xs uical:cal:px-3 uical:cal:py-1 uical:cal:text-left uical:cal:text-xs uical-transition-colors uical:cal:select-none uical-focus-outline"
    :class="[eventBlockClasses[calendarColor], eventOutlineClasses[calendarColor], 'uical:cal:z-10']"
    :style="eventStyle"
    :draggable="true"
    :aria-label="event.allDay ? calendar.t('allDayEvent', { title: event.title }) : `${event.title}, ${timeRange}`"
    @click.stop="calendar.openEvent(event)"
    @dragstart="onDragStart"
    @dblclick.stop
  >
    <span class="uical:cal:absolute uical:cal:inset-y-1 uical:cal:inset-s-1 uical:cal:w-1 uical:cal:rounded-full" :class="calendarDotClasses[calendarColor]" />
    <span class="uical:cal:w-full uical:cal:truncate uical-font-medium">{{ event.title }}</span>
    <span v-if="!compact" class="uical:cal:w-full uical:cal:truncate uical:cal:text-[10px] uical-tabular-nums uical:cal:opacity-80">{{ timeRange }}</span>
    <span
      v-if="!event.allDay"
      data-resize-handle
      role="separator"
      aria-orientation="horizontal"
      :aria-label="calendar.t('resizeEvent', { title: event.title })"
      tabindex="0"
      class="uical:cal:absolute uical:cal:inset-x-0 uical:cal:bottom-0 uical:cal:h-2 uical:cal:cursor-ns-resize"
      @pointerdown="startResize"
    />
  </button>
</template>
