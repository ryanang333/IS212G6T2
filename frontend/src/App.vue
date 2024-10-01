<template>
  <div>

    <header v-if="!$route.path.includes('/login')">
      <NavBar :userRole="userRole" />
    </header>
    <router-view />
  </div>
</template>
<script>
import NavBar from './components/NavBar.vue';

export default {
  components: {
    NavBar
  },
  data(){
    return {
      userRole: 'HR'
    };
  },
};
</script>
<style></style>