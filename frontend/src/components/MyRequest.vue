<template>
  <tr class="hover:bg-gray-50 transition-all duration-200 ease-in-out">
    <td class="p-4">
      <span class="flex items-center space-x-2">
        <button
          v-if="hasChildren"
          @click="toggle"
          class="focus:outline-none transition-transform duration-200"
          :class="isOpen ? 'rotate-90' : 'rotate-0'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-4 h-4 text-gray-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <span class="text-gray-800 font-medium">{{ node.request_date }}</span>
      </span>
    </td>
    <td class="p-4 text-gray-600">{{ node.request_time }}</td>
    <td class="p-4 text-gray-600">{{ node.reason }}</td>
    <td class="p-4 text-gray-600">
      <span
        v-if="node.status == 'Pending'"
        class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
        >Pending</span
      >
      <span
        v-if="node.status == 'Approved'"
        class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
        >Approved</span
      >
      <span
        v-if="node.status == 'Rejected'"
        class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"
        >Rejected</span
      >
      <span
        v-if="node.status == 'Cancelled'"
        class="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10"
        >Cancelled</span
      >
      <span
        v-if="node.status == 'Pending Withdrawal'"
        class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
        >Pending Withdrawal</span
      >
      <span
        v-if="node.status == 'Withdrawn'"
        class="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10"
        >Withdrawn</span
      >
    </td>
    <td>
      <button @click="handleActions">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="size-4"
        >
          <path
            fill-rule="evenodd"
            d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </td>
  </tr>

  <tr
    v-if="isOpen && hasChildren"
    v-for="(child, index) in node.children"
    :key="index"
    class="bg-gray-50"
  >
    <td class="p-4 pl-10">
      <span class="flex items-center space-x-2">
        <button
          v-if="child.hasChildren"
          @click="child.toggle"
          class="focus:outline-none transition-transform duration-200"
          :class="child.isOpen ? 'rotate-90' : 'rotate-0'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-4 h-4 text-gray-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <span class="text-gray-800">{{ child.request_date }}</span>
      </span>
    </td>
    <td class="p-4 text-gray-600"></td>
    <td class="p-4 text-gray-600"></td>
    <td class="p-4 text-gray-600">
      <span
        v-if="child.status == 'Pending'"
        class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
        >Pending</span
      >
      <span
        v-if="child.status == 'Approved'"
        class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
        >Approved</span
      >
      <span
        v-if="child.status == 'Rejected'"
        class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"
        >Rejected</span
      >
      <span
        v-if="child.status == 'Cancelled'"
        class="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10"
        >Cancelled</span
      >
      <span
        v-if="child.status == 'Pending Withdrawal'"
        class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
        >Pending Withdrawal</span
      >
      <span
        v-if="child.status == 'Withdrawn'"
        class="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10"
        >Withdrawn</span
      >
    </td>
    <td class="p-4 text-gray-600">
      <button @click="handleActions">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="size-4"
        >
          <path
            fill-rule="evenodd"
            d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    node: { type: Object, required: true }
  },
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    hasChildren() {
      return this.node.group_id != null && this.node.children;
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen
    }
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
