<script setup>
import ContentPanel from '../components/ContentPanel.vue';
import { RouterLink } from 'vue-router';
import { profile } from '../content/profile.js';
</script>

<template>
  <ContentPanel :title="`Hey, I'm ${profile.name}.`">
    <div class="prose"><p v-for="paragraph in profile.about" :key="paragraph">{{ paragraph }}</p></div>
    <nav class="inline-links" aria-label="Explore more"><RouterLink to="/toolbox/">The toolbox ↗</RouterLink><RouterLink to="/contact/">Say hello ↗</RouterLink></nav>
  </ContentPanel>
</template>
