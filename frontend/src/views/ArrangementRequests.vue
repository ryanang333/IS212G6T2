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
          <th class="border border-gray-300 p-2">Request Time</th>
          <th class="border border-gray-300 p-2">Status</th>
          <th class="border border-gray-300 p-2">Reason</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in paginatedRequests" :key="request._id">
          <td class="border border-gray-300 p-2">
            <div class="flex">
              <button class="bg-green-500 text-white rounded px-2 py-1 mr-1 hover:bg-green-600">Approve</button>
              <button class="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600">Reject</button>
            </div>
          </td>
          <td class="border border-gray-300 p-2">{{ request.request_id }}</td>
          <td class="border border-gray-300 p-2">{{ request.staff_id }}</td>
          <td class="border border-gray-300 p-2">{{ request.group_id || "-" }}</td>
          <td class="border border-gray-300 p-2">{{ new Date(request.request_date).toLocaleString() }}</td>
          <td class="border border-gray-300 p-2">{{ request.time }}</td>
          <td class="border border-gray-300 p-2">{{ request.status }}</td>
          <td class="border border-gray-300 p-2">{{ request.reason }}</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center space-x-2 mt-4">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="bg-gray-300 rounded px-4 py-2 hover:bg-gray-400"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="bg-gray-300 rounded px-4 py-2 hover:bg-gray-400"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      manager_id: null,
      arrangementRequests: [],
      currentPage: 1,
      itemsPerPage: 10,
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
          this.currentPage = 1;
        }
      } catch (error) {
        console.error('Error fetching arrangement requests:', error);
        this.arrangementRequests = [];
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  },
  computed: {
    totalPages() {
      return Math.ceil(this.arrangementRequests.length / this.itemsPerPage); 
    },
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.arrangementRequests.slice(start, start + this.itemsPerPage);
    },
  },
  // mounted() {
  //   this.fetchArrangementRequests();
  //   this.interval = setInterval(this.fetchArrangementRequests, 1000);
  // },
  // beforeDestroy() {
  //   clearInterval(this.interval);
  // },
};
</script>
<style></style>