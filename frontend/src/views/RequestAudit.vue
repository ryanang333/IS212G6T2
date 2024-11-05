<template>
    <div class="flex flex-col items-center">
        <h1 class="text-2xl font-bold mb-4">Audit Logs</h1>

        <div class="flex space-x-2 mb-4">
            <div>
                Start Date
                <input 
                type="date" 
                v-model="startDate" 
                @change="validateDates" 
                class="border rounded p-2"
            />
            </div>
        </div>
        <div class="flex space-x-2 mb-4">
            <div>
                End Date
                <input 
                    type="date" 
                    v-model="endDate" 
                    @change="validateDates" 
                    class="border rounded p-2"
                />
            </div>
        </div>

        <div class="flex items-center mb-4">
            <input 
                type="text" 
                v-model="filterStaffId" 
                placeholder="Filter by Staff ID" 
                class="border rounded p-2 mr-2" 
            />
            <button @click="searchByStaffId" class="border rounded p-2 bg-blue-500 text-white">Search</button>
        </div>
        <div>
            <button @click="resetFilters" class="border rounded p-2 bg-red-500 text-white">Reset Filters</button>
        </div>

        <p v-if="auditLogs.length === 0" class="mt-4">No Records Found</p>

        <table v-if="auditLogs.length > 0" class="min-w-full border-collapse border border-gray-300 mx-auto">
            <thead>
                <tr class="bg-gray-200">
                    <th class="border border-gray-300 p-2">Request ID</th>
                    <th class="border border-gray-300 p-2">Status Before</th>
                    <th class="border border-gray-300 p-2">Status After</th>
                    <th class="border border-gray-300 p-2">Date Updated</th>
                    <th class="border border-gray-300 p-2">Reason</th>
                    <th class="border border-gray-300 p-2">Staff ID</th>
                    <th class="border border-gray-300 p-2">Request Date</th>
                    <th class="border border-gray-300 p-2">Modified By</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in auditLogs" :key="log._id" class="hover:bg-gray-100">
                    <td class="border border-gray-300 p-2">{{ log.request_id._id }}</td>
                    <td class="border border-gray-300 p-2">{{ log.old_status }}</td>
                    <td class="border border-gray-300 p-2">{{ log.new_status }}</td>
                    <td class="border border-gray-300 p-2">{{ formatDate(log.change_timestamp) }}</td>
                    <td class="border border-gray-300 p-2">{{ update_reason(log) || 'N/A' }}</td>
                    <td class="border border-gray-300 p-2">{{ log.request_id.staff_id }}</td>
                    <td class="border border-gray-300 p-2">{{ formatDate(log.request_id.request_date) }}</td>
                    <td class="border border-gray-300 p-2">{{ log.changed_by }}</td>
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
            auditLogs: [],
            startDate: '',
            endDate: '',
            filterStaffId: '',
            backendURL: import.meta.env.VITE_BACKEND_ENDPOINT,
        };
    },
    
    created() {
        this.fetchAuditLogs();
    },
    
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        validateDates() {
            if (this.startDate && this.endDate && new Date(this.startDate) > new Date(this.endDate)) {
                alert('End date cannot be earlier than start date.');
            } else {
                this.fetchAuditLogs();
            }
        },
        resetFilters() {
            this.startDate = '';
            this.endDate = '';
            this.filterStaffId = '';
            this.fetchAuditLogs(); // Fetch all logs without filters
        },
        async fetchAuditLogs() {
            try {
                const response = await axios.get(`${this.backendURL}/requestAudit`, {
                    params: {
                        startDate: this.startDate ? new Date(this.startDate).toISOString() : undefined,
                        endDate: this.endDate ? new Date(this.endDate).toISOString() : undefined,
                        staffId: this.filterStaffId || undefined,
                    },
                });
                if (response.data.logs) {
                    this.auditLogs = response.data.logs.length > 0 ? response.data.logs : [];
                } else {
                    this.auditLogs = []; // Ensure this is empty if no logs are returned
                }
            } catch (error) {
                console.error('Error fetching audit logs:', error.response ? error.response.data : error);
            }
        },

        async searchByStaffId() {
            await this.fetchAuditLogs();
        },

        update_reason(log) {
            if (log.new_status == 'Rejected') {
                return log.request_id.manager_reason;
            } else {
                return log.request_id.reason;
            }
        },
    },
};
</script>