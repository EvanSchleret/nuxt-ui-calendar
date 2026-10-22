<script setup lang="ts">
import { computed } from 'vue'
import { addDays, differenceInCalendarDays } from 'date-fns'
import { useCalendar } from '#imports'
import type { CalendarEvent } from '../types'
import { daysForView, isDateInMonth, localDateTime, weekDayNames } from '../utils/dates'

const calendar = useCalendar()
const days = computed(() => daysForView(calendar.date.value, 'month'))
const weekdays = computed(() => weekDayNames(calendar.locale))

function dayEvents(day: Date): CalendarEvent[] {
  return calendar.eventsForDay(day)
}

function createAllDay(day: Date) {
  void calendar.openEvent(undefined, day, true)
}

function dropEvent(day: Date, dragEvent: DragEvent) {
  dragEvent.preventDefault()
  const id = dragEvent.dataTransfer?.getData('text/plain')
  const event = calendar.events.value.find(item => item.id === id)
  if (!event) {
    return
  }

  const start = new Date(event.start)
  const end = new Date(event.end)
  const dayDelta = differenceInCalendarDays(day, start)
  const movedStart = addDays(start, dayDelta)
  const movedEnd = addDays(end, dayDelta)

  void calendar.updateEvent({ ...event, start: localDateTime(movedStart), end: localDateTime(movedEnd) })
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="grid grid-cols-7 border-b border-default bg-default/90">
      <div v-for="weekday in weekdays" :key="weekday" class="py-2 text-center text-xs font-medium text-muted">{{ weekday }}</div>
    </div>

    <div class="calendar-month-grid grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
      <div
        v-for="day in days"
        :key="localDateTime(day).slice(0, 10)"
        :data-date="localDateTime(day).slice(0, 10)"
        class="group min-h-20 overflow-hidden border-r border-b border-default p-1 sm:p-2"
        :class="isDateInMonth(day, calendar.date.value) ? 'bg-default' : 'bg-elevated/30'"
        @dblclick="createAllDay(day)"
        @dragover.prevent
        @drop="dropEvent(day, $event)"
      >
        <div class="mb-1 flex items-center justify-between">
          <button
            type="button"
            class="flex size-7 items-center justify-center rounded-full text-xs font-medium text-muted hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
            :class="day.toDateString() === new Date().toDateString() ? 'bg-primary text-inverted hover:bg-primary' : ''"
            :aria-label="`Open ${day.toLocaleDateString(calendar.locale, { dateStyle: 'full' })}`"
            @click="calendar.setDate(day); calendar.setView('day')"
          >
            {{ day.getDate() }}
          </button>
          <UButton
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="xs"
            class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Create event on this day"
            @click="createAllDay(day)"
          />
        </div>
        <div class="flex flex-col gap-0.5">
          <CalendarEventBlock
            v-for="event in dayEvents(day).slice(0, 4)"
            :key="`${day.toISOString()}-${event.id}`"
            :event="event"
            compact
          />
          <button
            v-if="dayEvents(day).length > 4"
            type="button"
            class="px-1 text-left text-[11px] font-medium text-muted hover:text-highlighted"
            @click="calendar.setDate(day); calendar.setView('day')"
          >
            +{{ dayEvents(day).length - 4 }} more
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
