<script setup lang="ts">
import { translateCalendar } from '../utils/i18n'

const emit = defineEmits<{ close: [confirmed: boolean] }>()
const props = defineProps<{
  title: string
  description: string
  locale: string
}>()
const t = (key: 'cancel' | 'deleteEvent') => translateCalendar(props.locale, key)
</script>

<template>
  <UModal :title="title" :description="description" :ui="{ content: 'ui-calendar', footer: 'uical:cal:justify-end' }" @update:open="open => !open && emit('close', false)">
    <template #footer>
      <UButton :label="t('cancel')" color="neutral" variant="outline" @click="emit('close', false)" />
      <UButton :label="t('deleteEvent')" color="error" @click="emit('close', true)" />
    </template>
  </UModal>
</template>
