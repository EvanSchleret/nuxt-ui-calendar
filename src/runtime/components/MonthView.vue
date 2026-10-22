<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, shallowRef, unref, watch } from 'vue'
import { addDays, addMonths, addWeeks, differenceInCalendarWeeks, startOfMonth, startOfWeek } from 'date-fns'
import { useCalendar } from '#imports'
import { daysForView, weekDayNames } from '../utils/dates'

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
const scrollElement = shallowRef<HTMLElement | null>(null)
const labels = shallowRef<{ key: number, month: string, year: string, y: number }[]>([])
const labelOffsets = new Map<number, number>()
let viewportHeight = 0
let labelsAwake = false
let labelsTimer: ReturnType<typeof setTimeout> | undefined

function indexOf(date: Date): number {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
  return Math.min(weeks.length - 1, Math.max(0, differenceInCalendarWeeks(start, firstWeek, { weekStartsOn: 1 })))
}

function initialOffset(): number {
  return indexOf(calendar.date.value) * ROW_HEIGHT
}

function getVirtualizer() {
  return unref(scrollArea.value?.virtualizer)
}

function getScrollElement(): HTMLElement | null {
  return (getVirtualizer()?.scrollElement as HTMLElement | undefined) ?? null
}

function scrollToMonth(date: Date, smooth = false) {
  getVirtualizer()?.scrollToIndex(indexOf(date), {
    align: 'start',
    behavior: smooth ? 'smooth' : 'auto'
  })
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
  if (visible && (visible.getFullYear() !== calendar.date.value.getFullYear() || visible.getMonth() !== calendar.date.value.getMonth())) {
    calendar.setDate(visible)
  }
}

onMounted(async () => {
  if (!calendar.infiniteScroll) {
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
  scrollElement.value?.removeEventListener('scroll', updateScrollState)
  if (labelsTimer) {
    clearTimeout(labelsTimer)
  }
  calendar.monthLabelsVisible.value = false
})

watch(calendar.date, (date) => {
  if (!calendar.infiniteScroll) {
    return
  }

  const docked = dockedMonth()
  if (docked && docked.getFullYear() === date.getFullYear() && docked.getMonth() === date.getMonth()) {
    return
  }

  const target = indexOf(date)
  const visible = getVirtualizer()?.getVirtualItems()
  const center = visible?.length ? Math.round((visible[0]!.index + visible[visible.length - 1]!.index) / 2) : target
  scrollToMonth(date, Math.abs(target - center) <= CHUNK_WEEKS * 2)
}, { flush: 'sync' })
</script>

<template>
  <div class="relative flex min-h-0 flex-1 flex-col">
    <UScrollArea
      v-if="calendar.infiniteScroll"
      ref="scrollArea"
      :items="weeks"
      :virtualize="{ estimateSize: ROW_HEIGHT, skipMeasurement: true, overscan: 4, paddingStart: CHROME_HEIGHT, scrollPaddingStart: CHROME_HEIGHT, initialOffset }"
      :ui="{ item: 'snap-start' }"
      :style="{ scrollPaddingTop: `${CHROME_HEIGHT}px` }"
      class="flex-1 snap-y snap-proximity scrollbar-gutter-stable"
      @scroll="onScroll"
    >
      <template #default="{ item }">
        <CalendarMonthWeek :week-start="item" :style="{ height: `${ROW_HEIGHT}px` }" />
      </template>
    </UScrollArea>

    <div v-else class="flex-1 scrollbar-gutter-stable overflow-y-auto" :style="{ paddingTop: `${CHROME_HEIGHT}px` }">
      <CalendarMonthWeek
        v-for="week in staticWeeks"
        :key="week.getTime()"
        :week-start="week"
        :style="{ height: `${ROW_HEIGHT}px` }"
      />
    </div>

    <div class="glass-material absolute inset-x-0 top-[calc(var(--ui-header-height)+0.5rem)] z-30 grid h-10 scrollbar-gutter-stable grid-cols-7 overflow-hidden border-b border-default bg-(--glass-bg)">
      <span
        v-for="(weekday, index) in weekdays"
        :key="weekday"
        class="flex items-center justify-end border-default pe-2 text-sm text-muted"
        :class="index !== 0 && 'border-s'"
      >
        {{ weekday }}
      </span>
    </div>

    <div
      v-if="calendar.infiniteScroll"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-40 overflow-hidden transition-opacity"
      :class="calendar.monthLabelsVisible.value ? 'opacity-100 duration-150' : 'opacity-0 duration-300'"
      :style="{ top: `${DOCK_TOP}px` }"
    >
      <div
        v-for="label in labels"
        :key="label.key"
        class="absolute inset-s-13 top-0 flex h-8 items-center gap-1.5 text-xl tracking-tight will-change-[translate] sm:text-2xl lg:inset-s-4"
        :style="{ translate: `0 ${label.y}px` }"
      >
        <span class="truncate font-bold text-highlighted">{{ label.month }}</span>
        <span class="hidden font-normal text-muted sm:inline">{{ label.year }}</span>
      </div>
    </div>
  </div>
</template>
