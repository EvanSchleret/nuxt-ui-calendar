<script setup lang="ts">
import { computed, ref } from 'vue'
import { createCalendarController, provideCalendar } from '#imports'
import type { CalendarAppEmits, CalendarAppProps } from '../types'
import { formatCalendarTitle } from '../utils/dates'

const props = defineProps<CalendarAppProps>()
const emit = defineEmits<CalendarAppEmits>()
const calendar = createCalendarController(props, emit)
provideCalendar(calendar)

const sidebarOpen = ref(false)
const title = computed(() => formatCalendarTitle(calendar.date.value, calendar.view.value, calendar.locale))
</script>

<template>
  <div class="ui-calendar relative flex h-full min-h-[38rem] overflow-hidden bg-default text-default">
    <CalendarSidebar class="hidden w-72 shrink-0 border-r border-default lg:flex" />

    <div class="flex min-w-0 flex-1 flex-col">
      <CalendarToolbar :title="title" @menu="sidebarOpen = true" />

      <UAlert
        v-if="calendar.error.value"
        color="error"
        variant="subtle"
        :title="calendar.error.value"
        class="mx-4 mt-3"
      />

      <div class="flex min-h-0 flex-1 flex-col">
        <CalendarMonthView v-if="calendar.view.value === 'month'" />
        <CalendarWeekView v-else />
      </div>
    </div>

    <USlideover v-model:open="sidebarOpen" side="left" title="Calendar" :ui="{ content: 'w-[min(20rem,calc(100vw-1rem))]' }">
      <template #body>
        <CalendarSidebar />
      </template>
    </USlideover>
  </div>
</template>
