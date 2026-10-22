<script setup lang="ts">
import { computed } from 'vue'
import { useCalendar } from '#imports'
import type { CalendarView } from '../types'

defineProps<{ title: string }>()
const emit = defineEmits<{ menu: [] }>()
const calendar = useCalendar()
const compactDate = computed(() => calendar.date.value.toLocaleDateString(calendar.locale, { month: 'long', year: 'numeric' }))

function changeView(value: string | number) {
  if (value === 'day' || value === 'week' || value === 'month') {
    calendar.setView(value as CalendarView)
  }
}
</script>

<template>
  <header class="flex min-h-16 items-center gap-2 border-b border-default px-3 sm:gap-4 sm:px-5">
    <UButton
      icon="i-lucide-menu"
      color="neutral"
      variant="ghost"
      aria-label="Open calendar menu"
      class="lg:hidden"
      @click="emit('menu')"
    />

    <h1 class="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-highlighted sm:text-xl">
      <span class="hidden sm:inline">{{ title }}</span>
      <span class="sm:hidden">{{ compactDate }}</span>
    </h1>

    <UTabs
      :items="[
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' }
      ]"
      :model-value="calendar.view.value"
      :content="false"
      size="sm"
      color="neutral"
      class="hidden w-48 sm:block"
      @update:model-value="changeView"
    />

    <USelect
      :items="[
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' }
      ]"
      :model-value="calendar.view.value"
      aria-label="Calendar view"
      class="w-20 sm:hidden"
      @update:model-value="changeView"
    />

    <div class="flex items-center gap-1 sm:gap-2">
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
      <UButton color="neutral" variant="soft" class="hidden rounded-full sm:inline-flex" @click="calendar.goToToday()">Today</UButton>
      <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" aria-label="Previous range" @click="calendar.move(-1)" />
      <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" aria-label="Next range" @click="calendar.move(1)" />
      <UButton icon="i-lucide-plus" color="primary" aria-label="Create event" @click="calendar.openEvent(undefined, calendar.date.value)" />
    </div>
  </header>
</template>
