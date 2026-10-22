<script setup lang="ts">
import { computed } from 'vue'
import { useCalendar } from '#imports'
import type { CalendarAppSlots, CalendarToolbarSlotProps, CalendarView } from '../types'
import type { CalendarTitle } from '../utils/dates'

const props = withDefaults(defineProps<{ title: CalendarTitle, viewSwitcherPlacement?: 'center' | 'right' }>(), {
  viewSwitcherPlacement: 'center'
})
defineSlots<Pick<CalendarAppSlots, 'view-switcher' | 'previous' | 'today' | 'next'>>()
const calendar = useCalendar()
const viewOptions = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' }
] satisfies { label: string, value: CalendarView }[]
const slotProps = computed<CalendarToolbarSlotProps>(() => ({
  date: calendar.date.value,
  view: calendar.view.value,
  views: viewOptions.map(option => option.value),
  setView: calendar.setView,
  goToPrevious: () => calendar.move(-1),
  goToToday: calendar.goToToday,
  goToNext: () => calendar.move(1)
}))

function changeView(value: string | number) {
  if (value === 'day' || value === 'week' || value === 'month') {
    calendar.setView(value as CalendarView)
  }
}
</script>

<template>
  <header class="absolute inset-x-0 top-0 z-10 flex h-[calc(var(--ui-header-height)+0.5rem)] items-center gap-2 border-b border-default bg-default px-4 pt-2 sm:gap-4">
    <h1
      class="flex min-w-0 flex-1 items-baseline gap-1.5 truncate text-xl tracking-tight transition-opacity duration-0 sm:text-2xl"
      :class="[
        calendar.view.value === 'month' && calendar.monthLabelsVisible.value ? 'opacity-0 delay-150' : 'opacity-100',
        props.viewSwitcherPlacement === 'right' ? 'order-1' : undefined
      ]"
    >
      <span class="truncate font-bold text-highlighted">{{ title.months }}</span>
      <span class="hidden font-normal text-muted sm:inline">{{ title.year }}</span>
    </h1>

    <div
      class="shrink-0"
      :class="props.viewSwitcherPlacement === 'right' ? 'order-3' : 'mx-auto'"
    >
      <slot name="view-switcher" v-bind="slotProps">
        <UTabs
          :items="viewOptions"
          :model-value="calendar.view.value"
          :content="false"
          size="sm"
          color="neutral"
          :ui="{ indicator: 'bg-default', trigger: 'data-[state=active]:z-10 data-[state=active]:text-highlighted data-[state=active]:before:bg-default' }"
          class="w-20 sm:w-42 lg:w-48"
          @update:model-value="changeView"
        >
          <template #default="{ item }">
            <span class="sm:hidden">{{ item.label.charAt(0) }}</span>
            <span class="hidden sm:inline">{{ item.label }}</span>
          </template>
        </UTabs>
      </slot>
    </div>

    <div
      class="flex items-center justify-end gap-1 sm:gap-2 md:flex-1"
      :class="props.viewSwitcherPlacement === 'right' ? 'order-2' : undefined"
    >
      <UBadge
        v-if="calendar.online.value && calendar.pendingCount.value"
        icon="i-lucide-loader-circle"
        color="neutral"
        variant="subtle"
        :label="calendar.pendingCount.value > 1 ? String(calendar.pendingCount.value) : 'Saving'"
        aria-label="Saving calendar changes"
      />
      <UBadge
        v-if="!calendar.online.value"
        icon="i-lucide-cloud-off"
        color="warning"
        variant="subtle"
        :label="calendar.pendingCount.value ? String(calendar.pendingCount.value) : undefined"
        aria-label="Offline. Changes will sync when reconnected."
      />
      <UButton icon="i-lucide-search" color="neutral" variant="ghost" aria-label="Search events" @click="calendar.openSearch()" />
      <slot name="previous" v-bind="slotProps">
        <UTooltip text="Previous">
          <UButton icon="i-lucide-chevron-left" color="neutral" variant="soft" size="sm" aria-label="Previous range" @click="calendar.move(-1)" />
        </UTooltip>
      </slot>
      <slot name="today" v-bind="slotProps">
        <UTooltip text="Today">
          <UButton color="neutral" variant="soft" size="sm" class="hidden sm:inline-flex" @click="calendar.goToToday()">Today</UButton>
        </UTooltip>
      </slot>
      <slot name="next" v-bind="slotProps">
        <UTooltip text="Next">
          <UButton icon="i-lucide-chevron-right" color="neutral" variant="soft" size="sm" aria-label="Next range" @click="calendar.move(1)" />
        </UTooltip>
      </slot>
      <UButton icon="i-lucide-plus" color="primary" size="sm" aria-label="Create event" @click="calendar.openEvent(undefined, calendar.date.value)" />
    </div>
  </header>
</template>
