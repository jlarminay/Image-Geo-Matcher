<script setup lang="ts">
import { ref } from 'vue';
import { useMapStore } from '@/stores/map.store';
import { useFileStore } from '@/stores/file.store';
import { Modal, MapDetailsModal } from '@/components';
import { open } from '@tauri-apps/plugin-dialog';

const mapStore = useMapStore();
const fileStore = useFileStore();
const uploadType = ref<'images' | 'maps'>('images');
const loadingModal = ref<boolean>(false);
const showMapDetailsModal = ref<boolean>(false);

async function handleFileSelect() {
  console.log('Opening file dialog for:', uploadType.value);
  const returnedFilePaths: string | string[] | null = await open({
    multiple: true,
    directory: false,
    // filters:
    //   uploadType.value === 'images'
    //     ? [{extensions: ['jpg', 'jpeg', 'png', 'dng'] }]
    //     : [{ name: 'Maps', extensions: ['csv', 'txt'] }],
  });
  let filePaths: string[] = [];

  // turn filePaths into array if it's a single string
  if (typeof returnedFilePaths === 'string') {
    filePaths = [returnedFilePaths];
  } else if (Array.isArray(returnedFilePaths)) {
    filePaths = returnedFilePaths;
  }
  console.log('Selected file paths:', filePaths, uploadType.value);

  loadingModal.value = true;

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (uploadType.value === 'images') {
    await fileStore.addImages(filePaths);
  } else {
    await mapStore.addMap(filePaths);
  }

  loadingModal.value = false;
}
</script>

<template>
  <div class="border-b flex">
    <q-btn flat no-caps dense square class="px-6">
      Images
      <q-menu square class="shadow-none">
        <q-list dense style="min-width: 100px">
          <q-item
            clickable
            v-close-popup
            @click="
              uploadType = 'images';
              handleFileSelect();
            "
          >
            <q-item-section>Add...</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <q-btn flat no-caps dense square class="px-6">
      Maps
      <q-menu square class="shadow-none">
        <q-list dense style="min-width: 100px">
          <q-item
            clickable
            v-close-popup
            @click="
              uploadType = 'maps';
              handleFileSelect();
            "
          >
            <q-item-section>Add...</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="showMapDetailsModal = true">
            <q-item-section>Show map details</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <!-- Loading Modal -->
    <Modal v-model="loadingModal" size="tiny" :closeButton="false" persistent>
      <p>Loading Maps...</p>
      <q-spinner color="white" size="2em" class="mx-auto" />
    </Modal>
    <MapDetailsModal v-model="showMapDetailsModal" />
  </div>
</template>

<style scoped></style>
