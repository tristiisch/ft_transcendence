<script setup lang="ts">
    import CardTitle from './CardTitle.vue'
    const props = defineProps<{
    title: string
}>()
</script>

<template>
    <div class="flex w-full h-full bg-red-500 pb-4 overflow-y-auto sm:w-3/5 py-5 sm:py-10 3xl:py-20">
        <slot></slot>
        <div class="flex justify-end items-center w-1/12">
            <card-title>{{ title }}</card-title>
        </div>
    </div>
</template>