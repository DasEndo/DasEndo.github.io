<script setup>
import { RouterLink } from 'vue-router';
defineProps({ title: { type: String, required: true } });
</script>

<template>
  <section class="content-panel" aria-labelledby="panel-title">
    <RouterLink to="/" class="back-link">← Main menu</RouterLink>
    <h1 id="panel-title" tabindex="-1">{{ title }}</h1>
    <slot />
  </section>
</template>
