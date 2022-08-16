<script setup lang="ts">

const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'validate'): void
}>()

</script>

<template>
	<div class="self-end flex gap-3 mr-6">
		<button @click="emit('close')" class="bg-red-600 text-red-200 border border-red-700 hover:text-white rounded-lg mt-4 focus:ring-2 focus:ring-gray-300 p-1 sm:p-2 inline-flex h-6 w-6 sm:h-8 sm:w-8">
			<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
		</button>
		<button @click="emit('validate')" class="bg-green-600 text-green-200  hover:text-white rounded-lg mt-4 focus:ring-2 focus:ring-gray-300 p-1 sm:p-2 inline-flex h-6 w-6 sm:h-8 sm:w-8">
			<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
		</button>
	</div>
</template>