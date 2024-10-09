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
        <tr>
          <th class="border border-gray-300 p-2">
            <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" />
          </th>
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
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import { getInStorage } from '../../utils/localStorage.js';

export default {
  data() {
    return {
      manager_id: null,
      arrangementRequests: [],
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
      itemsPerPage: 10,
    };
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
      if (!this.manager_id) {
        alert('Please enter a manager ID');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/arrangementRequests?manager_id=${this.manager_id}`);
        //const requests = response.data;
        console.log('Fetched arrangement requests:', response.data);  // Log the fetched data

        if (requests.length === 0) {
          this.arrangementRequests = [];
          return;
        }

        // Set the arrangementRequests to the fetched data
        this.arrangementRequests = response.data;

        // Split requests into groups and non-grouped requests
        const { grouped, nonGrouped } = this.groupRequests(response.data);
        this.groupedRequests = grouped;
        this.nonGroupedRequests = nonGrouped;
        this.selectedRequests = [];
      } catch (error) {
        console.error('Error fetching arrangement requests:', error.response ? error.response.data : error);
      }
    },

    groupRequests(requests) {
      const grouped = {};
      const nonGrouped = [];

      requests.forEach(request => {
        if (request.group_id) {
          if (!grouped[request.group_id]) grouped[request.group_id] = [];
          grouped[request.group_id].push(request);
        } else {
          nonGrouped.push(request);
        }
      });

      return { grouped, nonGrouped };
    },

    async approveRequest(requestId) {
      try {
        const response = await axios.post(`http://localhost:3001/arrangementRequests/approve`, { requestId });
        console.log('Request approved:', response.data);
        await this.fetchArrangementRequests();
        location.reload(); // Refresh the page
      } catch (error) {
        console.log("approve error")
        console.error('Error approving request:', error);        
      }
    },

     showRejectModalForRequest(requestId) {
       this.requestToRejectId = requestId; // Set the request ID to be rejected
       this.rejectionReason = ""; // Clear any previous rejection reason
       this.showRejectModal = true; // Show the modal
     },

     async rejectRequest() {
       if (!this.rejectionReason) {
         alert('Please provide a rejection reason.');
         return;
       }

       try {
         const response = await axios.post(`http://localhost:3001/arrangementRequests/reject`, {
           requestId: this.requestToRejectId, // The request to reject
           reason: this.rejectionReason // The reason provided by the user
         });

         console.log('Request rejected:', response.data);
         this.showRejectModal = false; // Close the modal after rejection
         this.fetchArrangementRequests(); // Refresh the request list
         location.reload();
       } catch (error) {
         console.error('Error rejecting request:', error);
         alert('Failed to reject the request. Please try again.');
       }
     },

     async approveSelectedRequests() {
       const selectedRequestIds = this.selectedRequests;

       if (selectedRequestIds.length === 0) {
         alert('Please select at least one request to approve.');
         return;
       }

       try {
         const response = await axios.post(`http://localhost:3001/arrangementRequests/approveSelected`, {
           requestIds: selectedRequestIds,
           managerId: this.manager_id // Ensure the managerId is being sent here
         });

         console.log('Selected requests approved:', response.data);
         this.selectedRequests = []; // Clear the selected requests after approval
         this.fetchArrangementRequests(); // Refresh the data
         location.reload();
       } catch (error) {
         console.error('Error approving selected requests:', error);
         alert('Failed to approve selected requests. Please try again.');
       }
     },

     async rejectSelectedRequests() {
       if (!this.rejectionReason) {
         alert('Please provide a rejection reason.');
         return;
       }

       const selectedRequestIds = this.selectedRequests;

       try {
         const response = await axios.post(`http://localhost:3001/arrangementRequests/rejectSelected`, {
           requestIds: selectedRequestIds,
           reason: this.rejectionReason
         });

         console.log('Selected requests rejected:', response.data);
         this.fetchArrangementRequests(); // Refresh the data
         this.selectedRequests = []; // Clear the selected requests
         location.reload();
       } catch (error) {
         console.error('Error rejecting selected requests:', error);
       }
     },

     async approveGroupRequests(groupId) {
       const groupRequests = this.groupedRequests[groupId];
       if (confirm(`Are you sure you want to approve all requests in this group?`)) {
         try {
           const response = await axios.post(`http://localhost:3001/arrangementRequests/approveGroup`, { 
             requestIds: groupRequests.map(req => req._id) 
           });
           console.log('Group requests approved:', response.data);
           this.fetchArrangementRequests(); // Refresh the data
           location.reload();
         } catch (error) {
           console.error('Error approving group requests:', error);
           alert('Failed to approve group requests. Please try again later.');
         }
       }
     },
    
     showRejectModalForGroup(groupId) {
       this.requestToRejectGroupId = groupId;  // Set the group ID to be rejected
       this.rejectionReason = "";  // Clear any previous rejection reason
       this.showRejectModalGroup = true;  // Show the modal
     },

     async rejectGroupRequests(groupId) {
      if (!this.rejectionReason) {
         alert('Please provide a rejection reason.');
         return;
       }

       const groupRequests = this.groupedRequests[groupId];  // Get the requests in the selected group

       try {
         const response = await axios.post(`http://localhost:3001/arrangementRequests/rejectGroup`, {
           requestIds: groupRequests.map(req => req._id),  // Send all request IDs in the group
           reason: this.rejectionReason  // Send the rejection reason
         });

        console.log('Group requests rejected:', response.data);
        this.fetchArrangementRequests();  // Refresh the request list after rejection
        this.rejectionReason = "";  // Clear the rejection reason
        this.showRejectGroupModal = false;  // Close the modal
      } catch (error) {
        console.error('Error rejecting group requests:', error);
        alert("Failed to reject group requests. Please try again.");
      }
    },
    cancelRejectGroup() {
      this.showRejectGroupModal = false;  // Close modal if cancel is clicked
      this.rejectionReason = "";  // Clear the rejection reason
    },


  }
};
</script>
