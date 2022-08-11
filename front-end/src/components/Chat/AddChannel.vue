<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import UploadAvatar from '@/components/UploadAvatar.vue';

const success = ref(false)
const userStore = useUserStore();
const usersToggle = ref(false);

function showUsers() {
            usersToggle.value = !usersToggle.value;
        };

const image = ref(userStore.userData.avatar);
let isUpload = false;

function uploadImage(imageData: string): void {
	image.value = imageData;
	isUpload = true;
}
</script>


<template>
	<div class="flex flex-col items-center w-full mb-6 sm:flex-row sm:gap-8 sm:items-end">
		<div class="mb-2 sm:mb-0 sm:w-1/2">
			<label class="block mb-2 text-sm font-medium text-red-200">Channel name:</label>
			<input type="text" class="bg-red-100 border border-red-500 placeholder:text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-red-600 block w-full p-2" placeholder="choose name">
		</div>
		<div class="inline-flex shadow-sm sm:w-1/2">
			<a href="#" aria-current="page" class="py-2 px-4 text-sm font-medium text-gray-800 bg-red-100 rounded-l-lg border border-red-200 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
				Public
			</a>
			<a href="#" class="py-2 px-4 text-sm font-medium text-gray-800 bg-red-100 border-t border-b border-red-200 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
				Private
			</a>
			<a href="#" class="py-2 px-4 text-sm font-medium text-gray-800 bg-red-100 rounded-r-md border border-red-200 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white">
				Protected
			</a>
		</div>
	</div>
	<!-- <div v-if="success" class="mb-6">
		<label class="block mb-2 text-sm font-medium text-green-700 dark:text-green-500">Channel name:</label>
		<input type="text" id="success" class="bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500" placeholder="Success input">
		<p class="mt-2 text-sm text-green-600 dark:text-green-500"><span class="font-medium">Well done!</span> Some success messsage.</p>
	</div>
	<div v-else>
		<label for="error" class="block mb-2 text-sm font-medium text-red-700 dark:text-red-500">Channel name:</label>
		<input type="text" id="error" class="bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500" placeholder="Error input">
		<p class="mt-2 text-sm text-red-600 dark:text-red-500"><span class="font-medium">Oh, snapp!</span> Some error message.</p>
	</div> -->
	<div class="flex w-full mb-6">
		<div class="flex items-end mr-4 h-full">
			<img class="w-12 h-12 rounded object-cover border-[1px] border-zinc-300" src="@/assets/obama.jpeg" alt="Rounded avatar">
		</div>
		<div class="flex flex-col">
			<label class="block mb-2 text-sm font-medium text-red-200">Choose image:</label>
			<upload-avatar @image-loaded="uploadImage"></upload-avatar>
		</div>
	</div>
	<form class="flex w-full pt-5 pb-2 border-t-[1px] border-red-400">
		<div class="self-start relative">
			<button @click="showUsers" class="relative flex-shrink-0 inline-flex items-center rounded-l-lg py-2 px-3 text-sm font-medium text-center text-white bg-blue-600" type="button">Filter<svg aria-hidden="true" class="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
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
			<input type="search" class="block p-2 w-full text-sm placeholder:text-gray-400 bg-red-100 border-l-red-100 rounded-r-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Search Player" required>
			
		</div>
	</form>
	<div class="overflow-y-auto h-full w-full">
			<div class="flex justify-between items-center border-b-[1px] w-full border-red-400">
				<div class="inline-flex items-center py-4">
					<img class="shrink-0 w-12 h-12 rounded-full object-cover border-t-[1px] border-zinc-300" src='@/assets/obama.jpeg' alt="Rounded avatar">
					<p class="px-4 text-sm">Obama</p>
				</div>
				<svg class="h-10 w-10 mr-6 w-full">
					<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
				</svg>
			</div>
			<div class="flex justify-between items-center border-b-[1px] w-full border-red-400">
				<div class="inline-flex items-center py-4">
					<img class="shrink-0 w-12 h-12 rounded-full object-cover border-t-[1px] border-zinc-300" src='@/assets/obama.jpeg' alt="Rounded avatar">
					<p class="px-4 text-sm">Obama</p>
				</div>
				<svg class="h-10 w-10 mr-6 w-full">
					<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
				</svg>
			</div>
			<div class="flex justify-between items-center border-b-[1px] w-full border-red-400">
				<div class="inline-flex items-center py-4">
					<img class="shrink-0 w-12 h-12 rounded-full object-cover border-t-[1px] border-zinc-300" src='@/assets/obama.jpeg' alt="Rounded avatar">
					<p class="px-4 text-sm">Obama</p>
				</div>
				<svg class="h-10 w-10 mr-6 w-full">
					<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
				</svg>
			</div>
			<div class="flex justify-between items-center border-b-[1px] w-full border-red-400">
				<div class="inline-flex items-center py-4">
					<img class="shrink-0 w-12 h-12 rounded-full object-cover border-t-[1px] border-zinc-300" src='@/assets/obama.jpeg' alt="Rounded avatar">
					<p class="px-4 text-sm">Obama</p>
				</div>
				<svg class="h-10 w-10 mr-6 w-full">
					<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
				</svg>
			</div>
			<div class="flex justify-between items-center border-b-[1px] w-full border-red-400">
				<div class="inline-flex items-center py-4">
					<img class="shrink-0 w-12 h-12 rounded-full object-cover border-t-[1px] border-zinc-300" src='@/assets/obama.jpeg' alt="Rounded avatar">
					<p class="px-4 text-sm">Obama</p>
				</div>
				<svg class="h-10 w-10 mr-6 w-full">
					<circle cx="20" cy="20" r="8"  fill="none" stroke="#f87171" stroke-width="1" />
				</svg>
			</div>
			
			
			
			
		</div>
</template>

<!-- <button type="submit" class="absolute top-0 right-0 p-2.5 text-sm font-medium text-white bg-blue-700  border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
				<svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
				<span class="sr-only">Search</span>
			</button> -->