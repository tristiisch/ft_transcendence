<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, onMounted, onUnmounted, onBeforeUpdate } from 'vue';
import type Leaderboard from '@/types/Leaderboard';
import Status from '@/types/Status';
import PlayerStatus from '@/components/Divers/PlayerStatus.vue';
import UsersService from '@/services/UserService';
import type User from '@/types/User';

const globalStore = useGlobalStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const sizeAvatar = ref<HTMLInputElement | null>(null);
const avatarWidth = ref(sizeAvatar.value?.width.toString() as string);
const windowHeight = ref(window.innerHeight);
const props = defineProps<{ user?: Leaderboard }>();
const pending = ref<User>()

const userStatus = computed(() => {
	if (props.user?.status === Status.INGAME) return 'Ingame';
	else if (props.user?.status === Status.OFFLINE) return 'Offline';
	else props.user?.status === Status.ONLINE;
	return 'Online';
});

function handleResize() {
	if (sizeAvatar.value) {
		let size = (sizeAvatar.value?.width + 20).toString();
		avatarWidth.value = 'padding-left: ' + size + 'px';
	}
}

const isUser = computed(() => {
	if (props.user?.id === userStore.userData.id) return true;
	return false;
});

const isFriend = computed(() => {
	if (props.user) return globalStore.isFriend(props.user?.id);
});

const isPendingFriend = computed(() => {
	if (props.user) return globalStore.isPendingFriend(props.user?.id)
});

function friendRequest() {
	if(props.user?.id)
	{
		if (!globalStore.isFriend(props.user?.id)) {
		UsersService.sendFriendRequest(props.user?.id)
			.then(() => {
				/*UsersService.getPendingFriends().then((response) => {
					pending.value = response.data
					console.log(pending.value)
				}*/
			})
			.catch((error) => {
				router.replace({ name: 'Error', params: { pathMatch: route.path.substring(1).split('/') }, query: { code: error.response?.status }});
			});
		}
	}
}

onMounted(() => {
	window.addEventListener('resize', handleResize);
	windowHeight.value += 1;
	handleResize();
	windowHeight.value -= 1;
});

onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
});
</script>

<template>
	<div
		class="relative grid [grid-template-columns:_2fr_1fr_1fr] auto-cols-min place-content-center h-full text-slate-800 overflow-hidden bg-gradient-to-r from-red-400 to-blue-500 hover:from-green-500 hover:to-lime-200"
	>
		<img
			ref="sizeAvatar"
			class="absolute left-[2%] top-[30%] rounded-full h-[40%] sm:left-0 sm:-top-[15%] sm:h-[150%] aspect-square sm:rounded-none sm:rounded-r-full object-cover"
			:src="user?.avatar"
			alt="Rounded avatar"
		/>
		<div class="flex items-center pr-4" :style="avatarWidth">
			<base-button link :to="{ name: 'Profile', params: { id: user?.id } }">{{ user?.username }}</base-button>
		</div>
		<div class="flex gap-3">
			<div class="flex gap-3" v-if="isUser || isFriend">
				<player-status :userStatus="user?.status"></player-status>
				<span>{{ userStatus }}</span>
			</div>
			<div v-else class="inline-flex items-center justify-center p-[1px]">
				<button v-if="!isPendingFriend">
					<span class="border border-slate-800 text-xs text-slate-800 px-2 py-2.5 transition-all ease-in duration-75 rounded-md group-hover:bg-opacity-0 hover:bg-blue-600 hover:text-white hover:border-white" @click="friendRequest()" >Add friend</span>
				</button>
				<span v-else class="pl-2 text-slate-800">Pending</span>
			</div>
		</div>
		<div class="flex justify-center items-center">{{ user?.rank }}</div>
	</div>
</template>
