<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import AmbientBackground from './components/AmbientBackground.vue';
import { profile } from './content/profile.js';
import { menuPages } from './pages.js';

const route = useRoute();
const router = useRouter();
const view = ref(null);
const paused = ref(false);
let previousSelection = menuPages.find(page => page.name === route.name)?.name ?? menuPages[0]?.name;
let shouldFocus = false;

function skipToContent() {
  document.querySelector('main h1')?.focus();
}
function updateMetadata() {
  document.title = route.meta.title;
  let canonical = document.querySelector('link[rel="canonical"]');
  let robots = document.querySelector('meta[name="robots"]');
  if (route.meta.canonical) {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = route.meta.canonical;
    robots?.remove();
  } else {
    canonical?.remove();
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.append(robots);
    }
    robots.content = 'noindex';
  }
}
async function focusScreen() {
  if (!shouldFocus) return;
  await nextTick();
  if (route.name === 'menu') view.value?.focusItem(previousSelection);
  else document.querySelector('main h1')?.focus({ preventScroll: true });
  shouldFocus = false;
}
function onKeydown(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable]')) return;
  if (event.key === 'Escape' && route.name !== 'menu') {
    router.push('/');
  } else if (route.name === 'menu' && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    view.value?.moveFocus(event.key === 'ArrowDown' ? 1 : -1);
  }
}
watch(() => route.path, () => {
  const menuPage = menuPages.find(page => page.name === route.name);
  if (menuPage) previousSelection = menuPage.name;
  shouldFocus = true;
  if (typeof document !== 'undefined') updateMetadata();
});
onMounted(() => {
  updateMetadata();
  document.addEventListener('keydown', onKeydown);
});
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <AmbientBackground :paused="paused" />
  <button class="skip-link" type="button" @click="skipToContent">Skip to content</button>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink to="/" class="wordmark" :aria-label="`${profile.name} — main menu`">{{ profile.handle }}</RouterLink>
    </header>

    <main id="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="screen" mode="out-in" @after-enter="focusScreen">
          <component :is="Component" :key="route.path" ref="view" v-bind="route.name === 'menu' ? { items: menuPages } : {}" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer">
      <span>{{ profile.location }}</span>
      <div class="footer-actions">
        <button class="motion-toggle" type="button" :aria-pressed="paused" @click="paused = !paused">{{ paused ? 'Resume motion' : 'Pause motion' }}</button>
        <RouterLink to="/legal-notice/">Legal notice</RouterLink>
        <a :href="profile.github">GitHub <span aria-hidden="true">↗</span></a>
      </div>
    </footer>
  </div>
</template>
