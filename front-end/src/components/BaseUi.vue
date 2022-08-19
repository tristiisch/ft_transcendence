<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore';

export interface Props {
	isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
	isLoading: false,
});

const userStore = useUserStore();

const userDataLoading = computed(() => {
	if (userStore.userData.avatar !== undefined && userStore.userData.username !== undefined)
		return false;
	return true;
});

</script>

<template>
	<base-spinner v-if="userDataLoading || isLoading"></base-spinner>
    <div v-else class="relative flex flex-col justify-between h-full font-Noir mx-[8vw] gap-4">
        <the-header></the-header>
        <div class="w-full min-w-full lg:min-w-0 lg:w-[80%] xl:w-[70%] 2xl:w-[65%] 3xl:w-[50%] self-center h-3/5 sm:h-1/2 min-h-[500px] [box-shadow:_0_0_20px_rgba(0,_0,_0,_0.8)]">
            <slot></slot>
        </div>
        <the-footer></the-footer>
    </div>
    <div class="h-full w-full fixed bg-brick bg-fixed bg-bottom bg-cover top-0 left-0 -z-10 [transform:_scale(1.2)]"></div>
</template>
