<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@nuxt/ui/composables'
import { createCalendarController, provideCalendar } from '#imports'
import CalendarMonthView from './MonthView.vue'
import CalendarToolbar from './Toolbar.vue'
import CalendarWeekView from './WeekView.vue'
import type { CalendarAppEmits, CalendarAppProps, CalendarAppSlots } from '../types'
import { formatCalendarTitle } from '../utils/dates'

const props = defineProps<CalendarAppProps>()
const emit = defineEmits<CalendarAppEmits>()
const { code: appLocale } = useLocale()
const calendar = createCalendarController(props, emit, appLocale)
provideCalendar(calendar)

const title = computed(() => formatCalendarTitle(calendar.date.value, calendar.view.value, calendar.locale))

defineSlots<CalendarAppSlots>()
defineExpose({ calendar })
</script>

<template>
  <div class="ui-calendar relative flex h-full min-h-152 overflow-hidden bg-default text-default">
    <div class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      <CalendarToolbar
        :title="title"
        :view-switcher-placement="props.viewSwitcherPlacement ?? 'center'"
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
