<script setup lang="ts">
import { useMapStore } from '@/stores/map.store';

const mapStore = useMapStore();
</script>

<template>
  <div class="absolute top-0 left-0 z-11 pl-2 pt-2" v-auto-animate>
    <q-btn
      v-if="mapStore.availableDates.length > 0"
      no-caps
      unelevated
      class="rounded px-3 py-0 bg-white/70 text-black text-sm font-bold"
    >
      {{
        typeof mapStore.selectedDates === 'object' && mapStore.selectedDates !== null
          ? mapStore.selectedDates.to && mapStore.selectedDates.from
            ? `${mapStore.selectedDates.to} - ${mapStore.selectedDates.from}`
            : ''
          : mapStore.selectedDates || 'All Dates'
      }}
      <q-icon name="sym_o_arrow_drop_down" class="-mr-1" />

      <q-menu square class="shadow-none mt-4">
        <q-date
          v-model="mapStore.selectedDates"
          minimal
          flat
          range
          mask="YYYY-MM-DD"
          :events="mapStore.availableDates.map((d) => d.replace(/-/g, '/'))"
          event-color="orange"
          color="white"
        />
      </q-menu>
    </q-btn>
  </div>
</template>

<style scoped></style>
