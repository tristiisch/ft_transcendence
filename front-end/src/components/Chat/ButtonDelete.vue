<script setup lang="ts">

const emit = defineEmits<{
    (e: 'delete'): void,
	(e: 'close'): void,
}>()
</script>

<template>
    <button @click="emit('delete')" class="absolute top-[6px] left-[54px] z-10 h-[48px] w-[calc(100%_-_54px)] bg-blue-600 text-white text-sm">
        <div class="flex justify-center items-center h-full ">
            <label class="w-full">Delete</label>
            <div class="self-start w-[10%] pr-4 pt-1">
                <button @click="emit('close')" class="inline-flex justify-center items-center bg-blue-700 rounded-sm h-4 w-4">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </button>
            </div>
        </div>
    </button>
</template>