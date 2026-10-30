<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, shallowRef, unref, useTemplateRef, watch } from 'vue'
import { addDays, addMonths, addWeeks, differenceInCalendarWeeks, startOfMonth, startOfWeek } from 'date-fns'
import { useCalendar } from '#imports'
import CalendarMonthWeek from './MonthWeek.vue'
import { daysForView, localDateTime, monthViewFocusDate, weekDayNames, weekIndexForDate } from '../utils/dates'

const ROW_HEIGHT = 140
const WEEKS_AROUND = 260
const HEADER_PADDING = 8
const HEADER_HEIGHT = 64
const WEEKDAY_HEIGHT = 40
const CHROME_HEIGHT = HEADER_PADDING + HEADER_HEIGHT + WEEKDAY_HEIGHT
const LABEL_HEIGHT = 32
const LABEL_LIFT = 12
const DOCK_TOP = HEADER_PADDING + (HEADER_HEIGHT - 1 - LABEL_HEIGHT) / 2
const GRID_TOP = CHROME_HEIGHT - DOCK_TOP
const CHUNK_WEEKS = 6

const calendar = useCalendar()
const firstWeek = startOfWeek(addWeeks(new Date(), -WEEKS_AROUND), { weekStartsOn: 1 })
const weeks = Array.from({ length: WEEKS_AROUND * 2 + 1 }, (_, index) => addWeeks(firstWeek, index))
const weekdays = computed(() => weekDayNames(calendar.locale))
const staticWeeks = computed(() => {
  const days = daysForView(calendar.date.value, 'month')
  return Array.from({ length: 6 }, (_, index) => days[index * 7]!)
})
const scrollArea = useTemplateRef('scrollArea')
const staticScrollArea = useTemplateRef('staticScrollArea')
const scrollElement = shallowRef<HTMLElement | null>(null)
const labels = shallowRef<{ key: number, month: string, year: string, y: number }[]>([])
const visibleMonth = shallowRef<Date | null>(null)
const focusMonth = computed(() => visibleMonth.value ?? calendar.date.value)
const hasMobileToolbar = shallowRef(false)
const virtualizeOptions = computed(() => ({
  estimateSize: ROW_HEIGHT,
  skipMeasurement: true,
  overscan: 4,
  paddingStart: CHROME_HEIGHT,
  paddingEnd: hasMobileToolbar.value ? 96 : 0,
  scrollPaddingStart: CHROME_HEIGHT,
  initialOffset
}))
const labelOffsets = new Map<number, number>()
let toolbarMediaQuery: MediaQueryList | null = null
let viewportHeight = 0
let labelsAwake = false
let labelsTimer: ReturnType<typeof setTimeout> | undefined
let syncingDateFromScroll = false

function indexOf(date: Date): number {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
  return Math.min(weeks.length - 1, Math.max(0, differenceInCalendarWeeks(start, firstWeek, { weekStartsOn: 1 })))
}

function initialOffset(): number {
  return weekIndexForDate(monthViewFocusDate(calendar.date.value), firstWeek, weeks.length) * ROW_HEIGHT
}

function getVirtualizer() {
  return unref(scrollArea.value?.virtualizer)
}

function getScrollElement(): HTMLElement | null {
  return (getVirtualizer()?.scrollElement as HTMLElement | undefined) ?? null
}

function scrollToDate(date: Date, smooth = false) {
  getVirtualizer()?.scrollToIndex(weekIndexForDate(monthViewFocusDate(date), firstWeek, weeks.length), {
    align: 'start',
    behavior: smooth ? 'smooth' : 'auto'
  })
}

function isDateWeekVisible(date: Date): boolean {
  const element = getScrollElement()
  if (!element) {
    return false
  }

  const firstVisible = Math.floor(element.scrollTop / ROW_HEIGHT)
  const lastVisible = Math.ceil((element.scrollTop + element.clientHeight) / ROW_HEIGHT)
  const selectedWeek = weekIndexForDate(monthViewFocusDate(date), firstWeek, weeks.length)

  return selectedWeek >= firstVisible && selectedWeek < lastVisible
}

async function scrollToStaticDate(date: Date) {
  await nextTick()
  const element = staticScrollArea.value
  const focusDate = monthViewFocusDate(date)
  const dateCell = element?.querySelector<HTMLElement>(`[data-date="${localDateTime(focusDate).slice(0, 10)}"]`)
  if (!element || !dateCell) {
    return
  }

  const offset = dateCell.getBoundingClientRect().top - element.getBoundingClientRect().top + element.scrollTop - CHROME_HEIGHT
  element.scrollTo({ top: Math.max(0, offset), behavior: 'auto' })
}

function dockedMonth(): Date | null {
  const offset = scrollElement.value?.scrollTop ?? getScrollElement()?.scrollTop
  if (offset == null) {
    return null
  }

  const top = Math.min(weeks.length - 1, Math.max(0, Math.floor(offset / ROW_HEIGHT)))
  const week = weeks[top]
  return week ? startOfMonth(addDays(week, 6)) : null
}

function monthKey(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth()
}

function labelOffset(date: Date): number {
  const key = monthKey(date)
  let offset = labelOffsets.get(key)
  if (offset === undefined) {
    offset = indexOf(startOfMonth(date)) * ROW_HEIGHT
    labelOffsets.set(key, offset)
  }
  return offset
}

function updateLabels(docked: Date) {
  const offset = scrollElement.value?.scrollTop
  if (offset == null) {
    return
  }

  const months = [docked]
  while (months.length < 4) {
    const next = addMonths(months[months.length - 1]!, 1)
    if (labelOffset(next) > offset + viewportHeight) {
      break
    }
    months.push(next)
  }

  const positions = months.map((month) => {
    const distance = labelOffset(month) - offset
    return Math.max((distance >= GRID_TOP ? GRID_TOP + distance : distance * 2) - LABEL_LIFT, 0)
  })

  for (let index = positions.length - 2; index >= 0; index--) {
    positions[index] = Math.min(positions[index]!, positions[index + 1]! - LABEL_HEIGHT)
  }

  labels.value = months.map((month, index) => ({
    key: monthKey(month),
    month: new Intl.DateTimeFormat(calendar.locale, { month: 'long' }).format(month),
    year: String(month.getFullYear()),
    y: positions[index]!
  }))
}

function updateScrollState() {
  const docked = dockedMonth()
  if (!docked) {
    return
  }

  visibleMonth.value = docked
  updateLabels(docked)
  if (!labelsAwake) {
    return
  }

  calendar.monthLabelsVisible.value = true
  if (labelsTimer) {
    clearTimeout(labelsTimer)
  }
  labelsTimer = setTimeout(() => {
    calendar.monthLabelsVisible.value = false
  }, 600)
}

function onScroll(isScrolling: boolean) {
  if (isScrolling || !calendar.infiniteScroll) {
    return
  }

  const visible = dockedMonth()
  if (isDateWeekVisible(calendar.date.value)) {
    return
  }

  if (visible && (visible.getFullYear() !== calendar.date.value.getFullYear() || visible.getMonth() !== calendar.date.value.getMonth())) {
    syncingDateFromScroll = true
    calendar.setDate(visible)
    syncingDateFromScroll = false
  }
}

onMounted(async () => {
  toolbarMediaQuery = window.matchMedia('(max-width: 1023px)')
  hasMobileToolbar.value = toolbarMediaQuery.matches
  toolbarMediaQuery.addEventListener('change', updateToolbarClearance)

  if (!calendar.infiniteScroll) {
    await scrollToStaticDate(calendar.date.value)
    return
  }

  await nextTick()
  const element = getScrollElement()
  if (!element) {
    return
  }

  scrollElement.value = element
  viewportHeight = element.clientHeight
  element.addEventListener('scroll', updateScrollState, { passive: true })
  updateScrollState()
  requestAnimationFrame(() => {
    labelsAwake = true
  })
})

onUnmounted(() => {
  toolbarMediaQuery?.removeEventListener('change', updateToolbarClearance)
  scrollElement.value?.removeEventListener('scroll', updateScrollState)
  if (labelsTimer) {
    clearTimeout(labelsTimer)
  }
  calendar.monthLabelsVisible.value = false
})

watch(calendar.date, (date) => {
  if (syncingDateFromScroll) {
    return
  }

  visibleMonth.value = calendar.infiniteScroll ? startOfMonth(date) : null

  if (!calendar.infiniteScroll) {
    void scrollToStaticDate(date)
    return
  }

  const target = weekIndexForDate(date, firstWeek, weeks.length)
  const visible = getVirtualizer()?.getVirtualItems()
  const center = visible?.length ? Math.round((visible[0]!.index + visible[visible.length - 1]!.index) / 2) : target
  scrollToDate(date, Math.abs(target - center) <= CHUNK_WEEKS * 2)
}, { flush: 'sync' })

function updateToolbarClearance() {
  hasMobileToolbar.value = toolbarMediaQuery?.matches ?? false
}
</script>

<template>
  <div data-calendar-view="month" class="uical:cal:relative uical:cal:flex uical:cal:min-h-0 uical:cal:flex-1 uical:cal:flex-col">
    <UScrollArea
      v-if="calendar.infiniteScroll"
      ref="scrollArea"
      :items="weeks"
      :virtualize="virtualizeOptions"
      :ui="{ item: 'uical-snap-start' }"
      :style="{ scrollPaddingTop: `${CHROME_HEIGHT}px`, scrollPaddingBottom: hasMobileToolbar ? '6rem' : undefined }"
      class="uical:cal:flex-1 uical-scroll-y uical:cal:scrollbar-gutter-stable"
      @scroll="onScroll"
    >
      <template #default="{ item }">
        <CalendarMonthWeek :week-start="item" :focus-month="focusMonth" :style="{ height: `${ROW_HEIGHT}px` }" />
      </template>
    </UScrollArea>

    <div
      v-else
      ref="staticScrollArea"
      class="uical:cal:flex-1 uical:cal:scrollbar-gutter-stable uical:cal:overflow-y-auto uical-scroll-y uical:cal:max-lg:pb-24 uical:cal:max-lg:scroll-pb-24"
      :style="{ paddingTop: `${CHROME_HEIGHT}px`, scrollPaddingTop: `${CHROME_HEIGHT}px` }"
    >
      <CalendarMonthWeek
        v-for="week in staticWeeks"
        :key="week.getTime()"
        :week-start="week"
        :focus-month="focusMonth"
        :style="{ height: `${ROW_HEIGHT}px` }"
      />
    </div>

    <div class="uical:cal:absolute uical:cal:inset-x-0 uical:cal:top-[calc(var(--ui-header-height)+0.5rem)] uical:cal:z-30 uical:cal:grid uical:cal:h-10 uical:cal:scrollbar-gutter-stable uical:cal:grid-cols-7 uical:cal:overflow-hidden uical-border-bottom uical:cal:border-default uical:cal:bg-default">
      <span
        v-for="(weekday, index) in weekdays"
        :key="weekday"
        class="uical:cal:flex uical:cal:items-center uical:cal:justify-end uical:cal:border-default uical:cal:pe-2 uical:cal:text-sm uical:cal:text-muted"
        :class="[index !== 0 && 'uical-border-start', index >= 5 && 'uical:cal:bg-muted/25']"
      >
        {{ weekday }}
      </span>
    </div>

    <div
      v-if="calendar.infiniteScroll"
      class="uical:cal:pointer-events-none uical:cal:absolute uical:cal:inset-x-0 uical:cal:bottom-0 uical:cal:z-40 uical:cal:overflow-hidden uical-transition-opacity"
      :class="calendar.monthLabelsVisible.value ? 'uical:cal:opacity-100 uical-duration-150' : 'uical:cal:opacity-0 uical-duration-300'"
      :style="{ top: `${DOCK_TOP}px` }"
    >
      <div
        v-for="label in labels"
        :key="label.key"
        class="uical:cal:absolute uical:cal:inset-s-13 uical:cal:top-0 uical:cal:flex uical:cal:h-8 uical:cal:items-center uical:cal:gap-1.5 uical:cal:text-xl uical-tracking-tight uical:cal:will-change-[translate] uical:cal:sm:text-2xl uical:cal:lg:inset-s-4"
        :style="{ translate: `0 ${label.y}px` }"
      >
        <span class="uical:cal:truncate uical-font-bold uical:cal:text-highlighted">{{ label.month }}</span>
        <span class="uical:cal:hidden uical-font-normal uical:cal:text-muted uical:cal:sm:inline">{{ label.year }}</span>
      </div>
    </div>
  </div>
</template>
