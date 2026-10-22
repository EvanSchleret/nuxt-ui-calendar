<script setup lang="ts">
import { computed } from 'vue'
import { addDays } from 'date-fns'
import { useCalendar } from '#imports'
import CalendarEventChip from './EventChip.vue'
import type { AllDayPositionedEvent, CalendarEvent } from '../types'
import { localDateTime } from '../utils/dates'
import { layoutAllDay } from '../utils/layout'

const SLOT_HEIGHT = 22
const MAX_SLOTS = 4
const MAX_LANES = MAX_SLOTS - 1

const props = defineProps<{ weekStart: Date }>()
const calendar = useCalendar()
const days = computed(() => Array.from({ length: 7 }, (_, index) => addDays(props.weekStart, index)))
const gridStyle = {
  gridTemplateRows: ['auto', ...Array.from({ length: MAX_LANES }, () => `${SLOT_HEIGHT}px`), `minmax(${SLOT_HEIGHT}px, 1fr)`].join(' ')
}

const weekEvents = computed(() => {
  const unique = new Map<string, CalendarEvent>()
  for (const day of days.value) {
    for (const event of calendar.eventsForDay(day)) {
      unique.set(event.id, event)
    }
  }
  return [...unique.values()]
})

const lanes = computed(() => layoutAllDay(weekEvents.value, days.value))
const bars = computed(() => lanes.value.filter(bar => bar.lane < MAX_LANES))

function covers(bar: AllDayPositionedEvent, index: number): boolean {
  return index >= bar.colStart && index < bar.colStart + bar.colSpan
}

const cells = computed(() => days.value.map((day, index) => {
  const covering = lanes.value.filter(bar => covers(bar, index))
  const occupied = new Set(covering.filter(bar => bar.lane < MAX_LANES).map(bar => bar.lane))
  const dropped = covering.filter(bar => bar.lane >= MAX_LANES)
  const free = Array.from({ length: MAX_SLOTS }, (_, slot) => slot).filter(slot => !occupied.has(slot))
  const timed = calendar.eventsForDay(day).filter(event => !event.allDay).sort((left, right) => left.start.localeCompare(right.start))
  const overflows = dropped.length > 0 || timed.length > free.length
  const visible = timed.slice(0, overflows ? Math.max(free.length - 1, 0) : free.length)
  const slot = free[visible.length]

  return {
    day,
    events: visible.map((event, position) => ({ event, slot: free[position]! })),
    more: overflows && slot !== undefined
      ? { slot, hidden: dropped.length + timed.length - visible.length, events: calendar.eventsForDay(day) }
      : null
  }
}))

function label(day: Date): string {
  if (day.getDate() === 1) {
    return `${new Intl.DateTimeFormat(calendar.locale, { month: 'short' }).format(day)} 1`
  }
  return String(day.getDate())
}

function openDay(day: Date) {
  calendar.setDate(day)
  calendar.setView('day')
}

function createAllDay(day: Date) {
  void calendar.openEvent(undefined, day, true)
}
</script>

<template>
  <div class="grid min-w-0 grid-cols-7 border-b border-default" :style="gridStyle">
    <div
      v-for="({ day }, index) in cells"
      :key="`day-${day.getTime()}`"
      :data-date="localDateTime(day).slice(0, 10)"
      class="row-span-full border-default"
      :class="index !== 0 && 'border-s'"
      :style="{ gridColumn: index + 1 }"
      @dblclick="createAllDay(day)"
    />

    <button
      v-for="({ day }, index) in cells"
      :key="`number-${day.getTime()}`"
      type="button"
      class="row-start-1 m-0.5 inline-flex h-6 min-w-6 items-center justify-center justify-self-end rounded-full p-1 text-xs font-semibold transition-colors select-none focus-visible:outline-3"
      :class="day.toDateString() === new Date().toDateString()
        ? 'text-inverted bg-primary active:bg-primary/75 outline-primary/25'
        : 'text-default hover:bg-(--control-bg) active:bg-(--control-bg) outline-inverted/25'"
      :style="{ gridColumn: index + 1 }"
      :aria-label="calendar.t('openDate', { date: day.toLocaleDateString(calendar.locale, { dateStyle: 'full' }) })"
      @click="openDay(day)"
    >
      {{ label(day) }}
    </button>

    <template v-for="{ event, colStart, colSpan, lane } in bars" :key="event.id">
      <CalendarEventChip
        :event="event"
        class="mx-0.5 self-start"
        :style="{ gridColumn: `${colStart + 1} / span ${colSpan}`, gridRow: lane + 2 }"
      />
    </template>

    <template v-for="({ day, events: dayEvents, more }, index) in cells" :key="`events-${day.getTime()}`">
      <CalendarEventChip
        v-for="{ event, slot } in dayEvents"
        :key="event.id"
        :event="event"
        show-time
        class="mx-0.5 self-start max-lg:**:data-time:hidden"
        :style="{ gridColumn: index + 1, gridRow: slot + 2 }"
      />

      <UPopover
        v-if="more"
        :content="{ side: 'right' }"
        :ui="{ content: 'flex flex-col gap-0.5 p-2 w-64' }"
      >
        <template #default="{ open }">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            class="mx-0.5 justify-start self-start px-1.5 py-0.5 font-normal text-muted"
            :class="open && 'bg-elevated'"
            :style="{ gridColumn: index + 1, gridRow: more.slot + 2 }"
          >
            <span class="lg:hidden">+{{ more.hidden }}</span>
            <span class="hidden lg:inline">+{{ more.hidden }} {{ calendar.t('more') }}</span>
            <span class="sr-only">{{ calendar.t('showMoreEvents', { count: more.hidden }) }}</span>
          </UButton>
        </template>

        <template #content>
          <CalendarEventChip
            v-for="event in more.events"
            :key="event.id"
            :event="event"
            show-time
          />
        </template>
      </UPopover>
    </template>
  </div>
</template>
