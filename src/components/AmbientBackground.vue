<script setup>
import { onMounted, ref } from 'vue';

defineProps({ paused: Boolean });
const ready = ref(false);
onMounted(() => { ready.value = true; });
</script>

<template>
  <div class="ambient" :class="{ 'is-ready': ready, 'is-paused': paused }" aria-hidden="true"><div class="ambient-haze"></div></div>
</template>

<style scoped>
.ambient { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; background: #080808; }
.ambient-haze { position: absolute; inset: -30%; background: radial-gradient(ellipse at 75% 40%, #242424 0, #141414 24%, transparent 55%); opacity: .65; transform: translate(-3%, 3%) rotate(-7deg); }
.is-ready .ambient-haze { animation: haze 40s ease-in-out infinite alternate; }
.is-paused .ambient-haze { animation-play-state: paused; }
@keyframes haze { from { transform: translate(-3%, 3%) rotate(-7deg); } to { transform: translate(6%, -4%) rotate(7deg); } }
</style>
