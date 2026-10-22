<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CalendarDefinition, CalendarEvent } from '../types'

const props = defineProps<{
  events: CalendarEvent[]
  calendars: CalendarDefinition[]
  locale: string
}>()

const emit = defineEmits<{ close: [event: CalendarEvent | null] }>()
const query = ref('')

const results = computed(() => {
  const value = query.value.trim().toLocaleLowerCase(props.locale)
  if (!value) {
    return []
  }

  return props.events
    .filter(event => `${event.title} ${event.description ?? ''}`.toLocaleLowerCase(props.locale).includes(value))
    .slice(0, 30)
})

function calendarName(id: string): string {
  return props.calendars.find(calendar => calendar.id === id)?.name ?? 'Calendar'
}

function dateLabel(event: CalendarEvent): string {
  return new Intl.DateTimeFormat(props.locale, { dateStyle: 'medium', timeStyle: event.allDay ? undefined : 'short' }).format(new Date(event.start))
}
</script>

<template>
  <UModal title="Search events" description="Find an event by title or description." :ui="{ content: 'sm:max-w-xl' }" @update:open="open => !open && emit('close', null)">
    <template #body>
      <div class="flex flex-col gap-3">
        <UInput v-model="query" icon="i-lucide-search" autofocus placeholder="Search your events" class="w-full" />
        <div v-if="query.trim()" class="max-h-[min(60vh,32rem)] overflow-y-auto">
          <UButton
            v-for="event in results"
            :key="event.id"
            color="neutral"
            variant="ghost"
            class="w-full justify-start"
            @click="emit('close', event)"
          >
            <template #leading>
              <span class="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
            </template>
            <span class="flex min-w-0 flex-col items-start">
              <span class="truncate font-medium">{{ event.title }}</span>
              <span class="truncate text-xs text-muted">{{ calendarName(event.calendarId) }} · {{ dateLabel(event) }}</span>
            </span>
          </UButton>
          <p v-if="!results.length" class="px-3 py-8 text-center text-sm text-muted">No matching events.</p>
        </div>
        <p v-else class="px-3 py-8 text-center text-sm text-muted">Start typing to search events.</p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-between text-xs text-muted">
        <span>Search event titles and descriptions</span>
        <UButton label="Close" color="neutral" variant="outline" @click="emit('close', null)" />
      </div>
    </template>
  </UModal>
</template>
