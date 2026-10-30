<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { differenceInCalendarDays, isWeekend } from 'date-fns'
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
const swipeStart = ref<{ pointerId: number, x: number, y: number, startedOnEvent: boolean } | null>(null)

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

function startSwipe(event: PointerEvent) {
  if (event.pointerType !== 'touch' || !event.isPrimary) {
    return
  }

  const target = event.target
  swipeStart.value = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    startedOnEvent: target instanceof Element && !!target.closest('[data-event], [data-resize-handle]')
  }
}

function endSwipe(event: PointerEvent) {
  const start = swipeStart.value
  swipeStart.value = null

  if (!start || start.pointerId !== event.pointerId || start.startedOnEvent) {
    return
  }

  const distanceX = event.clientX - start.x
  const distanceY = event.clientY - start.y
  if (Math.abs(distanceX) < 50 || Math.abs(distanceX) < 2 * Math.abs(distanceY)) {
    return
  }

  calendar.move(distanceX < 0 ? 1 : -1)
}

function cancelSwipe(event: PointerEvent) {
  if (swipeStart.value?.pointerId === event.pointerId) {
    swipeStart.value = null
  }
}

function createAllDay(day: Date) {
  void calendar.openEvent(undefined, day, true)
}
</script>

<template>
  <div data-calendar-view="week" class="uical:cal:relative uical:cal:flex uical:cal:min-h-0 uical:cal:flex-1 uical:cal:flex-col">
    <UScrollArea
      ref="container"
      :style="{ scrollPaddingTop: chromeOffset }"
      class="uical:cal:z-0 uical:cal:flex-1 uical-scroll-y uical:cal:scrollbar-gutter-stable uical:cal:max-lg:scroll-pb-24"
      @pointerdown.passive="startSwipe"
      @pointerup.passive="endSwipe"
      @pointercancel="cancelSwipe"
    >
      <div
        data-week-grid
        class="uical:cal:grid uical:cal:max-lg:pb-24"
        :style="{ ...gridStyle, paddingTop: chromeOffset, marginTop: mounted ? undefined : startPull }"
      >
        <div class="uical:cal:relative" :style="{ height: `${24 * HOUR_HEIGHT}px` }">
          <span
            v-for="hour in hours"
            :key="hour"
            class="uical:cal:absolute uical:cal:inset-e-2 uical-center-y uical:cal:text-[11px] uical:cal:text-dimmed uical-tabular-nums"
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
      class="uical:cal:absolute uical:cal:inset-x-0 uical:cal:top-[calc(var(--ui-header-height)+0.5rem)] uical:cal:z-30 uical:cal:scrollbar-gutter-stable uical:cal:overflow-hidden uical-border-bottom uical:cal:border-default uical:cal:bg-default"
    >
      <div class="uical:cal:grid" :style="gridStyle">
        <div />
        <div
          v-for="day in days"
          :key="localDateTime(day).slice(0, 10)"
          class="uical:cal:flex uical:cal:items-center uical:cal:justify-center uical:cal:gap-1 uical-border-start uical:cal:border-default uical:cal:py-2 uical:cal:text-sm"
          :class="isWeekend(day) && 'uical:cal:bg-muted/25'"
        >
          <span class="uical:cal:text-muted">{{ dayLabel(day) }}</span>
          <span
            class="uical:cal:flex uical:cal:size-6 uical:cal:items-center uical:cal:justify-center uical:cal:rounded-full uical-font-semibold"
            :class="isToday(day) ? 'uical:cal:bg-primary uical:cal:text-inverted' : 'uical:cal:text-highlighted'"
          >
            {{ day.getDate() }}
          </span>
        </div>
      </div>

      <div
        class="uical:cal:grid uical-border-top uical:cal:border-default"
        :style="{ ...gridStyle, gridTemplateRows: `repeat(${allDayLanes}, ${ALL_DAY_LANE_HEIGHT}px)` }"
      >
        <span class="uical:cal:row-span-full uical:cal:self-center uical:cal:pe-2 uical:cal:text-end uical:cal:text-[10px] uical:cal:text-dimmed">{{ calendar.t('allDay') }}</span>

        <div
          v-for="(day, index) in days"
          :key="`all-day-${localDateTime(day).slice(0, 10)}`"
          :data-date="localDateTime(day).slice(0, 10)"
          class="uical:cal:row-span-full uical-border-start uical:cal:border-default"
          :class="isWeekend(day) && 'uical:cal:bg-muted/25'"
          :style="{ gridColumn: index + 2 }"
          @dblclick="createAllDay(day)"
        />

        <CalendarEventChip
          v-for="{ event, colStart, colSpan, lane } in allDayEvents"
          :key="event.id"
          :event="event"
          class="uical:cal:mx-1 uical:cal:mt-1 uical:cal:h-5"
          :style="{ gridColumn: `${colStart + 2} / span ${colSpan}`, gridRow: lane + 1 }"
        />
      </div>
    </div>
    <p class="uical:cal:sr-only">{{ heading }}. {{ calendar.t('doubleClickEmptySlot') }} {{ calendar.t('dragEventsToMove') }}</p>
  </div>
</template>
