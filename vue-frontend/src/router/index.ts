import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import store from '@/store';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "view-home" */ '@/views/Home.vue')
  },
  {
    path: '/wait-for-visualcal',
    name: 'wait-for-visualcal',
    component: () => import(/* webpackChunkName: "view-wait-for-visualcal" */ '@/views/WaitForVisualCal.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, _from, next) => {
  if (to.name === 'wait-for-visualcal') return next();
  try {
    await store.dispatch.refreshUser();
  } catch (error) {
    console.warn('Attempted to refresh sessions, but VisualCal was\'t ready');
    return next({
      name: 'wait-for-visualcal'
    });
  }
  return next();
});

export default router;
