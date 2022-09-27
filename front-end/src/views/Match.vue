<script setup lang="ts">

import { ref, onMounted, onBeforeMount, onBeforeUnmount, watch } from 'vue';
import Konva from 'konva'
import socket from '@/plugin/socketInstance'
import { useRoute, useRouter } from 'vue-router';
import MatchService from '@/services/MatchService';
import UserService from '@/services/UserService'
import { useUserStore } from '@/stores/userStore';
import status from '@/types/Status';
import { useGlobalStore } from '@/stores/globalStore';

const route = useRoute()
const router = useRouter()
var match = ref()
var match_id = route.params.id as string

const userStore = useUserStore()
const globalStore = useGlobalStore()

var isLoaded = ref(false)
var isMounted = ref(false)
var isPlayer = ref(false)

MatchService.loadMatch(match_id)
	.then((response) => {
		console.log(response.data)
		match.value = response.data
		if (userStore.userData.id === match.user1_id || userStore.userData.id === match.user2_id)
			isPlayer.value = true
		isLoaded.value = true
	})
	.catch((e) => {
		router.replace({
			name: 'Error',
			params: { pathMatch: route.path.substring(1).split('/') },
			query: { code: e.response?.status, message: e.response?.data.message }
		});
	})

onBeforeUnmount(() => {
	socket.emit('update_status', status.ONLINE)
})

watch([isLoaded, isMounted], () => {
	if (isLoaded.value && isMounted.value)
		loadStage()
})

onBeforeMount(() => {
	isMounted.value = true
	socket.emit('updateUserStatus', isPlayer.value ? status.INGAME : status.SPEC )
	if (globalStore.gameInvitation)
		globalStore.gameInvitation = false
})

function loadStage() {
	const default_stage_width = 3989
	const default_stage_height = 2976
	const stage_height_percentage = 50
	const stage_ratio = default_stage_width/default_stage_height
	const ball_size_quotient = 100 // the least, the bigger
	const ball_xpos_quotient = 2 // 2 being the center | min:1 max:inf
	const ball_ypos_quotient = 2 // same
	const ball_speed = 12

	const blocker_width_quotient = 50 // the least, the bigger
	const blocker_height_quotient = 5 // the least, the longer
	const blocker_xpos_quotient = 10 // the more, the closer to the stage

	function computeStageHeight(): number { return window.innerHeight * (stage_height_percentage / 100) }
	function computeBallSize(): number { return stage.width() / ball_size_quotient }
	function computeBlockerWidth(): number { return stage.width() / blocker_width_quotient }
	function computeBlockerHeight(): number { return stage.height() / blocker_height_quotient }

	var stage_height = computeStageHeight()
	var stage_width = stage_height * stage_ratio
	var stage = new Konva.Stage({
		container: 'stage-container',
		visible: true,
		height: computeStageHeight(),
		width: stage_width
	})
	// stage.getContent().style.backgroundColor = 'rgba(0, 0, 255, 0.2)'

	var backend_stage_width = default_stage_width
	var backend_stage_ratio = stage.width() / backend_stage_width

	var layer = new Konva.Layer()
	var ball_radius = computeBallSize()
	var ball = new Konva.Circle({
		radius: ball_radius,
		fill: 'dark',
	})
	var blockers_width = computeBlockerWidth()
	var blockers_height = computeBlockerHeight()
	var p1_blocker: Konva.Rect = new Konva.Rect({
		width: blockers_width,
		height: blockers_height,
		x: stage.width() / blocker_xpos_quotient,
		y: stage.height() / 2 - blockers_height / 2,
		fill: 'lightgreen',
		cornerRadius: 2,
		visible: false
	})
	var p2_blocker = new Konva.Rect({
		width: blockers_width,
		height: blockers_height,
		x: stage.width() - stage.width() / blocker_xpos_quotient,
		y: stage.height() / 2 - blockers_height / 2,
		fill: 'lightgreen',
		cornerRadius: 2,
		visible: false
	})
	// var line = new Konva.Line({
	// 	x: stage.width() / 2 - 1,
	// 	y: 0,
	// 	width: 2,
	// 	height: stage.height(),
	// 	fill: "white"
	// })

	var stage_container = document.getElementById('stage-container')!
	if (match.value.user1_id == userStore.userData.id) {
		stage_container.addEventListener('mousemove', (event) => {
			var stage_pos = stage_container.getBoundingClientRect()
			var mouse_ypos = event.clientY - stage_pos.y

			if (mouse_ypos < computeBlockerHeight() / 2)
				p1_blocker.y(0)
			else if (mouse_ypos > stage.height() - computeBlockerHeight() / 2)
				p1_blocker.y(stage.height() - computeBlockerHeight())
			else
				p1_blocker.y(mouse_ypos - computeBlockerHeight() / 2)
			socket.emit("p1Pos", {id: match_id, pos: p1_blocker.y() / backend_stage_ratio})
		});
	}
	else if (match.value.user2_id == userStore.userData.id) {
		stage_container.addEventListener('mousemove', (event) => {
			var stage_pos = stage_container.getBoundingClientRect()
			var mouse_ypos = event.clientY - stage_pos.y

			if (mouse_ypos < computeBlockerHeight() / 2)
				p2_blocker.y(0)
			else if (mouse_ypos > stage.height() - computeBlockerHeight() / 2)
				p2_blocker.y(stage.height() - computeBlockerHeight())
			else
				p2_blocker.y(mouse_ypos - computeBlockerHeight() / 2)
			socket.emit("p2Pos", {id: match_id, pos: p2_blocker.y() / backend_stage_ratio})
		});
	}

	layer.add(ball)
	layer.add(p1_blocker)
	layer.add(p2_blocker)
	// layer.add(line)

	//with ballAnimation
	// let dx = 75 * backend_stage_ratio
	// let dy = 5 * backend_stage_ratio

	//with setInterval
	let dx = ball_speed * backend_stage_ratio
	let dy = ball_speed * backend_stage_ratio
	let ball_x = stage_width/2
	let ball_y = -50

	// var ballAnimation = new Konva.Animation(function(frame) {
	// 	if (ball.x() + dx < 0 || ball.x() + dx > stage_width) { dx = -dx; }
	// 	if (ball_y + dy < 0 || ball_y + dy > stage_height) { dy = -dy; }
	// 	if ((ball.x() > p1_blocker.x() && ball.x() < p1_blocker.x() + blockers_width && ball.x() + dx > p1_blocker.x() && ball.x() + dx < p1_blocker.x() + blockers_width && ball_y + dy > p1_blocker.y() && ball_y + dy < p1_blocker.y() + blockers_height) ||
	// 		(ball.x() > p2_blocker.x() && ball.x() < p2_blocker.x() + blockers_width && ball.x() + dx > p2_blocker.x() && ball.x() + dx < p2_blocker.x() + blockers_width && ball_y + dy > p2_blocker.y() && ball_y + dy < p2_blocker.y() + blockers_height))
	// 			dy = -dy
	// 	else if ((ball.x() + dx > p1_blocker.x() && ball.x() + dx < p1_blocker.x() + blockers_width && ball_y + dy > p1_blocker.y() && ball_y + dy < p1_blocker.y() + blockers_height) ||
	// 			(ball.x() + dx > p2_blocker.x() && ball.x() + dx < p2_blocker.x() + blockers_width && ball_y + dy > p2_blocker.y() && ball_y + dy < p2_blocker.y() + blockers_height))
	// 			dx = -dx
	// 	ball.x(ball.x() + dx)
	// 	ball.y(ball.y() + dy)
	// 	// ball.x(ball_x)
	// 	// ball.y(ball_y)
	// }, layer)

	//--------------------------------------------------
	//	Resize whole stage once the window gets resized
	function resizeStage() {
		stage.height(computeStageHeight())
		stage.width(stage.height() * stage_ratio)
		backend_stage_ratio = stage.width() / backend_stage_width

		var ratio = stage.height() / stage_height
		ball_radius = computeBallSize()
		ball.radius(ball_radius)
		dx = dx < 0 ? -(ball_speed * backend_stage_ratio) : ball_speed * backend_stage_ratio
		dy = dy < 0 ? -(ball_speed * backend_stage_ratio) : ball_speed * backend_stage_ratio

		blockers_width = computeBlockerWidth()
		blockers_height = computeBlockerHeight()
		p1_blocker.width(blockers_width)
		p1_blocker.height(blockers_height)
		p1_blocker.x(p1_blocker.x() * ratio)
		p1_blocker.y(p1_blocker.y() * ratio)
		p2_blocker.width(blockers_width)
		p2_blocker.height(blockers_height)
		p2_blocker.x(p2_blocker.x() * ratio)
		p2_blocker.y(p2_blocker.y() * ratio)

		stage_height = stage.height()
		stage_width = stage.width()
	}
	window.onresize = resizeStage
	// -------------------------------------------------

	stage.add(layer)

// -----------------------------------------------------
// sockets after loading stage
	// socket.on("ballPos", (x, y) => ball.position({x: x * backend_stage_ratio, y: y * backend_stage_ratio}))
	socket.on("ballPos", (x, y) => {
		ball_x = x * backend_stage_ratio
		ball_y = y * backend_stage_ratio
	})
	if (userStore.userData.id !== match.value.user1_id) {
		console.log('p1Pos')
		socket.on("p1Pos", (y) => p1_blocker.y(y * backend_stage_ratio))
	}
	if (userStore.userData.id !== match.value.user2_id) {
		console.log('p2Pos')
		socket.on("p2Pos", (y) => p2_blocker.y(y * backend_stage_ratio))
	}

	socket.on("newMatchRound", (data) => {
		console.log(data)
		ball.x(data.ballX)
		ball.y(data.ballY)
		// dx = data.dx
		// dy = data.dy
		if (data.scored === 'p1') match.value.score[0]++
		else if (data.scored === 'p2') match.value.score[1]++
	})
	socket.on("endMatch", () => {
		router.replace('/home')
	})

	socket.emit("joinMatch", match_id, (match_infos: any) => {
		backend_stage_width = match_infos.stageWidth
		backend_stage_ratio = stage.width() / backend_stage_width
		setInterval(() => ball.position({x: ball_x, y: ball_y}), 1)
		if (match_infos.started) {
			// launchMatchLoop()
		}
		else if (isPlayer)
			socket.emit("readyToPlay", match_id)
		p1_blocker.y(match_infos.p1Pos * backend_stage_ratio)
		p2_blocker.y(match_infos.p2Pos * backend_stage_ratio)
		p1_blocker.visible(true)
		p2_blocker.visible(true)
	})

	async function launchMatchLoop() {
		setInterval(() => {
			if (ball_x + dx < 0 || ball_x + dx > stage_width) { dx = -dx; }
			// if (ball_y + dy < 0 || ball_y + dy > stage_height) { dy = -dy; }
			// if ((ball_x > p1_blocker.x() && ball_x < p1_blocker.x() + blockers_width && ball_x + dx > p1_blocker.x() && ball_x + dx < p1_blocker.x() + blockers_width && ball_y + dy > p1_blocker.y() && ball_y + dy < p1_blocker.y() + blockers_height) ||
			// 	(ball_x > p2_blocker.x() && ball_x < p2_blocker.x() + blockers_width && ball_x + dx > p2_blocker.x() && ball_x + dx < p2_blocker.x() + blockers_width && ball_y + dy > p2_blocker.y() && ball_y + dy < p2_blocker.y() + blockers_height))
			// 		dy = -dy
			// else if ((ball_x + dx > p1_blocker.x() && ball_x + dx < p1_blocker.x() + blockers_width && ball_y + dy > p1_blocker.y() && ball_y + dy < p1_blocker.y() + blockers_height) ||
			// 		(ball_x + dx > p2_blocker.x() && ball_x + dx < p2_blocker.x() + blockers_width && ball_y + dy > p2_blocker.y() && ball_y + dy < p2_blocker.y() + blockers_height))
			// 		dx = -dx
			ball_x += dx
			// ball_y += dy
		}, 1)
		// if (ball_x + dx < 0 || ball_x + dx > stage_width) { dx = -dx; }
		// if (ball_y + dy < 0 || ball_y + dy > stage_height) { dy = -dy; }
		// if ((ball_x > p1_blocker.x() && ball_x < p1_blocker.x() + blockers_width && ball_x + dx > p1_blocker.x() && ball_x + dx < p1_blocker.x() + blockers_width && ball_y + dy > p1_blocker.y() && ball_y + dy < p1_blocker.y() + blockers_height) ||
		// 	(ball_x > p2_blocker.x() && ball_x < p2_blocker.x() + blockers_width && ball_x + dx > p2_blocker.x() && ball_x + dx < p2_blocker.x() + blockers_width && ball_y + dy > p2_blocker.y() && ball_y + dy < p2_blocker.y() + blockers_height))
		// 		dy = -dy
		// else if ((ball_x + dx > p1_blocker.x() && ball_x + dx < p1_blocker.x() + blockers_width && ball_y + dy > p1_blocker.y() && ball_y + dy < p1_blocker.y() + blockers_height) ||
		// 		(ball_x + dx > p2_blocker.x() && ball_x + dx < p2_blocker.x() + blockers_width && ball_y + dy > p2_blocker.y() && ball_y + dy < p2_blocker.y() + blockers_height))
		// 		dx = -dx
		// ball_x += dx
		// ball_y += dy
		// setTimeout(launchMatchLoop, 0)
	}

// -----------------------------------------------------
}

function leaveMatch() {
	if (isPlayer)
		socket.emit("leaveMatch", match_id)
	router.replace('')
}

function getShrunkUsername(username: string)
{
	if (username.length > 11)
		return username.slice(0, 10) + '.'
	return username
}

onBeforeUnmount(() => {
	//socket.off(...)
	socket.emit('updateUserStatus', status.ONLINE)
});

</script>

<template>
	<div class="flex justify-center h-full w-full bg-[#9f9e89] bg-TvScreen-texture">
		<div class="flex items-center justify-center w-full absolute m-auto left-0 right-0 top-p1.5 h-p10">
			<h1 v-if="isLoaded" class="[font-size:_calc(0.15_*_100vh)] text-white font-skyfont brightness-200 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">{{ match.score[0] }}</h1>
			<h1 class="[font-size:_calc(0.15_*_100vh)] text-black pl-[calc(0.01_*_100vw)] pr-[calc(0.01_*_100vw)] font-VS brightness-200 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]"> / VS \</h1>
			<h1 v-if="isLoaded" class="[font-size:_calc(0.15_*_100vh)] text-white font-skyfont brightness-200 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">{{ match.score[1] }}</h1>
		</div>
		
		<base-button @click="leaveMatch()" class="absolute left-7 z-1 text-white font-BPNeon brightness-200 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
			<h1 class="[font-size:_calc(0.05_*_100vh)] hover:text-yellow-300">&lt;</h1>
		</base-button>
		<div v-if="isLoaded" class="flex flex-col h-full w-[calc(0.5_*_100vh)] ml-5">
			<base-button link :to="{ name: 'Profile', params: { id: match.user1_id }}" class="mt-20vh text-left z-1 text-white font-VS brightness-100 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
				<h1 class="[font-size:_calc(0.05_*_100vh)] hover:text-yellow-300">{{ getShrunkUsername(match.user1_username) }}</h1>
			</base-button>
			<img :src="match.user1_avatar" class="h-1/2 border-2 object-cover"/>
		</div>
		<div class="w-[calc(0.8_*_100vh)]"></div>
		<div v-if="isLoaded" class="flex flex-col h-full w-[calc(0.5_*_100vh)] mr-5">
			<base-button link :to="{ name: 'Profile', params: { id: match.user2_id }}" class="mt-20vh text-right z-1 text-white font-VS brightness-100 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]">
				<h1 class="[font-size:_calc(0.05_*_100vh)] hover:text-yellow-300">{{ getShrunkUsername(match.user2_username) }}</h1>
			</base-button>
			<img :src="match.user2_avatar" class="h-1/2 border-2 object-cover"/>
		</div>
		<div class="w-[100vh] absolute m-auto left-0 right-0 top-0 bottom-0 h-3/4 bg-stone-800"></div>
		<div class="rounded-3xl w-[100vh] animationFlicker absolute m-auto left-0 right-0 top-0 bottom-0 h-3/4 bg-[#202020] [background:_radial-gradient(circle,rgba(85,_107,_47,_1)_0%,rgba(32,_32,_32,_1)_75%)] [filter:_blur(10px)_contrast(0.98)_sepia(0.25)] overflow-hidden [animation:_flicker_0.15s_infinite alternate]">
			<div class="animationRefresh absolute w-full h-[80px] bottom-full opacity-10 [background:_linear-gradient(0deg,_#00ff00,_rgba(255,_255,_255,_0.25)_10%,_rgba(0,_0,_0,_0.1)_100%)]"></div>
		</div>
		<div class="bg-contain bg-TvScreen-transparent bg-no-repeat bg-center w-[100vh] absolute m-auto top-0 bottom-0 left-0 right-0 h-3/4"></div>
		<div id="stage-container"></div>
<!--	<div class="absolute bottom-0 flex flex-col bg-[#cdb887] w-full">
			<img src="@/assets/tv-bar.png" class="w-full sm:max-h-[20px]">
			<img src="@/assets/tv-button.png" class="self-end h-[5vw] w-[5vw]">
		</div> -->
	</div>
		<!-- <div id="stage-container" class="bg-contain bg-TvScreen-transparent bg-no-repeat bg-center"></div> -->
	<!-- <div class="relative flex flex-col h-full w-full justify-center bg-[#9f9e89] bg-TvScreen-texture">
		<div class="h-full w-full bg-contain bg-TvScreen bg-no-repeat bg-center z-10 xl:my-6 flex">
		</div>
		<div class="flex flex-col bg-[#cdb887] w-full">
			<img src="@/assets/tv-bar.png" class="w-full sm:max-h-[40px]">
			<img src="@/assets/tv-button.png" class="self-end h-[5vw] w-[5vw]">
		</div>
    </div> -->
</template>

<style scoped>

#stage-container {
	height: 50%;
	/* max-width: 3989px;
	max-height: 2976px; */
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
	border: 1px solid rgb(69, 69, 69);
	/* background-color:rgba(1,255,1,1); */
}

@keyframes refresh {
	0% {
		bottom: 100%;
	}
	60% {
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
/* 
.animationFlicker {
	animation: flicker 0.15s infinite alternate;
}

.animationRefresh {
	animation: refresh 5s linear infinite;
} */


</style>
