import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', redirect: '/login' },
		{
			path: '/login',
			name: 'Login',
			component: () => import('@/views/Login.vue'),
		},
		{
			path: '/fakelogin/:username',
			name: 'FakeLogin',
			component: () => import('@/views/fakeLogin.vue'),
		},
		{
			path: '/home',
			name: 'Home',
			component: () => import('@/views/Home.vue'),
		},
		{
			path: '/match/:id(\\d+)',
			name: 'Match',
			component: () => import('@/views/Match.vue'),
		},
		{
			path: '/matchmaking',
			name: 'Matchmaking',
			component: () => import('@/views/Matchmaking.vue'),
		},
		{
			path: '/profile/:id(\\d+)',
			name: 'Profile',
			component: () => import('@/views/Profile.vue'),
		},
		{
			path: '/leaderboard',
			name: 'Leaderboard',
			component: () => import('@/views/Leaderboard.vue'),
			//meta: { requiresAuth: true },
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
		{
			path: '/:pathMatch(.*)*',
			name: 'Error',
			component: () => import('@/views/Error.vue'),
		},
	],
});

router.beforeEach((to, _) => {
	const userStore = useUserStore();
	if (to.name !== 'Login' && !userStore.isLoggedIn && to.name !== 'FakeLogin') {
		return { name: 'Login' };
	} else if (to.name === 'Login' && userStore.isLoggedIn) {
		return { name: 'Home' };
	}
});

export default router;
