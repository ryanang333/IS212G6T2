<template>
  <nav class="bg-gray-800 p-4">
    <ul class="flex space-x-4">
      <li>
        <router-link to="/apply" class="text-white hover:underline">Make Request</router-link>
      </li>
      <li>
        <router-link to="/myrequests" class="text-white hover:underline">My Requests</router-link>
      </li>
      <li><router-link to="/schedule" class="text-white hover:underline">Schedule</router-link></li>
      <li>
        <router-link to="/notifications" class="text-white hover:underline">Inbox</router-link>
      </li>

      <li v-if="role === '1'">
        <router-link to="/audit-logs" class="text-white hover:underline">Records</router-link>
      </li>

      <li v-if="role === '3' || role === '1'">
        <router-link to="/staffrequests" class="text-white hover:underline"
          >Staff Requests</router-link
        >
      </li>
      <li>
        <button @click="handleLogout" class="text-white hover:underline">Sign Out</button>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    role: {
      type: String,
      required: true
    }
  },
  methods: {
    handleLogout() {
      localStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>
