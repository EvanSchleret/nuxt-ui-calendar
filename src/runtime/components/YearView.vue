<script setup lang="ts">
import { computed } from 'vue'
import { addDays, isToday, isWeekend, startOfWeek } from 'date-fns'
import { useCalendar } from '#imports'

const calendar = useCalendar()
const weekdayStart = startOfWeek(new Date(2024, 0, 7), { weekStartsOn: 1 })
const weekdays = computed(() => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(calendar.locale, { weekday: 'narrow' }).format(addDays(weekdayStart, index))))
const months = computed(() => Array.from({ length: 12 }, (_, index) => {
  const first = new Date(calendar.date.value.getFullYear(), index, 1)
  const start = startOfWeek(first, { weekStartsOn: 1 })

  return {
    first,
    label: new Intl.DateTimeFormat(calendar.locale, { month: 'long' }).format(first),
    days: Array.from({ length: 42 }, (_, offset) => {
      const day = addDays(start, offset)
      return { day, inMonth: day.getMonth() === index }
    })
  }
}))

function openMonth(date: Date) {
  calendar.setDate(date)
  calendar.setView('month')
}

function openDay(date: Date) {
  calendar.setDate(date)
  calendar.setView('day')
}
</script>

<template>
  <div data-calendar-view="year" class="uical:cal:flex uical:cal:min-h-0 uical:cal:flex-1 uical:cal:flex-col">
    <UScrollArea
      class="uical:cal:flex-1 uical:cal:overflow-y-auto uical-scroll-y uical:cal:scrollbar-gutter-stable"
      :style="{ scrollPaddingTop: 'calc(var(--ui-header-height) + 1rem)' }"
    >
      <div class="uical:cal:grid uical:cal:grid-cols-3 uical:cal:gap-x-4 uical:cal:gap-y-6 uical:cal:px-4 uical:cal:pb-24 uical:cal:pt-[calc(var(--ui-header-height)+1.5rem)] uical:cal:lg:grid-cols-4 uical:cal:lg:gap-x-6 uical:cal:lg:px-6 uical:cal:lg:pb-8">
        <section v-for="month in months" :key="month.first.getMonth()" class="uical:cal:relative">
          <button
            type="button"
            class="uical:cal:inline-block uical:cal:rounded-md uical:cal:text-base uical-font-semibold uical:cal:text-highlighted uical-focus-outline uical-outline-primary uical:cal:sm:text-lg uical:cal:max-sm:hidden"
            :aria-label="calendar.t('openMonth', { month: month.label })"
            @click="openMonth(month.first)"
          >
            {{ month.label }}
          </button>

          <div class="uical:cal:mt-2 uical:cal:hidden uical:cal:grid-cols-7 uical:cal:text-center uical:cal:text-[10px] uical-font-medium uical:cal:text-dimmed uical:cal:sm:grid">
            <span v-for="(weekday, index) in weekdays" :key="index">{{ weekday }}</span>
          </div>

          <div class="uical:cal:mt-1 uical:cal:hidden uical:cal:grid-cols-7 uical:cal:justify-items-center uical:cal:gap-y-0.5 uical:cal:sm:grid">
            <template v-for="{ day, inMonth } in month.days" :key="day.getTime()">
              <button
                v-if="inMonth"
                type="button"
                class="uical:cal:inline-flex uical:cal:aspect-square uical:cal:w-full uical:cal:max-w-4 uical:cal:items-center uical:cal:justify-center uical:cal:rounded-full uical:cal:text-[9px] uical-tabular-nums uical-transition-colors uical-focus-outline uical-outline-inverted uical:cal:sm:size-6 uical:cal:sm:max-w-none uical:cal:sm:text-xs uical:cal:md:pointer-coarse:size-8 uical:cal:md:pointer-coarse:text-sm"
                :class="isToday(day)
                  ? 'uical:cal:bg-primary uical:cal:font-semibold uical:cal:text-inverted uical-outline-primary'
                  : [isWeekend(day) ? 'uical:cal:text-muted' : 'uical:cal:text-default', 'uical:cal:hover:bg-(--control-bg) uical:cal:active:bg-(--control-bg)']"
                :aria-label="calendar.t('openDate', { date: day.toLocaleDateString(calendar.locale, { dateStyle: 'full' }) })"
                @click="openDay(day)"
              >
                {{ day.getDate() }}
              </button>
              <span v-else class="uical:cal:aspect-square uical:cal:w-full uical:cal:max-w-4 uical:cal:sm:size-6 uical:cal:sm:max-w-none" />
            </template>
          </div>

          <button
            type="button"
            class="uical:cal:grid uical:cal:w-full uical:cal:grid-cols-7 uical:cal:gap-y-0.5 uical:cal:rounded-md uical:cal:p-1 uical:cal:text-left uical:cal:text-highlighted uical-focus-outline uical-outline-primary uical:cal:sm:hidden"
            :aria-label="calendar.t('openMonth', { month: month.label })"
            @click="openMonth(month.first)"
          >
            <span class="uical:cal:col-span-7 uical:cal:mb-1 uical:cal:text-sm uical-font-semibold">{{ month.label }}</span>
            <span
              v-for="{ day, inMonth } in month.days"
              :key="day.getTime()"
              class="uical:cal:inline-flex uical:cal:aspect-square uical:cal:w-full uical:cal:items-center uical:cal:justify-center uical:cal:rounded-full uical:cal:text-[9px] uical-tabular-nums"
              :class="[
                !inMonth && 'uical:cal:invisible',
                inMonth && isToday(day) && 'uical:cal:bg-primary uical:cal:font-semibold uical:cal:text-inverted',
                inMonth && !isToday(day) && (isWeekend(day) ? 'uical:cal:text-muted' : 'uical:cal:text-default')
              ]"
            >
              {{ inMonth ? day.getDate() : '' }}
            </span>
          </button>
        </section>
      </div>
    </UScrollArea>
  </div>
</template>
