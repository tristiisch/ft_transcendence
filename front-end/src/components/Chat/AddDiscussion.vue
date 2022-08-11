<script setup lang="ts">
import type { Vue } from 'pinia/node_modules/vue-demi';
import { ref } from 'vue'
const usersToggle = ref(false);

function showUsers() {
            usersToggle.value = !usersToggle.value;
        };
</script>


<template>
	<form class="flex w-full pb-10">
		<div class="self-start relative">
			<button @click="showUsers" class="relative flex-shrink-0 inline-flex items-center rounded-l-lg py-2 px-3 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100" type="button">Filter<svg aria-hidden="true" class="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
			<div v-show="usersToggle" class="absolute z-10 w-44 bg-white rounded shadow">
				<ul  class="py-1 text-sm text-gray-700">
					<li>
						<button type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Friends</button>
					</li>
					<li>
						<button type="button" class="inline-flex py-2 px-4 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">All</button>
					</li>
				</ul>
			</div>
		</div>
		<div class="relative w-full">
			<input type="search" class="block p-2 w-full text-sm text-gray-900 bg-gray-50 border-l-gray-50  border-l-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-l-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" placeholder="Search Player" required>
			<button type="submit" class="absolute top-0 right-0 p-2 text-sm font-medium text-white bg-blue-700  border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
				<svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
				<span class="sr-only">Search</span>
			</button>
		</div>
	</form>
	<
		
</template>

			