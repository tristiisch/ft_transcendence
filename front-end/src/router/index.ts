import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: '/', redirect: '/login' },
		{
			path: '/login',
			name: 'login',
			component: () => import('@/views/Login.vue'),
		},
		{
			path: '/home',
			name: 'Home',
			component: () => import('@/views/Home.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/game',
			name: 'Game',
			component: () => import('@/views/Game.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/profile/:username',
			name: 'Profile',
			component: () => import('@/views/Profile.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/leaderboard',
			name: 'Leaderboard',
			component: () => import('@/views/Leaderboard.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/chat',
			name: 'Chat',
			component: () => import('@/views/Chat.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/lobby',
			name: 'Lobby',
			component: () => import('@/views/Lobby.vue'),
			meta: { requiresAuth: true },
		},
		{ path: '/:notFound(.*)', component: () => import('@/views/NotFound.vue') },
	],
});

router.beforeEach((to, _, next) => {
	const authStore = useAuthStore()
	if (to.meta.requiresAuth && !authStore.isAuthenticated) {
		next('/login');
	} else {
		next();
	}
});

export default router;
