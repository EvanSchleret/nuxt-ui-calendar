import { computed, inject, onMounted, onUnmounted, provide, ref, shallowRef, watch, type InjectionKey, type Ref } from 'vue'
import { useCookie, useOverlay, useToast } from '#imports'
import type { CalendarAppEmits, CalendarAppProps, CalendarController, CalendarDefinition, CalendarEvent, CalendarEventModalResult, CalendarMutation, CalendarView } from '../types'
import { eventCoversDay, stepDate } from '../utils/dates'
import EventModal from '../components/EventModal.vue'
import SearchModal from '../components/SearchModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { hiddenCalendarIdsFor } from '../utils/calendars'

interface QueuedMutation {
  mutation: CalendarMutation
  previous?: CalendarEvent
}

const calendarKey: InjectionKey<CalendarController> = Symbol('nuxt-ui-calendar')

function parseInitialDate(value?: Date | string): Date {
  if (value instanceof Date) {
    return new Date(value)
  }

  if (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    }

    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return new Date()
}

function applyMutation(events: CalendarEvent[], mutation: CalendarMutation): CalendarEvent[] {
  if (mutation.type === 'delete') {
    return events.filter(event => event.id !== mutation.id)
  }

  const index = events.findIndex(event => event.id === mutation.event.id)
  if (index === -1) {
    return [...events, mutation.event]
  }

  return events.map(event => event.id === mutation.event.id ? mutation.event : event)
}

function isSameEvent(left: CalendarEvent | undefined, right: CalendarEvent | undefined): boolean {
  return !!left && !!right && left.id === right.id && left.calendarId === right.calendarId && left.title === right.title && left.start === right.start && left.end === right.end && left.allDay === right.allDay
}

export function provideCalendar(calendar: CalendarController): void {
  provide(calendarKey, calendar)
}

export function useCalendar(): CalendarController {
  const calendar = inject(calendarKey)
  if (!calendar) {
    throw new Error('Calendar components must be rendered inside <CalendarApp>.')
  }

  return calendar
}

export function createCalendarController(props: CalendarAppProps, emit: CalendarAppEmits): CalendarController {
  const toast = useToast()
  const overlay = useOverlay()
  const eventModal = overlay.create(props.eventModal ?? EventModal)
  const searchModal = overlay.create(SearchModal)
  const confirmModal = overlay.create(ConfirmDialog)

  const date = ref(parseInitialDate(props.date ?? props.initialDate))
  const view = ref<CalendarView>(props.view ?? props.initialView ?? 'week')
  const events = shallowRef<CalendarEvent[]>([...(props.events ?? [])])
  const calendars = computed<CalendarDefinition[]>(() => props.calendars ?? [])
  const storageKey = props.storageKey ?? 'nuxt-ui-calendar'
  const hiddenCalendarIds = useCookie<string[]>(`${storageKey}:hidden`, { default: () => [] })
  const visibleCalendarIds = computed(() => calendars.value.filter(calendar => !hiddenCalendarIds.value.includes(calendar.id)).map(calendar => calendar.id))
  const online = ref(true)
  const error = ref<string | null>(null)
  const monthLabelsVisible = ref(false)
  const queued = shallowRef<QueuedMutation[]>([])
  const activeMutations = ref(0)
  const pendingCount = computed(() => queued.value.length + activeMutations.value)
  const visibleEvents = computed(() => events.value.filter(event => !event.calendarId || !hiddenCalendarIds.value.includes(event.calendarId)))
  let overlayOpen = false
  let replaying = false

  watch([() => props.visibleCalendarIds, calendars], ([visibleIds]) => {
    if (visibleIds !== undefined) {
      hiddenCalendarIds.value = hiddenCalendarIdsFor(calendars.value, visibleIds)
    }
  }, { immediate: true })

  function updateEvents(next: CalendarEvent[]) {
    events.value = next
    emit('update:events', next)
  }

  function reapplyQueued(incoming: CalendarEvent[]): CalendarEvent[] {
    return queued.value.reduce((current, item) => applyMutation(current, item.mutation), incoming)
  }

  watch(() => props.events, (incoming) => {
    if (incoming) {
      events.value = reapplyQueued([...incoming])
    }
  })

  watch(() => props.date, (incoming) => {
    if (incoming) {
      date.value = parseInitialDate(incoming)
    }
  })

  watch(() => props.view, (incoming) => {
    if (incoming) {
      view.value = incoming
    }
  })

  function setDate(nextDate: Date) {
    date.value = new Date(nextDate)
    emit('update:date', date.value)
  }

  function setView(nextView: CalendarView) {
    view.value = nextView
    emit('update:view', nextView)
  }

  function move(direction: -1 | 1) {
    setDate(stepDate(date.value, view.value, direction))
  }

  function goToToday() {
    setDate(new Date())
  }

  function setVisibleCalendarIds(ids: string[]) {
    const requestedIds = new Set(ids)
    const nextVisibleIds = calendars.value.filter(calendar => requestedIds.has(calendar.id)).map(calendar => calendar.id)
    hiddenCalendarIds.value = hiddenCalendarIdsFor(calendars.value, nextVisibleIds)
    emit('update:visibleCalendarIds', nextVisibleIds)
  }

  function toggleCalendar(id: string) {
    const nextVisibleIds = new Set(visibleCalendarIds.value)
    if (nextVisibleIds.has(id)) {
      nextVisibleIds.delete(id)
    } else {
      nextVisibleIds.add(id)
    }
    setVisibleCalendarIds([...nextVisibleIds])
  }

  function eventsForDay(day: Date): CalendarEvent[] {
    return visibleEvents.value.filter(event => eventCoversDay(event, day))
  }

  function rollback(item: QueuedMutation) {
    const { mutation, previous } = item
    if (mutation.type === 'create') {
      if (isSameEvent(events.value.find(event => event.id === mutation.event.id), mutation.event)) {
        updateEvents(events.value.filter(event => event.id !== mutation.event.id))
      }
      return
    }

    if (mutation.type === 'update') {
      if (isSameEvent(events.value.find(event => event.id === mutation.event.id), mutation.event) && previous) {
        updateEvents(events.value.map(event => event.id === previous.id ? previous : event))
      }
      return
    }

    if (previous && !events.value.some(event => event.id === previous.id)) {
      updateEvents([...events.value, previous])
    }
  }

  async function send(mutation: CalendarMutation): Promise<void> {
    const previous = mutation.type === 'delete'
      ? events.value.find(event => event.id === mutation.id)
      : events.value.find(event => event.id === mutation.event.id)
    const item: QueuedMutation = { mutation, previous }
    updateEvents(applyMutation(events.value, mutation))

    if (!props.adapter) {
      if (mutation.type === 'create') {
        emit('create', mutation.event)
      } else if (mutation.type === 'update') {
        emit('update', mutation.event)
      } else {
        emit('delete', mutation.id)
      }
      return
    }

    if (!online.value) {
      queued.value = [...queued.value, item]
      return
    }

    activeMutations.value += 1
    try {
      await sendToAdapter(mutation)
    } catch {
      if (!navigator.onLine) {
        online.value = false
        queued.value = [...queued.value, item]
        return
      }

      rollback(item)
      error.value = 'The change could not be saved.'
      toast.add({ title: error.value, color: 'error' })
    } finally {
      activeMutations.value -= 1
    }
  }

  async function sendToAdapter(mutation: CalendarMutation): Promise<void> {
    const adapter = props.adapter
    if (!adapter) {
      return
    }

    if (mutation.type === 'create') {
      await adapter.create(mutation.event)
    } else if (mutation.type === 'update') {
      await adapter.update(mutation.event)
    } else {
      await adapter.delete(mutation.id)
    }
  }

  async function createEvent(event: CalendarEvent): Promise<void> {
    error.value = null
    await send({ type: 'create', event })
  }

  async function updateEvent(event: CalendarEvent): Promise<void> {
    error.value = null
    await send({ type: 'update', event })
  }

  async function removeEvent(id: string): Promise<void> {
    error.value = null
    await send({ type: 'delete', id })
  }

  async function openEvent(event?: CalendarEvent, start = new Date(date.value), allDay = false): Promise<void> {
    overlayOpen = true
    const result = await eventModal.open({
      event: event ?? null,
      calendars: calendars.value,
      initialStart: start,
      allDay,
      locale: props.locale ?? 'en-US'
    }) as CalendarEventModalResult | undefined
    overlayOpen = false

    if (!result) {
      return
    }

    if (result.action === 'delete' && event) {
      const confirmed = await confirmModal.open({
        title: 'Delete event?',
        description: `“${event.title}” will be deleted.`
      })

      if (confirmed) {
        await removeEvent(event.id)
        if (!error.value) {
          toast.add({ title: 'Event deleted', color: 'success' })
        }
      }
      return
    }

    if (result.action === 'save') {
      if (event) {
        await updateEvent(result.event)
        if (!error.value) {
          toast.add({ title: 'Event updated', color: 'success' })
        }
      } else {
        await createEvent(result.event)
        if (!error.value) {
          toast.add({ title: 'Event created', color: 'success' })
        }
      }
    }
  }

  async function openSearch(): Promise<void> {
    overlayOpen = true
    const result = await searchModal.open({
      events: visibleEvents.value,
      calendars: calendars.value,
      locale: props.locale ?? 'en-US',
      shortcuts: props.shortcuts ?? false,
      view: view.value,
      hiddenCalendarIds: hiddenCalendarIds.value,
      setView,
      goToToday,
      toggleCalendar
    })
    overlayOpen = false
    if (result) {
      setDate(new Date(result.start))
      await openEvent(result)
    }
  }

  async function replayQueue(): Promise<void> {
    if (!props.adapter || replaying || !online.value || !queued.value.length) {
      return
    }

    replaying = true
    let synced = false

    while (queued.value.length && online.value) {
      const item = queued.value[0]
      if (!item) {
        break
      }

      try {
        await sendToAdapter(item.mutation)
        queued.value = queued.value.slice(1)
        synced = true
      } catch {
        if (!navigator.onLine) {
          online.value = false
          break
        }

        rollback(item)
        queued.value = queued.value.slice(1)
        toast.add({ title: 'An offline change could not be synced', color: 'error' })
      }
    }

    if (synced) {
      toast.add({ title: 'Offline changes synced', color: 'success' })
    }
    replaying = false
  }

  const controller: CalendarController = {
    date,
    view,
    events,
    calendars,
    visibleCalendarIds,
    visibleEvents,
    hiddenCalendarIds,
    online,
    pendingCount,
    error,
    monthLabelsVisible,
    locale: props.locale ?? 'en-US',
    shortcuts: props.shortcuts ?? false,
    infiniteScroll: props.infiniteScroll ?? true,
    setDate,
    setView,
    move,
    goToToday,
    toggleCalendar,
    setVisibleCalendarIds,
    eventsForDay,
    createEvent,
    updateEvent,
    removeEvent,
    openEvent,
    openSearch
  }

  function syncOnline() {
    online.value = navigator.onLine
    if (online.value) {
      void replayQueue()
    }
  }

  function onKeydown(keyboardEvent: KeyboardEvent) {
    const target = keyboardEvent.target
    const editing = target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable="true"]')

    if (keyboardEvent.metaKey || keyboardEvent.ctrlKey) {
      if (keyboardEvent.key.toLowerCase() === 'k') {
        keyboardEvent.preventDefault()
        void openSearch()
      }
      return
    }

    if (editing || overlayOpen || keyboardEvent.altKey) {
      return
    }

    const key = keyboardEvent.key.toLowerCase()
    if (key === 't') {
      goToToday()
    } else if (key === 'd' || key === 'w' || key === 'm') {
      setView(key === 'd' ? 'day' : key === 'w' ? 'week' : 'month')
    } else if (key === 'n') {
      void openEvent(undefined, date.value)
    } else if (keyboardEvent.key === 'ArrowLeft') {
      keyboardEvent.preventDefault()
      move(-1)
    } else if (keyboardEvent.key === 'ArrowRight') {
      keyboardEvent.preventDefault()
      move(1)
    }
  }

  if (import.meta.client) {
    watch(queued, (items) => {
      try {
        localStorage.setItem(`${storageKey}:queue`, JSON.stringify(items))
      } catch {
        error.value = 'Offline changes could not be stored in this browser.'
      }
    }, { deep: true })

    watch(online, (isOnline) => {
      if (isOnline) {
        void replayQueue()
      }
    })

    watch(queued, replayQueue)
  }

  onMounted(() => {
    online.value = navigator.onLine
    window.addEventListener('online', syncOnline)
    window.addEventListener('offline', syncOnline)
    if (props.shortcuts) {
      window.addEventListener('keydown', onKeydown)
    }

    try {
      const saved = localStorage.getItem(`${storageKey}:queue`)
      if (saved) {
        queued.value = JSON.parse(saved) as QueuedMutation[]
      }
    } catch {
      queued.value = []
    }

    events.value = reapplyQueued(events.value)
    if (online.value && queued.value.length) {
      void replayQueue()
    }
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('online', syncOnline)
      window.removeEventListener('offline', syncOnline)
      if (props.shortcuts) {
        window.removeEventListener('keydown', onKeydown)
      }
    }
  })

  return controller
}

export function useCalendarEvents(): { events: Ref<CalendarEvent[]>, eventsForDay: (date: Date) => CalendarEvent[] } {
  const calendar = useCalendar()

  return {
    events: computed(() => calendar.visibleEvents.value),
    eventsForDay: calendar.eventsForDay
  }
}
