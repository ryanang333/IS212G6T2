<template>
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      aria-hidden="true"
    ></div>

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
        >
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <h4 class="text-2xl text-center font-bold dark:text-white">
              {{ selectedDepartment }} Department
            </h4>
            <p class="mt-2 text-md text-center text-gray-500">{{ date }}</p>
          </div>
          <div class="mb-3 flex items-center justify-center align-center" v-if="tabSelected==='isOverall'">
            <span
              class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
              >Home (AM) : {{ totalHomeAM }}</span
            >
            <span
              class="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
              >Office (AM) : {{ totalRecordsLength - totalHomeAM}}</span
            >
            <span
              class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300"
              >Home (PM) : {{ totalHomePM }}</span
            >
            <span
              class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
              >Office (PM) : {{ totalRecordsLength - totalHomePM }}</span
            >
          </div>
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">Staff Name</th>
                <th scope="col" class="px-6 py-3">AM</th>
                <th scope="col" class="px-6 py-3">PM</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(person, index) in paginatedData"
                :key="index"
                class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <th
                  scope="row"
                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ person.name }}
                </th>
                <td class="px-6 py-4">
                  <span class="text-emerald-700" v-if="person.AM == 1"> Home</span>
                  <span class="text-cyan-700" v-if="person.AM == 0">Office</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-emerald-700" v-if="person.PM == 1">Home</span>
                  <span class="text-cyan-700" v-if="person.PM == 0">Office</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Controls -->
          <div class="flex justify-center items-center space-x-2 py-4">
            <button @click="prevPage" :disabled="currentPage === 1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <span>{{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              @click="$emit('closemodal')"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      displayData: null,
      selectedDepartment: null,
      currentPage: 1,
      itemsPerPage: 8,
      totalRecordsLength: 0,
      totalHomeAM: 0,
      totalHomePM: 0,
    }
  },
  props: ['date', 'department', 'tabSelected'],
  computed: {
    totalPages() {
      return Math.ceil(this.displayData?.length / this.itemsPerPage)
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.displayData?.slice(start, end)
    },
  },
  emits: ['closemodal'],
  methods: {
    /**
     * Fetches department data from the API based on the selected department and date.
     *
     * This method sets the selected department and makes an asynchronous API request
     * to retrieve the team schedule for a specified department. It uses the current
     * date as the start and end date in the request parameters.
     *
     * If the request is successful (status 200), the response data is stored in the
     * `displayData` property. If the request fails, an error message is displayed.
     *
     * @async
     * @param {string} department - The name of the department for which the data is to be fetched.
     * @returns {Promise<void>} A promise that resolves when the data is fetched and set, or an error occurs.
     */
    async getDeptData(department) {
      this.selectedDepartment = department
      try {
        const response = await axios.get(`http://localhost:3001/arrangementRequests/teamschedule`, {
          params: {
            startDate: this.date,
            endDate: this.date,
            dept: department
          }
        })
        if (response.status === 200) {
          this.displayData = response.data.data
          if (this.tabSelected === 'isOverall'){
            this.computeTotalNumbers();
          }
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    },

    /**
   * Computes the total number of AM and PM records from the `displayData` array
   * and updates the corresponding totals and record length.
   *
   * Iterates through the `displayData` array to sum up the 'AM' and 'PM' values
   * and assigns the totals to `totalHomeAM`, `totalHomePM`, and the number of records to `totalRecordsLength`.
   */
    computeTotalNumbers(){
      let totalRecords = this.displayData.length;
      let homeAM = 0;
      let homePM = 0;
      this.displayData.forEach((person)=> {
        homeAM += person['AM'];
        homePM += person['PM'];
      })
      this.totalHomeAM = homeAM;
      this.totalHomePM = homePM;
      this.totalRecordsLength = totalRecords;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    }
  },
  mounted() {
    this.getDeptData(this.department);
  }
}
</script>

<style scoped></style>
