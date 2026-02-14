import type dayjs from 'dayjs';

export interface MapPoint {
  date: dayjs.Dayjs;
  lat: number;
  lng: number;
}

export interface UploadFile {
  name: string;
  size: number;
  allPoints: number;
  importedPoints: number;
  skippedPoints: number;
}

export interface Images {
  name: string;
  location: string;
  dngLocation: string | null;
  date: dayjs.Dayjs;
  size: number;
  lat: number;
  lng: number;
}
