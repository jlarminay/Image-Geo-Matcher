import { createWebHistory, createRouter } from 'vue-router';

import HomeView from '../pages/HomeView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
      meta: { tenantOnly: true },
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});
