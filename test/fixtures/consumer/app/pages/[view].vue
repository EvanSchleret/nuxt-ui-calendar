<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CalendarDefinition, CalendarEvent, CalendarView } from '@evanschleret/nuxt-ui-calendar/runtime/types'
import CustomEventModal from '../components/CustomEventModal.vue'

const route = useRoute()
const view = computed<CalendarView>(() => route.params.view === 'month' ? 'month' : 'week')
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
    :initial-view="view"
  />
</template>
