import { createWebHistory, createRouter } from 'vue-router';

import HomeRoutes from '@/modules/home/router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...HomeRoutes,

    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});
