<script setup lang="ts">
import { ref } from 'vue';

const emits = defineEmits(['back', 'close']);
withDefaults(
  defineProps<{
    size?: 'tiny' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';
    closeButton?: boolean;
    tight?: boolean;
    maximized?: boolean;
  }>(),
  {
    size: 'sm',
    closeButton: true,
    tight: false,
    maximized: false,
  },
);

const modal = ref<any>(false);

defineExpose({
  show: () => modal.value.show(),
  hide: () => modal.value.hide(),
});
</script>

<template>
  <q-dialog
    ref="modal"
    class="modal"
    @before-hide="emits('close')"
    :maximized="maximized"
    :transitionShow="maximized ? 'slide-up' : 'fade'"
    :transitionHide="maximized ? 'slide-down' : 'fade'"
  >
    <q-card
      class="shadow-none"
      :class="{
        'w-auto!': size === 'tiny',
        'w-140 max-w-140!': size === 'sm',
        'w-175 max-w-175!': size === 'md',
        'w-237.5 max-w-237.5!': size === 'lg',
        'w-275 max-w-275!': size === 'xl',
        'w-auto': size === 'auto',
        'flex flex-col h-full': maximized,
      }"
    >
      <q-card-section
        v-if="!tight"
        class="flex items-center justify-end pb-0 sticky top-0 z-1000"
        v-auto-animate
      >
        <q-btn
          :class="{ 'opacity-0 pointer-events-none': !closeButton }"
          v-close-popup
          icon="sym_o_close"
          flat
          round
          dense
        />
      </q-card-section>

      <q-card-section class="q-pt-none p-10 pt-0" :class="{ 'p-0! m-0!': tight, grow: maximized }">
        <slot />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="postcss"></style>
