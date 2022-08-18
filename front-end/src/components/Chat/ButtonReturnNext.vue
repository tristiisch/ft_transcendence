<script setup lang="ts">
    const props = defineProps<{
    side: string
}>()
</script>


<template>
	<button v-if="side === 'previous'" class="bg-blue-600 text-green-200 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1 sm:p-2 inline-flex h-6 w-6 sm:h-8 sm:w-8">
		<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" ></path></svg>
	</button>
	<button v-else class="bg-blue-600 text-green-200 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1 sm:p-2 inline-flex h-6 w-6 sm:h-8 sm:w-8">
		<svg class="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" ></path></svg>
	</button>
</template>
