<script setup lang="ts">
import type { CalendarDefinition, CalendarEvent } from '@evanschleret/nuxt-ui-calendar/runtime/types'
import CustomEventModal from './components/CustomEventModal.vue'

const calendars: CalendarDefinition[] = [
  { id: 'work', name: 'Work', color: 'primary' }
]

const events = ref<CalendarEvent[]>([])
</script>

<template>
  <AcmeCalendarApp
    v-model:events="events"
    :calendars="calendars"
    :event-modal="CustomEventModal"
  />
</template>
