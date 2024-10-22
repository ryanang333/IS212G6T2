<template>
  <div class="bg-white">
    <div>
      <main class="mx-auto max-w-screen-2xl sm:px-20">
        <div class="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900">{{ pageTitle }}</h1>

          <div class="flex items-center">
            <Menu as="div" class="relative inline-block text-left">
              <div>
                <MenuButton
                  class="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sort
                  <ChevronDownIcon
                    class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                </MenuButton>
              </div>

              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems
                  class="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div class="py-1">
                    <MenuItem
                      v-for="option in sortOptions"
                      :key="option.name"
                      v-slot="{ active }"
                      @click="handleSort(option.name)"
                    >
                      <a
                        :class="[
                          option.current ? 'font-medium text-gray-900' : 'text-gray-500',
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm'
                        ]"
                        >{{ option.name }}</a
                      >
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>

        <section aria-labelledby="products-heading" class="pb-24 pt-6">
          <h2 id="products-heading" class="sr-only">Products</h2>

          <div class="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            <!-- Filters -->
            <form class="hidden lg:block">
              <Disclosure
                as="div"
                v-for="section in filters"
                :key="section.id"
                class="border-b border-gray-200 py-6"
                v-slot="{ open }"
              >
                <h3 class="-my-3 flow-root">
                  <DisclosureButton
                    class="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500"
                  >
                    <span class="font-medium text-gray-900">{{ section.name }}</span>
                    <span class="ml-6 flex items-center">
                      <PlusIcon v-if="!open" class="h-5 w-5" aria-hidden="true" />
                      <MinusIcon v-else class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </DisclosureButton>
                </h3>
                <DisclosurePanel class="pt-6">
                  <div class="space-y-4">
                    <div
                      v-for="(option, optionIdx) in section.options"
                      :key="option.value"
                      class="flex items-center"
                    >
                      <input
                        :id="`filter-${section.id}-${optionIdx}`"
                        :name="`${section.id}[]`"
                        :value="option.value"
                        type="radio"
                        :checked="option.checked"
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        @click.stop="setFilters(section.id, option.value)"
                      />
                      <label
                        :for="`filter-${section.id}-${optionIdx}`"
                        class="ml-3 text-sm text-gray-600"
                        >{{ option.label }}</label
                      >
                    </div>
                  </div>
                </DisclosurePanel>
              </Disclosure>
            </form>

            <!-- Product grid -->
            <div class="lg:col-span-3">
              <div class="lg:col-span-3">
                <div class="container mx-auto p-4">
                  <table class="min-w-full table-auto border-collapse shadow-lg">
                    <thead>
                      <tr class="bg-gray-800 text-white">
                        <th class="p-4 text-left font-semibold uppercase tracking-wider"></th>
                        <th
                          v-if="invokingPage === 'Staff Request'"
                          class="p-4 text-left font-semibold uppercase tracking-wider"
                        >
                          Staff Name
                        </th>
                        <th
                          v-if="invokingPage === 'Staff Request'"
                          class="p-4 text-left font-semibold uppercase tracking-wider"
                        >
                          Position
                        </th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider">Date</th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider">Time</th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider">Reason</th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider">Status</th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody class="bg-white">
                      <Request
                        v-for="(node, index) in requests"
                        :key="index"
                        :node="node"
                        :invokingPage="invokingPage"
                        @requestaction="handleRequestEmit"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
  <OptionsModal
    v-if="isOpenOptions"
    :message="msg"
    :options="options"
    :helpMessage="helpMsg"
    @close="this.isOpenOptions = false"
    @optionselected="handleOptionChosen"
  />
  <InputPrompt
    v-if="isWithdrawalModalOpen"
    :title="modalData.title"
    :button1="modalData.button1"
    :button2="modalData.button2"
    @inputfilled="handleModalInput"
    @close="closeModal"
  />
</template>

<script>
import {
  Dialog,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'
import { ChevronDownIcon, MinusIcon, PlusIcon } from '@heroicons/vue/20/solid'
import Request from '@/components/Request.vue'
import { getInStorage } from '@/utils/localStorage.js'
import axios from 'axios'
import OptionsModal from '@/components/OptionsModal.vue'
import InputPrompt from '@/components/InputPrompt.vue'
export default {
  props: ['invokingPage', 'pageTitle', 'parentSortingOptions', 'parentFilters'],
  mounted() {
    this.copyPropsLocally()
    this.staffId = getInStorage('staff_id')
    this.fetchArrangementRequests()
  },
  data() {
    return {
      isOpenOptions: false,
      isWithdrawalModalOpen: false,
      modalData: {
        title: '',
        button1: '',
        button2: ''
      },
      modalResolve: null,
      msg: 'What would you like to do?',
      options: [],
      selectedRequest: [],
      fullRequests: [],
      staffId: null,
      requests: [],
      status: [],
      helpMsg: '**For recurring request(s), the action will only be applied to applicable date(s)',
      sortOptions: [],
      filters: []
    }
  },
  components: {
    Request,
    Dialog,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    ChevronDownIcon,
    MinusIcon,
    PlusIcon,
    OptionsModal,
    InputPrompt
  },
  methods: {
    copyPropsLocally() {
      this.sortOptions = this.parentSortingOptions
      this.filters = this.parentFilters
    },
    /**
     * Handles the option chosen by the user from a selection menu.
     * Depending on the chosen option ('Cancel' or 'Withdraw'), it filters the
     * selected requests based on their status and calls the corresponding
     * method to process those requests.
     *
     * @param {string} event - The event representing the user's chosen option.
     *                         Can be either 'Cancel' or 'Withdraw'.
     *
     * @returns {void} - This function does not return a value.
     */
    handleOptionChosen(event) {
      if (!Array.isArray(this.selectedRequest)) {
        this.selectedRequest = [this.selectedRequest]
      }
      let cleanedRequests = []
      if (event == 'Cancel') {
        cleanedRequests = this.selectedRequest.filter((req) => req.status == 'Pending')
        this.cancelArrangementRequests(cleanedRequests)
      } else if (event == 'Withdraw') {
        cleanedRequests = this.selectedRequest.filter((req) => req.status == 'Approved')
        this.withdrawArrangementRequests(cleanedRequests)
      } else if (event == 'Withdraw Approval') {
        cleanedRequests = this.selectedRequest.filter((req) => req.status == 'Approved')
        this.withdrawApprovedRequests(cleanedRequests)
      } else if (event == 'Reject Request') {
        cleanedRequests = this.selectedRequest.filter((req) => req.status == 'Pending')
        this.rejectArrangementRequest(cleanedRequests)
      } else if (event == 'Approve Request') {
        cleanedRequests = this.selectedRequest.filter((req) => req.status == 'Pending')
        this.approveArrangementRequest(cleanedRequests)
      } else if (event == 'Approve Withdrawal') {
        cleanedRequests = this.selectedRequest.filter((req) => req.status == 'Pending Withdrawal')
        this.ApproveWithdrawalRequests(cleanedRequests)
      } else if (event == 'Reject Withdrawal') {
        cleanedRequests = this.selectedRequest.filter((req) => req.status == 'Pending Withdrawal')
        this.RejectWithdrawalRequests(cleanedRequests)
      }
      this.isOpenOptions = false
    },

    async withdrawApprovedRequests(reqArray) {
      try {
        const modalResponse = await this.showModal(
          'Enter a reason for withdrawal',
          'Cancel',
          'Withdraw'
        )
        if (modalResponse.button === 'Cancel') {
          return
        }
        try {
          const response = await axios.patch(
            'http://localhost:3001/arrangementRequests/managerwithdrawal',
            {
              requests: reqArray,
              reason: modalResponse.input
            }
          )
          if (response.status === 200) {
            alert(response.data.message)
            this.fetchArrangementRequests()
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          alert(`Error - ${errorMessage}`)
        }
      } catch (error) {
        console.error(error)
      }
    },
    /**
     * Rejects a list of arrangement requests after prompting the user for a rejection reason via a modal.
     *
     * @async
     * @function rejectArrangementRequest
     * @param {Array} reqArray - An array of request objects to be rejected.
     * @returns {Promise<void>} A promise that resolves when the server processes the rejection request.
     * @throws {Error} Will throw an error if the request fails, or if the user cancels the modal input.
     */
    async rejectArrangementRequest(reqArray) {
      try {
        const modalResponse = await this.showModal(
          'Enter a reason for rejection',
          'Cancel',
          'Reject'
        )
        if (modalResponse.button === 'Cancel') {
          return
        }
        try {
          console.log(reqArray)
          const response = await axios.patch(
            'http://localhost:3001/arrangementRequests/staffrejection',
            {
              requests: reqArray,
              reason: modalResponse.input
            }
          )
          if (response.status === 200) {
            alert(response.data.message)
            this.fetchArrangementRequests()
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          alert(`Error - ${errorMessage}`)
        }
      } catch (error) {
        console.error(error)
      }
    },

    /**
     * Approves a list of arrangement requests by sending them to the server for staff approval.
     *
     * @async
     * @function approveArrangementRequest
     * @param {Array} reqArray - An array of request objects to be approved.
     * @returns {Promise<void>} A promise that resolves when the server responds to the approval request.
     * @throws {Error} Will throw an error if the request fails, displaying an alert with the error message.
     */
    async approveArrangementRequest(reqArray) {
      try {
        const response = await axios.patch(
          'http://localhost:3001/arrangementRequests/staffapproval',
          {
            requests: reqArray
          }
        )
        if (response.status === 200) {
          alert(response.data.message)
          this.fetchArrangementRequests()
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    },
    /**
     * Handles the process of withdrawing arrangement requests.
     * Displays a modal to the user to enter a reason for withdrawal.
     * If the user confirms, sends a PATCH request to update the withdrawal status
     * for the specified requests. Alerts the user of the operation's success or failure.
     *
     * @param {Array} reqArray - An array of request objects to be withdrawn.
     *
     * @returns {Promise<void>} - This method returns a promise that resolves when the
     *                            withdrawal process is complete.
     */
    async withdrawArrangementRequests(reqArray) {
      try {
        const modalResponse = await this.showModal(
          'Enter a reason for withdrawal',
          'Cancel',
          'Withdraw'
        )
        if (modalResponse.button === 'Cancel') {
          return
        }
        try {
          const response = await axios.patch(
            'http://localhost:3001/arrangementRequests/staffwithdrawal',
            {
              requests: reqArray,
              reason: modalResponse.input
            }
          )
          if (response.status === 200) {
            alert(response.data.message)
            this.fetchArrangementRequests()
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message
          alert(`Error - ${errorMessage}`)
        }
      } catch (error) {
        console.error(error)
      }
    },

    /**
     * Displays a modal with specified title and buttons.
     * Returns a promise that resolves with the user's input when the modal is closed.
     *
     * @param {string} title - The title to display on the modal.
     * @param {string} button1 - The label for the first button.
     * @param {string} button2 - The label for the second button.
     *
     * @returns {Promise<Object>} - A promise that resolves to an object containing the user's
     *                              input and the button clicked to close the modal.
     */
    showModal(title, button1, button2) {
      return new Promise((resolve) => {
        this.modalData = {
          title: title,
          button1: button1,
          button2: button2
        }
        this.isWithdrawalModalOpen = true
        this.modalResolve = resolve
      })
    },

    /**
     * Handles the input from the modal and closes it.
     * Resolves the modal promise with the provided response.
     *
     * @param {Object} response - The response object containing the user's input and the button clicked.
     *
     * @returns {void}
     */
    handleModalInput(response) {
      this.isWithdrawalModalOpen = false
      if (this.modalResolve) {
        this.modalResolve(response)
      }
    },

    /**
     * Closes the modal without resolving the promise.
     * Sets the modal state to closed.
     *
     * @returns {void}
     */
    closeModal() {
      this.isWithdrawalModalOpen = false
    },

    async cancelArrangementRequests(reqArray) {
      try {
        const response = await axios.patch(
          'http://localhost:3001/arrangementRequests/staffcancellation',
          {
            requests: reqArray
          }
        )
        if (response.status === 200) {
          alert(response.data.message)
          this.fetchArrangementRequests()
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    },

    async ApproveWithdrawalRequests(reqArray) {
      try {
        const response = await axios.patch(
          'http://localhost:3001/arrangementRequests/approveWithdrawal',
          {
            requests: reqArray,
          }
        )
        if (response.status === 200) {
          alert(response.data.message)
          this.fetchArrangementRequests()
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    },

    async RejectWithdrawalRequests(reqArray) {
      try {
        const response = await axios.patch(
          'http://localhost:3001/arrangementRequests/rejectWithdrawal',
          {
            requests: reqArray,
          }
        )
        if (response.status === 200) {
          alert(response.data.message)
          this.fetchArrangementRequests()
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    },
    /**
     * Handles the emission of a request event and determines possible options
     * based on the request's type and status.
     *
     * @param {Object} event - The emitted event object containing request details.
     * @param {string} event.type - The type of the request, either 'regular' or other.
     * @param {Object} event.data - The data associated with the request.
     * @param {Array} event.data.children - An array of child requests if the request type is 'regular'.
     *
     * @returns {void}
     */
    handleRequestEmit(event) {
      let possibleOptions = []
      if (event.type === 'regular') {
        possibleOptions = this.checkPossibleOptions(event.data.children)
        this.selectedRequest = event.data.children
      } else {
        possibleOptions = this.checkPossibleOptions([event.data])
        this.selectedRequest = [event.data]
      }
      if (possibleOptions.size == 0) {
        this.selectedRequest = []
        alert('Sorry, the request is neither an approved or pending one :(')
        return
      }
      this.options = possibleOptions.values()
      this.isOpenOptions = true
    },

    /**
     * Checks the status of each request in the provided array and determines
     * the possible options based on their statuses.
     *
     * @param {Array<Object>} reqArray - An array of request objects to check.
     * @param {string} reqArray[].status - The status of each request, which can be 'Approved', 'Pending', or others.
     *
     * @returns {Set<string>} A set containing possible options such as 'Withdraw' or 'Cancel'.
     */
    checkPossibleOptions(reqArray) {
      const possibleOptions = new Set()
      reqArray.forEach((req) => {
        if (this.invokingPage === 'My Request') {
          switch (req.status) {
            case 'Approved':
              possibleOptions.add('Withdraw')
              break
            case 'Pending':
              possibleOptions.add('Cancel')
              break
            default:
              break
          }
        } else if (this.invokingPage === 'Staff Request') {
          switch (req.status) {
            case 'Pending':
              possibleOptions.add('Approve Request')
              possibleOptions.add('Reject Request')
              break
            case 'Pending Withdrawal':
              possibleOptions.add('Approve Withdrawal')
              possibleOptions.add('Reject Withdrawal')
              break
            case 'Approved':
              possibleOptions.add('Withdraw Approval')
              break
            default:
              break
          }
        }
      })
      return possibleOptions
    },

    /**
     * Fetches arrangement requests for the logged-in staff member based on their ID and status.
     * If no staff ID is found, alerts the user to log in again.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the requests have been successfully fetched and processed.
     * @throws {Error} Throws an error if the request to fetch arrangement requests fails.
     */
    async fetchArrangementRequests() {
      if (!this.staffId) {
        alert('No staff ID found. Please log in again.')
        return
      }
      try {
        let response
        if (this.invokingPage === 'My Request') {
          response = await axios.get('http://localhost:3001/arrangementRequests/staff', {
            params: { staff_id: this.staffId, status: this.status }
          })
        } else if (this.invokingPage === 'Staff Request') {
          response = await axios.get(
            `http://localhost:3001/arrangementRequests?manager_id=${this.staffId}`
          )
        }
        let data = response.data.data
        this.fullRequests = this.convertToTreeData(data)
        this.filterRequests()
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    },

    /**
     * Converts an array of arrangement requests into a tree data structure.
     * Requests with the same group ID are combined into a single entry,
     * with their dates aggregated into a date range.
     *
     * @param {Array<Object>} requests - An array of request objects, where each request contains
     *                                    properties like request_date, group_id, reason, and request_time.
     * @returns {Array<Object>} An array of requests formatted for tree representation,
     *                          combining requests with the same group ID into a single entry.
     */
    convertToTreeData(requests) {
      let requestsArr = []
      let requestMap = new Map()
      requests.forEach((req) => {
        const reqDate = new Date(req.request_date)
        req.request_date = reqDate.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })

        if (req.group_id) {
          let currArr = requestMap.has(req.group_id) ? requestMap.get(req.group_id) : []
          currArr.push(req)
          requestMap.set(req.group_id, currArr)
        } else {
          requestsArr.push(req)
        }
      })

      for (const [key, value] of requestMap) {
        if (value.length > 1) {
          const earliestDate = value.reduce(
            (min, req) => (new Date(req.request_date) < new Date(min) ? req.request_date : min),
            value[0].request_date
          )
          const latestDate = value.reduce(
            (max, req) => (new Date(req.request_date) > new Date(max) ? req.request_date : max),
            value[0].request_date
          )

          requestsArr.push({
            group_id: key,
            request_date: `${new Date(earliestDate).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })} to ${new Date(latestDate).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}`,
            children: value,
            // reason: value[0].reason,
            request_time: value[0].request_time,
            staff_name: value[0].staff_name,
            position: value[0].position
          })
        } else {
          requestsArr.push(...value)
        }
      }
      return requestsArr
    },

    /**
     * Sorts the requests array based on the specified sort key.
     * The requests can be sorted from latest to oldest or oldest to latest.
     *
     * @param {string} key - The sorting criteria. Should be either 'Latest to Oldest'
     *                       or 'Oldest to Latest'.
     * @returns {void} This method does not return a value; it modifies the
     *                 requests array in place.
     */
    handleSort(key) {
      const extractDate = (dateString) => {
        return dateString.split(' to ')[0]
      }

      if (key === 'Latest to Oldest') {
        this.sortOptions[0].current = true
        this.sortOptions[1].current = false
        this.requests.sort(
          (a, b) => new Date(extractDate(b.request_date)) - new Date(extractDate(a.request_date))
        )
      } else if (key === 'Oldest to Latest') {
        this.sortOptions[1].current = true
        this.sortOptions[0].current = false
        this.requests.sort(
          (a, b) => new Date(extractDate(a.request_date)) - new Date(extractDate(b.request_date))
        )
      }
    },

    /**
     * Sets the checked state of filter options based on the provided filter ID and value.
     * This method updates the filters to reflect the selected value and then triggers a
     * re-evaluation of the requests based on the current filter state.
     *
     * @param {string} id - The ID of the filter to be updated.
     * @param {string} value - The value to be set as checked for the corresponding filter option.
     * @returns {void} This method does not return a value; it modifies the filters array in place
     *                 and calls the filterRequests method.
     */
    setFilters(id, value) {
      for (let filterObj of this.filters) {
        if (filterObj.id == id) {
          for (let filterOption of filterObj.options) {
            filterOption.checked = filterOption.value == value
          }
        }
      }
      this.filterRequests()
    },

    /**
     * Filters the requests based on selected criteria defined in the filters array.
     * This method iterates through the filters, identifies the selected options,
     * and then applies these filters to the requests using the applyFilter method.
     *
     * @returns {void} This method does not return a value; it modifies the request list in place
     *                 based on the applied filters.
     */
    filterRequests() {
      let type
      let status
      let date
      this.filters.forEach((filter) => {
        let filterId = filter.id
        const filterOption = filter.options.find((option) => option.checked === true)
        if (filterId == 'Type') {
          type = filterOption.value
        } else if (filterId == 'Status') {
          status = filterOption.value
        } else if (filterId == 'Date') {
          date = filterOption.value
        }
      })
      this.applyFilter(type, status, date)
    },

    /**
     * Applies the specified filters to the full list of requests and updates the requests array.
     *
     * This method filters requests based on the provided type, status, and date parameters.
     * It modifies the filteredRequests array based on the criteria and updates the requests
     * property with the filtered results.
     *
     * @param {string|null} type - The type of requests to filter: 'Ad-Hoc', 'Regular', or null for no type filter.
     * @param {string|null} status - The status of requests to filter: 'Pending', 'Approved', 'Rejected',
     *                               'Cancelled', 'Pending Withdrawal', 'Withdrawn', or null for no status filter.
     * @param {string|null} date - The date category to filter: 'Upcoming', 'Past', or null for no date filter.
     *
     * @returns {void} This method does not return a value; it modifies the requests array in place.
     */
    applyFilter(type, status, date) {
      let filteredRequests = [...this.fullRequests]
      switch (type) {
        case 'Ad-Hoc':
          filteredRequests = filteredRequests.filter((request) => request.group_id === null)
          break
        case 'Regular':
          filteredRequests = filteredRequests.filter((request) => request.group_id !== null)
          break
        default:
          break
      }

      switch (status) {
        case 'Pending':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                (request.children &&
                  request.children.some((child) => child.status === 'Pending')) ||
                request.status === 'Pending'
              )
            }
            return request.status === 'Pending'
          })
          break
        case 'Approved':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                (request.children &&
                  request.children.some((child) => child.status === 'Approved')) ||
                request.status === 'Approved'
              )
            }
            return request.status === 'Approved'
          })
          break
        case 'Rejected':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                (request.children &&
                  request.children.some((child) => child.status === 'Rejected')) ||
                request.status === 'Rejected'
              )
            }
            return request.status === 'Rejected'
          })
          break
        case 'Cancelled':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                (request.children &&
                  request.children.some((child) => child.status === 'Cancelled')) ||
                request.status === 'Cancelled'
              )
            }
            return request.status === 'Cancelled'
          })
          break
        case 'Pending Withdrawal':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                (request.children &&
                  request.children.some((child) => child.status === 'Pending Withdrawal')) ||
                request.status === 'Pending Withdrawal'
              )
            }
            return request.status === 'Pending Withdrawal'
          })
          break
        case 'Withdrawn':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                (request.children &&
                  request.children.some((child) => child.status === 'Withdrawn')) ||
                request.status === 'Withdrawn'
              )
            }
            return request.status === 'Withdrawn'
          })
          break
        default:
          break
      }

      switch (date) {
        case 'Upcoming':
          filteredRequests = filteredRequests.filter((request) => {
            const requestDateParts = request.request_date.split(' to ')[0]
            const requestDate = new Date(requestDateParts)
            return requestDate > new Date()
          })
          break
        case 'Past':
          filteredRequests = filteredRequests.filter((request) => {
            const requestDateParts = request.request_date.split(' to ')[0]
            const requestDate = new Date(requestDateParts)
            return requestDate < new Date()
          })
          break
        default:
          break
      }
      this.requests = filteredRequests
    }
  }
}
</script>
