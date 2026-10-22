<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCalendar } from '#imports'
import type { CalendarColor, CalendarEvent, PositionedCalendarEvent } from '../types'
import { addMinutes, localDateTime, SNAP_MINUTES } from '../utils/dates'

const props = withDefaults(defineProps<{
  event: CalendarEvent
  positioned?: PositionedCalendarEvent
  compact?: boolean
}>(), {
  compact: false
})

const calendar = useCalendar()
const previewEnd = ref<Date | null>(null)

const colorClasses: Record<CalendarColor, string> = {
  primary: 'border-primary/50 bg-primary/15 text-primary hover:bg-primary/25',
  secondary: 'border-secondary/50 bg-secondary/15 text-secondary hover:bg-secondary/25',
  info: 'border-info/50 bg-info/15 text-info hover:bg-info/25',
  success: 'border-success/50 bg-success/15 text-success hover:bg-success/25',
  warning: 'border-warning/50 bg-warning/15 text-warning hover:bg-warning/25',
  error: 'border-error/50 bg-error/15 text-error hover:bg-error/25'
}

const calendarColor = computed(() => calendar.calendars.value.find(item => item.id === props.event.calendarId)?.color ?? 'primary')
const timeLabel = computed(() => new Intl.DateTimeFormat(calendar.locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(props.event.start)))
const eventStyle = computed(() => {
  if (!props.positioned) {
    return undefined
  }

  return {
    top: `${props.positioned.top + 1}px`,
    height: `${(previewEnd.value ? Math.max(20, (previewEnd.value.getTime() - new Date(props.event.start).getTime()) / 60_000 * 64 / 60) : props.positioned.height) - 2}px`,
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

function resizeWithKeyboard(event: KeyboardEvent) {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
    return
  }

  event.preventDefault()
  const adjustment = event.key === 'ArrowUp' ? -SNAP_MINUTES : SNAP_MINUTES
  const end = addMinutes(new Date(props.event.end), adjustment)
  if (end > new Date(props.event.start)) {
    void calendar.updateEvent({ ...props.event, end: localDateTime(end) })
  }
}
</script>

<template>
  <div
    :style="eventStyle"
    :class="[
      'group min-w-0 overflow-hidden rounded-md border-l-2 text-xs',
      positioned ? 'absolute z-10' : '',
      compact ? 'min-h-5 w-full text-[11px] leading-5' : ''
    ]"
  >
    <button
      type="button"
      :aria-label="event.allDay ? `${event.title}, all day` : `${event.title}, ${timeLabel}`"
      :draggable="true"
      :class="[
        'flex h-full min-w-0 w-full cursor-pointer flex-col overflow-hidden px-1.5 py-1 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
        colorClasses[calendarColor],
        compact ? 'min-h-5 border-0 px-1 py-0 text-[11px] leading-5' : ''
      ]"
      @click.stop="calendar.openEvent(event)"
      @dragstart="onDragStart"
      @dblclick.stop
    >
      <span class="truncate font-medium">{{ event.title || 'Untitled event' }}</span>
      <span v-if="!compact && !event.allDay" class="truncate text-[10px] opacity-75">{{ timeLabel }}</span>
      <span v-if="compact && !event.allDay" class="hidden truncate text-[10px] opacity-75 sm:inline">{{ timeLabel }}</span>
    </button>
    <button
      v-if="positioned && !event.allDay"
      type="button"
      class="absolute inset-x-0 bottom-0 z-10 h-2 cursor-ns-resize bg-transparent opacity-0 focus:opacity-100 group-hover:opacity-100"
      :aria-label="`Resize ${event.title}`"
      @pointerdown="startResize"
      @keydown="resizeWithKeyboard"
      @click.stop
    />
  </div>
</template>
