<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { differenceInCalendarDays } from 'date-fns'
import { useCalendar } from '#imports'
import CalendarDayColumn from './DayColumn.vue'
import CalendarEventChip from './EventChip.vue'
import type { AllDayPositionedEvent, CalendarEvent } from '../types'
import { daysForView, formatCalendarTitle, HOUR_HEIGHT, localDateTime } from '../utils/dates'
import { layoutAllDay, layoutDay } from '../utils/layout'

const DAY_HEADER_HEIGHT = 41
const ALL_DAY_LANE_HEIGHT = 28
const ALL_DAY_ROW_BORDER = 1
const START_OFFSET = 7 * HOUR_HEIGHT

const calendar = useCalendar()
const container = useTemplateRef('container')
const compact = ref(false)
const mounted = ref(false)
const now = ref(new Date())
const weekMedia = ref<MediaQueryList | null>(null)
let clock: ReturnType<typeof setInterval> | undefined

const range = computed(() => daysForView(calendar.date.value, calendar.view.value))
const days = computed(() => {
  if (calendar.view.value !== 'week' || !mounted.value || !compact.value || range.value.length <= 3) {
    return range.value
  }

  const start = Math.min(Math.max(differenceInCalendarDays(calendar.date.value, range.value[0]!), 0), range.value.length - 3)
  return range.value.slice(start, start + 3)
})
const gridStyle = computed(() => ({ gridTemplateColumns: `3.5rem repeat(${days.value.length}, minmax(0, 1fr))` }))
const timedEvents = computed(() => days.value.map(day => layoutDay(
  calendar.eventsForDay(day).filter(event => !event.allDay),
  day
)))
const allDayEvents = computed<AllDayPositionedEvent[]>(() => {
  const unique = new Map<string, CalendarEvent>()
  for (const day of days.value) {
    for (const event of calendar.eventsForDay(day)) {
      if (event.allDay) {
        unique.set(event.id, event)
      }
    }
  }
  return layoutAllDay([...unique.values()], days.value)
})
const allDayLanes = computed(() => allDayEvents.value.reduce((lanes, event) => Math.max(lanes, event.lane + 1), 1))
const chromeHeight = computed(() => DAY_HEADER_HEIGHT + allDayLanes.value * ALL_DAY_LANE_HEIGHT + ALL_DAY_ROW_BORDER)
const chromeOffset = computed(() => `calc(var(--ui-header-height) + 0.5rem + ${chromeHeight.value}px)`)
const startPull = computed(() => `calc(-1 * clamp(0px, ${START_OFFSET}px, ${24 * HOUR_HEIGHT}px + ${chromeOffset.value} - 100svh))`)
const hours = Array.from({ length: 23 }, (_, index) => index + 1)
const heading = computed(() => {
  const title = formatCalendarTitle(calendar.date.value, calendar.view.value, calendar.locale)
  return `${title.months} ${title.year}`
})

function updateCompact() {
  compact.value = weekMedia.value?.matches ?? false
}

onMounted(async () => {
  weekMedia.value = window.matchMedia('(max-width: 1023px)')
  updateCompact()
  weekMedia.value.addEventListener('change', updateCompact)
  mounted.value = true
  clock = setInterval(() => {
    now.value = new Date()
  }, 60_000)

  await nextTick()
  container.value?.$el.scrollTo({ top: START_OFFSET })
})

onUnmounted(() => {
  weekMedia.value?.removeEventListener('change', updateCompact)
  if (clock) {
    clearInterval(clock)
  }
})

function dayLabel(day: Date): string {
  return new Intl.DateTimeFormat(calendar.locale, { weekday: 'short' }).format(day).toUpperCase()
}

function formatHour(hour: number): string {
  return new Intl.DateTimeFormat(calendar.locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(2024, 0, 1, hour))
}

function isToday(day: Date): boolean {
  return day.toDateString() === now.value.toDateString()
}

function createAllDay(day: Date) {
  void calendar.openEvent(undefined, day, true)
}
</script>

<template>
  <div data-calendar-view="week" class="relative flex min-h-0 flex-1 flex-col">
    <UScrollArea
      ref="container"
      :style="{ scrollPaddingTop: chromeOffset }"
      class="z-0 flex-1 snap-y snap-proximity scrollbar-gutter-stable"
    >
      <div
        data-week-grid
        class="grid"
        :style="{ ...gridStyle, paddingTop: chromeOffset, marginTop: mounted ? undefined : startPull }"
      >
        <div class="relative" :style="{ height: `${24 * HOUR_HEIGHT}px` }">
          <span
            v-for="hour in hours"
            :key="hour"
            class="absolute inset-e-2 -translate-y-1/2 text-[11px] text-dimmed tabular-nums"
            :style="{ top: `${hour * HOUR_HEIGHT}px` }"
          >
            {{ formatHour(hour) }}
          </span>
        </div>

        <CalendarDayColumn
          v-for="(day, index) in days"
          :key="localDateTime(day).slice(0, 10)"
          :day="day"
          :events="timedEvents[index]!"
          :now="now"
        />
      </div>
    </UScrollArea>

    <div
      class="absolute inset-x-0 top-[calc(var(--ui-header-height)+0.5rem)] z-30 scrollbar-gutter-stable overflow-hidden border-b border-default bg-default"
    >
      <div class="grid" :style="gridStyle">
        <div />
        <div
          v-for="day in days"
          :key="localDateTime(day).slice(0, 10)"
          class="flex items-center justify-center gap-1 border-s border-default py-2 text-sm"
        >
          <span class="text-muted">{{ dayLabel(day) }}</span>
          <span
            class="flex size-6 items-center justify-center rounded-full font-semibold"
            :class="isToday(day) ? 'bg-primary text-inverted' : 'text-highlighted'"
          >
            {{ day.getDate() }}
          </span>
        </div>
      </div>

      <div
        class="grid border-t border-default"
        :style="{ ...gridStyle, gridTemplateRows: `repeat(${allDayLanes}, ${ALL_DAY_LANE_HEIGHT}px)` }"
      >
        <span class="row-span-full self-center pe-2 text-end text-[10px] text-dimmed">{{ calendar.t('allDay') }}</span>

        <div
          v-for="(day, index) in days"
          :key="`all-day-${localDateTime(day).slice(0, 10)}`"
          :data-date="localDateTime(day).slice(0, 10)"
          class="row-span-full border-s border-default"
          :style="{ gridColumn: index + 2 }"
          @dblclick="createAllDay(day)"
        />

        <CalendarEventChip
          v-for="{ event, colStart, colSpan, lane } in allDayEvents"
          :key="event.id"
          :event="event"
          class="mx-1 mt-1 h-5"
          :style="{ gridColumn: `${colStart + 2} / span ${colSpan}`, gridRow: lane + 1 }"
        />
      </div>
    </div>
    <p class="sr-only">{{ heading }}. {{ calendar.t('doubleClickEmptySlot') }} {{ calendar.t('dragEventsToMove') }}</p>
  </div>
</template>
