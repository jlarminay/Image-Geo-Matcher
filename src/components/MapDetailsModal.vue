<script setup lang="ts">
import { useMapStore } from '@/stores/map.store';
import { Modal } from '@/components';
import { formatMemorySize } from '@/lib/helpers';

const mapStore = useMapStore();
</script>

<template>
  <Modal>
    <h2 class="text-2xl mb-2">Map Details</h2>

    <q-table
      :rows="mapStore.uploadedFiles"
      :columns="[
        { name: 'name', label: 'Name', field: 'name', align: 'left' },
        { name: 'size', label: 'Size', field: (row) => formatMemorySize(row.size), align: 'left' },
        { name: 'imported', label: 'Imported', field: 'importedPoints', align: 'right' },
        { name: 'skipped', label: 'Skipped', field: 'skippedPoints', align: 'right' },
      ]"
      flat
      dense
      :table-row-class-fn="() => 'text-sm'"
      hide-pagination
      :rows-per-page-options="[0]"
    >
      <template #body-cell="props">
        <q-td :props="props">
          <span class="text-sm">{{ props.value }}</span>
        </q-td>
      </template>
    </q-table>
  </Modal>
</template>

<style scoped></style>
