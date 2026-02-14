import { createApp } from 'vue';
import { Quasar } from 'quasar';
import { router } from './lib/router';
import { createPinia } from 'pinia';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';

import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css';
import './assets/first.css';
import './assets/style.css';

import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(autoAnimatePlugin);
app.use(router);
app.use(Quasar, {
  plugins: {},
  config: {
    dark: true,
    brand: {
      primary: '#0f172b',
      secondary: '#26A69A',
      accent: '#9C27B0',
      dark: '#1d1d1d',
      positive: '#00a63e',
      negative: '#fb2c36',
      info: '#31CCEC',
      warning: '#F2C037',
    },
  },
});

app.mount('#app');
