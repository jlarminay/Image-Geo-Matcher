<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import * as L from 'leaflet';
import { useMapStore } from '@/stores/map.store';

import 'leaflet/dist/leaflet.css';

let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
const mapStore = useMapStore();

onMounted(() => {
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
  }).setView([0, 0], 2);

  const tiles = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 18,
      minZoom: 2,
    },
  );
  tiles.addTo(map);

  addMarkersAndFit();

  // Ensure proper sizing after mount
  setTimeout(() => map?.invalidateSize(), 0);
});

watch(
  () => mapStore.filteredEntries,
  () => {
    addMarkersAndFit();
  },
  { deep: true },
);

function addMarkersAndFit() {
  if (!map) return;

  // Remove previous markers layer if exists
  if (markersLayer) {
    markersLayer.clearLayers();
    map.removeLayer(markersLayer);
  }
  markersLayer = L.layerGroup();

  const latlngSegments: [number, number][][] = [];
  let currentSegment: [number, number][] = [];
  let lastTime: number | null = null;
  const latlngs: [number, number][] = [];

  mapStore.filteredEntries.forEach((entry, _index) => {
    const latlng: [number, number] = [entry.lat, entry.lng];
    latlngs.push(latlng);

    // App points as small circles
    // L.circleMarker(latlng, {
    //   stroke: true,
    //   radius: 1,
    //   color: '#000',
    //   fillColor: '#000',
    //   fillOpacity: 1,
    // })
    //   .bindPopup(
    //     `
    //     <div style="font-size: 12px; font-family: sans-serif;">
    //       <strong>${entry.date.format('YYYY-MM-DD HH:mm:ss')}</strong><br/>
    //       Lat: ${entry.lat.toFixed(5)}, Lng: ${entry.lng.toFixed(5)}
    //     </div>
    //   `,
    //   )
    //   .addTo(markersLayer!);

    // entry.date is dayjs.Dayjs
    const entryTime =
      entry.date && typeof entry.date.diff === 'function'
        ? entry.date.valueOf()
        : entry.date instanceof Date
          ? entry.date.getTime()
          : Number(entry.date);

    // More than 2 hours, start new segment
    const timeDiffMax = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    if (lastTime !== null && Math.abs(entryTime - lastTime) > timeDiffMax) {
      if (currentSegment.length > 1) {
        latlngSegments.push(currentSegment);
      }
      currentSegment = [];
    }
    currentSegment.push(latlng);
    lastTime = entryTime;
  });
  if (currentSegment.length > 1) {
    latlngSegments.push(currentSegment);
  }

  // Color palette for lines
  const colors = [
    '#ff5722',
    '#2196f3',
    '#4caf50',
    '#9c27b0',
    '#ffc107',
    '#e91e63',
    '#00bcd4',
    '#8bc34a',
    '#ff9800',
    '#607d8b',
  ];
  let colorIdx = 0;
  latlngSegments.forEach((segment) => {
    if (segment.length > 1) {
      const color = colors[colorIdx % colors.length];
      colorIdx++;
      L.polyline(segment, {
        color,
        weight: 2,
        opacity: 1,
      }).addTo(markersLayer!);
    }
  });

  markersLayer.addTo(map);

  // Zoom/follow logic
  if (latlngs.length > 0) {
    const bounds = L.latLngBounds(latlngs);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div id="map" class="absolute w-full h-full z-10" />
</template>

<style scoped></style>
