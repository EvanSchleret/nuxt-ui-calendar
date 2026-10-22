<script setup lang="ts">
import { differenceInMilliseconds } from 'date-fns'
import { useCalendar } from '#imports'
import type { PositionedCalendarEvent } from '../types'
import { dateAtMinutes, HOUR_HEIGHT, localDateTime, minutesFromPointer } from '../utils/dates'

const props = defineProps<{
  day: Date
  events: PositionedCalendarEvent[]
  now: Date
}>()

const calendar = useCalendar()

function createAt(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  void calendar.openEvent(undefined, dateAtMinutes(props.day, minutesFromPointer(event.clientY, rect)))
}

function dropEvent(event: DragEvent) {
  event.preventDefault()
  const id = event.dataTransfer?.getData('text/plain')
  const current = calendar.events.value.find(item => item.id === id)
  if (!current) {
    return
  }

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const start = dateAtMinutes(props.day, minutesFromPointer(event.clientY, rect))
  const duration = Math.max(15, differenceInMilliseconds(new Date(current.end), new Date(current.start)) / 60_000)
  const end = new Date(start.getTime() + duration * 60_000)

  void calendar.updateEvent({ ...current, start: localDateTime(start), end: localDateTime(end) })
}

</script>

<template>
  <div
    data-day-column
    :data-date="localDateTime(day).slice(0, 10)"
    class="relative snap-start border-s border-default"
    :style="{ height: `${24 * HOUR_HEIGHT}px` }"
    @dblclick="createAt"
    @dragover.prevent
    @drop="dropEvent"
  >
    <div
      v-for="hour in 23"
      :key="hour"
      class="pointer-events-none absolute inset-x-0 snap-start border-t border-default"
      :style="{ top: `${hour * HOUR_HEIGHT}px` }"
    />

    <CalendarEventBlock
      v-for="positioned in events"
      :key="positioned.event.id"
      :event="positioned.event"
      :positioned="positioned"
    />

    <div
      v-if="day.toDateString() === now.toDateString()"
      class="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-error"
      :style="{ top: `${(now.getHours() * 60 + now.getMinutes()) * HOUR_HEIGHT / 60}px` }"
    >
      <span class="absolute -top-1 -left-1.5 size-3 rounded-full bg-error" />
    </div>

  </div>
</template>
