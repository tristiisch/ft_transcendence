<script setup lang="ts">
    import CardTitle from './CardTitle.vue'
    const props = defineProps<{
    title: string
}>()
</script>

<template>
    <div class="flex w-full sm:w-3/5 min-h-[252px] sm:max-h-full bg-red-500 ">
        <div class="flex flex-col justify-evenly items-center w-11/12 h-full">
            <slot></slot>
        </div>
        <div class="flex justify-end items-center w-1/12">
            <card-title>{{ title }}</card-title>
        </div>
    </div>
</template>