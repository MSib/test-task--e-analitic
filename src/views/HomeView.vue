<script setup lang="ts">
const sections = [
  { title: 'Доходы', link: 'incomes' },
  { title: 'Заказы', link: 'orders' },
  { title: 'Продажи', link: 'sales' },
  { title: 'Запасы', link: 'stocks' },
]
</script>

<template>
  <main>
    <h1>Главная</h1>
    <section v-for="section in sections" :key="section.link" class="section">
      <h2 class="section__title">{{ section.title }}</h2>
      <p class="section__description">
        Вы можете посмотреть {{ section.title.toLowerCase() }}
        <RouterLink :to="`/${section.link}`" class="section__link link">тут</RouterLink>
      </p>
    </section>
  </main>
</template>

<style>
.section {
  margin-inline: 24px;
  padding: 32px 8px;
}
.section__title {
  margin: 0;
}
.section__description {
  margin: 0;
}
.section__link {
  padding: 3px;
}
.section + .section {
  border-top: 4px dotted #777;
  border-top-right-radius: 80px;
}
</style>
