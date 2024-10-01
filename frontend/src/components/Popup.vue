<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">Reason for Canceling Request</h2>
      
      <!-- Textbox for reason -->
      <textarea v-model="reason" rows="4" class="w-full p-2 border border-gray-300 rounded" placeholder="Enter your reason..."></textarea>

      <div class="flex justify-end mt-4">
        <!-- Close button to close the popup without submitting -->
        <button @click="closePopup" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">Close</button>

        <!-- Submit button to send the reason -->
        <button @click="submitReason" class="bg-red-500 text-white px-4 py-2 rounded">Submit</button>
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
  data() {
    return {
      reason: ''  // Holds the reason for canceling
    };
  },
  methods: {
    closePopup() {
      this.$emit('close');
    },
    submitReason() {
      if (this.reason.trim() === '') {
        alert('Please provide a reason for canceling.');
        return;
      }
      // Emit the reason back to the parent component
      this.$emit('submit-reason', this.reason);
      this.closePopup();  // Close popup after submitting
    }
  }
};
</script>
