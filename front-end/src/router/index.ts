import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'

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
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/game',
      name: 'Game',
      component: () => import('@/views/Game.vue'),
    },
    {
      path: '/profile/:username',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
    },
    {
      path: '/leaderboard',
      name: 'Leaderboard',
      component: () => import('@/views/Leaderboard.vue'),
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/views/Chat.vue'),
    },
    {
      path: '/lobby',
      name: 'Lobby',
      component: () => import('@/views/Lobby.vue'),
    },
    { path: '/:notFound(.*)', component: () => import('@/views/NotFound.vue') },
  ],
})

export default router
