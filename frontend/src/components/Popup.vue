<template>
  <div>
    <!-- Confirmation message -->
    <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Confirm Cancellation</h2>
        <p>Are you sure you want to submit a cancellation request?</p>

        <div class="flex justify-end mt-4">
          <!-- Close button to close the confirmation -->
          <button @click="closeConfirmation" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>

          <!-- Confirm button to submit the request -->
          <button @click="confirmCancellation" class="bg-red-500 text-white px-4 py-2 rounded">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closeConfirmation() {
      this.$emit('close');
    },
    confirmCancellation() {
      // Emit confirmation back to the parent component
      this.$emit('confirm-cancellation');
      this.closeConfirmation();  // Close confirmation after submitting
    }
  }
};
</script>