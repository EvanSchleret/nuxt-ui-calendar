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
const viewOptions = computed(() => [
  { label: calendar.t('day'), value: 'day' },
  { label: calendar.t('week'), value: 'week' },
  { label: calendar.t('month'), value: 'month' },
  { label: calendar.t('year'), value: 'year' }
] satisfies { label: string, value: CalendarView }[])
const slotProps = computed<CalendarToolbarSlotProps>(() => ({
  date: calendar.date.value,
  view: calendar.view.value,
  views: viewOptions.value.map(option => option.value),
  setView: calendar.setView,
  goToPrevious: () => calendar.move(-1),
  goToToday: calendar.goToToday,
  goToNext: () => calendar.move(1)
}))

function changeView(value: string | number) {
  if (value === 'day' || value === 'week' || value === 'month' || value === 'year') {
    calendar.setView(value as CalendarView)
  }
}
</script>

<template>
  <div class="uical:cal:pointer-events-none uical:cal:absolute uical:cal:inset-0 uical:cal:z-10">
    <header class="uical:cal:pointer-events-auto uical:cal:absolute uical:cal:inset-x-0 uical:cal:top-0 uical:cal:z-10 uical:cal:flex uical:cal:h-[calc(var(--ui-header-height)+0.5rem)] uical:cal:items-center uical:cal:gap-2 uical-border-bottom uical:cal:border-default uical:cal:bg-default uical:cal:px-4 uical:cal:pt-2 uical:cal:sm:gap-4">
      <h1
        class="uical:cal:flex uical:cal:min-w-0 uical:cal:flex-1 uical:cal:items-baseline uical:cal:gap-1.5 uical:cal:truncate uical:cal:text-xl uical-tracking-tight uical-transition-opacity uical-duration-0 uical:cal:sm:text-2xl"
        :class="[
          calendar.view.value === 'month' && calendar.monthLabelsVisible.value ? 'uical:cal:opacity-0 uical:cal:delay-150' : 'uical:cal:opacity-100',
          props.viewSwitcherPlacement === 'right' ? 'uical:cal:order-1' : undefined
        ]"
      >
        <span class="uical:cal:truncate uical-font-bold uical:cal:text-highlighted">{{ title.months }}</span>
        <span class="uical:cal:hidden uical-font-normal uical:cal:text-muted uical:cal:sm:inline">{{ title.year }}</span>
      </h1>

      <div
        class="uical-view-switcher uical:cal:shrink-0"
        :class="props.viewSwitcherPlacement === 'right' ? 'uical:cal:order-3' : 'uical:cal:mx-auto'"
      >
        <slot name="view-switcher" v-bind="slotProps">
          <UTabs
            :items="viewOptions"
            :model-value="calendar.view.value"
            :content="false"
            size="sm"
            color="neutral"
            :ui="{ indicator: 'uical:cal:bg-default', trigger: 'uical:cal:data-[state=active]:z-10 uical:cal:data-[state=active]:text-highlighted' }"
            class="uical:cal:w-24 uical:cal:sm:w-42 uical:cal:lg:w-48"
            @update:model-value="changeView"
          >
            <template #default="{ item }">
              <span class="uical:cal:sm:hidden">{{ item.label.charAt(0) }}</span>
              <span class="uical:cal:hidden uical:cal:sm:inline">{{ item.label }}</span>
            </template>
          </UTabs>
        </slot>
      </div>

      <div
        class="uical:cal:flex uical:cal:items-center uical:cal:justify-end uical:cal:gap-1 uical:cal:sm:gap-2 uical:cal:md:flex-1"
        :class="props.viewSwitcherPlacement === 'right' ? 'uical:cal:order-2' : undefined"
      >
        <UBadge
          v-if="calendar.online.value && calendar.pendingCount.value"
          icon="i-lucide-loader-circle"
          color="neutral"
          variant="subtle"
          :label="calendar.pendingCount.value > 1 ? String(calendar.pendingCount.value) : calendar.t('saving')"
          :aria-label="calendar.t('savingCalendarChanges')"
        />
        <UBadge
          v-if="!calendar.online.value"
          icon="i-lucide-cloud-off"
          color="warning"
          variant="subtle"
          :label="calendar.pendingCount.value ? String(calendar.pendingCount.value) : undefined"
          :aria-label="calendar.t('offlineSyncDescription')"
        />
        <UButton icon="i-lucide-search" color="neutral" variant="ghost" :aria-label="calendar.t('searchEvents')" @click="calendar.openSearch()" />
        <slot name="previous" v-bind="slotProps">
          <UTooltip :text="calendar.t('previous')">
            <UButton icon="i-lucide-chevron-left" color="neutral" variant="soft" size="sm" :aria-label="calendar.t('previousRange')" @click="calendar.move(-1)" />
          </UTooltip>
        </slot>
        <div class="uical:cal:hidden uical:cal:lg:flex">
          <slot name="today" v-bind="slotProps">
            <UTooltip :text="calendar.t('today')">
              <UButton color="neutral" variant="soft" size="sm" @click="calendar.goToToday()">{{ calendar.t('today') }}</UButton>
            </UTooltip>
          </slot>
        </div>
        <slot name="next" v-bind="slotProps">
          <UTooltip :text="calendar.t('next')">
            <UButton icon="i-lucide-chevron-right" color="neutral" variant="soft" size="sm" :aria-label="calendar.t('nextRange')" @click="calendar.move(1)" />
          </UTooltip>
        </slot>
        <UButton icon="i-lucide-plus" color="primary" size="sm" class="uical:cal:hidden uical:cal:lg:inline-flex" :aria-label="calendar.t('createEvent')" @click="calendar.openEvent(undefined, calendar.date.value)" />
      </div>
    </header>

    <div class="uical:cal:pointer-events-none uical:cal:absolute uical:cal:inset-x-4 uical:cal:bottom-4 uical:cal:z-40 uical:cal:flex uical:cal:justify-end uical:cal:gap-2 uical:cal:lg:hidden" :style="{ bottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }">
      <div class="uical:cal:flex uical:cal:pointer-events-auto">
        <slot name="today" v-bind="slotProps">
          <UTooltip :text="calendar.t('today')">
            <UButton color="neutral" variant="soft" size="md" @click="calendar.goToToday()">{{ calendar.t('today') }}</UButton>
          </UTooltip>
        </slot>
      </div>
      <UButton class="uical:cal:pointer-events-auto" icon="i-lucide-plus" color="primary" size="md" :aria-label="calendar.t('createEvent')" @click="calendar.openEvent(undefined, calendar.date.value)" />
    </div>
  </div>
</template>
