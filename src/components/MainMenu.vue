<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { profile } from '../content/profile.js';
import { nextMenuIndex } from '../navigation.js';

defineProps({ items: { type: Array, required: true } });
const navigation = ref(null);
const getLinks = () => [...(navigation.value?.querySelectorAll('a') ?? [])];

function focusItem(id) {
  const links = getLinks();
  (links.find(link => link.dataset.section === id) ?? links[0])?.focus({ preventScroll: true });
}
function moveFocus(direction) {
  const links = getLinks();
  const index = nextMenuIndex(links.indexOf(document.activeElement), direction, links.length);
  links[index]?.focus({ preventScroll: true });
}
defineExpose({ focusItem, moveFocus });
</script>

<template>
  <section class="menu-screen" aria-labelledby="menu-title">
    <h1 id="menu-title" tabindex="-1">{{ profile.name }}<span class="title-dot">.</span></h1>
    <p class="tagline">{{ profile.tagline }}</p>
    <nav ref="navigation" class="main-menu" aria-label="Main menu">
      <RouterLink v-for="item in items" :key="item.name" :to="item.path" :data-section="item.name">
        <span class="menu-cursor" aria-hidden="true">›</span>{{ item.label }}
      </RouterLink>
    </nav>
    <p class="keyboard-hint" aria-hidden="true"><kbd>↑</kbd> <kbd>↓</kbd> select <span>·</span> <kbd>↵</kbd> open</p>
  </section>
</template>
