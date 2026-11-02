<script setup>
import ContentPanel from '../components/ContentPanel.vue';
import { profile } from '../content/profile.js';

const columns = [
  { label: 'Programs', tools: profile.toolbox.filter(tool => tool.kind === 'program') },
  { label: 'Languages and frameworks', tools: profile.toolbox.filter(tool => tool.kind !== 'program') },
];
</script>

<template>
  <ContentPanel title="The toolbox.">
    <p class="panel-intro">My usual setup, plus other software and languages I'm familiar with.</p>
    <div class="tool-columns">
      <ul v-for="column in columns" :key="column.label" class="tool-list" :aria-label="column.label">
        <li v-for="tool in column.tools" :key="tool.name" :class="{ 'is-primary': tool.primary }">{{ tool.name }}</li>
      </ul>
    </div>
  </ContentPanel>
</template>

<style scoped>
.tool-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; margin-top: 28px; max-width: 490px; }
.tool-list { display: grid; grid-auto-rows: minmax(33px, auto); align-content: start; gap: 7px; list-style: none; margin: 0; padding: 0; }
.tool-list li { display: flex; align-items: center; min-width: 0; color: var(--muted); font-size: 14px; line-height: 1.8; overflow-wrap: anywhere; }
.tool-list .is-primary { color: #e5e5e5; font-size: 18px; }
</style>
