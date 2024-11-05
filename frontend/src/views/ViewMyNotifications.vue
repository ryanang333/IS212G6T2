  <template>
    <div class="p-6 bg-gray-50 min-h-screen">
      <Notifications :userRole="userRole" />
    </div>
  </template>

  <script>
  import Notifications from '../components/Notification.vue';
  import { getInStorage } from '@/utils/localStorage.js';

  export default {
    components: {
      Notifications,
    },
    data() {
      return {
        userRole: '',
      };
    },
    mounted() {
      const storedUserRole = getInStorage('user_role');
      this.userRole = storedUserRole === 'manager' ? 'Manager' : 'Staff';
    },
  };
  </script>