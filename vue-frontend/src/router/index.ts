import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Session',
    component: () => import(/* webpackChunkName: "view-home" */ '@/views/Session.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "view-login" */ '@/views/Login.vue')
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "view-error" */ '@/views/Error.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
