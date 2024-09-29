<template>
  <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mb-6">
    <div class="sm:col-span-2">
      <label for="date" class="block text-sm font-medium leading-6 text-gray-900">Date</label>
      <div class="mt-2">
        <input
          required
          type="date"
          name="date"
          id="date"
          v-model="localData.date"
          class="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <div class="sm:col-span-2">
      <label for="time" class="block text-sm font-medium leading-6 text-gray-900">Time</label>
      <div class="mt-2">
        <select
          required
          id="time"
          name="time"
          v-model="localData.time"
          class="px-3 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option>AM</option>
          <option>PM</option>
          <option selected>Full Day</option>
        </select>
      </div>
    </div>
    <div class="sm:col-span-2">
      <label for="reason" class="block text-sm font-medium leading-6 text-gray-900">Reason</label>
      <div class="mt-2">
        <input
          required
          type="text"
          v-model="localData.reason"
          name="reason"
          id="reason"
          autocomplete="reason"
          class="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    <input type="hidden" v-model="localData.id" />
  </div>
</template>
<script>
export default {
  props: {
    value: Object,
    index: Number
  },
  data() {
    return {
      /**
       * Local copy of the arrangement data, initialized from the value prop.
       * If value prop is not provided, initializes with an object containing null values.
       * @type {Object}
       */
      localData: this.value || { id: null, date: null, time: null, reason: null }
    }
  },
  methods: {},
  watch: {
    /**
     * Watches for changes in localData and emits an input event to update the parent component.
     * @param {Object} newValue - The new value of localData after the change.
     */
    localData: {
      handler(newValue) {
        this.$emit('input', newValue)
      },
      deep: true
    }
  },
  emits: ['input']
}
</script>
<style scoped></style>
