<script setup lang="ts">
import ButtonGradient from '@/components/Divers/ButtonGradient.vue';
</script>

<template>
	<div class="flex flex-col items-center justify-center text-center pb-32 h-full w-full">
		<h1 class="font-Arlon text-white text-5xl sm:text-6xl m-4">Page not Found</h1>
		<button-gradient link :to="{ name: 'Home' }">Home</button-gradient>
	</div>
	<div class="h-full w-full fixed bg-brick bg-fixed bg-bottom bg-cover top-0 left-0 -z-10 [transform:_scale(1.2)]"></div>
</template>
