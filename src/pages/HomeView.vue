<script setup lang="ts">
import { Map, TopBar, DateSelector } from '@/components';
import { useMapStore } from '@/stores/map.store';
import { useFileStore } from '@/stores/file.store';
import { formatMemorySize } from '@/lib/helpers';
import dayjs from 'dayjs';

const mapStore = useMapStore();
const fileStore = useFileStore();
</script>

<template>
  <main class="h-full flex flex-col overflow-hidden">
    <TopBar class="shrink-0" />

    <div class="flex flex-1 min-h-0">
      <!-- Sidebar -->
      <div class="w-80 flex flex-col h-full border-r p-2">
        <div class="h-full relative overflow-scroll">
          <div v-for="image in fileStore.images" :key="image.name" class="flex mb-4">
            <img :src="image.location" class="w-1/3 aspect-video object-cover" />

            <div class="w-2/3 flex flex-col justify-center gap-0.5 px-4">
              <p class="text-sm mb-0 truncate w-full">{{ image.name }}</p>
              <p class="text-xs mb-0">{{ formatMemorySize(image.size) }}</p>
              <p class="text-xs mb-0">{{ dayjs(image.date).format('YYYY-MM-DD HH:mm:ss') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="flex-1 min-h-0 relative">
        <DateSelector />
        <Map />
      </div>
    </div>
  </main>
</template>

<style scoped></style>
