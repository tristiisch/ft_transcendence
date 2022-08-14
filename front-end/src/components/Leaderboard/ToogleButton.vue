<script setup lang="ts">
import type User from '@/types/User';
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';

export interface Props {
	twoFa?: boolean;
}

withDefaults(defineProps<Props>(), {
	twoFa: false,
});

const userStore = useUserStore();

const emit = defineEmits<{
	(e: 'switchButton'): void;
}>();
</script>

<template>
	<label for="default-toggle" class="inline-flex relative items-center cursor-pointer">
		<input v-if="userStore.userData['2fa'] && twoFa" @click="emit('switchButton')" type="checkbox" id="default-toggle" class="sr-only peer" checked />
		<input v-else @click="emit('switchButton')" type="checkbox" id="default-toggle" class="sr-only peer" />
		<div
			class="w-11 h-6 bg-blue-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-lime-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"
		></div>
	</label>
</template>
