import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: '/', redirect: '/login' },
		{
			path: '/login',
			name: 'Login',
			component: () => import('@/views/Login.vue'),
			meta: { requiresAuth: false },
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
	const authStore = useAuthStore();
	if (to.name === 'Login' && to.query.code !== undefined && !authStore.isAuthenticated) {
		authStore.handleLogin(to.query.code as string, to.query.state as string);
		authStore.isLoading = true;
		console.log('test')
		next('/login')
	}
	else if ((to.meta.requiresAuth  && !authStore.isAuthenticated)) {
		next('/login')
	} else if (authStore.isAuthenticated && !authStore.user.username) {
		authStore.user.username = JSON.parse(localStorage.getItem('user') as string).id
		next('/login')
	} else if (!to.meta.requiresAuth  && authStore.isAuthenticated && JSON.parse(localStorage.getItem('user') as string).username) {
		next('/home')
	} else {
		next();
	}
});

export default router;
