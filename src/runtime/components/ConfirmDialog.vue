<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()

const emit = defineEmits<{ close: [confirmed: boolean] }>()
</script>

<template>
  <UModal :title="title" :description="description" :ui="{ footer: 'justify-end' }" @update:open="open => !open && emit('close', false)">
    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="emit('close', false)" />
      <UButton label="Delete event" color="error" @click="emit('close', true)" />
    </template>
  </UModal>
</template>
