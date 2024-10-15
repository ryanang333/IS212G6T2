<template>
    <nav class="bg-gray-800 p-4">
      <ul class="flex space-x-4">
        <li><router-link to="/apply" class="text-white hover:underline">Make Request</router-link></li>
        <li><router-link to="/submittedview" class="text-white hover:underline">Submitted Requests</router-link></li>
        <li><router-link to="/schedule" class="text-white hover:underline">Schedule</router-link></li>
        <li><router-link to="/cancel" class="text-white hover:underline">Cancelled Requests</router-link></li>
        <li><router-link to="/inbox" class="text-white hover:underline">Inbox</router-link></li>
  
        <li v-if="role === '1'">
          <router-link to="/audit-logs" class="text-white hover:underline">Audit Logs</router-link>
        </li>
        
        <li v-if="role === 3">
          <router-link to="/staff-requests-for-review" class="text-white hover:underline">Staff Requests for Review</router-link>
        </li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    props: {
      role: {
        type: String,
        required: true,
      },
    },
  },
};
</script>
