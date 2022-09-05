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
			//meta: { requiresAuth: false },
		},
		{
			path: '/fakelogin',
			name: 'FakeLogin',
			component: () => import('@/views/fakeLogin.vue'),
			//meta: { requiresAuth: false },
		},
		{
			path: '/home',
			name: 'Home',
			component: () => import('@/views/Home.vue'),
			//meta: { requiresAuth: true },
		},
		{
			path: '/match/:id(\\d+)',
			name: 'Match',
			component: () => import('@/views/Match.vue'),
			//meta: { requiresAuth: true },
		},
		{
			path: '/matchmaking',
			name: 'Matchmaking',
			component: () => import('@/views/Matchmaking.vue'),
			//meta: { requiresAuth: true },
		},
		{
			path: '/profile/:id(\\d+)',
			name: 'Profile',
			component: () => import('@/views/Profile.vue'),
			//meta: { requiresAuth: true },
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
			//meta: { requiresAuth: true },
		},
		{
			path: '/lobby',
			name: 'Lobby',
			component: () => import('@/views/Lobby.vue'),
			//meta: { requiresAuth: true },
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'Error',
			component: () => import('@/views/Error.vue'),
			//meta: { requiresAuth: true },
		},
		//{ path: '/:notFound(.*)', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
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
