<template>
  <div>
    <h1>View Arrangement Requests</h1>
    <table>
      <thead>
        <tr>
          <th>Actions</th>
          <th>Request ID</th>
          <th>Staff ID</th>
          <th>Group ID</th>
          <th>Request Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in arrangementRequests" :key="request._id">
          <td>
            <div class="button-container">
              <button class="approve-button">Approve</button>
              <button class="reject-button">Reject</button>
            </div>
          </td>
          <td>{{ request.Request_ID }}</td>
          <td>{{ request.Staff_ID }}</td>
          <td>{{ request.Group_ID || "-" }}</td>
          <td>{{ new Date(request.Request_Date).toLocaleString() }}</td>
          <td>{{ request.Status }}</td>
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
      arrangementRequests: [],
    };
  },
  created() {
    this.fetchArrangementRequests();
  },
  methods: {
    async fetchArrangementRequests() {
      try {
        const response = await axios.get('http://localhost:3001/arrangementRequests');
        console.log('Fetched arrangement requests:', response.data);
        this.arrangementRequests = response.data;
      } catch (error) {
        console.error('Error fetching arrangement requests:', error);
      }
    },
  },
};
</script>

<style>
h1 {
  text-align: center;
}
table {
  width: 75%;
  border-collapse: collapse;
  margin: 0 auto;
}

th, td {
  border: 1px solid;
  padding: 8px;
  text-align: left;
}

.button-container {
  display: flex;
}

button {
  margin-right: 5px;
  padding: 8px 12px;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
button:hover {
  opacity: 0.8;
}

.approve-button {
  background-color: green;
}
.approve-button:hover {
  background-color: darkgreen;
}

.reject-button {
  background-color: red;
}
.reject-button:hover {
  background-color: darkred;
}
</style>
