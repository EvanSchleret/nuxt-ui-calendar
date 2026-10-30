<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@nuxt/ui/composables'
import { createCalendarController, provideCalendar } from '#imports'
import CalendarMonthView from './MonthView.vue'
import CalendarToolbar from './Toolbar.vue'
import CalendarWeekView from './WeekView.vue'
import CalendarYearView from './YearView.vue'
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
  <div class="ui-calendar uical:cal:relative uical:cal:flex uical:cal:h-full uical:cal:min-h-152 uical:cal:overflow-hidden uical:cal:bg-default uical:cal:text-default">
    <div class="uical:cal:relative uical:cal:flex uical:cal:min-w-0 uical:cal:flex-1 uical:cal:flex-col uical:cal:overflow-hidden">
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
        class="uical:cal:absolute uical:cal:inset-x-4 uical:cal:top-18 uical:cal:z-40"
      />

      <div class="uical:cal:absolute uical:cal:inset-0 uical:cal:flex uical:cal:min-h-0 uical:cal:flex-col">
        <CalendarYearView v-if="calendar.view.value === 'year'" />
        <CalendarMonthView v-else-if="calendar.view.value === 'month'" />
        <CalendarWeekView v-else />
      </div>
    </div>
  </div>
</template>
