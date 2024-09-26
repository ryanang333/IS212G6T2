<template>
  <div class="flex flex-col items-center p-5">
    <h1 class="text-2xl font-bold mb-6">Work From Home Application</h1>
    <form @submit.prevent="submitApplication" class="w-full max-w-lg">
      <div class="mb-4">
        <label for="arrangementType" class="block text-sm font-medium">Arrangement Type:</label>
        <select v-model="arrangementType" id="arrangementType" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500">
          <option value="Flexible">Flexible</option>
          <option value="Regular">Regular</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="recurringDays" class="block text-sm font-medium">Recurring Arrangement Weeks (Enter number of weeks):</label>
        <input type="number" v-model="recurringDays" id="recurringDays" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500" min="1" />
      </div>
      <div class="mb-4">
        <label for="arrangementTime" class="block text-sm font-medium">Arrangement Time:</label>
        <select v-model="arrangementTime" id="arrangementTime" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500">
          <option value="am">AM</option>
          <option value="pm">PM</option>
          <option value="fullday">Full Day</option>
        </select>
      </div>
      
      <div class="mb-4">
        <label for="reason" class="block text-sm font-medium">Reason for Work From Home:</label>
        <textarea v-model="reason" id="reason" rows="3" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium">Select Work From Home Dates:</label>
        <FullCalendar :options="calendarOptions" @select="handleDateSelect" @dateClick="handleDateClick" />
        <div v-if="selectedDates.length" class="mt-2">
          <p class="text-sm">Selected Dates:</p>
          <ul>
            <li v-for="date in selectedDates" :key="date">{{ date }}</li>
          </ul>
        </div>
      </div>

      <button type="submit" class="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-500">Submit Application</button>
    </form>

    <div v-if="confirmationMessage" class="text-green-600 mt-4">{{ confirmationMessage }}</div>
    <div v-if="errorMessage" class="text-red-600 mt-4">{{ errorMessage }}</div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import axios from 'axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default defineComponent({
  name: 'WorkFromHomeApplication',
  components: {
    FullCalendar,
  },
  data() {
    return {
      arrangementType: 'Regular',
      recurringDays: 1,
      arrangementTime: '',
      reason: '', // New data property for the reason
      selectedDates: [],
      confirmationMessage: '',
      errorMessage: '',
    };
  },
  computed: {
    calendarOptions() {
      return {
        plugins: [dayGridPlugin, interactionPlugin],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: ''
        },
        initialView: 'dayGridMonth',
        selectable: true,
        selectAllow: this.allowDateSelection,
        select: this.handleDateSelect,
        events: this.getSelectedEvents(),
        eventClick: this.handleEventClick,
      };
    },
  },
  methods: {
    allowDateSelection(selectInfo) {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const selectableDate = new Date(tomorrow);
      selectableDate.setHours(selectableDate.getHours() + 24);

      return selectInfo.start >= selectableDate;
    },
    handleDateSelect(selectInfo) {
      const formattedDate = selectInfo.startStr;

      if (this.selectedDates.includes(formattedDate)) {
        this.selectedDates = this.selectedDates.filter(date => date !== formattedDate);
      } else {
        this.selectedDates.push(formattedDate);

        for (let i = 1; i < this.recurringDays; i++) {
          const nextDate = new Date(selectInfo.start);
          nextDate.setDate(nextDate.getDate() + (i * 7));
          this.selectedDates.push(nextDate.toISOString().split('T')[0]);
        }
      }
    },
    handleEventClick(info) {
      const formattedDate = info.event.startStr;
      this.selectedDates = this.selectedDates.filter(date => date !== formattedDate);
    },
    getSelectedEvents() {
      return this.selectedDates.map(date => ({
        title: 'Selected',
        start: date,
        end: date,
        allDay: true,
      }));
    },
    async submitApplication() {
      if (this.selectedDates.length === 0) {
        this.errorMessage = 'Please select at least one date using the calendar.';
        return;
      }

      const applicationData = {
        arrangementType: this.arrangementType,
        recurringDays: this.recurringDays,
        arrangementTime: this.arrangementTime,
        reason: this.reason, // Include reason in the application data
        selectedDates: this.selectedDates,
      };

      try {
        await axios.post('https://your-backend-url/api/work-from-home', applicationData);
        this.confirmationMessage = 'Your work from home application has been submitted!';
      } catch (error) {
        this.errorMessage = 'There was an error submitting your application. Please try again.';
        console.error('Error submitting application:', error);
      } finally {
        this.resetForm();
      }
    },
    resetForm() {
      this.arrangementType = 'Regular';
      this.recurringDays = 1;
      this.arrangementTime = '';
      this.reason = ''; // Reset the reason field
      this.selectedDates = [];
      this.confirmationMessage = '';
      this.errorMessage = '';
    },
  },
});
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
