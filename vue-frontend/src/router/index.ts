import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/session',
    name: 'Session',
    component: () => import(/* webpackChunkName: "view-session" */ '@/views/Session.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "view-login" */ '@/views/Login.vue')
  },
  {
    path: '/procedure-select',
    name: 'ProcedureSelect',
    component: () => import(/* webpackChunkName: "view-procedure-select" */ '@/views/procedure/Select.vue')
  },
  {
    path: '/procedure-create',
    name: 'ProcedureCreate',
    component: () => import(/* webpackChunkName: "view-procedure-create" */ '@/views/procedure/Create.vue')
  },
  {
    path: '/session-select',
    name: 'SessionSelect',
    component: () => import(/* webpackChunkName: "view-session-select" */ '@/views/session/Select.vue')
  },
  {
    path: '/session-create',
    name: 'SessionCreate',
    component: () => import(/* webpackChunkName: "view-session-create" */ '@/views/session/Create.vue')
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "view-no-route" */ '@/views/NoRoute.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
