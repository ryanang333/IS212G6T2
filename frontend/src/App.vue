<template>
  <div>
    <header v-if="!$route.path.includes('/login')">
      <NavBar :role="role" />
    </header>
    <router-view />
  </div>
</template>
<script>
import NavBar from './components/NavBar.vue';
import { getInStorage } from '../utils/localStorage'; // Import the method to get data from local storage

export default {
  components: {
    NavBar
  },
  data(){
    return {
      role: getInStorage('role') || ''
    };
  },
};
</script>
<style></style>