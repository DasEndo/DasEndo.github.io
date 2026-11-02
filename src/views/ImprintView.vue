<script setup>
import ContentPanel from '../components/ContentPanel.vue';
import { imprint, imprintComplete } from '../content/legal.js';
</script>

<template>
  <ContentPanel title="Legal notice.">
    <p class="panel-intro" lang="de">Impressum</p>
    <div v-if="imprintComplete" class="prose legal-copy">
      <h2>Website provider</h2>
      <address>{{ imprint.name }}<br><template v-for="line in imprint.address" :key="line">{{ line }}<br></template></address>
      <h2>Contact</h2>
      <p><a :href="`mailto:${imprint.email}`">{{ imprint.email }}</a></p>
      <p v-for="paragraph in imprint.additionalInformation" :key="paragraph">{{ paragraph }}</p>
    </div>
    <div v-else class="prose">
      <p class="draft-label">Draft — details pending</p>
      <p>The provider and contact details for this imprint will be added before publication.</p>
    </div>
  </ContentPanel>
</template>
