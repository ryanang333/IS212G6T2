<template>
  <div class="bg-white">
    <div>
      <main class="mx-auto max-w-screen-2xl	 sm:px-20">
        <div class="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900">My Requests</h1>

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
                        <th class="p-4 text-left font-semibold uppercase tracking-wider">Date</th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider">Time</th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider">Reason</th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider">Status</th>
                        <th class="p-4 text-left font-semibold uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody class="bg-white">
                      <MyRequest v-for="(node, index) in requests" :key="index" :node="node" />
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
import MyRequest from '../components/MyRequest.vue'
import { getInStorage } from '../../utils/localStorage.js'
import axios from 'axios'
export default {
  data() {
    return {
      fullRequests: [],
      staffId: null,
      requests: [],
      status: [],
      sortOptions: [
        { name: 'Latest to Oldest', current: true },
        { name: 'Oldest to Latest', current: false }
      ],
      filters: [
        {
          id: 'Type',
          name: 'Request Type',
          options: [
            { value: 'Ad-Hoc', label: 'Ad-Hoc', checked: false },
            { value: 'Regular', label: 'Regular', checked: false },
            { value: 'All', label: 'All', checked: true }
          ]
        },
        {
          id: 'Status',
          name: 'Request Status',
          options: [
            { value: 'Pending', label: 'Pending', checked: false },
            { value: 'Approved', label: 'Approved', checked: false },
            { value: 'Rejected', label: 'Rejected', checked: false },
            { value: 'Cancelled', label: 'Cancelled', checked: false },
            { value: 'Pending Withdrawal', label: 'Pending Withdrawal', checked: false },
            { value: 'Withdrawn', label: 'Withdrawn', checked: false },
            { value: 'All', label: 'All', checked: true }
          ]
        },
        {
          id: 'Date',
          name: 'Date',
          options: [
            { value: 'Upcoming', label: 'Upcoming', checked: true },
            { value: 'Past', label: 'Past', checked: false },
            { value: 'All', label: 'All', checked: false }
          ]
        }
      ]
    }
  },
  components: {
    MyRequest,
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
    PlusIcon
  },
  methods: {
    async fetchArrangementRequests() {
      if (!this.staffId) {
        alert('No staff ID found. Please log in again.')
        return
      }
      try {
        const response = await axios.get('http://localhost:3001/arrangementRequests/staff', {
          params: { staff_id: this.staffId, status: this.status }
        })
        let data = response.data.data
        this.fullRequests = await this.convertToTreeData(data)
        this.filterRequests()
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message
        alert(`Error - ${errorMessage}`)
      }
    },
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
            reason: value[0].reason,
            request_time: value[0].request_time
          })
        } else {
          requestsArr.push(...value)
        }
      }
      return requestsArr
    },
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
                request.children && request.children.some((child) => child.status === 'Pending')
              )
            }
            return request.status === 'Pending'
          })
          break
        case 'Approved':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                request.children && request.children.some((child) => child.status === 'Approved')
              )
            }
            return request.status === 'Approved'
          })
          break
        case 'Rejected':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                request.children && request.children.some((child) => child.status === 'Rejected')
              )
            }
            return request.status === 'Rejected'
          })
          break
        case 'Cancelled':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                request.children && request.children.some((child) => child.status === 'Cancelled')
              )
            }
            return request.status === 'Cancelled'
          })
          break
        case 'Pending Withdrawal':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                request.children &&
                request.children.some((child) => child.status === 'Pending Withdrawal')
              )
            }
            return request.status === 'Pending Withdrawal'
          })
          break
        case 'Withdrawn':
          filteredRequests = filteredRequests.filter((request) => {
            if (request.group_id) {
              return (
                request.children && request.children.some((child) => child.status === 'Withdrawn')
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
  },
  mounted() {
    this.staffId = getInStorage('staff_id')
    this.fetchArrangementRequests()
  }
}
</script>
