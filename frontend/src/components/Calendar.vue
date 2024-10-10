<template>
  <FullCalendar ref="fullCalendar" :options="calendarOptions" />
  <ScheduleModal
    v-if="showScheduleModal"
    :date="dateSelected"
    :department="dept"
    :tabSelected="tab"
    @closemodal="this.showScheduleModal=false;"
  />
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import axios from 'axios'
import ScheduleModal from './ScheduleModal.vue'
export default {
  data() {
    return {
      events: [],
      showScheduleModal: false,
      startDate: null,
      endDate: null,
      /**
       * Configuration options for the FullCalendar component.
       *
       * @type {Object}
       * @property {Array} plugins - An array of FullCalendar plugins used for rendering.
       * @property {string} initialView - The initial view of the calendar, e.g., 'dayGridMonth'.
       * @property {Function} dateClick - Callback function invoked when a date is clicked.
       * @property {number|string} height - The height of the calendar.
       * @property {Array} events - An array of event objects to be displayed in the calendar.
       * @prop
       */
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        dateClick: this.handleDateClick,
        height: this.height,
        events: this.events,
        datesSet: this.handleDatesSet
      },
      dateSelected: null
    }
  },
  props: ['tab', 'height', 'staffId', 'dept'],
  components: {
    FullCalendar,
    ScheduleModal
  },
  methods: {
    /**
     * Handles the date set event from the calendar.
     * Fetches the data for the given date range.
     *
     * @param {Object} dateInfo - The date information object containing start and end dates.
     */
    handleDatesSet(dateInfo) {
      this.startDate = dateInfo.start
      this.endDate = dateInfo.end
      this.fetchData()
    },

    /**
     * Populates the events on the calendar based on the response from the server.
     *
     * @param {Object} response - The response object from the API containing event data.
     * @property {Array} response.data.data - Array of event objects.
     * @property {string} response.data.data[].request_time - Time description of the request.
     * @property {string} response.data.data[].request_date - Date of the request.
     */
    populateEvents(response) {
      this.events = response.data.data.map((date) => {
        let color
        if (date.request_time === 'Full Day') {
          color = '#4CAF50'
        } else if (date.request_time.includes('AM')) {
          color = '#2196F3'
        } else if (date.request_time.includes('PM')) {
          color = '#FF9800'
        }
        return {
          title: 'Work From Home (' + date.request_time + ')',
          start: date.request_date.split('T')[0],
          color: color
        }
      })
    },
    async handleDateClick(event) {
      if (this.tab === 'isTeam') {
        this.dateSelected = event.dateStr
        this.showScheduleModal = true
      }
    },

    /**
     * Fetches data from the server based on the current tab and date range.
     *
     * @async
     * @throws {Error} Throws an error if the request fails.
     */
    async fetchData() {
      try {
        if (this.tab === 'isOwn') {
          const response = await axios.get(`http://localhost:3001/arrangementRequests/myschedule`, {
            params: {
              staff_id: this.staffId,
              startDate: this.startDate,
              endDate: this.endDate
            }
          })
          if (response.status == 200) {
            this.populateEvents(response)
            const calendarApi = this.$refs.fullCalendar.getApi()
            calendarApi.addEventSource(this.events)
          }
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    }
  },
  updated() {
    const calendarApi = this.$refs.fullCalendar.getApi()
    calendarApi.removeAllEvents()
    if (this.tab === 'isOwn') {
      this.fetchData()
    }
  }
}
</script>

<style scoped></style>
