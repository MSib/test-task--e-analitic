<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="menu">
      <nav>
        <RouterLink to="/">Главная</RouterLink>
        <RouterLink to="/incomes">Доходы</RouterLink>
      </nav>
    </div>
  </header>

  <main class="content">
    <RouterView />
  </main>
</template>

<style scoped>
header {
  padding: 8px;
  background-color: var(--c-bg);
  border-bottom: 1px solid var(--c-separator);
}

.menu nav {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  gap: 4px;
}

.menu a {
  padding: 8px 16px;
  color: var(--c-text);
  font-weight: bold;
  text-decoration: none;
  border-radius: 8px;
  outline: none;
}

.menu a.router-link-active {
  text-decoration-line: underline;
  text-decoration-thickness: 3px;
  text-underline-offset: 8px;
}

.menu a:hover {
  background-color: var(--c-hover-bg);
}

.menu a:focus-visible {
  background-color: var(--c-hover-bg);
  outline: 2px solid var(--c-focus-border);
}

.content {
  padding: 32px 16px;
}
</style>
