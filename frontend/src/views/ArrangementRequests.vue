<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-center">Arrangement Requests</h1>

    <div v-if="errorMessage" class="text-red-500 text-center mb-4">{{ errorMessage }}</div>

    <!-- Pending Requests Table -->
    <div>
      <h2 class="text-xl font-semibold mb-2">Pending Requests</h2>
      <div class="flex justify-center mb-4 space-x-4">
        <button @click="acceptAll" class="bg-green-500 text-white px-4 py-2 rounded">Accept All</button>
        <button @click="rejectAll" class="bg-red-500 text-white px-4 py-2 rounded">Reject All</button>
      </div>

      <table class="min-w-full border border-gray-300">
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
                          <!-- Show Cancel button if child request is approved -->
                          <button v-if="child.status === 'Approved'" @click.stop="openConfirmation(child._id)" class="text-red-500 hover:underline ml-2">
                            Cancel Request
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div class="flex justify-center space-x-4 mt-4">
        <button @click="prevPage" :disabled="currentPage === 1" class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Previous</button>
        <span class="flex items-center">Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Next</button>
      </div>
    </div>

    <!-- Approved Requests Table -->
    <div>
      <h2 class="text-xl font-semibold mt-8 mb-2">Approved Requests</h2>
      <table class="min-w-full border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2">Staff ID</th>
            <th class="border border-gray-300 px-4 py-2">Request Date</th>
            <th class="border border-gray-300 px-4 py-2">Request Time</th>
            <th class="border border-gray-300 px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="approvedRequest in approvedRequests" :key="approvedRequest.id">
            <!-- Only show parent request if it has children -->
            <tr 
              v-if="approvedRequest.children"
              class="cursor-pointer hover:bg-gray-100" 
              @click="handleRowClick(approvedRequest)"
            >
              <td class="border border-gray-300 px-4 py-2">{{ approvedRequest.staff_id }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ (approvedRequest.request_date) }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ approvedRequest.request_time }}</td>
              <td class="border border-gray-300 px-4 py-2">
                {{ approvedRequest.status }}
                <!-- Cancel button for parent to cancel all approved child requests -->
                <button @click.stop="cancelAllApproved(approvedRequest)" class="text-red-500 hover:underline ml-2">
                  Cancel All Approved
                </button>
              </td>
            </tr>

            <!-- Show child requests when the parent is clicked -->
            <tr v-if="approvedRequest.showChildren">
              <td colspan="4">
                <table class="min-w-full border border-gray-300 mt-2">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border border-gray-300 px-4 py-2">Staff ID</th>
                      <th class="border border-gray-300 px-4 py-2">Request Date</th>
                      <th class="border border-gray-300 px-4 py-2">Request Time</th>
                      <th class="border border-gray-300 px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="child in approvedRequest.children" :key="child.id">
                      <td class="border border-gray-300 px-4 py-2">{{ child.staff_id }}</td>
                      <td class="border border-gray-300 px-4 py-2">{{ formatDate(child.request_date) }}</td>
                      <td class="border border-gray-300 px-4 py-2">{{ child.request_time }}</td>
                      <td class="border border-gray-300 px-4 py-2">{{ child.status }}
                        <!-- Show Cancel button for child request if approved -->
                        <button v-if="child.status === 'Approved'" @click="openConfirmation(child._id)" class="text-red-500 hover:underline ml-2">
                          Cancel Request
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>

          <!-- Render ad-hoc approved requests directly -->
          <template v-for="adHocRequest in adHocApprovedRequests" :key="adHocRequest.id">
            <tr class="cursor-pointer hover:bg-gray-100">
              <td class="border border-gray-300 px-4 py-2">{{ adHocRequest.staff_id }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ formatDate(adHocRequest.request_date) }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ adHocRequest.request_time }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ adHocRequest.status }}
                <button v-if="adHocRequest.status === 'Approved'" @click="openConfirmation(adHocRequest._id)" class="text-red-500 hover:underline ml-2">
                  Cancel Request
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="confirmationVisible" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">Confirm Cancellation</h2>
        <p>Are you sure you want to cancel this request?</p>
        <label for="reason" class="block text-sm font-medium text-gray-700">Reason for cancellation:</label>
        <textarea v-model="withdrawalReason" id="reason" rows="3" class="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>

        <div class="flex justify-end mt-4">
          <button @click="confirmCancellation" class="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 transition">Yes, Cancel</button>
          <button @click="closeConfirmation" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">No, Go Back</button>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm">
        <h2 class="text-xl font-semibold mb-4 text-red-500">Error</h2>
        <p>{{ errorMessage }}</p>
        <div class="flex justify-end mt-4">
          <button @click="closeErrorModal" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
            Close
          </button>
        </div>
      </div>
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
      currentPage: 1,
      recordsPerPage: 20,
      loading: false,
      errorMessage: '',
      filteredRequests: [],
      approvedRequests: [], // State for parent-child approved requests
      adHocApprovedRequests: [], // State for ad-hoc approved requests
      confirmationVisible: false,
      activeRequestId: null,
      withdrawalReason: '',
      showErrorModal: false, // Control the error modal visibility
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

      try {
        const response = await axios.get(`http://localhost:3001/arrangementRequests?manager_id=${this.staff_id}`);
        this.handleResponse(response.data);
      } catch (error) {
        this.handleError(error);
      }
    },

    handleResponse(data) {
      console.log('Fetched arrangement requests:', data);

      if (data.length === 0) {
        this.submitted_view = [];
        this.filteredRequests = [];
        this.approvedRequests = [];
        this.adHocApprovedRequests = [];
        alert('No requests found for the logged-in user.');
      } else {
        const groupedRequests = {};
        const groupedApprovedRequests = {};

        // Reset the lists
        this.filteredRequests = [];
        this.approvedRequests = [];
        this.adHocApprovedRequests = [];

        data.forEach(request => {
          if (request.status === 'Approved') {
            if (request.group_id) {
              // Handle grouped approved requests (parent-child)
              if (!groupedApprovedRequests[request.group_id]) {
                groupedApprovedRequests[request.group_id] = [];
              }
              groupedApprovedRequests[request.group_id].push(request);
            } else {
              // Handle ad-hoc approved requests (no group_id)
              this.adHocApprovedRequests.push(request);
            }
          } else {
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
          }
        });

        // Process each group for pending requests (no change here)
        for (const group in groupedRequests) {
          const groupRequests = groupedRequests[group];
          const latestDate = groupRequests.reduce((latest, req) => new Date(req.request_date) > new Date(latest) ? req.request_date : latest, groupRequests[0].request_date);

          const parentRequest = {
            id: `${group}-summary`,
            staff_id: groupRequests[0].staff_id,
            request_date: `Request Summary for ${this.staff_id} ${new Date(latestDate).toLocaleString()} (${groupRequests.length} requests)`,
            request_time: '',
            status: "Parent Request",
            showChildren: false,
            children: groupRequests,
            isAdHoc: false
          };

          this.filteredRequests.push(parentRequest);
        }

        // Process each group for approved requests
        for (const group in groupedApprovedRequests) {
          const groupApprovedRequests = groupedApprovedRequests[group];
          const latestDate = groupApprovedRequests.reduce((latest, req) => new Date(req.request_date) > new Date(latest) ? req.request_date : latest, groupApprovedRequests[0].request_date);

          const parentApprovedRequest = {
            id: `${group}-approved-summary`,
            staff_id: groupApprovedRequests[0].staff_id,
            request_date: `Approved Request Summary for ${this.staff_id} ${new Date(latestDate).toLocaleString()} (${groupApprovedRequests.length} requests)`,
            request_time: '',
            status: "Parent Approved Request",
            showChildren: false,
            children: groupApprovedRequests,
            isAdHoc: false
          };

          this.approvedRequests.push(parentApprovedRequest);
        }

        console.log('Processed pending requests:', this.filteredRequests);
        console.log('Processed approved requests:', this.approvedRequests);
        console.log('Processed ad-hoc approved requests:', this.adHocApprovedRequests);
      }
    },

    handleError(error) {
      console.error('Error fetching requests:', error);
      this.errorMessage = error.response?.data?.message || 'An error occurred while fetching requests.';
    },

    handleRowClick(request) {
      request.showChildren = !request.showChildren; // Toggle child visibility for pending and approved requests
    },

    approveRequest(request) {
      console.log(`Approved request: ${request.id}`);
    },

    rejectRequest(request) {
      console.log(`Rejected request: ${request.id}`);
    },

    requestAdditionalInfo(request) {
      console.log(`Requested additional info for: ${request.id}`);
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

    cancelAllApproved(approvedRequest) {
    const approvedChildren = approvedRequest.children.filter(child => child.status === 'Approved');
    if (approvedChildren.length === 0) {
      alert('No approved child requests to cancel.');
      return;
    }

    // Collect all approved child request IDs
    const approvedRequestIds = approvedChildren.map(child => child._id);

    this.openConfirmation(approvedRequestIds); // Pass all approved request IDs to openConfirmation
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

    formatDate(date) {
      return new Date(date).toLocaleString(); // Formats the date to a readable string
    },

    openConfirmation(requestIds) {
    if (!Array.isArray(requestIds)) {
      requestIds = [requestIds]; // Ensure it's an array
    }
    console.log('Opening confirmation for request(s):', requestIds);
    this.confirmationVisible = true;
    this.activeRequestIds = requestIds; // Store the array of request IDs
  },

    closeConfirmation() {
      this.confirmationVisible = false;
      this.activeRequestIds = [];
      this.withdrawalReason = ''; // Clear reason on close
    },

    async confirmCancellation() {
    if (!this.activeRequestIds || this.activeRequestIds.length === 0) {
      console.error('No active request IDs to cancel');
      return;
    }

    if (!this.withdrawalReason || this.withdrawalReason.trim() === "") {
      this.errorMessage = "Cancellation reason cannot be empty";
      this.showErrorModal = true;
      return;
    }

    try {
      // Send the cancellation request for all active request IDs
      const response = await axios.patch('http://localhost:3001/arrangementRequests/withdrawal', {
        requestIds: this.activeRequestIds,  // Send all active request IDs
        status: 'Cancelled',
        withdraw_reason: this.withdrawalReason
      });

      console.log('Requests status updated successfully:', response.data);

      // Reset the lists before fetching new data
      this.filteredRequests = [];
      this.approvedRequests = [];
      this.adHocApprovedRequests = [];

      // Refetch the arrangement requests to reflect the latest state
      await this.fetchArrangementRequests();

      // Close the confirmation modal and reset the state
      this.closeConfirmation();

    } catch (error) {
      console.error('Error during cancellation:', error);

      if (error.response && error.response.data && error.response.data.message) {
        this.errorMessage = error.response.data.message;
      } else {
        this.errorMessage = 'An error occurred while canceling the request(s)';
      }

      this.showErrorModal = true;
    }
  },



    closeErrorModal() {
      this.showErrorModal = false;
      this.errorMessage = ''; // Clear error message on close
    }
  }
};
</script>
