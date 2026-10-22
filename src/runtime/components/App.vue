<script setup lang="ts">
import type { CalendarAppEmits, CalendarAppProps } from '../types'

const props = withDefaults(defineProps<CalendarAppProps>(), {
  events: () => [],
  calendars: () => [],
  initialView: 'week',
  locale: 'en-US'
})

const emit = defineEmits<CalendarAppEmits>()
</script>

<template>
  <UApp>
    <CalendarWorkspace
      v-bind="props"
      @update:events="emit('update:events', $event)"
      @update:date="emit('update:date', $event)"
      @update:view="emit('update:view', $event)"
      @create="emit('create', $event)"
      @update="emit('update', $event)"
      @delete="emit('delete', $event)"
    />
  </UApp>
</template>
