<template>
  <div>
    <header class="header">
      <nav>
        <ul class="nav-list">
          <li><RouterLink to="/about" class="nav-link">About</RouterLink></li>
          <li><RouterLink to="/" class="nav-link">Home</RouterLink></li>
          <li><RouterLink to="/arrangementrequests" class="nav-link">Arrangement Requests</RouterLink></li>
        </ul>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<style scoped>
.header {
  background-color: blue;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.nav-list li {
  margin-right: 20px;
}

.nav-link {
  text-decoration: none;
  color: white;
  font-weight: bold;
}

.nav-link:hover {
  text-decoration: underline;
}
</style>