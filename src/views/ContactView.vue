<script setup>
import ContentPanel from '../components/ContentPanel.vue';
import ContactMethod from '../components/ContactMethod.vue';
import { contactMethods } from '../content/contact.js';
</script>

<template>
  <ContentPanel title="Say hello.">
    <p class="panel-intro">Want to get in touch? Here's where you can find me.</p>
    <ul class="contact-methods">
      <ContactMethod v-for="method in contactMethods" :key="method.id" :method="method" />
    </ul>
  </ContentPanel>
</template>

<style scoped>
.contact-methods { display: grid; grid-auto-rows: 1fr; list-style: none; margin: 32px 0 0; padding: 0; width: 100%; }
</style>
