<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { useCalendar } from '#imports'

const calendar = useCalendar()
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
    const date = calendar.date.value
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  },
  set: (value: CalendarDate | null) => {
    if (value) {
      calendar.setDate(value.toDate(getLocalTimeZone()))
    }
  }
})
</script>

<template>
  <aside class="flex min-h-0 w-full flex-col gap-5 overflow-y-auto p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 font-semibold text-highlighted">
        <UIcon name="i-lucide-calendar-days" class="size-5 text-primary" />
        <span>Calendar</span>
      </div>
      <UButton icon="i-lucide-plus" color="primary" size="sm" aria-label="Create event" @click="calendar.openEvent(undefined, calendar.date.value)" />
    </div>

    <UCalendar
      v-model="selectedDate"
      :locale="calendar.locale"
      :month-controls="true"
      :year-controls="false"
      :ui="{ root: 'w-full', grid: 'w-full' }"
    />

    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-highlighted">My calendars</h2>
        <UBadge color="neutral" variant="subtle" :label="String(calendar.calendars.value.length)" />
      </div>

      <div v-if="calendar.calendars.value.length" class="flex flex-col gap-2">
        <UCheckbox
          v-for="item in calendar.calendars.value"
          :key="item.id"
          :label="item.name"
          :model-value="!calendar.hiddenCalendarIds.value.includes(item.id)"
          @update:model-value="calendar.toggleCalendar(item.id)"
        >
          <template #label>
            <span class="flex min-w-0 items-center gap-2">
              <span class="size-2.5 shrink-0 rounded-full" :class="calendarDotClasses[item.color]" />
              <span class="truncate">{{ item.name }}</span>
            </span>
          </template>
        </UCheckbox>
      </div>

      <p v-else class="text-sm text-muted">Add calendars through the `calendars` prop.</p>
    </div>

    <div class="mt-auto rounded-lg border border-default bg-elevated/50 p-3">
      <div class="flex items-center gap-2 text-sm font-medium text-highlighted">
        <UIcon name="i-lucide-keyboard" class="size-4 text-muted" />
        Keyboard shortcuts
      </div>
      <dl class="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-xs text-muted">
        <dt>Today</dt><dd><UKbd value="T" /></dd>
        <dt>New event</dt><dd><UKbd value="N" /></dd>
        <dt>Search</dt><dd><UKbd value="⌘ K" /></dd>
        <dt>Change view</dt><dd><span><UKbd value="D" /> <UKbd value="W" /> <UKbd value="M" /></span></dd>
        <dt>Navigate</dt><dd><span><UKbd value="←" /> <UKbd value="→" /></span></dd>
      </dl>
    </div>
  </aside>
</template>
