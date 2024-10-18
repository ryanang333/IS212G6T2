<template>
    <div class="flex flex-col items-center">
        <h1 class="text-2xl font-bold mb-4">Audit Logs</h1>
        
        <div class="flex space-x-2 mb-4">
            <input 
                type="date" 
                v-model="startDate" 
                @change="validateDates" 
                class="border rounded p-2" 
            />
            <input 
                type="date" 
                v-model="endDate" 
                @change="validateDates" 
                class="border rounded p-2" 
            />
            <button @click="resetFilters" class="border rounded p-2 bg-blue-500 text-white">Reset Filters</button>
        </div>
        
        <input 
            type="text" 
            v-model="filterStaffId" 
            placeholder="Filter by Staff ID" 
            @input="fetchAuditLogs" 
            class="border rounded p-2 mb-4" 
        />
        
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
                    <td class="border border-gray-300 p-2">{{ log.request_id.request_id }}</td>
                    <td class="border border-gray-300 p-2">{{ log.old_status }}</td>
                    <td class="border border-gray-300 p-2">{{ log.new_status }}</td>
                    <td class="border border-gray-300 p-2">{{ formatDate(log.change_timestamp) }}</td>
                    <td class="border border-gray-300 p-2">{{ log.update_reason || 'N/A' }}</td>
                    <td class="border border-gray-300 p-2">{{ log.request_id.staff_id }}</td>
                    <td class="border border-gray-300 p-2">{{ formatDate(log.request_id.request_date) }}</td>
                    <td class="border border-gray-300 p-2">{{ log.changed_by }}</td>
                </tr>
            </tbody>
        </table>
        
        <p v-if="auditLogs.length === 0" class="mt-4">No Records Found</p>
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
            console.log("Start Date:", this.startDate);
            console.log("End Date:", this.endDate);
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
                const response = await axios.get(`http://localhost:3001/requestAudit`, {
                    params: {
                        startDate: this.startDate ? new Date(this.startDate).toISOString() : undefined,
                        endDate: this.endDate ? new Date(this.endDate).toISOString() : undefined,
                        staffId: this.filterStaffId || undefined,
                    },
                });
                console.log('Fetched audit logs:', response.data);

                if (response.data.message) {
                    this.auditLogs = [];
                    alert(response.data.message);
                    return;
                }

                this.auditLogs = response.data.logs;
            } catch (error) {
                console.error('Error fetching audit logs:', error.response ? error.response.data : error);
            }
        },
    },
};
</script>
