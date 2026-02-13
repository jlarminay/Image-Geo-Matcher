import HomeView from './HomeView.vue';

export default [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView,
    meta: { tenantOnly: true },
  },
];
