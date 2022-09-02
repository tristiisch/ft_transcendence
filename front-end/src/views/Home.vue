<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useUserStore } from '@/stores/userStore';

const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);
const imageLoaded = ref(false);
const userStore = useUserStore();

function tvSize() {
	if (windowHeight.value > windowWidth.value)
		return 'w-[calc(0.6_*_100vw)]'
	return 'h-[calc(0.5_*_100vh)]'
}

function titleSize()
{
	if (windowHeight.value > windowWidth.value)
		return '[font-size:_calc(0.1_*_100vw)] top-[calc(0.15_*_100vh)]'
	return '[font-size:_calc(0.08_*_100vh)] top-[calc(0.15_*_100vh)]'
}

function screenTitleSize()
{
	if (windowHeight.value > windowWidth.value)
		return '[font-size:_calc(0.09_*_100vw)] pb-[calc(0.1_*_100vw)]'
	return '[font-size:_calc(0.08_*_100vh)] pb-[calc(0.1_*_100vh)]'
}

function screenSize()
{
	if (windowHeight.value > windowWidth.value)
		return 'w-[calc(0.5_*_100vw)]'
	return 'w-[calc(0.5_*_100vh)]'
}

function smallScreen() {
	if( windowWidth.value < 640)
		return true
	else
		return false
}

function handleResize() {
windowWidth.value = window.innerWidth;
windowHeight.value = window.innerHeight;
}

const isLoading = computed(() => {
	if (userStore.userData.avatar && userStore.userData.username)
		return false;
	return true;
});

function onImageLoad () {
      imageLoaded.value = true
    }

onMounted(() => {
    window.addEventListener('resize', handleResize)
  });

onUnmounted(() => {
window.removeEventListener('resize', handleResize)
})

</script>

<template>
	<base-spinner v-if="isLoading"></base-spinner>
	<div v-else class="relative flex flex-col h-full mx-[8vw]">
		<the-header :isHomePage="true"></the-header>
		<div class="flex justify-center h-full pt-[115px] min-h-[130px]">
			<the-footer v-if="smallScreen()" class=""></the-footer>
		</div>
		<div :class="titleSize()" class="absolute m-auto left-0 right-0 top-[calc(0.15_*_100vh)] text-center font-Vibur neon-text">
            <span class="px-[2vw]">W</span>
            <span class="px-[2vw]">E</span>
            <span class="px-[2vw]">L</span>
            <span class="px-[2vw]">C</span>
            <span class="px-[2vw]">O</span>
            <span class="px-[2vw]">M</span>
            <span class="px-[2vw]">E</span>
        </div>
		<div class="absolute m-auto left-0 right-0 bottom-[calc(0.15_*_100vh)]">
			<img src="../assets/TV.png" :class="tvSize()" @load="onImageLoad" class="relative m-auto left-0 right-0 z-10"/>
			<div v-if="imageLoaded">
				<base-button link :to="{ name: 'Match', params: { id: 'devtmp' }}" class="absolute top-0 h-full w-full text-center z-10 text-white font-BPNeon brightness-200 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
					<div class="flex justify-center items-center h-full">
						<h1 :class="screenTitleSize()" class="hover:text-yellow-300">PLAY</h1>
					</div>
				</base-button>
				<div :class="screenSize()" class="absolute m-auto left-0 right-0 top-3 h-3/4 bg-stone-800"></div>
				<div :class="screenSize()" class="animationFlicker absolute m-auto left-0 right-0 top-3 h-3/4 bg-[#202020] [background:_radial-gradient(circle,rgba(85,_107,_47,_1)_0%,rgba(32,_32,_32,_1)_75%)] [filter:_blur(10px)_contrast(0.98)_sepia(0.25)] overflow-hidden [animation:_flicker_0.15s_infinite alternate]">
					<div class="animationRefresh absolute w-full h-[80px] bottom-full opacity-10 [background:_linear-gradient(0deg,_#00ff00,_rgba(255,_255,_255,_0.25)_10%,_rgba(0,_0,_0,_0.1)_100%)]"></div>
				</div>
				<div :class="screenSize()" class="absolute opacity-10 m-auto left-0 right-0 top-3 h-3/4 bg-TvScreenPixel"></div>
			</div>
		</div>
		<the-footer v-if="!smallScreen()" class="absolute m-auto left-0 right-0 min-h-0 bottom-0 text-xs"></the-footer>
	</div>
	<div class="h-full w-full fixed bg-brick bg-bottom bg-cover top-0 left-0 -z-20 [transform:_scale(1.2)]"></div>
</template>

<style scoped>

@keyframes refresh {
	0% {
		bottom: 100%;
	}
	80% {
		bottom: 100%;
	}
	100% {
		bottom: 0%;
	}
}

@keyframes flicker {
	0% {
		opacity: 0.98;
	}
	1% {
		opacity: 0.95;
	}
}

.animationFlicker {
	animation: flicker 0.15s infinite alternate;
}

.animationRefresh {
	animation: refresh 8s linear infinite;
}

.neon-text {
  color: #fff;
  text-shadow:
	0 0 7px #fff,
	0 0 10px #fff,
	0 0 21px #fff,
	0 0 42px #5271ff,
	0 0 82px #5271ff,
	0 0 92px #5271ff,
	0 0 102px #5271ff,
	0 0 151px #5271ff;
}
</style>
