<script setup lang="ts">

import { ref, onMounted, onUnmounted, onBeforeMount, onBeforeUnmount, watch } from 'vue';
import Konva from 'konva'
import socket from '@/plugin/socketInstance'
import { useRoute, useRouter } from 'vue-router';
import MatchService from '@/services/MatchService';
import UserService from '@/services/UserService'
import { useUserStore } from '@/stores/userStore';
import status from '@/types/Status';
import { useGlobalStore } from '@/stores/globalStore';
import { useToast } from "vue-toastification"


const route = useRoute()
const router = useRouter()
const toast = useToast()
var match = ref()
var match_id = route.params.uuid as string

const userStore = useUserStore();
const globalStore = useGlobalStore();


const isLoaded = ref(false)
const isMounted = ref(false)
const matchPage = ref(null)

const isPlayer = ref(false)
const matchEnded = ref(false)

const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);

document.documentElement.style.overflow = 'hidden';

onBeforeMount(() => {
	MatchService.loadMatch(match_id)
		.then((response) => {
			match.value = response.data
			if (userStore.userData.id === match.value.user1_id || userStore.userData.id === match.value.user2_id)
				isPlayer.value = true
			socket.emit('updateUserStatus', isPlayer.value ? status.INGAME : status.SPEC )
			isLoaded.value = true
		})
		.catch((e) => {
			router.replace({
				name: 'Error',
				params: { pathMatch: route.path.substring(1).split('/') },
				query: { code: e.response?.status, message: e.response?.data.message }
			});
		})

	window.addEventListener('resize', handleResize);
	if (globalStore.gameInvitation)
	{
		globalStore.gameInvitation = false
		globalStore.invitedUser = undefined
	}
})

watch([isLoaded, isMounted, matchPage], () => {
	if (isLoaded.value && isMounted.value && matchPage.value)
		loadStage()
})

onMounted(() => {
	isMounted.value = true
})

onBeforeUnmount(() => {
	socket.emit('updateUserStatus', status.ONLINE)
})

onUnmounted(() => {
	socket.off("startMatch")
	socket.off("ballPos")
	socket.off("p1Pos")
	socket.off("p2Pos")
	socket.off("newMatchRound")
	socket.off("endMatch")
	if (!matchEnded.value)
		socket.emit("leaveMatch", match_id)
	window.removeEventListener('resize', handleResize);
	window.onresize = null
});

function loadStage() {
	const stage_container = document.getElementById('stage-container')!
	const default_stage_width = 3989
	const default_stage_height = 2976
	const stage_ratio = default_stage_width/default_stage_height
	const ball_size_quotient = 100 // the least, the bigger
	const ball_speed = 12 //if client compensator for ball movements
	const blocker_width_quotient = 50 // the least, the bigger
	const blocker_xpos_quotient = 20 // the more, the closer to the stage

	var stage_height = stage_container.offsetHeight
	var stage_width = stage_height * stage_ratio
	var backend_stage_ratio: number = stage_width / match.value.stageWidth
	var ball_radius = computeBallSize()
	var blockers_width: number = computeBlockerWidth()
	var blockers_height: number = computeBlockerHeight()
	
	function computeBallSize(): number { return stage_width / ball_size_quotient }
	function computeBlockerWidth(): number { return stage_width / blocker_width_quotient }
	function computeBlockerHeight(): number { return match.value.racketSize * backend_stage_ratio }

	var stage = new Konva.Stage({
		container: 'stage-container',
		visible: true,
		height: stage_height,
		width: stage_width
	})

	var layer = new Konva.Layer()
	var ball: Konva.Circle = new Konva.Circle({
		x: stage_width / 2,
		y: stage_height / 2,
		radius: ball_radius,
		fill: match.value.world === 0 ? 'dark' : '#D4F1F8',
		visible: false
	})
	var p1_blocker: Konva.Rect = new Konva.Rect({
		x: stage_width / blocker_xpos_quotient,
		width: blockers_width,
		height: blockers_height,
		fill: 'lightgreen',
		cornerRadius: 2,
		visible: false
	})
	var p2_blocker: Konva.Rect = new Konva.Rect({
		x: stage.width() - stage.width() / blocker_xpos_quotient,
		width: blockers_width,
		height: blockers_height,
		fill: 'lightgreen',
		cornerRadius: 2,
		visible: false
	})

	function moveRacket(event: MouseEvent, racket: Konva.Rect, emit_message: string) {
		var stage_pos = stage_container.getBoundingClientRect()
		var mouse_ypos = event.clientY - stage_pos.y

		if (mouse_ypos < blockers_height / 2)
			racket.y(0)
		else if (mouse_ypos > stage.height() - blockers_height / 2)
			racket.y(stage.height() - blockers_height)
		else
			racket.y(mouse_ypos - blockers_height / 2)
		socket.emit(emit_message, {id: match_id, pos: racket.y() / backend_stage_ratio})
	}

	layer.add(ball)
	layer.add(p1_blocker)
	layer.add(p2_blocker)

	//--------------------------------------------------
	//	Resize whole stage once the window gets resized
	function resizeStage() {
		stage.height(stage_container.offsetHeight)
		stage.width(stage.height() * stage_ratio)
		var ratio = stage.height() / stage_height
		stage_height = stage.height()
		stage_width = stage.width()
		backend_stage_ratio = stage_width / match.value.stageWidth

		ball_radius = computeBallSize()
		ball.radius(ball_radius)

		p1_blocker.x(p1_blocker.x() * ratio)
		p1_blocker.y(p1_blocker.y() * ratio)
		p2_blocker.x(p2_blocker.x() * ratio)
		p2_blocker.y(p2_blocker.y() * ratio)
		blockers_width = computeBlockerWidth()
		blockers_height = computeBlockerHeight()
		p1_blocker.width(blockers_width)
		p1_blocker.height(blockers_height)
		p2_blocker.width(blockers_width)
		p2_blocker.height(blockers_height)
	}
	window.onresize = resizeStage
	// -------------------------------------------------

	stage.add(layer)

// -----------------------------------------------------
// sockets after loading stage
	socket.on("ballPos", (x, y) => ball.position({x: x * backend_stage_ratio, y: y * backend_stage_ratio}))
	if (userStore.userData.id !== match.value.user1_id) socket.on("p1Pos", (y) => p1_blocker.y(y * backend_stage_ratio))
	if (userStore.userData.id !== match.value.user2_id) socket.on("p2Pos", (y) => p2_blocker.y(y * backend_stage_ratio))

	socket.on("startMatch", () => launchCountdown())
	socket.on("newMatchRound", (data) => {
		ball.x(data.ballX)
		ball.y(data.ballY)
		if (data.scored === 'p1') match.value.score[0]++
		else if (data.scored === 'p2') match.value.score[1]++
	})
	socket.on("endMatch", (msg: string) => {
		matchEnded.value = true
		toast.info(msg)
		router.push('/home')
	})

	socket.emit("joinMatch", match_id, (match_infos_array: any) => {
		let match_infos = match_infos_array[0]
		blockers_height = computeBlockerHeight()
		p1_blocker.height(blockers_height)
		p2_blocker.height(blockers_height)

		p1_blocker.y(match_infos.p1Pos * backend_stage_ratio)
		p2_blocker.y(match_infos.p2Pos * backend_stage_ratio)

		p1_blocker.visible(true)
		p2_blocker.visible(true)

		if (match_infos.started) {
			ball.visible(true)
			if (match.value.user1_id == userStore.userData.id)
				stage_container.addEventListener('mousemove', (event) => moveRacket(event, p1_blocker, "p1Pos"), { passive: true });
			else if (match.value.user2_id == userStore.userData.id)
				stage_container.addEventListener('mousemove', (event) => moveRacket(event, p2_blocker, "p2Pos"), { passive: true });
		}
		if (isPlayer)
			socket.emit("readyToPlay", match_id)
	})

	function launchCountdown() {
		match.value.score = [5, 5]
		match.value.started = true
		let interval = setInterval(() => {
			match.value.score[0]--
			match.value.score[1]--
		}, 1000)
		setTimeout(() => {
			clearInterval(interval)
			ball.x(stage_width/2)
			ball.y(stage_height/2)
			ball.visible(true)
			if (match.value.user1_id == userStore.userData.id)
				stage_container.addEventListener('mousemove', (event) => moveRacket(event, p1_blocker, "p1Pos"), { passive: true });
			else if (match.value.user2_id == userStore.userData.id)
				stage_container.addEventListener('mousemove', (event) => moveRacket(event, p2_blocker, "p2Pos"), { passive: true });
		}, 5000)
	}
}

function leaveMatch() {
	router.push('/home')
}

function getShrunkUsername(username: string) {
	if (username.length > 11)
		return username.slice(0, 10) + '.'
	return username
}

function handleResize() {
	windowWidth.value = window.innerWidth;
	windowHeight.value = window.innerHeight;
}

function colorBackground() {
	if (match.value.world === 0)
		return '[background:_radial-gradient(circle,rgba(85,_107,_47,_1)_0%,rgba(32,_32,_32,_1)_75%)]';
	else
		return '[background:radial-gradient(circle,_#458ac3,_#468dc5,_#4890c6,_#4992c8,_#4b95c9,_#569ecd,_#61a6d1,_#6cafd5,_#85c0dd,_#9ed0e5,_#b9e1ee,_#d4f1f8);]'
}

function msgTextSize() {
	return "text-xs"
}

</script>

<template>
	<div v-if="isLoaded" ref="matchPage" class="flex flex-col justify-between w-full h-full bg-[#9f9e89] bg-TvScreen-texture">
		<div class="flex justify-center pt-[1vh] h-[15%] sm:gap-4">
			<div v-if="isLoaded && (windowWidth <= 1500)" class="flex flex-col justify-center items-center h-full w-full">
				<base-button link :to="{ name: 'Profile', params: { id: match.user1_id }}" class="pb-1 text-left z-1 text-white font-VS brightness-100  tracking-[0.3rem] sm:tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
					<h1 class="[font-size:_calc(4px_+_0.01_*_100vw)] lg:[font-size:_calc(0.01_*_100vh)] hover:text-yellow-300">{{ getShrunkUsername(match.user1_username) }}</h1>
				</base-button>
				<img :src="match.user1_avatar" class="aspect-square w-[calc(0.1_*_100vw)] sm:w-[calc(0.1_*_100vh)] border-2 object-cover"/>
			</div>
			<div class="flex items-center justify-center">
				<h1 v-if="isLoaded" class="[font-size:_calc(0.08_*_100vw)] lg:[font-size:_calc(0.1_*_100vh)] text-white font-skyfont brightness-200 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">{{ match.score[0] }}</h1>
				<h1 class="[font-size:_calc(0.08_*_100vw)] lg:[font-size:_calc(0.1_*_100vh)] text-black pl-[calc(0.01_*_100vw)] pr-[calc(0.01_*_100vw)] font-VS brightness-200 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]"><span>/</span>VS<span>\</span></h1>
				<h1 v-if="isLoaded" class="[font-size:_calc(0.08_*_100vw)] lg:[font-size:_calc(0.1_*_100vh)] text-white font-skyfont brightness-200 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">{{ match.score[1] }}</h1>
			</div>
			<div v-if="isLoaded && (windowWidth <= 1500)" class="flex flex-col  justify-center items-center h-full w-full">
				<base-button link :to="{ name: 'Profile', params: { id: match.user2_id }}" class="pb-1 text-right z-1 text-white font-VS brightness-100 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
					<h1 class="[font-size:_calc(4px_+_0.01_*_100vw)] hover:text-yellow-300">{{ getShrunkUsername(match.user2_username) }}</h1>
				</base-button>
				<img :src="match.user2_avatar" class="aspect-square w-[calc(0.1_*_100vw)] sm:w-[calc(0.1_*_100vh)] border-2 object-cover"/>
			</div>
			<base-button @click="leaveMatch()" class="absolute bottom-0 left-1/2 md:bottom-auto md:left-7 z-1 text-white font-BPNeon brightness-200 tracking-[0.3rem] sm:tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
				<h1 class="[font-size:_calc(0.05_*_100vh)] hover:text-yellow-300">&lt;</h1>
			</base-button>
		</div>
		<div class="flex flex-col justify-center items-center w-full pb-[calc(0.04*100vh)] pt-2 h-[75%]">
			<div class="relative [aspect-ratio:_3989/2976] w-full">
				<div v-if="isLoaded && (windowWidth > 1500)" class="absolute left-6 top-0 flex flex-col h-full w-[calc(0.5_*_100vh)] ml-5">
					<base-button link :to="{ name: 'Profile', params: { id: match.user1_id }}" class="text-left z-1 text-white font-VS brightness-100 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
						<h1 class="[font-size:_calc(0.05_*_100vh)] hover:text-yellow-300">{{ getShrunkUsername(match.user1_username) }}</h1>
					</base-button>
					<img :src="match.user1_avatar" class="h-[80%] border-2 object-cover"/>
				</div>
				<div v-if="isLoaded && (windowWidth > 1500)" class="absolute right-6 top-0 flex flex-col h-full w-[calc(0.5_*_100vh)] mr-5">
					<base-button link :to="{ name: 'Profile', params: { id: match.user2_id }}" class="text-right z-1 text-white font-VS brightness-100 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
						<h1 class="[font-size:_calc(0.05_*_100vh)] hover:text-yellow-300">{{ getShrunkUsername(match.user2_username) }}</h1>
					</base-button>
					<img :src="match.user2_avatar" class="h-[80%] border-2 object-cover"/>
				</div>
				<img v-if="match.world === 0" class="absolute m-auto left-0 right-0 bottom-0 top-0 z-10 [aspect-ratio:_3989/2976] h-full object-contain" src="@/assets/TV_screen-world1.png">
				<img v-else class="absolute m-auto left-0 right-0 bottom-0 top-0 z-10 [aspect-ratio:_3989/2976] h-full object-contain" src="@/assets/TV_screen-world2.png">
				<div id="stage-container" class="h-[70%] [aspect-ratio:_3989/2976] absolute m-auto left-0 right-0 bottom-0 top-0 z-30 border" :class="match.world === 0 ? 'border-[#595959]' : 'border-[#D4F1F8]'"></div>
				<div :class="colorBackground()" class="animationFlicker z-20 [aspect-ratio:_3989/2860] absolute m-auto left-0 right-0 top-0 h-[92%] bottom-0 rounded-[calc(0.3*100vh)] bg-[#202020] [filter:_blur(10px)_contrast(0.98)_sepia(0.25)] overflow-hidden [animation:_flicker_0.15s_infinite alternate]">
					<div class="animationRefresh absolute w-[115%] h-[80px] m-auto -left-18 right-0 opacity-10 [background:_linear-gradient(0deg,_#00ff00,_rgba(255,_255,_255,_0.25)_10%,_rgba(0,_0,_0,_0.1)_100%)]"></div>
				</div>
				<div v-if="!match.started" :class="msgTextSize()" class="flex flex-col justify-center items-center absolute z-[999] w-[200px] h-[50px] m-auto left-0 right-0 bottom-0 top-0 font-extralight text-slate-700">
					<img class="m-7 opacity-30" src="@/assets/tail-spin.svg"/>
					<p class="m-15">Waiting for players</p>
				</div>
			</div>
		</div>
		<div class="flex flex-col bg-[#cdb887] w-full h-[10%]">
			<img src="@/assets/tv-bar.png" class="w-full h-[calc(0.02*100vh)]">
			<div class="flex justify-between items-center w-full mt-[0.4%]">
				<img src="@/assets/Tv-button.png" class="rotate-[75deg] aspect-square ml-16 h-[calc(0.06*100vh)]">
				<img src="@/assets/Tv-button.png" class="aspect-square mr-16 h-[calc(0.06*100vh)]">
			</div>
		</div>
	</div>
</template>

<style scoped>

/* v-if="isLoaded"   */
/* id="stage-container" */
/* #stage-container {
	height: 50%;
	/* max-width: 3989px;
	max-height: 2976px;
	aspect-ratio: 3989/2976;
	position: absolute;
	margin-right: auto;
	margin-left: auto;
	margin-top: auto;
	margin-bottom: auto;
	left: 0;
	right: 0;
	bottom: 0;
	top: 0;
	z-index: 999;
	border: 1px solid rgb(89, 89, 89);
	/* background-color:rgba(1,255,1,1);
} */

</style>
