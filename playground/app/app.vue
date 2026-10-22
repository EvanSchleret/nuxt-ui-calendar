<script setup lang="ts">
import type { CalendarDefinition, CalendarEvent } from '../../src/runtime/types'

const pad = (value: number) => String(value).padStart(2, '0')
const today = new Date()
const datePart = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

const calendars: CalendarDefinition[] = [
  { id: 'personal', name: 'Personal', color: 'primary' },
  { id: 'work', name: 'Work', color: 'info' },
  { id: 'health', name: 'Health', color: 'success' }
]

const events = ref<CalendarEvent[]>([
  { id: 'focus', calendarId: 'work', title: 'Focus time', start: `${datePart}T09:00:00`, end: `${datePart}T10:30:00` },
  { id: 'lunch', calendarId: 'personal', title: 'Lunch with Maya', start: `${datePart}T12:00:00`, end: `${datePart}T13:00:00` },
  { id: 'review', calendarId: 'work', title: 'Product review', start: `${datePart}T14:00:00`, end: `${datePart}T15:00:00` }
])
</script>

<template>
  <main class="h-svh p-3 sm:p-6">
    <CalendarApp v-model:events="events" :calendars="calendars" class="h-full rounded-xl border border-default shadow-sm" />
  </main>
</template>
