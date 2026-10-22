<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { addDays, differenceInMilliseconds } from 'date-fns'
import { useCalendar } from '#imports'
import type { CalendarEvent } from '../types'
import { dateAtMinutes, daysForView, formatCalendarTitle, HOUR_HEIGHT, localDateTime, minutesFromPointer } from '../utils/dates'
import { layoutDay } from '../utils/layout'

const calendar = useCalendar()
const compact = ref(false)
const days = computed(() => {
  if (calendar.view.value === 'week' && compact.value) {
    return Array.from({ length: 3 }, (_, index) => addDays(calendar.date.value, index))
  }

  return daysForView(calendar.date.value, calendar.view.value)
})
const hours = Array.from({ length: 24 }, (_, index) => index)
const columnTemplate = computed(() => compact.value && calendar.view.value === 'week'
  ? `2.5rem repeat(${days.value.length}, minmax(0, 1fr))`
  : `3.5rem repeat(${days.value.length}, minmax(8rem, 1fr))`)
const now = ref(new Date())
let clock: ReturnType<typeof setInterval> | undefined
let resize: (() => void) | undefined

onMounted(() => {
  const updateCompact = () => {
    compact.value = window.matchMedia('(max-width: 767px)').matches
  }
  updateCompact()
  resize = updateCompact
  window.addEventListener('resize', updateCompact)
  clock = setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onUnmounted(() => {
  if (resize) {
    window.removeEventListener('resize', resize)
  }
  if (clock) {
    clearInterval(clock)
  }
})

function dayLabel(day: Date): string {
  return new Intl.DateTimeFormat(calendar.locale, { weekday: 'short' }).format(day)
}

function isToday(day: Date): boolean {
  return day.toDateString() === now.value.toDateString()
}

function timedEvents(day: Date) {
  return layoutDay(calendar.eventsForDay(day), day)
}

function allDayEvents(day: Date): CalendarEvent[] {
  return calendar.eventsForDay(day).filter(event => event.allDay)
}

function createAt(day: Date, event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const minutes = minutesFromPointer(event.clientY, rect)
  void calendar.openEvent(undefined, dateAtMinutes(day, minutes))
}

function createAllDay(day: Date) {
  void calendar.openEvent(undefined, day, true)
}

function dropEvent(day: Date, event: DragEvent) {
  event.preventDefault()
  const id = event.dataTransfer?.getData('text/plain')
  const current = calendar.events.value.find(item => item.id === id)
  if (!current) {
    return
  }

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const minutes = minutesFromPointer(event.clientY, rect)
  const start = dateAtMinutes(day, minutes)
  const duration = Math.max(15, differenceInMilliseconds(new Date(current.end), new Date(current.start)) / 60_000)
  const end = new Date(start.getTime() + duration * 60_000)

  void calendar.updateEvent({ ...current, start: localDateTime(start), end: localDateTime(end) })
}

function eventPosition(event: CalendarEvent, day: Date) {
  return timedEvents(day).find(position => position.event.id === event.id)
}

const heading = computed(() => formatCalendarTitle(calendar.date.value, calendar.view.value, calendar.locale))
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="overflow-auto">
      <div :class="compact && calendar.view.value === 'week' ? 'min-w-[22rem]' : calendar.view.value === 'week' ? 'min-w-[48rem]' : 'min-w-full'">
        <div class="sticky top-0 z-20 grid border-b border-default bg-default/95 backdrop-blur" :style="{ gridTemplateColumns: columnTemplate }">
          <div class="border-r border-default" />
          <button
            v-for="day in days"
            :key="day.toISOString()"
            type="button"
            class="flex min-h-14 flex-col items-center justify-center border-r border-default text-sm hover:bg-elevated"
            @click="calendar.setDate(day)"
          >
            <span class="text-xs text-muted uppercase">{{ dayLabel(day) }}</span>
            <span :class="isToday(day) ? 'flex size-7 items-center justify-center rounded-full bg-primary font-semibold text-inverted' : 'font-medium text-highlighted'">{{ day.getDate() }}</span>
          </button>
        </div>

        <div class="grid border-b border-default bg-elevated/30" :style="{ gridTemplateColumns: columnTemplate }">
          <div class="flex items-center justify-end border-r border-default px-2 text-[10px] text-muted">All day</div>
          <div
            v-for="day in days"
            :key="`all-day-${day.toISOString()}`"
            class="min-h-9 border-r border-default p-1"
            @dblclick="createAllDay(day)"
          >
            <CalendarEventBlock
              v-for="event in allDayEvents(day)"
              :key="event.id"
              :event="event"
              compact
            />
          </div>
        </div>

        <div class="grid" :style="{ gridTemplateColumns: columnTemplate }">
          <div class="relative border-r border-default">
            <div v-for="hour in hours" :key="hour" class="relative border-b border-default/70 pr-2 text-right text-[10px] text-muted" :style="{ height: `${HOUR_HEIGHT}px` }">
              <span class="absolute -top-2 right-2 bg-default px-1">{{ hour === 0 ? '' : `${String(hour).padStart(2, '0')}:00` }}</span>
            </div>
          </div>

          <div
            v-for="day in days"
            :key="`day-${day.toISOString()}`"
            class="relative border-r border-default"
            :style="{ height: `${24 * HOUR_HEIGHT}px` }"
            @dblclick="createAt(day, $event)"
            @dragover.prevent
            @drop="dropEvent(day, $event)"
          >
            <div
              v-for="hour in hours"
              :key="hour"
              class="pointer-events-none absolute inset-x-0 border-t border-default/70"
              :style="{ top: `${hour * HOUR_HEIGHT}px` }"
            />
            <CalendarEventBlock
              v-for="positioned in timedEvents(day)"
              :key="positioned.event.id"
              :event="positioned.event"
              :positioned="eventPosition(positioned.event, day)"
            />
            <div v-if="isToday(day)" class="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-error" :style="{ top: `${(now.getHours() * 60 + now.getMinutes()) * HOUR_HEIGHT / 60}px` }">
              <span class="absolute -top-1 -left-1.5 size-3 rounded-full bg-error" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <p class="sr-only">{{ heading }}. Double-click an empty time slot to create an event. Drag events to move them.</p>
  </div>
</template>
