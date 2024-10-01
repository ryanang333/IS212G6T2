<template>
    <nav class="bg-gray-800 p-4">
      <ul class="flex space-x-4">
        <li><router-link to="/apply" class="text-white hover:underline">Make Request</router-link></li>
        <li><router-link to="/submittedview" class="text-white hover:underline">Submitted Requests</router-link></li>
        <li><router-link to="/arrangementrequests" class="text-white hover:underline">Schedule</router-link></li>
        <li><router-link to="/submittedview" class="text-white hover:underline">Inbox</router-link></li>
  
        <li v-if="userRole === 'HR'">
          <router-link to="/audit-logs" class="text-white hover:underline">Audit Logs</router-link>
        </li>
        <li v-if="userRole === 'Manager' || userRole === 'Director'">
          <router-link to="/staff-requests-for-review" class="text-white hover:underline">Staff Requests for Review</router-link>
        </li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    props: {
      userRole: {
        type: String,
        required: true,
      },
    },
  };
  </script>
  