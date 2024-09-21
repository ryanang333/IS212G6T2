<template>
  <div class="work-from-home-page">
    <h1>Work From Home Application</h1>
    <!-- Form for Work from Home Application -->
    <form @submit.prevent="submitApplication">
      <div>
        <label for="arrangementType">Arrangement Type:</label>
        <select v-model="arrangementType" id="arrangementType" required>
          <option value="Flexible">Flexible</option>
          <option value="Regular">Regular</option>
        </select>
      </div>
      <div>
        <label for="recurringDay">Recurring Arrangement Day:</label>
        <select v-model="recurringDay" id="recurringDay" required>
          <option value="Weekly">Weekly</option>
          <option value="None">None</option>
        </select>
      </div>
      <div>
        <label for="arrangementTime">Arrangement Time:</label>
        <select v-model="arrangementTime" id="arrangementTime" required>
          <option value="am">AM</option>
          <option value="pm">PM</option>
          <option value="fullday">Full Day</option>
        </select>
      </div>
  
      <!-- FullCalendar Component -->
      <div>
        <label>Select Work From Home Dates:</label>
        <FullCalendar
          :options="calendarOptions"
          @select="handleDateSelect"
        />
      </div>

      <!-- Submit Button -->
      <button type="submit">Submit Application</button>
    </form>

    <!-- Messages -->
    <div v-if="confirmationMessage" class="confirmation-message">{{ confirmationMessage }}</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default defineComponent({
  name: 'WorkFromHomeApplication',
  components: {
    FullCalendar, // Register FullCalendar component
  },
  data() {
    return {
      arrangementType: 'Regular',
      recurringDay: 'None',
      arrangementTime: '',
      startDate: null,
      endDate: null,
      confirmationMessage: '',
      errorMessage: '',
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: this.handleDateSelect,
        eventsSet: this.handleEvents
      },
      currentEvents: [], // To store events after selection
    };
  },
  methods: {
    handleDateSelect(selectInfo) {
      // Capture selected start and end dates from the calendar
      this.startDate = selectInfo.startStr;
      this.endDate = selectInfo.endStr;
      alert(`Selected dates: From ${selectInfo.startStr} to ${selectInfo.endStr}`);
    },
    submitApplication() {
      // Check if startDate and endDate are selected
      if (!this.startDate || !this.endDate) {
        this.errorMessage = 'Please select a start and end date using the calendar.';
        return;
      }

      // Mock application data
      const applicationData = {
        arrangementType: this.arrangementType,
        recurringDay: this.recurringDay,
        arrangementTime: this.arrangementTime,
        startDate: this.startDate,
        endDate: this.endDate,
      };

      // Mock sending the application (you could use axios to send this data to a server)
      this.sendApplicationToManager(applicationData);

      // Confirmation
      this.confirmationMessage = 'Your work from home application has been submitted!';
      this.resetForm();
    },
    sendApplicationToManager(data) {
      // Simulate sending the application data to the manager
      console.log('Sending application data to manager:', data);
    },
    handleEvents(events) {
      this.currentEvents = events;
    },
    resetForm() {
      // Reset form fields after submission
      this.arrangementType = 'Regular';
      this.recurringDay = 'None';
      this.arrangementTime = '';
      this.startDate = null;
      this.endDate = null;
      this.confirmationMessage = '';
      this.errorMessage = '';
    },
  }
});
</script>

<style scoped>
.work-from-home-page {
  text-align: center;
  padding: 20px;
}

form div {
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.confirmation-message {
  color: green;
  margin-top: 10px;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
