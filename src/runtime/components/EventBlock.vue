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
  primary: 'bg-primary/15 hover:bg-primary/25 data-active:bg-primary/25 text-primary border-primary',
  secondary: 'bg-secondary/15 hover:bg-secondary/25 data-active:bg-secondary/25 text-secondary border-secondary',
  info: 'bg-info/15 hover:bg-info/25 data-active:bg-info/25 text-info border-info',
  success: 'bg-success/15 hover:bg-success/25 data-active:bg-success/25 text-success border-success',
  warning: 'bg-warning/15 hover:bg-warning/25 data-active:bg-warning/25 text-warning border-warning',
  error: 'bg-error/15 hover:bg-error/25 data-active:bg-error/25 text-error border-error'
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
    class="absolute flex flex-col items-start overflow-hidden rounded-xs px-3 py-1 text-left text-xs transition-colors select-none focus-visible:outline-3"
    :class="[eventBlockClasses[calendarColor], eventOutlineClasses[calendarColor], 'z-10']"
    :style="eventStyle"
    :draggable="true"
    :aria-label="event.allDay ? calendar.t('allDayEvent', { title: event.title }) : `${event.title}, ${timeRange}`"
    @click.stop="calendar.openEvent(event)"
    @dragstart="onDragStart"
    @dblclick.stop
  >
    <span class="absolute inset-y-1 inset-s-1 w-1 rounded-full" :class="calendarDotClasses[calendarColor]" />
    <span class="w-full truncate font-medium">{{ event.title }}</span>
    <span v-if="!compact" class="w-full truncate text-[10px] tabular-nums opacity-80">{{ timeRange }}</span>
    <span
      v-if="!event.allDay"
      data-resize-handle
      role="separator"
      aria-orientation="horizontal"
      :aria-label="calendar.t('resizeEvent', { title: event.title })"
      tabindex="0"
      class="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
      @pointerdown="startResize"
    />
  </button>
</template>
