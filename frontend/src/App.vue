<template>
  <div>
    <header class="bg-blue-600 p-4 shadow-md">
      <nav>
        <ul class="flex space-x-4">
          <li>
            <RouterLink to="/about" class="text-white font-bold hover:underline">About</RouterLink>
          </li>
          <li>
            <RouterLink to="/" class="text-white font-bold hover:underline">Home</RouterLink>
          </li>
          <li>
            <RouterLink to="/arrangementrequests" class="text-white font-bold hover:underline">Arrangement Requests</RouterLink>
          </li>
        </ul>
      </nav>
    </header>
    <router-view />
  </div>
  <nav>
    <RouterLink to="/about"> Go to about </RouterLink>
    <RouterLink to="/"> Go to home</RouterLink>
    <RouterLink to="/submittedview"> Go to submitted requests</RouterLink>
  </nav>
  <RouterView />
</template>
<style></style>