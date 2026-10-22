export type CalendarMessageKey =
  | 'calendar'
  | 'day'
  | 'week'
  | 'month'
  | 'today'
  | 'allDay'
  | 'allDayCheckbox'
  | 'allDayEvent'
  | 'saving'
  | 'savingCalendarChanges'
  | 'offlineSyncDescription'
  | 'searchEvents'
  | 'previous'
  | 'previousRange'
  | 'next'
  | 'nextRange'
  | 'createEvent'
  | 'closeMenu'
  | 'search'
  | 'myCalendars'
  | 'editEvent'
  | 'newEvent'
  | 'updateEventDetails'
  | 'addEventToCalendar'
  | 'title'
  | 'titleRequired'
  | 'eventTitle'
  | 'selectCalendar'
  | 'starts'
  | 'ends'
  | 'endAfterStart'
  | 'description'
  | 'addNotes'
  | 'delete'
  | 'cancel'
  | 'saveEvent'
  | 'deleteEvent'
  | 'deleteEventConfirmation'
  | 'eventDeleted'
  | 'eventUpdated'
  | 'eventCreated'
  | 'changeCouldNotBeSaved'
  | 'offlineChangeCouldNotBeSynced'
  | 'offlineChangesSynced'
  | 'offlineChangesCouldNotBeStored'
  | 'goToToday'
  | 'views'
  | 'calendars'
  | 'events'
  | 'searchCalendar'
  | 'searchEventsSwitchViews'
  | 'openDate'
  | 'more'
  | 'showMoreEvents'
  | 'resizeEvent'
  | 'doubleClickEmptySlot'
  | 'dragEventsToMove'

export type CalendarMessageParams = Record<string, string | number>

type CalendarMessages = Record<CalendarMessageKey, string>

const english: CalendarMessages = {
  calendar: 'Calendar',
  day: 'Day',
  week: 'Week',
  month: 'Month',
  today: 'Today',
  allDay: 'all-day',
  allDayCheckbox: 'All day',
  allDayEvent: 'All-day event: {title}',
  saving: 'Saving',
  savingCalendarChanges: 'Saving calendar changes',
  offlineSyncDescription: 'Offline. Changes will sync when reconnected.',
  searchEvents: 'Search events',
  previous: 'Previous',
  previousRange: 'Previous range',
  next: 'Next',
  nextRange: 'Next range',
  createEvent: 'Create event',
  closeMenu: 'Close menu',
  search: 'Search',
  myCalendars: 'My calendars',
  editEvent: 'Edit event',
  newEvent: 'New event',
  updateEventDetails: 'Update the event details.',
  addEventToCalendar: 'Add an event to your calendar.',
  title: 'Title',
  titleRequired: 'Title is required.',
  eventTitle: 'Event title',
  selectCalendar: 'Select a calendar.',
  starts: 'Starts',
  ends: 'Ends',
  endAfterStart: 'End must be after start.',
  description: 'Description',
  addNotes: 'Add notes',
  delete: 'Delete',
  cancel: 'Cancel',
  saveEvent: 'Save event',
  deleteEvent: 'Delete event',
  deleteEventConfirmation: '“{title}” will be deleted.',
  eventDeleted: 'Event deleted',
  eventUpdated: 'Event updated',
  eventCreated: 'Event created',
  changeCouldNotBeSaved: 'The change could not be saved.',
  offlineChangeCouldNotBeSynced: 'An offline change could not be synced',
  offlineChangesSynced: 'Offline changes synced',
  offlineChangesCouldNotBeStored: 'Offline changes could not be stored in this browser.',
  goToToday: 'Go to today',
  views: 'Views',
  calendars: 'Calendars',
  events: 'Events',
  searchCalendar: 'Search calendar',
  searchEventsSwitchViews: 'Search events, switch views...',
  openDate: 'Open {date}',
  more: 'more',
  showMoreEvents: 'Show {count} more events',
  resizeEvent: 'Resize {title}',
  doubleClickEmptySlot: 'Double-click an empty time slot to create an event.',
  dragEventsToMove: 'Drag events to move them.'
}

const translations: Record<string, CalendarMessages> = {
  fr: {
    calendar: 'Calendrier', day: 'Jour', week: 'Semaine', month: 'Mois', today: 'Aujourd’hui', allDay: 'toute la journée', allDayCheckbox: 'Toute la journée', allDayEvent: 'Événement sur toute la journée : {title}',
    saving: 'Enregistrement', savingCalendarChanges: 'Enregistrement des changements du calendrier', offlineSyncDescription: 'Hors ligne. Les changements seront synchronisés à la reconnexion.', searchEvents: 'Rechercher des événements', previous: 'Précédent', previousRange: 'Période précédente', next: 'Suivant', nextRange: 'Période suivante', createEvent: 'Créer un événement', closeMenu: 'Fermer le menu', search: 'Rechercher', myCalendars: 'Mes calendriers',
    editEvent: 'Modifier l’événement', newEvent: 'Nouvel événement', updateEventDetails: 'Modifier les détails de l’événement.', addEventToCalendar: 'Ajouter un événement à votre calendrier.', title: 'Titre', titleRequired: 'Le titre est obligatoire.', eventTitle: 'Titre de l’événement', selectCalendar: 'Sélectionnez un calendrier.', starts: 'Début', ends: 'Fin', endAfterStart: 'La fin doit être postérieure au début.', description: 'Description', addNotes: 'Ajouter des notes', delete: 'Supprimer', cancel: 'Annuler', saveEvent: 'Enregistrer', deleteEvent: 'Supprimer l’événement', deleteEventConfirmation: '« {title} » sera supprimé.', eventDeleted: 'Événement supprimé', eventUpdated: 'Événement modifié', eventCreated: 'Événement créé', changeCouldNotBeSaved: 'Le changement n’a pas pu être enregistré.', offlineChangeCouldNotBeSynced: 'Un changement hors ligne n’a pas pu être synchronisé', offlineChangesSynced: 'Changements hors ligne synchronisés', offlineChangesCouldNotBeStored: 'Les changements hors ligne n’ont pas pu être enregistrés dans ce navigateur.',
    goToToday: 'Aller à aujourd’hui', views: 'Affichages', calendars: 'Calendriers', events: 'Événements', searchCalendar: 'Rechercher dans le calendrier', searchEventsSwitchViews: 'Rechercher des événements, changer d’affichage…', openDate: 'Ouvrir le {date}', more: 'de plus', showMoreEvents: 'Afficher {count} événements supplémentaires', resizeEvent: 'Redimensionner {title}', doubleClickEmptySlot: 'Double-cliquez sur un créneau vide pour créer un événement.', dragEventsToMove: 'Faites glisser les événements pour les déplacer.'
  },
  de: {
    calendar: 'Kalender', day: 'Tag', week: 'Woche', month: 'Monat', today: 'Heute', allDay: 'ganztägig', allDayCheckbox: 'Ganztägig', allDayEvent: 'Ganztägiges Ereignis: {title}', saving: 'Wird gespeichert', savingCalendarChanges: 'Kalenderänderungen werden gespeichert', offlineSyncDescription: 'Offline. Änderungen werden synchronisiert, sobald die Verbindung wiederhergestellt ist.', searchEvents: 'Ereignisse suchen', previous: 'Zurück', previousRange: 'Vorheriger Zeitraum', next: 'Weiter', nextRange: 'Nächster Zeitraum', createEvent: 'Ereignis erstellen', closeMenu: 'Menü schließen', search: 'Suchen', myCalendars: 'Meine Kalender',
    editEvent: 'Ereignis bearbeiten', newEvent: 'Neues Ereignis', updateEventDetails: 'Ereignisdetails aktualisieren.', addEventToCalendar: 'Ereignis zum Kalender hinzufügen.', title: 'Titel', titleRequired: 'Der Titel ist erforderlich.', eventTitle: 'Ereignistitel', selectCalendar: 'Kalender auswählen.', starts: 'Beginn', ends: 'Ende', endAfterStart: 'Das Ende muss nach dem Beginn liegen.', description: 'Beschreibung', addNotes: 'Notizen hinzufügen', delete: 'Löschen', cancel: 'Abbrechen', saveEvent: 'Ereignis speichern', deleteEvent: 'Ereignis löschen', deleteEventConfirmation: '„{title}“ wird gelöscht.', eventDeleted: 'Ereignis gelöscht', eventUpdated: 'Ereignis aktualisiert', eventCreated: 'Ereignis erstellt', changeCouldNotBeSaved: 'Die Änderung konnte nicht gespeichert werden.', offlineChangeCouldNotBeSynced: 'Eine Offline-Änderung konnte nicht synchronisiert werden', offlineChangesSynced: 'Offline-Änderungen synchronisiert', offlineChangesCouldNotBeStored: 'Offline-Änderungen konnten in diesem Browser nicht gespeichert werden.',
    goToToday: 'Zu heute wechseln', views: 'Ansichten', calendars: 'Kalender', events: 'Ereignisse', searchCalendar: 'Kalender durchsuchen', searchEventsSwitchViews: 'Ereignisse suchen, Ansichten wechseln …', openDate: '{date} öffnen', more: 'weitere', showMoreEvents: '{count} weitere Ereignisse anzeigen', resizeEvent: '{title} anpassen', doubleClickEmptySlot: 'Doppelklicke auf einen freien Zeitraum, um ein Ereignis zu erstellen.', dragEventsToMove: 'Ziehe Ereignisse, um sie zu verschieben.'
  },
  it: {
    calendar: 'Calendario', day: 'Giorno', week: 'Settimana', month: 'Mese', today: 'Oggi', allDay: 'tutto il giorno', allDayCheckbox: 'Tutto il giorno', allDayEvent: 'Evento di tutto il giorno: {title}', saving: 'Salvataggio', savingCalendarChanges: 'Salvataggio delle modifiche al calendario', offlineSyncDescription: 'Non in linea. Le modifiche verranno sincronizzate alla riconnessione.', searchEvents: 'Cerca eventi', previous: 'Precedente', previousRange: 'Periodo precedente', next: 'Successivo', nextRange: 'Periodo successivo', createEvent: 'Crea evento', closeMenu: 'Chiudi menu', search: 'Cerca', myCalendars: 'I miei calendari',
    editEvent: 'Modifica evento', newEvent: 'Nuovo evento', updateEventDetails: 'Modifica i dettagli dell’evento.', addEventToCalendar: 'Aggiungi un evento al calendario.', title: 'Titolo', titleRequired: 'Il titolo è obbligatorio.', eventTitle: 'Titolo dell’evento', selectCalendar: 'Seleziona un calendario.', starts: 'Inizio', ends: 'Fine', endAfterStart: 'La fine deve essere successiva all’inizio.', description: 'Descrizione', addNotes: 'Aggiungi note', delete: 'Elimina', cancel: 'Annulla', saveEvent: 'Salva evento', deleteEvent: 'Elimina evento', deleteEventConfirmation: '“{title}” verrà eliminato.', eventDeleted: 'Evento eliminato', eventUpdated: 'Evento aggiornato', eventCreated: 'Evento creato', changeCouldNotBeSaved: 'Impossibile salvare la modifica.', offlineChangeCouldNotBeSynced: 'Impossibile sincronizzare una modifica offline', offlineChangesSynced: 'Modifiche offline sincronizzate', offlineChangesCouldNotBeStored: 'Impossibile salvare le modifiche offline in questo browser.',
    goToToday: 'Vai a oggi', views: 'Visualizzazioni', calendars: 'Calendari', events: 'Eventi', searchCalendar: 'Cerca nel calendario', searchEventsSwitchViews: 'Cerca eventi, cambia visualizzazione…', openDate: 'Apri {date}', more: 'altri', showMoreEvents: 'Mostra altri {count} eventi', resizeEvent: 'Ridimensiona {title}', doubleClickEmptySlot: 'Fai doppio clic su uno spazio vuoto per creare un evento.', dragEventsToMove: 'Trascina gli eventi per spostarli.'
  },
  es: {
    calendar: 'Calendario', day: 'Día', week: 'Semana', month: 'Mes', today: 'Hoy', allDay: 'todo el día', allDayCheckbox: 'Todo el día', allDayEvent: 'Evento de todo el día: {title}', saving: 'Guardando', savingCalendarChanges: 'Guardando cambios del calendario', offlineSyncDescription: 'Sin conexión. Los cambios se sincronizarán al volver a conectarte.', searchEvents: 'Buscar eventos', previous: 'Anterior', previousRange: 'Período anterior', next: 'Siguiente', nextRange: 'Período siguiente', createEvent: 'Crear evento', closeMenu: 'Cerrar menú', search: 'Buscar', myCalendars: 'Mis calendarios',
    editEvent: 'Editar evento', newEvent: 'Nuevo evento', updateEventDetails: 'Actualiza los detalles del evento.', addEventToCalendar: 'Añade un evento a tu calendario.', title: 'Título', titleRequired: 'El título es obligatorio.', eventTitle: 'Título del evento', selectCalendar: 'Selecciona un calendario.', starts: 'Empieza', ends: 'Termina', endAfterStart: 'El final debe ser posterior al inicio.', description: 'Descripción', addNotes: 'Añadir notas', delete: 'Eliminar', cancel: 'Cancelar', saveEvent: 'Guardar evento', deleteEvent: 'Eliminar evento', deleteEventConfirmation: 'Se eliminará «{title}».', eventDeleted: 'Evento eliminado', eventUpdated: 'Evento actualizado', eventCreated: 'Evento creado', changeCouldNotBeSaved: 'No se pudo guardar el cambio.', offlineChangeCouldNotBeSynced: 'No se pudo sincronizar un cambio sin conexión', offlineChangesSynced: 'Cambios sin conexión sincronizados', offlineChangesCouldNotBeStored: 'No se pudieron guardar los cambios sin conexión en este navegador.',
    goToToday: 'Ir a hoy', views: 'Vistas', calendars: 'Calendarios', events: 'Eventos', searchCalendar: 'Buscar en el calendario', searchEventsSwitchViews: 'Buscar eventos, cambiar de vista…', openDate: 'Abrir {date}', more: 'más', showMoreEvents: 'Mostrar {count} eventos más', resizeEvent: 'Cambiar el tamaño de {title}', doubleClickEmptySlot: 'Haz doble clic en un espacio vacío para crear un evento.', dragEventsToMove: 'Arrastra los eventos para moverlos.'
  },
  nl: {
    calendar: 'Agenda', day: 'Dag', week: 'Week', month: 'Maand', today: 'Vandaag', allDay: 'hele dag', allDayCheckbox: 'Hele dag', allDayEvent: 'Gebeurtenis voor de hele dag: {title}', saving: 'Opslaan', savingCalendarChanges: 'Agendawijzigingen opslaan', offlineSyncDescription: 'Offline. Wijzigingen worden gesynchroniseerd zodra je weer verbonden bent.', searchEvents: 'Gebeurtenissen zoeken', previous: 'Vorige', previousRange: 'Vorige periode', next: 'Volgende', nextRange: 'Volgende periode', createEvent: 'Gebeurtenis maken', closeMenu: 'Menu sluiten', search: 'Zoeken', myCalendars: 'Mijn agenda’s',
    editEvent: 'Gebeurtenis bewerken', newEvent: 'Nieuwe gebeurtenis', updateEventDetails: 'Werk de gegevens van de gebeurtenis bij.', addEventToCalendar: 'Voeg een gebeurtenis toe aan je agenda.', title: 'Titel', titleRequired: 'Een titel is verplicht.', eventTitle: 'Titel van gebeurtenis', selectCalendar: 'Selecteer een agenda.', starts: 'Begint', ends: 'Eindigt', endAfterStart: 'Het einde moet na het begin liggen.', description: 'Beschrijving', addNotes: 'Notities toevoegen', delete: 'Verwijderen', cancel: 'Annuleren', saveEvent: 'Gebeurtenis opslaan', deleteEvent: 'Gebeurtenis verwijderen', deleteEventConfirmation: '“{title}” wordt verwijderd.', eventDeleted: 'Gebeurtenis verwijderd', eventUpdated: 'Gebeurtenis bijgewerkt', eventCreated: 'Gebeurtenis gemaakt', changeCouldNotBeSaved: 'De wijziging kon niet worden opgeslagen.', offlineChangeCouldNotBeSynced: 'Een offline wijziging kon niet worden gesynchroniseerd', offlineChangesSynced: 'Offline wijzigingen gesynchroniseerd', offlineChangesCouldNotBeStored: 'Offline wijzigingen konden niet in deze browser worden opgeslagen.',
    goToToday: 'Naar vandaag', views: 'Weergaven', calendars: 'Agenda’s', events: 'Gebeurtenissen', searchCalendar: 'Agenda doorzoeken', searchEventsSwitchViews: 'Gebeurtenissen zoeken, weergaven wisselen...', openDate: '{date} openen', more: 'meer', showMoreEvents: 'Nog {count} gebeurtenissen tonen', resizeEvent: '{title} aanpassen', doubleClickEmptySlot: 'Dubbelklik op een leeg tijdvak om een gebeurtenis te maken.', dragEventsToMove: 'Sleep gebeurtenissen om ze te verplaatsen.'
  },
  pt: {
    calendar: 'Calendário', day: 'Dia', week: 'Semana', month: 'Mês', today: 'Hoje', allDay: 'dia inteiro', allDayCheckbox: 'Dia inteiro', allDayEvent: 'Evento de dia inteiro: {title}', saving: 'A guardar', savingCalendarChanges: 'A guardar alterações do calendário', offlineSyncDescription: 'Offline. As alterações serão sincronizadas quando a ligação for restabelecida.', searchEvents: 'Pesquisar eventos', previous: 'Anterior', previousRange: 'Período anterior', next: 'Seguinte', nextRange: 'Período seguinte', createEvent: 'Criar evento', closeMenu: 'Fechar menu', search: 'Pesquisar', myCalendars: 'Os meus calendários',
    editEvent: 'Editar evento', newEvent: 'Novo evento', updateEventDetails: 'Atualize os detalhes do evento.', addEventToCalendar: 'Adicione um evento ao seu calendário.', title: 'Título', titleRequired: 'O título é obrigatório.', eventTitle: 'Título do evento', selectCalendar: 'Selecione um calendário.', starts: 'Início', ends: 'Fim', endAfterStart: 'O fim tem de ser posterior ao início.', description: 'Descrição', addNotes: 'Adicionar notas', delete: 'Eliminar', cancel: 'Cancelar', saveEvent: 'Guardar evento', deleteEvent: 'Eliminar evento', deleteEventConfirmation: '“{title}” será eliminado.', eventDeleted: 'Evento eliminado', eventUpdated: 'Evento atualizado', eventCreated: 'Evento criado', changeCouldNotBeSaved: 'Não foi possível guardar a alteração.', offlineChangeCouldNotBeSynced: 'Não foi possível sincronizar uma alteração offline', offlineChangesSynced: 'Alterações offline sincronizadas', offlineChangesCouldNotBeStored: 'Não foi possível guardar as alterações offline neste navegador.',
    goToToday: 'Ir para hoje', views: 'Vistas', calendars: 'Calendários', events: 'Eventos', searchCalendar: 'Pesquisar calendário', searchEventsSwitchViews: 'Pesquisar eventos, mudar de vista...', openDate: 'Abrir {date}', more: 'mais', showMoreEvents: 'Mostrar mais {count} eventos', resizeEvent: 'Redimensionar {title}', doubleClickEmptySlot: 'Faça duplo clique num intervalo vazio para criar um evento.', dragEventsToMove: 'Arraste os eventos para os mover.'
  }
}

export function translateCalendar(locale: string, key: CalendarMessageKey, params: CalendarMessageParams = {}): string {
  const language = locale.replaceAll('_', '-').split('-')[0]?.toLowerCase() ?? 'en'
  const message = translations[language]?.[key] ?? english[key]

  return message.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))
}
