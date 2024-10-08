<template>
  <div>
    <h2>Pending Requests</h2>
    <div v-for="(request, index) in pendingRequests" :key="index">
      <label>
        <input type="checkbox" :value="request._id" v-model="selectedRequests" />
        {{ request.date }} - {{ request.reason }}
      </label>
    </div>
    <button @click="cancelRequests">Cancel Selected Requests</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      pendingRequests: [], // Loaded from server
      selectedRequests: []  // Selected request IDs to cancel
    };
  },
  methods: {
    async cancelRequests() {
      if (this.selectedRequests.length === 0) {
        alert('Please select at least one request to cancel.');
        return;
      }

      try {
        const response = await axios.post('/api/cancel-arrangement-requests', {
          staffId: '12345', // Replace with the actual staff ID
          requestIds: this.selectedRequests,
          cancelAll: false // Set to true if cancelling the entire parent request
        });

        if (response.status === 200) {
          alert('Selected requests have been successfully canceled!');
          // Optionally, refresh the pending requests list
          this.loadPendingRequests();
        }
      } catch (error) {
        alert('Failed to cancel the requests: ' + error.message);
      }
    },
    async loadPendingRequests() {
      // Fetch the pending requests from your API and assign to pendingRequests array
      const response = await axios.get(`/api/getStaffArrangementRequests?staff_id=12345`);
      this.pendingRequests = response.data;
    }
  },
  mounted() {
    this.loadPendingRequests();
  }
};
</script>
