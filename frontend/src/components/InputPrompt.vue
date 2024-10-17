<template>
  <div tabindex="-1" class="relative z-10">
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
    ></div>
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
        >
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div>
              <label
                for="reason"
                class="mt-2 text-base font-semibold leading-6 text-gray-900 block mb-2 dark:text-white"
                >{{ title }}</label
              >
              <input
                type="text"
                name="reason"
                id="reason"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required
                v-model="inputText"
              />
            </div>
            <div class="mt-5 flex align-end justify-end">
              <button
                type="button"
                class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                @click="handleClick(button1)"
              >
                {{ button1 }}
              </button>
              <button
                type="button"
                class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                @click="handleClick(button2)"
              >
                {{ button2 }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputText: ''
    }
  },
  props: ['title', 'button1', 'button2'],
  methods: {
    handleClick(btnClicked) {
      if (btnClicked == this.button2 && this.inputText === '') {
        alert('Please fill in the field before proceeding')
        return
      }
      this.$emit('inputfilled', { input: this.inputText, button: btnClicked })
    }
  },
  emits:['inputfilled'],
}
</script>
