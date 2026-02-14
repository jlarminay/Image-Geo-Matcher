import { defineStore } from 'pinia';
import { parseCoord } from '@/lib/helpers';
import dayjs from 'dayjs';
import { type MapPoint, type UploadFile } from '@/lib/types';

import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { invoke } from '@tauri-apps/api/core';
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

export const useMapStore = defineStore('map', {
  state: () => ({
    // single date or range of dates for filtering
    selectedDates: null as { from: string; to: string } | string | null,
    entries: [] as MapPoint[],
    uploadedFiles: [] as UploadFile[],
  }),

  getters: {
    filteredEntries(): MapPoint[] {
      if (!this.selectedDates) return this.entries;

      if (typeof this.selectedDates === 'string') {
        const selectedDate = dayjs(this.selectedDates, 'YYYY-MM-DD');
        return this.entries.filter((entry) => entry.date.isSame(selectedDate, 'day'));
      } else {
        const fromDate = dayjs(this.selectedDates.from, 'YYYY-MM-DD');
        const toDate = dayjs(this.selectedDates.to, 'YYYY-MM-DD');
        return this.entries.filter((entry) => entry.date.isBetween(fromDate, toDate, 'day', '[]'));
      }
    },
    availableDates(): string[] {
      const uniqueDates = new Set<string>();
      this.entries.forEach((entry) => {
        uniqueDates.add(entry.date.format('YYYY-MM-DD'));
      });
      return Array.from(uniqueDates).sort();
    },
  },

  actions: {
    async addMap(files: string[]) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // check if file was already uploaded
        if (this.uploadedFiles.some((f) => f.name === file)) {
          console.log('File already uploaded:', file);
          continue;
        }

        try {
          // get file from tauri API
          const text = await invoke<string>('get_file_content', { filePath: file });
          const lines = text.split('\n').map((l) => l.trim());
          const newEntries: MapPoint[] = [];
          let previousData: { lat?: number; lng?: number } = {};
          let skippedLines = 0;

          // parse each line
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;

            const data = line.split(',');
            const date = dayjs(`${data[2]}${data[3]}`, 'YYMMDDHHmmss');
            const lat = parseCoord(data[4]);
            const lng = parseCoord(data[5]);

            // before pushing, check if moved less than set distance away
            if (previousData.lat !== undefined && previousData.lng !== undefined) {
              const distance = Math.sqrt(
                Math.pow(lat - previousData.lat, 2) + Math.pow(lng - previousData.lng, 2),
              );

              // const minDistance = 0.00029; // approximately 30 meters in degrees
              const minDistance = 0.00005; // approximately 5 meters in degrees
              if (distance < minDistance) {
                skippedLines++;
                continue; // approximately
              }
            }

            // store previous data for next iteration
            previousData = { lat, lng };

            // Leaflet expects [lat, lng] as numbers
            newEntries.push({ date: date, lat, lng });
          }

          // get file stats
          const stats = await invoke<any>('get_file_details', { filePath: file });
          console.log('File stats:', stats);

          // store file info
          this.uploadedFiles.push({
            name: stats.filename,
            size: stats.size,
            allPoints: lines.length - 1,
            importedPoints: newEntries.length,
            skippedPoints: skippedLines,
          });

          // push new entries to state
          this.entries.push(...newEntries);
        } catch (err: any) {
          console.log('Error importing file:', err);
        }
      }
    },

    async sortEntries() {
      this.entries.sort((a, b) => a.date.valueOf() - b.date.valueOf());
    },
  },
});
