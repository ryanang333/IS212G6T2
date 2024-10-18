<template>
  <section class="bg-stone-200">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <span class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-10 me-4"
        >
          <path
            d="M19.006 3.705a.75.75 0 1 0-.512-1.41L6 6.838V3a.75.75 0 0 0-.75-.75h-1.5A.75.75 0 0 0 3 3v4.93l-1.006.365a.75.75 0 0 0 .512 1.41l16.5-6Z"
          />
          <path
            fill-rule="evenodd"
            d="M3.019 11.114 18 5.667v3.421l4.006 1.457a.75.75 0 1 1-.512 1.41l-.494-.18v8.475h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3v-9.129l.019-.007ZM18 20.25v-9.566l1.5.546v9.02H18Zm-9-6a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.75-.75H9Z"
            clip-rule="evenodd"
          />
        </svg>

        All-In-One WFH Tracking System
      </span>
      <div
        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1
            class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
          >
            Sign in to your account
          </h1>
          <form class="space-y-4 md:space-y-6" @submit.prevent="login">
            <div>
              <label
                for="staffId"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Staff ID</label
              >
              <input
                type="text"
                name="staffId"
                id="staffId"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="e.g. 1023192"
                required
                v-model="staffId"
              />
            </div>

            <button
              type="submit"
              class="w-full bg-stone-500 text-white hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import { REGEX_NUM } from '../utils/utils'
import { saveInStorage } from '../utils/localStorage'
export default {
  data() {
    return {
      staffId: null
    }
  },
  methods: {
    /**
     * Logs in the user by checking the entered staff ID,
     * fetching user details from the backend, and saving them in local storage.
     * Redirects to 'submittedview' upon successful login.
     *
     * @returns {Promise<void>} - No return value.
     */
    async login() {
      if (
        this.staffId === null ||
        this.staffId.trim().length == 0 ||
        !REGEX_NUM.test(this.staffId)
      ) {
        alert('Please enter a valid ID before tryna log in!')
        return
      }
      try {
        console.log(this.staffId)
        const response = await axios.get(`http://localhost:3001/staff?staff_id=${this.staffId}`)
        if (response.status === 200) {
          const { data } = response
          saveInStorage(data.data)
          alert('Successfully logged in!')
          this.$router.push('/schedule')
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    }
  }
}
</script>

<style scoped></style>
