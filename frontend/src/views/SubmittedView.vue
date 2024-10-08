<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-center">View Submitted Requests</h1>
      <button @click="showFilterModal = true" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
        Filter Requests
      </button>
    </div>

    <div v-if="showFilterModal" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Filter Requests</h2>

        <label class="block mb-2 font-medium">Sort by Arrangement Date:</label>
        <select v-model="filters.arrangementDate" class="block w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <label class="block mb-2 font-medium">Type of Request:</label>
        <select v-model="filters.requestType" class="block w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All</option>
          <option value="Ad-hoc">Ad-hoc</option>
          <option value="Regular">Regular</option>
        </select>

        <label class="block mb-2 font-medium">Status:</label>
        <select v-model="filters.status" class="block w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>

        <label class="block mb-2 font-medium">Arrangement Date:</label>
        <select v-model="filters.datePassed" class="block w-full mb-6 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>

        <div class="flex justify-end space-x-4">
          <button @click="resetFilters" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">Reset Filters</button>
          <button @click="applyFilters" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Apply Filters</button>
          <button @click="showFilterModal = false" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Close</button>
        </div>
      </div>
    </div>

    <div v-if="filteredRequests.length === 0" class="text-center text-gray-500 mt-4 font-bold">
      <h2>No submitted requests</h2>
    </div>

    <table v-else class="min-w-full border border-collapse mt-6">
      <thead class="bg-gray-200">
        <tr>
          <th class="px-4 py-2 border">Request Date</th>
          <th class="px-4 py-2 border">Request Time</th>
          <th class="px-4 py-2 border">Reason for Arrangement</th>
          <th class="px-4 py-2 border">Status</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="request in paginatedRequests" :key="request._id">
          <tr @click="toggleChildren(request)" class="cursor-pointer" :class="{ 'bg-gray-100': request.showChildren }" v-if="!request.isAdHoc">
            <td class="border px-4 py-2">{{ request.summary }}</td>
            <td class="border px-4 py-2">{{ request.request_time }}</td>
            <td class="border px-4 py-2">{{ request.reason }}</td>
            <td class="border px-4 py-2">{{ request.status }}</td>
          </tr>

          <tr v-if="request.showChildren" class="bg-gray-50">
            <td colspan="4">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="border px-4 py-2">Request Date</th>
                    <th class="border px-4 py-2">Request Time</th>
                    <th class="border px-4 py-2">Reason for Arrangement</th>
                    <th class="border px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="child in request.children" :key="child._id">
                    <td class="border px-4 py-2">{{ new Date(child.request_date).toLocaleString() }}</td>
                    <td class="border px-4 py-2">{{ child.request_time }}</td>
                    <td class="border px-4 py-2">{{ child.reason }}</td>
                    <td class="border px-4 py-2">{{ child.status }}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>


          <tr v-if="request.isAdHoc" class="cursor-default">
            <td class="border px-4 py-2">{{ request.request_date }}</td>
            <td class="border px-4 py-2">{{ request.request_time }}</td>
            <td class="border px-4 py-2">{{ request.reason }}</td>
            <td class="border px-4 py-2">{{ request.status }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="flex justify-center mt-4 space-x-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-blue-600 transition">
        Previous
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-blue-600 transition">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { getInStorage } from '../../utils/localStorage.js';

export default {
  data() {
    return {
      submitted_view: [],
      staff_id: '',
      showFilterModal: false,
      filters: {
        arrangementDate: 'asc',
        requestType: 'all',
        status: 'all',
        datePassed: 'all',
      },
      filteredRequests: [],
      currentPage: 1,
      recordsPerPage: 20,
      loading: false,
      errorMessage: '',
    };
  },
  computed: {
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.recordsPerPage;
      const end = start + this.recordsPerPage;
      return this.filteredRequests.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredRequests.length / this.recordsPerPage);
    }
  },
  created() {
    this.staff_id = getInStorage('staff_id') || '';
    this.fetchArrangementRequests();
  },
  methods: {
    async fetchArrangementRequests() {
      if (!this.staff_id) {
        alert('No staff ID found. Please log in again.');
        return;
      }

      this.loading = true;
      try {
        const response = await axios.get('http://localhost:3001/arrangementRequests/staff', {
          params: { staff_id: this.staff_id }
        });

        this.handleResponse(response.data);
      } catch (error) {
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    },

    handleResponse(data) {
      console.log('Fetched arrangement requests:', data);

      if (data.length === 0) {
        this.submitted_view = [];
        this.filteredRequests = [];
        alert('No requests found for the logged-in user.');
      } else {
        const groupedRequests = {};
        data.forEach(request => {
          if (request.group_id && typeof request.group_id === 'string') {
            if (!groupedRequests[request.group_id]) {
              groupedRequests[request.group_id] = [];
            }
            groupedRequests[request.group_id].push(request);
          } else {
            request.isAdHoc = true;
          }
        });

        this.filteredRequests = [];
        Object.keys(groupedRequests).forEach(groupId => {
          const sortedGroup = groupedRequests[groupId];
          const latestDate = sortedGroup.reduce((latest, req) => {
            return new Date(req.request_date) > new Date(latest) ? req.request_date : latest;
          }, sortedGroup[0].request_date);

          const parentRequest = {
            summary: `Request Summary for ${this.staff_id} ${new Date(latestDate).toLocaleString()} (${sortedGroup.length} requests)`,
            request_time: sortedGroup[0].request_time,
            reason: sortedGroup[0].reason,
            status: sortedGroup[0].status,
            showChildren: false,
            children: sortedGroup,
            isAdHoc: false,
          };

          this.filteredRequests.push(parentRequest);
        });

        // Add ad-hoc requests
        data.forEach(request => {
          if (request.isAdHoc) {
            this.filteredRequests.push({
              summary: request.summary,
              request_date: request.request_date,
              request_time: request.request_time,
              reason: request.reason,
              status: request.status,
              isAdHoc: true,
            });
          }
        });

        this.applyFilters();
      }
    },

    handleError(error) {
      console.error('Error fetching arrangement requests:', error);
      this.errorMessage = 'Failed to load requests. Please try again later.';
      alert(this.errorMessage);
    },

    applyFilters() {
      let filtered = this.submitted_view;

      if (this.filters.requestType !== 'all') {
        filtered = filtered.filter(request => {
          if (request.children && request.children.length > 0) {
            return request.children[0].request_type === this.filters.requestType;
          }
          return request.isAdHoc && this.filters.requestType === 'Ad-hoc';
        });
      } else {
        filtered = this.filteredRequests;
      }

      if (this.filters.status !== 'all') {
        filtered = filtered.filter(request => request.status === this.filters.status);
      }

      if (this.filters.datePassed === 'upcoming') {
        filtered = filtered.filter(request => new Date(request.request_date) > new Date());
      } else if (this.filters.datePassed === 'past') {
        filtered = filtered.filter(request => new Date(request.request_date) < new Date());
      }

      this.filteredRequests = filtered;
    },

    resetFilters() {
      this.filters = {
        arrangementDate: 'asc',
        requestType: 'all',
        status: 'all',
        datePassed: 'all',
      };
      this.applyFilters();
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },

    toggleChildren(request) {
      request.showChildren = !request.showChildren;
    }
  },
};
</script>
