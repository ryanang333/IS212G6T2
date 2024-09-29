<template>
  <form @submit.prevent="validateDetails">
    <div class="px-20">
      <div class="border-b border-gray-900/10 pb-8">
        <ul role="list">
          <li v-for="(arrangement, index) in arrangements" :key="arrangement.id">
            <div class="flex justify-end">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6 stroke-gray-400"
                @click="removeArrangement(arrangement.id)"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <ApplyRegArrangementBar
              :index="index"
              :value="arrangement"
              @input="updateArrangement(index, $event)"
              @remove="removeArrangement($event)"
            />
          </li>
        </ul>
        <div class="flex justify-center mt-8">
          <button
            type="button"
            @click="addArrangement"
            class="rounded-md bg-zinc-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add Date
          </button>
        </div>
      </div>
    </div>

    <div class="px-20 mt-6 flex items-center gap-x-6">
      <button
        type="submit"
        class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="submitArrangements"
      >
        {{ submitButtonText }}
      </button>
      <button
        type="button"
        class="text-sm font-semibold leading-6 text-gray-900"
        @click="clearArrangements"
      >
        Clear
      </button>
    </div>
  </form>
</template>

<script>
import ApplyRegArrangementBar from '../components/ApplyRegArrangementBar.vue'
import axios from 'axios'
import { checkDatesValidity } from '../../utils/utils'
export default {
  mounted() {
    this.addArrangement()
  },
  data() {
    return {
      counter: 0, //Variable used to keep track of the unique ID of each request in the frontend
      arrangements: [],
      staffId: '00001' //fetch from local storage after authentication is implemented
    }
  },
  computed: {
    /**
     * Determines the text for the submit button. 
     * If no request is needed -> 'Apply' 
     * Else 'Submit Request'
     */
    submitButtonText() {
      return this.staffId === '00001' ? 'Apply' : 'Submit Request' // use 0001 for now
    }
  },
  methods: {
    /**
     * Adds a new arrangement object to the arrangements array.
     * The new arrangement object has a unique id, and its properties (date, time, reason) are initialized to null.
     */
    addArrangement() {
      this.arrangements.push({
        id: ++this.counter,
        startDate: null,
        recurringWeeks: null,
        recurringInterval: null,
        time: null,
        reason: null
      })
    },

    /**
     * Makes a POST request to submit validated arrangement requests.
     * @async
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the request fails.
     */
     async makeRequest() {
      let data = {
        staffId: this.staffId,
        arrangementRequests: this.arrangements
      }
      try {
        const response = await axios.post('http://localhost:3001/arrangementRequests/reg', data)
        if (response.status === 201) {
          alert(response.data.message)
        }
      } catch (error) {
        if (error.response) {
          alert('Error - ' + error.response.data.message)
        } else if (error.request) {
          alert('Error - ' + error.request.data.message)
        } else {
          alert('Error - ' + error.message)
        }
      }
    },

    /**
     * Validates the arrangement details before making a request.
     * Checks if the dates are valid and alerts the user if any date is invalid.
     * If all dates are valid, it proceeds to make the request.
     * @async
     * @returns {Promise<void>}
     */
    async validateDetails() {
      const dates = this.arrangements.map((arrangement) => arrangement.date)
      const { isValid, invalidDates } = checkDatesValidity(dates)

      if (!isValid) {
        const invalidDateMessages = invalidDates
          .map((invalidDate) => `${invalidDate.date} - ${invalidDate.reason}`)
          .join('\n')

        alert(
          `Sorry, your request is not valid for the following date(s):\n\n${invalidDateMessages}`
        )
        return
      }
      this.makeRequest()
    },

    /**
     * Updates an existing arrangement at the specified index with the new data from the event.
     * @param {number} idx - The index of the arrangement to update.
     * @param {Object} event - The new arrangement data to update.
     */
    updateArrangement(idx, event) {
      this.arrangements[idx] = event
    },

    /**
     * Removes an arrangement from the arrangements array by its id.
     * @param {number} id - The id of the arrangement to remove.
     */
    removeArrangement(id) {
      let arrangements = this.arrangements.filter((arrangement) => arrangement.id !== id)
      this.arrangements = arrangements
    },

    /**
     * Clears all arrangements from the arrangements array and adds a new default arrangement.
     */
    clearArrangements() {
      this.arrangements = []
      this.addArrangement()
    }
  },
  components: {
    ApplyRegArrangementBar
  }
}
</script>

<style scoped></style>
