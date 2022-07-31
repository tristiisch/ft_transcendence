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
		return ['Leaderboard', 'Home', 'Lobby'];
	} else if (route.name === 'Leaderboard' || route.name === 'Profile') {
		return ['Chat', 'Home', 'Lobby'];
	} else if (route.name === 'Lobby') {
		return ['Chat', 'Home', 'Leaderboard'];
	}
	else {
		return ['Chat', 'Leaderboard', 'Lobby'];
    }
});

/*watch(() => route.name,() => {
	 console.log(route.name)
	 changeTitle()
	  });*/
</script>

<template>
	<nav class="flex flex-col justify-center h-1/5 min-h-[140px] font-Noir">
		<ul class="flex flex-col items-center gap-2 sm:grid sm:grid-flow-col sm:auto-cols-fr sm:justify-items-center">
			<li class="sm:pr-20">
				<base-button
					link
					:to="{ name: button[0] }"
					class="text-lg sm:text-2xl text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914] hover:text-white hover:brightness-200"
				>
					{{ button[0] }}
				</base-button>
			</li>
			<li>
				<base-button
					link
					:to="{ name: button[1] }"
					class="text-lg sm:text-2xl text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914] hover:text-white hover:brightness-200"
				>
					{{ button[1] }}
				</base-button>
			</li>
			<li class="sm:pl-20">
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
