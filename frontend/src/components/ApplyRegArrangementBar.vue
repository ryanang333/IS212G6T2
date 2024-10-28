<template>
  <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mb-6">
    <div class="sm:col-span-1">
      <label for="date" class="block text-sm font-medium leading-6 text-gray-900">Starting Date</label>
      <div class="mt-2">
        <input
          required
          type="date"
          name="startDate" 
          id="startDate"
          v-model="localData.startDate"
          @change="validateDayAndDate" 
          class="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
    
    <div class="sm:col-span-1">
      <label for="day" class="block text-sm font-medium leading-6 text-gray-900">Recurring Interval</label>
      <div class="mt-2">
        <select
          required
          id = "recurringInterval"
          name = "recurringInterval"
          v-model="localData.recurringInterval"
          class="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
        <option value="" disabled>How Often?</option>
        <option value="1week">Every Week</option>
        <option value="2week">Every 2 Weeks</option>
        <option value="3week">Every 3 Weeks</option>
        <option value="4week">Every 4 Weeks</option>
        </select>
          
      </div>
    </div>

    <div class="sm:col-span-1">
      <label for="time" class="block text-sm font-medium leading-6 text-gray-900">No. of Events</label>
      <div class="mt-2">
        <input
          required
          type="number"
          v-model="localData.numEvents"
          name="numEvents"
          id="numEvents"
          min="1"
          placeholder="Total Recurring Days"
          class="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>

    <div class="sm:col-span-1">
      <label for="time" class="block text-sm font-medium leading-6 text-gray-900">Time</label>
      <div class="mt-2">
        <select
          required
          id="time"
          name="time"
          v-model="localData.time"
          class="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
      localData: this.value || { id: null, date: null, numEvents: null, recurringInterval: null, time: null, reason: null }
    }
  },
  methods: {
    /**
     * Not needed for now since we are just going to choose a starting date
     * Ensures that user does not select Tuesday & clicks on a non-Tuesday starting date
     * Can change this to somewhere else?
     */
    // validateDayAndDate() {
    //   const selectedDay = this.localData.day;
    //   const selectedDate = new Date(this.localData.startDate);
    //   const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
    //   if (selectedDate && selectedDay) {
    //     const dayOfWeek = daysOfWeek[selectedDate.getDay()];
    //     if (dayOfWeek !== selectedDay) {
    //       alert(`The selected date is a ${dayOfWeek}, but you selected ${selectedDay}. Please choose the correct date.`);
    //       // Reset the date field if validation fails
    //       this.localData.startDate = null;
    //     }
    //   }
    // }
  },
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
