<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import type { CalendarController, CalendarSidebarSlots } from '../types'

const props = defineProps<{ calendar: CalendarController }>()
const calendar = computed(() => props.calendar)
const open = defineModel<boolean>('open', { default: true })
defineSlots<CalendarSidebarSlots>()
const calendarDotClasses = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error'
}

const selectedDate = computed({
  get: () => {
    const date = calendar.value.date.value
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  },
  set: (value: CalendarDate | null) => {
    if (value) {
      calendar.value.setDate(value.toDate(getLocalTimeZone()))
    }
  }
})

function isCalendarVisible(id: string): boolean {
  return calendar.value.visibleCalendarIds.value.includes(id)
}

function toggleCalendar(id: string): void {
  calendar.value.toggleCalendar(id)
}

function setCalendarDate(date: Date): void {
  calendar.value.setDate(date)
}

function openSearch(): Promise<void> {
  return calendar.value.openSearch()
}

onMounted(() => {
  if (window.matchMedia('(max-width: 1023px)').matches) {
    open.value = false
  }
})
</script>

<template>
  <USidebar
    v-model:open="open"
    variant="floating"
    :menu="{ inset: true, transition: false }"
    :ui="{ container: 'p-2 pe-px border-0', body: 'pt-1', inner: 'bg-default ring ring-black/8 shadow-2xl dark:ring-white/10 divide-none', footer: 'p-2 border-t border-black/8 dark:border-white/10' }"
  >
    <template #header="{ close }">
      <slot name="header" :calendar="calendar" :close="close">
        <div class="flex items-end gap-0.5 rounded-md text-highlighted outline-primary/25 focus-visible:outline-3">
          <svg class="h-8 w-auto shrink-0" viewBox="0 0 264 264" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M146.496 211.2H234.822C237.627 211.2 240.383 210.468 242.813 209.078C245.242 207.688 247.259 205.688 248.662 203.279C250.064 200.871 250.801 198.139 250.8 195.359C250.799 192.579 250.059 189.847 248.655 187.44L189.337 85.612C187.935 83.2043 185.918 81.2049 183.489 79.8147C181.06 78.4246 178.305 77.6927 175.5 77.6927C172.695 77.6927 169.94 78.4246 167.511 79.8147C165.082 81.2049 163.065 83.2043 161.663 85.612L146.496 111.666L116.841 60.7179C115.438 58.3104 113.42 56.3113 110.991 54.9214C108.561 53.5315 105.805 52.7998 103 52.7998C100.195 52.7998 97.4386 53.5315 95.0089 54.9214C92.5793 56.3113 90.5615 58.3104 89.1583 60.7179L15.3453 187.44C13.9411 189.847 13.2012 192.579 13.2 195.359C13.1987 198.139 13.9363 200.871 15.3384 203.279C16.7405 205.688 18.7578 207.688 21.1873 209.078C23.6168 210.468 26.3728 211.2 29.1783 211.2H84.6219C106.589 211.2 122.789 201.636 133.937 182.979L161 136.526L175.496 111.666L219 186.34H161L146.496 211.2ZM83.7181 186.314L45.0255 186.306L103.026 86.7466L131.966 136.526L112.589 169.798C105.186 181.904 96.7763 186.314 83.7181 186.314Z" fill="var(--ui-primary)" />
          </svg>
          <span class="text-xl font-bold text-highlighted">{{ calendar.t('calendar') }}</span>
        </div>
        <div class="ms-auto flex items-center gap-1.5">
          <UButton icon="i-lucide-plus" color="primary" size="sm" :aria-label="calendar.t('createEvent')" @click="calendar.openEvent(undefined, calendar.date.value)" />
          <UButton icon="i-lucide-x" color="neutral" variant="soft" size="sm" :aria-label="calendar.t('closeMenu')" class="lg:hidden" @click="close" />
        </div>
      </slot>
    </template>

    <template #default>
      <slot name="content" :calendar="calendar">
        <slot name="search" :calendar="calendar" :open-search="openSearch" :shortcuts="calendar.shortcuts">
          <UButton
            icon="i-lucide-search"
            :label="calendar.t('search')"
            color="neutral"
            variant="soft"
            class="w-full justify-start"
            @click="openSearch"
          >
            <template v-if="calendar.shortcuts" #trailing>
              <span class="hidden items-center gap-0.5 lg:flex">
                <UKbd value="meta" variant="soft" />
                <UKbd value="k" variant="soft" />
              </span>
            </template>
          </UButton>
        </slot>

        <div v-if="calendar.calendars.value.length" class="flex flex-col gap-3">
          <slot
            name="calendars-header"
            :calendars="calendar.calendars.value"
            :visible-count="calendar.visibleCalendarIds.value.length"
            :total-count="calendar.calendars.value.length"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-highlighted">{{ calendar.t('myCalendars') }}</h2>
              <UBadge color="neutral" variant="subtle" :label="String(calendar.calendars.value.length)" />
            </div>
          </slot>

          <slot
            name="calendar-list"
            :calendars="calendar.calendars.value"
            :visible-calendar-ids="calendar.visibleCalendarIds.value"
            :is-visible="isCalendarVisible"
            :toggle-calendar="toggleCalendar"
          >
            <div class="flex flex-col gap-2">
              <template v-for="item in calendar.calendars.value" :key="item.id">
                <slot name="calendar" :item="item" :selected="isCalendarVisible(item.id)" :toggle="() => toggleCalendar(item.id)">
                  <UCheckbox
                    :label="item.name"
                    :color="item.color"
                    :model-value="isCalendarVisible(item.id)"
                    @update:model-value="toggleCalendar(item.id)"
                  >
                    <template #label>
                      <span class="flex min-w-0 items-center gap-2">
                        <span class="size-2.5 shrink-0 rounded-full" :class="calendarDotClasses[item.color]" />
                        <span class="truncate">{{ item.name }}</span>
                      </span>
                    </template>
                  </UCheckbox>
                </slot>
              </template>
            </div>
          </slot>
        </div>

        <USeparator class="mt-auto" />

        <slot name="mini-calendar" :date="calendar.date.value" :locale="calendar.locale" :set-date="setCalendarDate">
          <UCalendar
            v-model="selectedDate"
            :locale="calendar.locale"
            :week-starts-on="1"
            :year-controls="false"
            size="xs"
            fixed-weeks
            :ui="{ root: 'w-full' }"
          />
        </slot>
      </slot>
    </template>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" :calendar="calendar" />
    </template>
  </USidebar>
</template>
