<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav>
    <RouterLink to="/about"> Go to about </RouterLink>
    <RouterLink to="/"> Go to home</RouterLink>
    <RouterLink to="/submittedview"> Go to submitted requests</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>

</style>
