<template>
  <div
    class="flex items-center justify-center py-10 text-sm font-medium text-center text-gray-500 dark:text-gray-400 dark:border-gray-700"
  >
    <ul class="flex flex-wrap -mb-px">
      <li class="me-2" @click="loadSchedule('isOwn')">
        <a
          class="inline-block text-2xl p-4 border-b-2 rounded-t-lg hover:text-blue-600 hover:border-blue-600 dark:hover:text-gray-300"
          :class="{
            'text-blue-600': tabSelected === 'isOwn',
            'border-blue-600': tabSelected === 'isOwn',
            'border-transparent': tabSelected !== 'isOwn'
          }"
          >My Schedule</a
        >
      </li>
      <li class="me-2" @click="loadSchedule('isTeam')">
        <a
          class="inline-block text-2xl active p-4 border-b-2 rounded-t-lg hover:text-blue-600 hover:border-blue-600 dark:hover:text-gray-300"
          :class="{
            'text-blue-600': tabSelected === 'isTeam',
            'border-blue-600': tabSelected === 'isTeam',
            'border-transparent': tabSelected !== 'isTeam'
          }"
          >Team Schedule</a
        >
      </li>
      <li class="me-2" @click="loadSchedule('isOverall')" v-if="role == 1">
        <a
          class="inline-block text-2xl p-4 border-b-2 rounded-t-lg hover:text-blue-600 hover:border-blue-600 dark:hover:text-gray-300"
          :class="{
            'text-blue-600': tabSelected === 'isOverall',
            'border-blue-600': tabSelected === 'isOverall',
            'border-transparent': tabSelected !== 'isOverall'
          }"
          >Overall Schedule</a
        >
      </li>
    </ul>
  </div>

  <div v-if="isDataLoaded" class="w-10/12" style="margin-left: auto; margin-right: auto">
    <Calendar :staffId="staffId" :dept="department" :height="calendarHeight" :tab="tabSelected" />
  </div>
</template>

<script>
import Calendar from '../components/Calendar.vue'
import { getInStorage } from '../utils/localStorage'
export default {
  data() {
    return {
      isDataLoaded: false,
      tabSelected: null,
      calendarHeight: 0,
      staffId: null,
      role: null,
      department: null
    }
  },
  components: {
    Calendar
  },
  methods: {
    loadSchedule(tab) {
      this.tabSelected = tab
    },
    calculateCalendarHeight() {
      this.calendarHeight = window.innerHeight * (6 / 8)
    }
  },
  mounted() {
    this.loadSchedule('isOwn')
    this.calculateCalendarHeight()
    this.staffId = getInStorage('staff_id')
    this.role = getInStorage('role')
    this.department = getInStorage('dept')
    this.isDataLoaded = true
  }
}
</script>

<style scoped></style>
