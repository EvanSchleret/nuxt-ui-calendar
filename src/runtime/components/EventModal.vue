<script setup lang="ts">
import { computed, ref } from 'vue'
import { addDays } from 'date-fns'
import type { CalendarEvent, CalendarEventModalProps, CalendarEventModalResult } from '../types'
import { addMinutes, dateFromLocalDateTime, dateInputValue, localDateTime } from '../utils/dates'
import { translateCalendar } from '../utils/i18n'

const props = defineProps<CalendarEventModalProps>()
const emit = defineEmits<{ close: [result: CalendarEventModalResult] }>()

const title = ref(props.event?.title ?? '')
const description = ref(props.event?.description ?? '')
const calendarId = ref(props.event?.calendarId ?? props.calendars[0]?.id ?? '')
const allDay = ref(props.event?.allDay ?? props.allDay)
const start = ref(dateInputValue(props.event ? new Date(props.event.start) : props.initialStart))
const end = ref(dateInputValue(props.event ? new Date(props.event.end) : addMinutes(props.initialStart, 60)))
const titleError = ref('')
const calendarError = ref('')
const dateError = ref('')
const calendarOptions = computed(() => props.calendars.map(calendar => ({ label: calendar.name, value: calendar.id })))
const t = (key: Parameters<typeof translateCalendar>[1]) => translateCalendar(props.locale, key)

function createId(): string {
  return crypto.randomUUID()
}

function save() {
  titleError.value = title.value.trim() ? '' : t('titleRequired')
  calendarError.value = !props.calendars.length || calendarId.value ? '' : t('selectCalendar')
  dateError.value = ''

  const startDate = dateFromLocalDateTime(start.value)
  let endDate = dateFromLocalDateTime(end.value)

  if (allDay.value) {
    startDate.setHours(0, 0, 0, 0)
    endDate = addDays(startDate, 1)
  } else if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
    dateError.value = t('endAfterStart')
  }

  if (titleError.value || calendarError.value || dateError.value) {
    return
  }

  const event: CalendarEvent = {
    id: props.event?.id ?? createId(),
    ...(calendarId.value ? { calendarId: calendarId.value } : {}),
    title: title.value.trim(),
    start: localDateTime(startDate),
    end: localDateTime(endDate),
    allDay: allDay.value,
    ...(description.value.trim() ? { description: description.value.trim() } : {})
  }

  emit('close', { action: 'save', event })
}

function requestDelete() {
  emit('close', { action: 'delete' })
}
</script>

<template>
  <UModal
    :title="event ? t('editEvent') : t('newEvent')"
    :description="event ? t('updateEventDetails') : t('addEventToCalendar')"
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="open => !open && emit('close', null)"
  >
    <template #body>
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <UFormField :label="t('title')" required :error="titleError || undefined">
          <UInput v-model="title" autofocus maxlength="100" class="w-full" :placeholder="t('eventTitle')" />
        </UFormField>

        <UFormField v-if="calendars.length" :label="t('calendar')" required :error="calendarError || undefined">
          <USelect v-model="calendarId" :items="calendarOptions" class="w-full" />
        </UFormField>

        <UCheckbox v-model="allDay" :label="t('allDayCheckbox')" />

        <div v-if="!allDay" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UFormField :label="t('starts')" required>
            <UInput v-model="start" type="datetime-local" class="w-full" />
          </UFormField>
          <UFormField :label="t('ends')" required :error="dateError || undefined">
            <UInput v-model="end" type="datetime-local" class="w-full" />
          </UFormField>
        </div>

        <UFormField :label="t('description')">
          <UTextarea v-model="description" autoresize :maxrows="5" maxlength="1000" class="w-full" :placeholder="t('addNotes')" />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-between gap-3">
        <UButton v-if="event" :label="t('delete')" color="error" variant="ghost" @click="requestDelete" />
        <span v-else />
        <div class="flex items-center gap-2">
          <UButton :label="t('cancel')" color="neutral" variant="outline" @click="emit('close', null)" />
          <UButton :label="t('saveEvent')" color="primary" @click="save" />
        </div>
      </div>
    </template>
  </UModal>
</template>
