<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import CalendarWorkspace from './Workspace.vue'
import type { CalendarAppEmits, CalendarAppProps, CalendarAppSlots, CalendarController } from '../types'

const workspace = useTemplateRef<{ calendar: CalendarController }>('workspace')
const calendar = computed(() => workspace.value?.calendar)
defineExpose({ calendar })

const props = withDefaults(defineProps<CalendarAppProps>(), {
  events: () => [],
  calendars: () => [],
  initialView: 'week',
  viewSwitcherPlacement: 'center',
  locale: 'en-US',
  shortcuts: false,
  infiniteScroll: true
})

const emit = defineEmits<CalendarAppEmits>()

defineSlots<CalendarAppSlots>()
</script>

<template>
  <UApp>
    <CalendarWorkspace
      ref="workspace"
      v-bind="props"
      @update:events="emit('update:events', $event)"
      @update:visible-calendar-ids="emit('update:visibleCalendarIds', $event)"
      @update:date="emit('update:date', $event)"
      @update:view="emit('update:view', $event)"
      @create="emit('create', $event)"
      @update="emit('update', $event)"
      @delete="emit('delete', $event)"
    >
      <template v-if="$slots['view-switcher']" #view-switcher="slotProps">
        <slot name="view-switcher" v-bind="slotProps" />
      </template>
      <template v-if="$slots.previous" #previous="slotProps">
        <slot name="previous" v-bind="slotProps" />
      </template>
      <template v-if="$slots.today" #today="slotProps">
        <slot name="today" v-bind="slotProps" />
      </template>
      <template v-if="$slots.next" #next="slotProps">
        <slot name="next" v-bind="slotProps" />
      </template>
    </CalendarWorkspace>
  </UApp>
</template>
