import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import { type Images } from '@/lib/types';

export const useFileStore = defineStore('file', {
  state: () => ({
    images: [] as Images[],
  }),

  getters: {},

  actions: {
    async addImages(files: string[]) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(1);

        // check if file was already uploaded
        if (this.images.some((f) => f.name === file)) {
          console.log('File already uploaded:', file);
          continue;
        }

        if (!file.endsWith('.JPG')) {
          console.log('Unsupported file type, skipping:', file);
          continue;
        }

        console.log('Processing file:', file);
        const stats = await invoke<any>('get_file_details', { filePath: file });
        console.log('File stats:', stats);
        const thumbnail = await invoke<{ uid: string; path: string }>('generate_thumbnail', {
          imagePath: file,
          maxDimension: 200,
        });
        console.log('Generated thumbnail path:', thumbnail);

        this.images.push({
          name: stats.filename,
          location: thumbnail.path,
          dngLocation: null,
          date: stats.date_modified,
          size: stats.size,
          lat: 0,
          lng: 0,
        });
      }
    },
  },
});
