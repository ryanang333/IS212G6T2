<template>
  <div class="px-20 pt-20 pb-5">
    <h2
      class="pb-10 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
    >
      Apply for Flexible Work Arrangement
    </h2>
    <fieldset>
      <legend class="underline underline-offset-1 text-sm font-semibold leading-6 text-gray-900">
        <div class="grid grid-flow-col auto-cols-max gap-x-1">
          <p>Applying for?</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4 stroke-gray-600"
            @mouseover="showHelpText(true)"
            @mouseleave="showHelpText(false)"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
        </div>
      </legend>
      <div class="mt-2 grid grid-flow-col auto-cols-max">
        <div class="flex items-center gap-x-3 me-5">
          <input
            id="push-email"
            name="push-notifications"
            type="radio"
            value="adHoc"
            v-model="arrangementType"
            class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label for="push-email" class="block text-sm font-medium leading-6 text-gray-900"
            >Ad-Hoc</label
          >
        </div>
        <div class="flex items-center gap-x-3 ms-5">
          <input
            id="push-nothing"
            name="push-notifications"
            type="radio"
            value="regular"
            v-model="arrangementType"
            class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label for="push-nothing" class="block text-sm font-medium leading-6 text-gray-900"
            >Regular</label
          >
        </div>
      </div>
      <div v-if="isShowHelpText" class="mt-2">
        <p class="ms-2 text-sm leading-6 text-red-600">
          ** For a recurring arrangement, choose "Regular", for one-time arrangements, choose
          "Ad-Hoc".
        </p>
      </div>
    </fieldset>
  </div>
  <ApplyTempArrangement v-show="arrangementType == 'adHoc'" />
</template>

<script>
import ApplyTempArrangement from './ApplyTempArrangement.vue'

export default {
  data() {
    return {
      isShowHelpText: false,
      arrangementType: null
    }
  },
  methods: {
    /**
     * Toggles the visibility of the help text based on the provided boolean value.
     *
     * @param {boolean} bool - A flag indicating whether to show the help text (true) or hide it (false).
     * @returns {void}
     */
    showHelpText(bool) {
      this.isShowHelpText = bool
    }
  },
  components: { ApplyTempArrangement }
}
</script>
<style scoped></style>
