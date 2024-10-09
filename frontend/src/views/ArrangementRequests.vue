<template>
  <div>
    <h1 class="text-center text-2xl font-bold mb-6">View Arrangement Requests</h1>

    <div v-if="hasPendingRequests" class="text-center mb-4">
      <button @click="approveAllRequests" class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">
        Approve All
      </button>
      <button @click="showRejectModalForAll" class="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 ml-2">
        Reject All
      </button>
    </div>

    <p v-if="noPendingRequestsMessage" class="text-center text-red-500">{{ noPendingRequestsMessage }}</p>

    <div v-if="selectedRequests.length > 0" class="flex justify-between items-center mb-4">
      <div class="flex space-x-4">
        <button 
          @click="approveSelectedRequests" 
          class="bg-green-500 text-white px-2 py-1 mr-1 rounded hover:bg-green-600"
          :disabled="selectedRequests.length === 0">
          Approve Selected
        </button>
        
        <button 
          @click="rejectSelectedRequests" 
          class="bg-red-500 text-white px-2 py-1 mr-1 rounded hover:bg-red-600" 
          :disabled="selectedRequests.length === 0">
          Reject Selected
        </button>

        <textarea 
          v-model="rejectionReason"
          class="w-80 h-32 p-2 border rounded px-2 py-1 mr-1 resize-none" 
          placeholder="Enter the reason for rejection"></textarea>
      </div>
    </div>

    <table class="min-w-full border-collapse border border-gray-300 mx-auto" v-if="arrangementRequests.length > 0">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2">Select</th>
          <th class="border border-gray-300 px-4 py-2">Staff</th>
          <th class="border border-gray-300 px-4 py-2">Request Date</th>
          <th class="border border-gray-300 px-4 py-2">Request Time</th>
          <th class="border border-gray-300 px-4 py-2">Status</th>
          <th class="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="request in paginatedRequests" :key="request.id">
          <tr 
            class="cursor-pointer hover:bg-gray-100" 
            @click="handleRowClick(request)"
            :class="request.isAdHoc ? 'bg-gray-200' : ''"
          >
            <td class="border border-gray-300 px-4 py-2">
              <input type="checkbox" v-model="request.selected" @click.stop />
            </td>
            <td class="border border-gray-300 px-4 py-2">{{ request.staff_id }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ request.request_date }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ request.request_time }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ request.status }}</td>
            <td class="border border-gray-300 px-4 py-2">
              <div class="flex justify-around">
                <button @click.stop="approveRequest(request)" class="bg-blue-500 text-white px-2 py-1 rounded">Approve</button>
                <button @click.stop="rejectRequest(request)" class="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                <button @click.stop="requestAdditionalInfo(request)" class="bg-yellow-500 text-white px-2 py-1 rounded">Request Additional Info</button>
              </div>
            </td>
          </tr>

          <tr v-if="request.showChildren">
            <td colspan="6">
              <table class="min-w-full border border-gray-300 mt-2">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-4 py-2">Select</th>
                    <th class="border border-gray-300 px-4 py-2">Staff ID</th>
                    <th class="border border-gray-300 px-4 py-2">Request Date</th>
                    <th class="border border-gray-300 px-4 py-2">Request Time</th>
                    <th class="border border-gray-300 px-4 py-2">Status</th>
                    <th class="border border-gray-300 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="child in request.children" :key="child.id">
                    <td class="border border-gray-300 px-4 py-2">
                      <input type="checkbox" v-model="child.selected" @click.stop />
                    </td>
                    <td class="border border-gray-300 px-4 py-2">{{ child.staff_id }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ child.request_date }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ child.request_time }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ child.status }}</td>
                    <td class="border border-gray-300 px-4 py-2">
                      <div class="flex justify-around">
                        <button @click.stop="approveRequest(child)" class="bg-blue-500 text-white px-2 py-1 rounded">Approve</button>
                        <button @click.stop="rejectRequest(child)" class="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                        <button @click.stop="requestAdditionalInfo(child)" class="bg-yellow-500 text-white px-2 py-1 rounded">Request Additional Info</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </template>

        <!-- Grouped Requests -->
        <template v-for="(groupRequests, groupId) in groupedRequests" :key="groupId">
          <!-- Group header row -->
          <tr>
            <td class="border border-gray-300 p-2">
              <input 
                type="checkbox" 
                :checked="isGroupSelected(groupId)" 
                @change="toggleGroupSelection(groupId, groupRequests)"
              />
            </td>
            <td class="border border-gray-300 p-2">
              <button 
                @click="approveGroupRequests(groupId)" 
                class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                Approve Group
              </button>
              <button 
                @click="showRejectModalForGroup(groupId)" 
                class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                Reject Group
              </button>
            </td>
            <td class="border border-gray-300 p-2" colspan="4">
              <button 
                class="text-blue-600 hover:underline"
                @click="toggleGroup(groupId)">
                {{ groupRequests[0].staff_id }} 
                ({{ formatDate(getGroupStartDate(groupRequests)) }} 
                - {{ formatDate(getGroupEndDate(groupRequests)) }} 
                - {{ groupRequests.length }} requests
                )
              </button>
            </td>
          </tr>

          <!-- Group Requests (show each request in group) -->
          <tr v-if="isGroupVisible(groupId)" v-for="request in groupRequests" :key="request._id">
            <td class="border border-gray-300 p-2">
              <input type="checkbox" v-model="selectedRequests" :value="request._id" />
            </td>
            <td class="border border-gray-300 p-2">
              <div class="flex">
                <button 
                  @click="approveRequest(request._id)" 
                  class="bg-green-500 text-white rounded px-2 py-1 mr-1 hover:bg-green-600">Approve</button>
                <button 
                  @click="showRejectModalForRequest(request._id)" 
                  class="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600">Reject</button>
              </div>
            </td>
            <td class="border border-gray-300 p-2">{{ request.request_id }}</td>
            <td class="border border-gray-300 p-2">{{ request.staff_id }}</td>
            <td class="border border-gray-300 p-2">{{ request.group_id || "-" }}</td>
            <td class="border border-gray-300 p-2">{{ formatDate(request.request_date) }}</td>
            <td class="border border-gray-300 p-2">{{ request.status }}</td>
          </tr>
        </template>

        <!-- Non-grouped Requests (show as normal rows) -->
        <tr v-for="request in nonGroupedRequests" :key="request._id">
          <td class="border border-gray-300 p-2">
            <input type="checkbox" v-model="selectedRequests" :value="request._id" />
          </td>

        <tr v-for="request in paginatedRequests" :key="request._id">

          <td class="border border-gray-300 p-2">
            <div class="flex">
              <button 
                @click="approveRequest(request._id)" 
                class="bg-green-500 text-white rounded px-2 py-1 mr-1 hover:bg-green-600">Approve</button>
              <button 
                @click="showRejectModalForRequest(request._id)" 
                class="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600">Reject</button>
            </div>
          </td>
          <td class="border border-gray-300 p-2">{{ request.request_id }}</td>
          <td class="border border-gray-300 p-2">{{ request.staff_id }}</td>
          <td class="border border-gray-300 p-2">{{ request.group_id || "-" }}</td>

          <td class="border border-gray-300 p-2">{{ formatDate(request.request_date) }}</td>

          <-- <td class="border border-gray-300 p-2">{{ new Date(request.request_date).toLocaleString() }}</td> -->
          <-- <td class="border border-gray-300 p-2">{{ request.time }}</td> -->
          
          <td class="border border-gray-300 p-2">{{ request.status }}</td>
          <td class="border border-gray-300 p-2">{{ request.reason }}</td>
        </tr>
      </tbody>
    </table>


    <p v-if="arrangementRequests.length === 0" class="text-center text-red-500">No pending requests.</p>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow-lg w-1/2">
        <h3 class="text-xl mb-4">Reason for Rejection</h3>
        <textarea 
          v-model="rejectionReason" 
          class="w-full p-2 border rounded mb-4" 
          placeholder="Enter the reason for rejection..."></textarea>
        <div class="flex justify-end">
          <button @click="rejectRequest" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Reject</button>
          <button @click="cancelReject" class="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>
    <!-- Reject Group Modal -->
    <div v-if="showRejectModalGroup" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow-lg w-1/2">
        <h3 class="text-xl mb-4">Reason for Rejection (Group)</h3>
        <textarea 
          v-model="rejectionReason" 
          class="w-full p-2 border rounded mb-4" 
          placeholder="Enter the reason for rejection..."></textarea>
        <div class="flex justify-end">
          <button @click="rejectGroupRequests(requestToRejectGroupId)" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Reject</button>
          <button @click="cancelReject" class="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>
    <!-- Reject All Modal -->
    <div v-if="showRejectModalAll" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow-lg w-1/2">
        <h3 class="text-xl mb-4">Reason for Rejection (All)</h3>
        <textarea 
          v-model="rejectionReason" 
          class="w-full p-2 border rounded mb-4" 
          placeholder="Enter the reason for rejection..."></textarea>
        <div class="flex justify-end">
          <button @click="rejectAllRequests" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Reject All</button>
          <button @click="cancelReject" class="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>

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
    <div class="flex justify-center space-x-4 mt-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Previous</button>
      <span class="flex items-center">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Next</button>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import { getInStorage } from '../../utils/localStorage.js';
import { getInStorage } from '../../utils/localStorage.js';

export default {
  data() {
    return {
      submitted_view: [],
      staff_id: '',
      selectedRequests: [],
      groupedRequests: {},
      nonGroupedRequests: [],
      expandedGroups: new Set(),
      groupSelection: {},  // Track selected status of groups
      noPendingRequestsMessage: "",

      requestToRejectId: null,
      requestToRejectGroupId: null, 
      rejectionReason: "",
      showRejectModal: false,
      showRejectModalGroup: false,
      showRejectModalAll: false,
      selectedGroupId: null, 
      currentPage: 1,
      recordsPerPage: 20,
      loading: false,
      errorMessage: '',
      filteredRequests: [],
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
  computed: {
    hasPendingRequests() {
      const hasRequests = this.arrangementRequests.some(request => request.status === 'Pending');
      this.noPendingRequestsMessage = hasRequests ? "" : "No Pending Requests";
      return hasRequests;
    },
    isAllSelected() {
      return this.selectedRequests.length === this.arrangementRequests.filter(request => request.status === 'Pending').length;
    }
  },
  created() {
    this.manager_id = getInStorage('staff_id');
    this.fetchArrangementRequests();
  },
  computed: {
    hasPendingRequests() {
      const hasRequests = this.arrangementRequests.some(request => request.status === 'Pending');
      this.noPendingRequestsMessage = hasRequests ? "" : "No Pending Requests";
      return hasRequests;
    },
    isAllSelected() {
      return this.selectedRequests.length === this.arrangementRequests.filter(request => request.status === 'Pending').length;
    }
  },
  created() {
    this.manager_id = getInStorage('staff_id');
    this.fetchArrangementRequests();
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },

    getGroupStartDate(groupRequests) {
      const dates = groupRequests.map(request => new Date(request.request_date));
      return new Date(Math.min(...dates)).toISOString();
    },

    getGroupEndDate(groupRequests) {
      const dates = groupRequests.map(request => new Date(request.request_date));
      return new Date(Math.max(...dates)).toISOString();
    },

    toggleGroup(groupId) {
      if (this.expandedGroups.has(groupId)) {
        this.expandedGroups.delete(groupId);
      } else {
        this.expandedGroups.add(groupId);
      }
    },

    isGroupVisible(groupId) {
      return this.expandedGroups.has(groupId);
    },

    toggleGroupSelection(groupId, groupRequests) {
      const isChecked = !this.groupSelection[groupId];
      this.groupSelection[groupId] = isChecked;

      const groupIds = groupRequests.map(req => req._id);

      // Add or remove group requests from selectedRequests based on group selection
      if (isChecked) {
        this.selectedRequests = [...new Set([...this.selectedRequests, ...groupIds])];  // Prevent duplicate entries
      } else {
        this.selectedRequests = this.selectedRequests.filter(id => !groupIds.includes(id));
      }
    },

    isGroupSelected(groupId) {
      return this.groupSelection[groupId] || false;
    },

    async fetchArrangementRequests() {
      if (!this.staff_id) {
        alert('No staff ID found. Please log in again.');
        return;
      }

      this.loading = true;
      try {
        const response = await axios.get(`http://localhost:3001/arrangementRequests?manager_id=${this.staff_id}`);
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
          if (request.group_id) {
            if (!groupedRequests[request.group_id]) {
              groupedRequests[request.group_id] = [];
            }
            groupedRequests[request.group_id].push(request);
          } else {
            request.showChildren = false;
            request.isAdHoc = true;
            this.filteredRequests.push(request);
          }
        });

        for (const group in groupedRequests) {
          const groupRequests = groupedRequests[group];

          const parentRequest = groupRequests.reduce((earliest, request) => {
            return !earliest || new Date(request.request_date) < new Date(earliest.request_date) ? request : earliest;
          }, null);

          if (parentRequest) {
            parentRequest.showChildren = false;
            parentRequest.children = groupRequests.filter(req => req !== parentRequest);
            parentRequest.isAdHoc = false;
            this.filteredRequests.push(parentRequest);
          }
        }
      }
    },

    handleError(error) {
      console.error('Error fetching arrangement requests:', error);
      this.errorMessage = 'Failed to fetch arrangement requests. Please try again later.';
    },

    handleRowClick(request) {
      if (!request.isAdHoc) {
        // Toggle children visibility only for non-Ad Hoc (regular) requests
        request.showChildren = !request.showChildren;
      }
    },

    acceptAll() {
      this.filteredRequests.forEach(request => {
        if (request.selected) {
          this.approveRequest(request);
        }
      });
    },
    rejectAll() {
      this.filteredRequests.forEach(request => {
        if (request.selected) {
          this.rejectRequest(request);
        }
      });
    },
    approveRequest(request) {
      console.log('Approved request:', request);
    },
    rejectRequest(request) {
      console.log('Rejected request:', request);
    },
    requestAdditionalInfo(request) {
      console.log('Requesting additional info for:', request);
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
  },
};
</script>
