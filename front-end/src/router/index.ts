import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/views/Game.vue'),
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('@/views/Leaderboard.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/Chat.vue'),
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('@/views/Lobby.vue'),
    },
    //{ path: '/:notFound(.*)', component: null },
  ],
});

export default router;
