<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({ method: { type: Object, required: true } });
const valueElement = ref(null);
const infoElement = ref(null);
const infoButton = ref(null);
const hintOpen = ref(false);
const hintPinned = ref(false);
const copyState = ref('idle');
const announcement = ref('');
const hintId = `contact-hint-${props.method.id}`;
let resetTimer;
let active = true;
let copyInFlight = false;

function dismissHint() {
  hintOpen.value = false;
  hintPinned.value = false;
}
function showHover(event) {
  if (event.pointerType === 'mouse') hintOpen.value = true;
}
function hideHover(event) {
  if (event.pointerType === 'mouse' && !hintPinned.value && !infoButton.value?.matches(':focus-visible')) hintOpen.value = false;
}
function showFocus(event) {
  if (event.currentTarget.matches(':focus-visible')) hintOpen.value = true;
}
function toggleHint(event) {
  // Keyboard focus already reveals the tooltip; activation should toggle that visible state.
  hintPinned.value = event.detail === 0 ? !hintOpen.value : !hintPinned.value;
  hintOpen.value = hintPinned.value;
}
function onHintKeydown(event) {
  if (event.key === 'Escape' && hintOpen.value) {
    event.preventDefault();
    event.stopPropagation();
    dismissHint();
  }
}
function onOutsidePointer(event) {
  if (hintOpen.value && !infoElement.value?.contains(event.target)) dismissHint();
}
async function copyValue() {
  if (copyInFlight) return;
  copyInFlight = true;
  clearTimeout(resetTimer);
  copyState.value = 'idle';
  announcement.value = '';
  try {
    await navigator.clipboard.writeText(props.method.value);
    if (!active) return;
    copyState.value = 'copied';
    announcement.value = `${props.method.label} copied to clipboard.`;
  } catch {
    if (!active) return;
    const selection = window.getSelection();
    if (!selection || !valueElement.value) {
      announcement.value = 'Select the contact value and copy it manually.';
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(valueElement.value);
    selection.removeAllRanges();
    selection.addRange(range);
    copyState.value = 'selected';
    announcement.value = `${props.method.label} selected. You can copy it manually.`;
  } finally {
    copyInFlight = false;
  }
  resetTimer = setTimeout(() => {
    copyState.value = 'idle';
    announcement.value = '';
  }, 2000);
}
onMounted(() => {
  if (props.method.hint) document.addEventListener('pointerdown', onOutsidePointer);
});
onUnmounted(() => {
  active = false;
  document.removeEventListener('pointerdown', onOutsidePointer);
  clearTimeout(resetTimer);
});
</script>

<template>
  <li class="contact-method">
    <div class="contact-heading">
      <h2 class="contact-label">{{ method.label }}</h2>
      <span v-if="method.hint" ref="infoElement" class="contact-info" @pointerenter="showHover" @pointerleave="hideHover">
        <button ref="infoButton" type="button" class="info-button" :aria-label="`${method.label} information`" :aria-expanded="hintOpen" :aria-controls="hintId" :aria-describedby="hintId" @focus="showFocus" @blur="dismissHint" @click="toggleHint" @keydown="onHintKeydown">
          <svg class="info-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" opacity=".65" />
            <circle cx="8" cy="5.5" r=".75" fill="currentColor" />
            <path d="M8 7.5v3" stroke="currentColor" stroke-linecap="round" />
          </svg>
        </button>
        <span v-show="hintOpen" :id="hintId" role="tooltip" class="contact-tooltip">{{ method.hint }}</span>
      </span>
    </div>
    <div class="contact-row">
      <a v-if="method.href" ref="valueElement" class="contact-value contact-link" :href="method.href">{{ method.value }}</a>
      <code v-else ref="valueElement" class="contact-value">{{ method.value }}</code>
      <button v-if="method.copyLabel" type="button" class="copy-button" :aria-label="method.copyLabel" @click="copyValue">
        <span :class="{ 'label-hidden': copyState !== 'idle' }">{{ method.copyLabel }}</span>
        <span v-if="copyState !== 'idle'" class="copy-feedback" aria-hidden="true">{{ copyState === 'copied' ? 'Copied' : 'Selected' }}</span>
      </button>
    </div>
    <span class="screen-reader-status" role="status" aria-live="polite">{{ announcement }}</span>
  </li>
</template>

<style scoped>
.contact-method { position: relative; display: grid; grid-template-rows: auto 1fr; gap: 4px; padding: 14px 0; border-top: 1px solid var(--line); }
.contact-method:last-child { border-bottom: 1px solid var(--line); }
.contact-heading { position: relative; display: flex; align-items: center; gap: 3px; min-height: 28px; }
.contact-label { margin: 0; color: var(--muted); font-size: 11px; line-height: 16px; font-weight: 400; letter-spacing: 1px; }
.contact-info { display: inline-flex; align-items: center; height: 16px; }
.info-button { position: relative; display: grid; place-items: center; width: 14px; height: 16px; padding: 0; border: 0; background: none; color: #888; cursor: pointer; transform: translateY(-.5px); }
.info-button::before { content: ""; position: absolute; inset: -7px; }
.info-button:focus-visible { outline-offset: 3px; border-radius: 2px; }
.info-icon { display: block; width: 14px; height: 14px; }
.info-button:hover, .info-button[aria-expanded="true"] { color: #eee; }
.contact-tooltip { position: absolute; top: 100%; left: 0; z-index: 3; width: min(290px, 100%); padding: 12px 14px; border: 1px solid #3a3a3a; border-radius: 4px; background: #1b1b1b; color: #ccc; font-size: 12px; line-height: 1.65; box-shadow: 0 8px 24px #0005; }
.contact-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; min-height: 44px; gap: 12px; }
.contact-value { min-width: 0; font-family: inherit; font-size: clamp(18px, 3vw, 27px); font-weight: 350; line-height: 1.5; overflow-wrap: anywhere; user-select: all; }
.contact-link { text-decoration: underline; text-decoration-color: #555; text-underline-offset: 6px; text-decoration-thickness: 1px; }
.contact-link:hover { color: #fff; text-decoration-color: #aaa; }
.copy-button { position: relative; min-height: 44px; background: none; color: #ccc; border: 1px solid #3b3b3b; border-radius: 3px; padding: 11px 15px; font-size: 11px; cursor: pointer; }
.copy-button:hover { border-color: #888; color: #fff; }
.label-hidden { opacity: 0; }
.copy-feedback { position: absolute; inset: 0; display: grid; place-items: center; color: #eee; }
.screen-reader-status { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
</style>
