<template>
  <div>
    <header v-if="!$route.path.includes('/login')">
      <NavBar/>
    </header>
    <router-view />
  </div>
</template>
<script>
import NavBar from './components/NavBar.vue'

export default {
  components: {
    NavBar
  },
}
</script>
<style></style>
