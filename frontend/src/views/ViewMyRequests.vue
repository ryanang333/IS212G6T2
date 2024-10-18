<template>
  <MyRequests
    :pageTitle="pageTitle"
    :invokingPage="pageName"
    :parentSortingOptions="sortOptions"
    :parentFilters="filters"
  />
</template>
<script>
import MyRequests from '../components/Requests.vue'
export default {
  data() {
    return {
      pageTitle: 'My Requests',
      pageName: 'My Request',
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
      ],
      sortOptions: [
        { name: 'Latest to Oldest', current: true },
        { name: 'Oldest to Latest', current: false }
      ],
      helpMsg: '**For recurring request(s), the action will only be applied to applicable date(s)'
    }
  },
  methods: {},
  components: { MyRequests }
}
</script>
<style scoped></style>
