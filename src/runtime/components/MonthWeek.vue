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
  <div class="uical:cal:grid uical:cal:min-w-0 uical:cal:grid-cols-7 uical-border-bottom uical:cal:border-default" :style="gridStyle">
    <div
      v-for="({ day }, index) in cells"
      :key="`day-${day.getTime()}`"
      :data-date="localDateTime(day).slice(0, 10)"
      class="uical:cal:row-span-full uical:cal:border-default"
      :class="index !== 0 && 'uical-border-start'"
      :style="{ gridColumn: index + 1 }"
      @dblclick="createAllDay(day)"
    />

    <button
      v-for="({ day }, index) in cells"
      :key="`number-${day.getTime()}`"
      type="button"
      class="uical:cal:row-start-1 uical:cal:m-0.5 uical:cal:inline-flex uical:cal:h-6 uical:cal:min-w-6 uical:cal:items-center uical:cal:justify-center uical:cal:justify-self-end uical:cal:rounded-full uical:cal:p-1 uical:cal:text-xs uical-font-semibold uical-transition-colors uical:cal:select-none uical-focus-outline"
      :class="day.toDateString() === new Date().toDateString()
        ? 'uical:cal:text-inverted uical:cal:bg-primary uical:cal:active:bg-primary/75 uical-outline-primary'
        : 'uical:cal:text-default uical:cal:hover:bg-(--control-bg) uical:cal:active:bg-(--control-bg) uical-outline-inverted'"
      :style="{ gridColumn: index + 1 }"
      :aria-label="calendar.t('openDate', { date: day.toLocaleDateString(calendar.locale, { dateStyle: 'full' }) })"
      @click="openDay(day)"
    >
      {{ label(day) }}
    </button>

    <template v-for="{ event, colStart, colSpan, lane } in bars" :key="event.id">
      <CalendarEventChip
        :event="event"
        class="uical:cal:mx-0.5 uical:cal:self-start"
        :style="{ gridColumn: `${colStart + 1} / span ${colSpan}`, gridRow: lane + 2 }"
      />
    </template>

    <template v-for="({ day, events: dayEvents, more }, index) in cells" :key="`events-${day.getTime()}`">
      <CalendarEventChip
        v-for="{ event, slot } in dayEvents"
        :key="event.id"
        :event="event"
        show-time
        class="uical:cal:mx-0.5 uical:cal:self-start uical:cal:max-lg:**:data-time:hidden"
        :style="{ gridColumn: index + 1, gridRow: slot + 2 }"
      />

      <UPopover
        v-if="more"
        :content="{ side: 'right' }"
        :ui="{ content: 'ui-calendar uical:cal:flex uical:cal:flex-col uical:cal:gap-0.5 uical:cal:p-2 uical:cal:w-64' }"
      >
        <template #default="{ open }">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            class="uical:cal:mx-0.5 uical:cal:justify-start uical:cal:self-start uical:cal:px-1.5 uical:cal:py-0.5 uical-font-normal uical:cal:text-muted"
            :class="open && 'uical:cal:bg-elevated'"
            :style="{ gridColumn: index + 1, gridRow: more.slot + 2 }"
          >
            <span class="uical:cal:lg:hidden">+{{ more.hidden }}</span>
            <span class="uical:cal:hidden uical:cal:lg:inline">+{{ more.hidden }} {{ calendar.t('more') }}</span>
            <span class="uical:cal:sr-only">{{ calendar.t('showMoreEvents', { count: more.hidden }) }}</span>
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
