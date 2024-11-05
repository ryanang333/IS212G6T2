<template>
  <div class="container mx-auto p-4">
    <div class="tabs flex space-x-4 mb-4">
      <button 
        @click="activeTab = 'myNotifications'"
        :class="{ 'bg-blue-500 text-white': activeTab === 'myNotifications', 'bg-gray-200': activeTab !== 'myNotifications' }"
        class="px-4 py-2 rounded"
      >
        My Notifications
      </button>

      <button 
        v-if="managerNotifications.length"
        @click="activeTab = 'managerNotifications'"
        :class="{ 'bg-blue-500 text-white': activeTab === 'managerNotifications', 'bg-gray-200': activeTab !== 'managerNotifications' }"
        class="px-4 py-2 rounded"
      >
        Manager Notifications
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="text-red-500">
      {{ errorMessage }}
    </div>

    <!-- My Notifications Content -->
    <div v-if="activeTab === 'myNotifications'">
      <h2 class="text-lg font-semibold mb-2">My Notifications</h2>
      <ul>
        <li v-for="notification in myNotifications" :key="notification._id" class="mb-4">
          <div class="p-4 bg-gray-100 rounded-md shadow">
            <p><strong>Old Status:</strong> {{ notification.old_status }}</p>
            <p><strong>New Status:</strong> {{ notification.new_status }}</p>
            <p><strong>Message:</strong> {{ formatNotification(notification) }}</p>
            <p><strong>Notification Timestamp:</strong> {{ new Date(notification.created_at).toLocaleString() }}</p>
          </div>
        </li>
      </ul>
    </div>

    <!-- Manager Notifications Content -->
    <div v-if="activeTab === 'managerNotifications'">
      <h2 class="text-lg font-semibold mb-2">Manager Notifications</h2>
      <ul>
        <li v-for="notification in managerNotifications" :key="notification._id" class="mb-4">
          <div class="p-4 bg-gray-100 rounded-md shadow">
            <p><strong>Old Status:</strong> {{ notification.old_status }}</p>
            <p><strong>New Status:</strong> {{ notification.new_status }}</p>
            <p><strong>Message:</strong> {{ formatNotification(notification) }}</p>
            <p><strong>Notification Timestamp:</strong> {{ new Date(notification.created_at).toLocaleString() }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { getInStorage } from '@/utils/localStorage.js';

export default {
  data() {
    return {
      myNotifications: [],
      managerNotifications: [],
      activeTab: 'myNotifications',
      staffId: null,
      errorMessage: null, // Error message state
      backendURL: import.meta.env.VITE_BACKEND_ENDPOINT,
    };
  },
  mounted() {
    this.staffId = getInStorage('staff_id');
    this.fetchNotifications();
  },
  methods: {
    async fetchNotifications() {
      try {
        const response = await axios.get(`${this.backendURL}/notifications/staff/${this.staffId}`);

        // Populate My Notifications and Manager Notifications based on request_type
        this.myNotifications = response.data.notifications.filter(notification => notification.request_type === 'Manager_Action');
        this.managerNotifications = response.data.notifications.filter(notification => notification.request_type === 'Staff_Action');
      } catch (error) {
        console.error("Error fetching notifications:", error);
        this.errorMessage = "Failed to fetch notifications. Please try again later."; // Update the error message
      }
    },
    formatNotification(notification) {
      const formattedDate = new Date(notification.created_at).toLocaleDateString();
      const reasonPhrase = notification.reason && notification.reason !== 'N/A' ? ` due to ${notification.reason}` : '';

      if (notification.old_status === 'N/A') {
        return `Arrangement Request for date ${formattedDate} has been submitted by Staff ID ${notification.changed_by}${reasonPhrase}. The status has been changed to ${(notification.new_status).toLowerCase()}.`;
      }

      if (notification.request_type === 'Manager_Action') {
        return `Arrangement Request for date ${formattedDate} has been changed by Manager ID ${notification.changed_by}${reasonPhrase}. The status has changed from ${(notification.old_status).toLowerCase()} to ${(notification.new_status).toLowerCase()}.`;
      } else {
        return `Arrangement Request for date ${formattedDate} has been modified by Staff ID ${notification.changed_by}${reasonPhrase}. The status has changed from ${(notification.old_status).toLowerCase()} to ${(notification.new_status).toLowerCase()}.`;
      }
    },
  },
};
</script>

<style scoped>
.tabs button {
  @apply px-4 py-2 rounded cursor-pointer;
}
</style>
