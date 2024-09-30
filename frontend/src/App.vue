<template>
  <div>
    <header>
      <nav v-if="!$route.path.includes('/login')" class="bg-blue-600 p-4 shadow-md">
        <ul class="flex space-x-4">
          <li>
            <RouterLink to="/" class="text-white font-bold hover:underline">Home</RouterLink>
          </li>
          <li>
            <RouterLink to="/arrangementrequests" class="text-white font-bold hover:underline">Arrangement Requests</RouterLink>
          </li>
          <li>
            <RouterLink to="/submittedview" class="text-white font-bold hover:underline"> Go to submitted requests</RouterLink>
          </li>
        </ul>
      </nav>
    </header>
    <router-view />
  </div>
</template>
<style></style>