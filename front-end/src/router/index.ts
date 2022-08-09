import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';

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
		{
			path: '/:pathMatch(.*)*',
			name: 'NotFound',
			component: () => import('@/views/NotFound.vue'),
			meta: { requiresAuth: true },
		},
	],
});

router.beforeEach((to, _) => {

	const userStore = useUserStore();
	if (to.name !== 'Login' && !userStore.isLoggedIn) {
		return { name: 'Login' };
	} else if (to.name !== 'Login' && userStore.isLoggedIn && !userStore.isRegistered) {
		return { name: 'Login' };
	} else if (to.name !== 'Login' && userStore.isLoggedIn && userStore.isRegistered && !userStore.isAuthenticated) {
		return { name: 'Login' };
	} else if (to.name === 'Login' && userStore.isLoggedIn && userStore.isRegistered && userStore.isAuthenticated) {
		return { name: 'Home' };
	}


	/*if (to.name === 'Login' && !userStore.isLoggedIn) {
		return { name: 'Login' };
	} else if (to.meta.requiresAuth && !userStore.isLoggedIn && !userStore.isRegistered) {
		return { name: 'Login' };
	} else if (to.meta.requiresAuth && userStore.isLoggedIn && userStore.isRegistered) {
		if (userStore.is2faEnable && !userStore.isAuthenticated) return { name: 'Login' };
	} else if (to.name === 'Login' && userStore.isLoggedIn && userStore.isRegistered) {
		return { name: 'Home' };
	}*/
});

/*if (to.name === 'Login' && to.query.code !== undefined && to.query.state !== undefined && !userStore.isLoggedIn) {
	userStore.handleLogin(to.query.code as string, to.query.state as string);
	return { name: 'Login' };
} else if (to.meta.requiresAuth && !userStore.isLoggedIn && !userStore.isRegistered) {
	return { name: 'Login' };
} else if (!to.meta.requiresAuth && userStore.isLoggedIn && userStore.isRegistered) {
	return { name: 'Home' };*/

export default router;
