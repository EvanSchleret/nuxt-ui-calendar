<script setup lang="ts">
import type { CalendarEventModalProps, CalendarEventModalResult } from '@evanschleret/nuxt-ui-calendar/runtime/types'

const props = defineProps<CalendarEventModalProps>()
const emit = defineEmits<{ close: [result: CalendarEventModalResult] }>()
</script>

<template>
  <UModal title="Custom event">
    <template #body>
      <p>{{ props.event?.title ?? props.initialStart.toISOString() }}</p>
      <UButton @click="emit('close', null)">
        Cancel
      </UButton>
    </template>
  </UModal>
</template>
