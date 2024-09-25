<template>    
    <div class="p-6">
      <h1 class="text-2xl font-bold text-center mb-6">View Submitted Requests</h1>
      
      <button @click="showFilterModal = true" class="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 transition">
        Filter Requests
      </button>
      
      <div v-if="showFilterModal" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Filter Requests</h2>
  
          <label class="block mb-2">Sort by Arrangement Date:</label>
          <select v-model="filters.arrangementDate" class="block w-full mb-4 p-2 border rounded">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
  
          <label class="block mb-2">Type of Request:</label>
          <select v-model="filters.requestType" class="block w-full mb-4 p-2 border rounded">
            <option value="all">All</option>
            <option value="Ad-hoc">Ad-hoc</option>
            <option value="Regular">Regular</option>
          </select>
  
          <label class="block mb-2">Status:</label>
          <select v-model="filters.status" class="block w-full mb-4 p-2 border rounded">
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
  
          <label class="block mb-2">Arrangement Date:</label>
          <select v-model="filters.datematchesFiltered" class="block w-full mb-6 p-2 border rounded">
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
  
          <div class="flex justify-end">
            <button @click="resetFilters" class="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition">Reset Filters</button>
            <button @click="applyFilters" class="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition">Apply Filters</button>
            <button @click="showFilterModal = false" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Close</button>
          </div>
        </div>
      </div>
  
    <div v-if="filteredRequests.length === 0" class="text-center text-gray-500 mt-4 font-bold">
      <h2>No submitted requests</h2>
    </div>

      <table v-else class="table-auto w-full mt-6">
        <thead>
          <tr>
            <th class="px-4 py-2">Request ID</th>
            <th class="px-4 py-2">Staff ID</th>
            <th class="px-4 py-2">Group ID</th>
            <th class="px-4 py-2">Request Date</th>
            <th class="px-4 py-2">Requested Time</th>
            <th class="px-4 py-2">Reason for Arrangement</th>
            <th class="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in filteredRequests" :key="request._id" class="text-left">
            <td class="border px-4 py-2">{{ request.request_id }}</td>
            <td class="border px-4 py-2">{{ request.staff_id }}</td>
            <td class="border px-4 py-2">{{ request.group_id || '-' }}</td>
            <td class="border px-4 py-2">{{ new Date(request.request_date).toLocaleString() }}</td>
            <td class="border px-4 py-2">{{ request.time }}</td>
            <td class="border px-4 py-2">{{ request.reason }}</td>
            <td class="border px-4 py-2">{{ request.status }}</td>
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
        submitted_view: [],
        showFilterModal: false,
        filters: {
          arrangementDate: '',
          requestType: 'all',
          status: 'all',
          datePassed: 'all',
        },
        filteredRequests: [],
      };
    },
    created() {
      this.getSubmittedRequests();
    },
    methods: {
      async getSubmittedRequests() {
        try {
          const response = await axios.get('http://localhost:3001/submittedview');
          this.submitted_view = response.data;
          this.filteredRequests = this.submitted_view;
        } catch (error) {
          console.error('Error fetching submitted requests:', error);
        }
      },
      applyFilters() {
        this.filteredRequests = [];

        for (const request of this.submitted_view) {
        let matchesFilter = true;

        if (this.filters.requestType === 'Regular' && request.group_id) {
            matchesFilter = false;
        } else if (this.filters.requestType === 'Ad-hoc' && !request.group_id) {
            matchesFilter = false;
        }

        if (this.filters.status !== 'all' && request.status !== this.filters.status) {
            matchesFilter = false;
        }

        const now = new Date();
        const arrangementDate = new Date(request.request_date);
        if (this.filters.datePassed === 'upcoming' && arrangementDate < now) {
            matchesFilter = false;
        }
        if (this.filters.datePassed === 'past' && arrangementDate >= now) {
            matchesFilter = false;
        }

        if (matchesFilter) {
            this.filteredRequests.push(request);
        }
        }

        if (this.filters.arrangementDate) {
        this.filteredRequests.sort((a, b) => {
            const dateA = new Date(a.request_date);
            const dateB = new Date(b.request_date);
            if (this.filters.arrangementDate === 'asc') {
            return dateA - dateB;
            } else {
            return dateB - dateA;
            }
        });
        }
        this.showFilterModal = false;
        },
      resetFilters() {
        this.filters = {
          arrangementDate: '',
          requestType: 'all',
          status: 'all',
          datePassed: 'all',
        };
        this.filteredRequests = this.submitted_view;
      },
    },
  };
  </script>  