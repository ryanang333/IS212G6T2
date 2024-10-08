<template>
  <div>
    <h1 class="text-center text-2xl font-bold mb-6">View Submitted Requests</h1>
    <div class="flex flex-col items-center mb-5">
      <input
        v-model="staff_id"
        type="text"
        placeholder="Enter Staff ID"
        @keyup.enter="fetchArrangementRequests"
        pattern="[0-9]*"
        class="border border-gray-300 rounded-lg p-2 mb-2 w-64"
      />
      <button
        @click="fetchArrangementRequests"
        class="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
      >
        Fetch Requests
      </button>
    </div>

    <div v-for="group in groupedRequests" :key="group.group_id" class="mb-4">
      <div @click="toggleGroup(group.group_id)" class="group-header cursor-pointer bg-gray-200 p-2 rounded-lg">
        Group ID: {{ group.group_id }} (Start: {{ formatDate(group.start_date) }}, End: {{ formatDate(group.end_date) }}) -
        Status: {{ determineGroupStatus(group.requests) }} -
        <span>{{ isGroupOpen(group.group_id) ? '-' : '+' }}</span>
      </div>
      <div v-if="isGroupOpen(group.group_id)">
        <table class="min-w-full border-collapse border border-gray-300 mx-auto mt-2">
          <thead>
            <tr>
              <th class="border border-gray-300 p-2">Request ID</th>
              <th class="border border-gray-300 p-2">Staff ID</th>
              <th class="border border-gray-300 p-2">Request Date</th>
              <th class="border border-gray-300 p-2">Requested Time</th>
              <th class="border border-gray-300 p-2">Reason for Arrangement</th>
              <th class="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in group.requests" :key="request.request_id">
              <td class="border border-gray-300 p-2">{{ request.request_id }}</td>
              <td class="border border-gray-300 p-2">{{ request.staff_id }}</td>
              <td class="border border-gray-300 p-2">{{ formatDate(request.request_date) }}</td>
              <td class="border border-gray-300 p-2">{{ request.time }}</td>
              <td class="border border-gray-300 p-2">{{ request.reason }}</td>
              <td class="border border-gray-300 p-2">{{ request.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <h3 class="text-lg font-semibold mb-2">Requests Without Group ID</h3>
    <table class="min-w-full border-collapse border border-gray-300 mx-auto">
      <thead>
        <tr>
          <th class="border border-gray-300 p-2">Request ID</th>
          <th class="border border-gray-300 p-2">Staff ID</th>
          <th class="border border-gray-300 p-2">Request Date</th>
          <th class="border border-gray-300 p-2">Requested Time</th>
          <th class="border border-gray-300 p-2">Reason for Arrangement</th>
          <th class="border border-gray-300 p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in noGroupRequests" :key="request.request_id">
          <td class="border border-gray-300 p-2">{{ request.request_id }}</td>
          <td class="border border-gray-300 p-2">{{ request.staff_id }}</td>
          <td class="border border-gray-300 p-2">{{ formatDate(request.request_date) }}</td>
          <td class="border border-gray-300 p-2">{{ request.time }}</td>
          <td class="border border-gray-300 p-2">{{ request.reason }}</td>
          <td class="border border-gray-300 p-2">{{ request.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      staff_id: null,
      groupedRequests: [],
      noGroupRequests: [],
      openGroups: new Set(),
    };
  },
  methods: {
    async fetchArrangementRequests() {
      if (!this.staff_id) {
        alert('Please enter a staff ID');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/arrangementRequests/staff?staff_id=${this.staff_id}`);
        console.log('Fetched arrangement requests:', response.data);
        
        this.groupedRequests = [];
        this.noGroupRequests = [];

        response.data.forEach(item => {
          if (item.requests) {
            const { group_id, start_date, end_date, requests } = item;
            this.groupedRequests.push({
              group_id,
              start_date,
              end_date,
              requests,
            });
          } else if (Array.isArray(item)) {
            this.noGroupRequests.push(...item);
          }
        });

        this.groupedRequests = this.groupedRequests.map(group => {
          return {
            ...group,
            requests: group.requests.filter(request => request.staff_id == this.staff_id),
          };
        }).filter(group => group.requests.length > 0);

      } catch (error) {
        console.error('Error fetching arrangement requests:', error);
        this.groupedRequests = [];
        this.noGroupRequests = [];
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-GB');
    },
    toggleGroup(groupId) {
      if (this.openGroups.has(groupId)) {
        this.openGroups.delete(groupId);
      } else {
        this.openGroups.add(groupId);
      }
    },
    isGroupOpen(groupId) {
      return this.openGroups.has(groupId);
    },
    determineGroupStatus(requests) {
      const statuses = requests.map(request => request.status);
      if (statuses.every(status => status === 'Approved')) {
        return 'Approved';
      } else if (statuses.every(status => status === 'Rejected')) {
        return 'Rejected';
      } else {
        return 'Pending';
      }
    },
  },
};
</script>

<style>
.group-header {
  cursor: pointer;
}
</style>
