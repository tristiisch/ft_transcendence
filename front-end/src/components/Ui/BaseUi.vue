<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore';

export interface Props {
	isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
	isLoading: false,
});

</script>

<template>
	<base-spinner v-if="isLoading"></base-spinner>
    <div v-else class="relative flex flex-col justify-between h-full font-Noir mx-[4vw] gap-4">
        <the-header></the-header>
        <div class="w-full max-w-[950px] self-center h-3/4 min-h-[500px] sm:h-[600px] [box-shadow:_0_0_20px_rgba(0,_0,_0,_0.8)]">
            <slot></slot>
        </div>
        <the-footer></the-footer>
    </div>
</template>
