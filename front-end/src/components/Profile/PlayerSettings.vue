<script setup lang="ts">
import { ref, onBeforeMount, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import QrCode from '@/components/Profile/QrCode.vue';
import EditProfile from '@/components/Profile/EditProfile.vue';

const userStore = useUserStore();
const toast = useToast();
const mode = ref('2FA');

</script>

<template>
	<div class="flex flex-col items-center h-full w-full px-6 sm:px-8">
		<div class="inline-flex shadow-sm w-full">
			<button @click="mode = '2FA'" class="w-1/3 py-1.5 sm:py-2.5 text-xs sm:text-sm border-blue-600 focus:bg-blue-600 focus:text-neutral-100 rounded-l-md border" :class="mode === '2FA' ? 'bg-blue-600 text-neutral-100' : 'bg-neutral-100 text-blue-600'">2FA</button>
			<button @click="mode = 'Edit'" class="w-1/3 py-1.5 sm:py-2.5 text-xs sm:text-sm border-blue-600 focus:bg-blue-600 focus:text-neutral-100 border-t border-b" :class="mode === 'Edit' ? 'bg-blue-600 text-neutral-100' : 'bg-neutral-100 text-blue-600'">Edit</button>
			<button @click="mode = 'Remove'" class="w-1/3 py-1.5 sm:py-2.5 text-xs sm:text-sm border-blue-600 focus:bg-blue-600 focus:text-neutral-100 rounded-r-md border" :class="mode === 'Remove' ? 'bg-blue-600 text-neutral-100' : 'bg-neutral-100 text-blue-600'">Account</button>
		</div>
		<div v-if="mode === '2FA'" class="h-full w-full" >
			<QrCode></QrCode>
		</div>
		<div v-else-if="mode === 'Edit'" class="h-full w-full">
			<edit-profile></edit-profile>
		</div>
		<div v-else-if="mode === 'Remove'" class="flex flex-col items-center justify-center gap-8 h-full w-full">
			<p class="text-center text-red-200 text-xs sm:text-sm">You can delete your account below. Profile deletion is irreversible and you will lost all your data.</p>
			<base-button class="text-sm py-1 sm:py-2 px-3 rounded-lg bg-neutral-100 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-neutral-100">Delete</base-button>
		</div>
	</div>
</template>

