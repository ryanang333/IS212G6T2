<template>
  <div>
    <h1 class="text-center text-2xl font-bold mb-6">View Arrangement Requests</h1>
    <div class="flex flex-col items-center mb-5">
      <input
        v-model="manager_id"
        type="text"
        placeholder="Enter Manager ID"
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
    <table class="min-w-full border-collapse border border-gray-300 mx-auto">
      <thead>
        <tr>
          <th class="border border-gray-300 p-2">Actions</th>
          <th class="border border-gray-300 p-2">Request ID</th>
          <th class="border border-gray-300 p-2">Staff ID</th>
          <th class="border border-gray-300 p-2">Group ID</th>
          <th class="border border-gray-300 p-2">Request Date</th>
          <th class="border border-gray-300 p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in arrangementRequests" :key="request._id">
          <td>
            <div class="flex">
              <button class="bg-green-500 text-white rounded px-2 py-1 mr-1 hover:bg-green-600">Approve</button>
              <button class="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600">Reject</button>
            </div>
          </td>
          <td class="border border-gray-300 p-2">{{ request.request_id }}</td>
          <td class="border border-gray-300 p-2">{{ request.staff_id }}</td>
          <td class="border border-gray-300 p-2">{{ request.group_id || "-" }}</td>
          <td class="border border-gray-300 p-2">{{ new Date(request.request_date).toLocaleString() }}</td>
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
      manager_id: null,
      arrangementRequests: [],
    };
  },
  methods: {
    async fetchArrangementRequests() {
      if (!this.manager_id) {
        alert('Please enter a manager ID');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/arrangementRequests?manager_id=${this.manager_id}`);
        console.log('Fetched arrangement requests:', response.data);
        
        if (response.data.length === 0) {
          this.arrangementRequests = [];
          alert('No requests found for the provided manager ID.');
        } else {
          this.arrangementRequests = response.data;
        }
      } catch (error) {
        console.error('Error fetching arrangement requests:', error);
        this.arrangementRequests = [];
      }
    },
  },
};
</script>
<style></style>