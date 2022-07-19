<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const userStore = useUserStore();
defineProps<{
	isProfilePage?: boolean;
	isHomePage?: boolean;
}>();

const route = useRoute();

const button = computed<string[]>(() => {
	if (route.name === 'Chat') {
		return ['Home', 'Leaderboard', 'Lobby'];
	} else if (route.name === 'Leaderboard') {
		return ['Chat', 'Home', 'Lobby'];
	} else if (route.name === 'Lobby') {
		return ['Chat', 'Leaderboard', 'Home'];
	} else {
		return ['Chat', 'Leaderboard', 'Lobby'];
	}
});

/*watch(() => route.name,() => {
	 console.log(route.name)
	 changeTitle()
	  });*/
</script>

<template>
	<nav class="flex flex-col justify-end sm:justify-center font-Noir">
		<ul class="flex flex-col items-center sm:flex-row sm:justify-around">
			<li class="p-1">
				<base-button
					link
					:to="{ name: button[0] }"
					class="text-lg sm:text-2xl text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914] hover:text-white hover:brightness-200"
				>
					{{ button[0] }}
				</base-button>
			</li>
			<li class="p-1">
				<base-button
					link
					:to="{ name: button[1] }"
					class="text-lg sm:text-2xl text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914] hover:text-white hover:brightness-200"
				>
					{{ button[1] }}
				</base-button>
			</li>
			<li class="p-1">
				<base-button
					link
					:to="{ name: button[2] }"
					class="text-lg sm:text-2xl text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914] hover:text-white hover:brightness-200"
				>
					{{ button[2] }}
				</base-button>
			</li>
		</ul>
	</nav>
</template>
