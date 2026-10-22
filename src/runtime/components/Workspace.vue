<script setup lang="ts">
import { computed, ref } from 'vue'
import { createCalendarController, provideCalendar } from '#imports'
import type { CalendarAppEmits, CalendarAppProps, CalendarAppSlots } from '../types'
import { formatCalendarTitle } from '../utils/dates'

const props = defineProps<CalendarAppProps>()
const emit = defineEmits<CalendarAppEmits>()
const calendar = createCalendarController(props, emit)
provideCalendar(calendar)

const sidebarOpen = ref(true)
const title = computed(() => formatCalendarTitle(calendar.date.value, calendar.view.value, calendar.locale))

defineSlots<CalendarAppSlots>()
</script>

<template>
  <div class="ui-calendar relative flex h-full min-h-152 overflow-hidden bg-default text-default">
    <CalendarSidebar v-model:open="sidebarOpen">
      <template v-if="$slots['sidebar-footer']" #footer>
        <slot name="sidebar-footer" />
      </template>
    </CalendarSidebar>

    <div class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      <CalendarToolbar
        :title="title"
        :view-switcher-placement="props.viewSwitcherPlacement ?? 'center'"
        @menu="sidebarOpen = !sidebarOpen"
      >
        <template v-if="$slots['view-switcher']" #view-switcher="slotProps">
          <slot name="view-switcher" v-bind="slotProps" />
        </template>
        <template v-if="$slots.previous" #previous="slotProps">
          <slot name="previous" v-bind="slotProps" />
        </template>
        <template v-if="$slots.today" #today="slotProps">
          <slot name="today" v-bind="slotProps" />
        </template>
        <template v-if="$slots.next" #next="slotProps">
          <slot name="next" v-bind="slotProps" />
        </template>
      </CalendarToolbar>

      <UAlert
        v-if="calendar.error.value"
        color="error"
        variant="subtle"
        :title="calendar.error.value"
        class="absolute inset-x-4 top-18 z-40"
      />

      <div class="absolute inset-0 flex min-h-0 flex-col">
        <CalendarMonthView v-if="calendar.view.value === 'month'" />
        <CalendarWeekView v-else />
      </div>
    </div>
  </div>
</template>
