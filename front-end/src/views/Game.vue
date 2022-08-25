<script setup lang="ts">

import { ref, onMounted } from 'vue';
import Konva from 'konva'
import socket from '@/plugin/socketInstance'

const stage_ratio = 3989/2976
const ball_speed_quotient = 200 // the least, the faster
const ball_size_quotient = 100 // the least, the bigger
const ball_xpos_quotient = 2 // 2 being the center | min:1 max:inf
const ball_ypos_quotient = 2 // same

const blocker_width_quotient = 50 // the least, the bigger
const blocker_height_quotient = 5 // the least, the longer
const blocker_movements_delta = 20 // the least, the slower (needs some kind of better way tho imo)
const blocker_xpos_quotient = 10 // the more, the closer to the stage

onMounted(() => {
	function computeStageHeight(): number { return window.innerHeight * (75 / 100) }
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

	var layer = new Konva.Layer()

	var ball_radius = computeBallSize()
	var ball = new Konva.Circle({
		x: stage.width() / ball_xpos_quotient,
		y: stage.height() / ball_ypos_quotient,
		radius: ball_radius,
		fill: 'gray'
	})

	var fullstage_ratio = stage.width() / 3989
	var blockers_width = computeBlockerWidth()
	var blockers_height = computeBlockerHeight()
	var p1_blocker: Konva.Rect = new Konva.Rect({
		width: blockers_width,
		height: blockers_height,
		x: stage.width() / blocker_xpos_quotient,
		y: stage.height() / 2 - blockers_height / 2,
		fill: 'red',
		draggable: true,
		dragBoundFunc: function (pos) {
			socket.emit("p1_dy", pos.y / fullstage_ratio)
			return {
				x: this.absolutePosition().x,
				y: pos.y
			};
		}
	})
	var p2_blocker = new Konva.Rect({
		width: blockers_width,
		height: blockers_height,
		x: stage.width() - stage.width() / blocker_xpos_quotient,
		y: stage.height() / 2 - blockers_height / 2,
		fill: 'red'
	})
	// document.addEventListener("keydown", function(e) {
	// 	// console.log(e.key)
	// 	if (e.key == 'ArrowDown') {
	// 		if (p1_blocker.y() + p1_blocker.height() + blocker_movements_delta * fullstage_ratio <= stage.height() - stage.height() / 11.5)
	// 		{
	// 			socket.emit("p1_dy", blocker_movements_delta)
	// 			p1_blocker.y(p1_blocker.y() + blocker_movements_delta * fullstage_ratio)
	// 		}
	// 	}
	// 	else if (e.key == 'ArrowUp') {
	// 		if (p1_blocker.y() - blocker_movements_delta * fullstage_ratio >= stage.height() / 11.5)
	// 		{
	// 			socket.emit("p1_dy", -blocker_movements_delta)
	// 			p1_blocker.y(p1_blocker.y() - blocker_movements_delta * fullstage_ratio)
	// 		}
	// 	}
	// })

	layer.add(ball)
	layer.add(p1_blocker)
	layer.add(p2_blocker)

	//--------------------------------------------------
	//	Resize whole stage once the window gets resized
	function resizeStage() {
		stage.height(computeStageHeight())
		stage.width(stage.height() * stage_ratio)
		fullstage_ratio = stage.width() / 3989

		var ratio = stage.height() / stage_height
		ball_radius = computeBallSize()
		ball.radius(ball_radius)

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
	socket.on("ball", (x, y) => {
		// console.log('[SOCKET.IO]', 'CLIENT', 'ball', x, y);
		ball.x(x * fullstage_ratio)
		ball.y(y * fullstage_ratio)
	});
	socket.emit("start_match");
})

const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);

function screenSize()
{
	if (windowHeight.value > windowWidth.value)
		return 'w-[calc(1_*_100vw)]'
	return 'w-[calc(1_*_100vh)]'
}

</script>

<template>
	<div class="h-full w-full bg-[#9f9e89] bg-TvScreen-texture">
		<div :class="screenSize()" class="absolute m-auto left-0 right-0 top-0 bottom-0 h-3/4 bg-stone-800"></div>
		<div :class="screenSize()" class="animationFlicker absolute m-auto left-0 right-0 top-0 bottom-0 h-3/4 bg-[#202020] [background:_radial-gradient(circle,rgba(85,_107,_47,_1)_0%,rgba(32,_32,_32,_1)_75%)] [filter:_blur(10px)_contrast(0.98)_sepia(0.25)] overflow-hidden [animation:_flicker_0.15s_infinite alternate]">
			<div class="animationRefresh absolute w-full h-[80px] bottom-full opacity-10 [background:_linear-gradient(0deg,_#00ff00,_rgba(255,_255,_255,_0.25)_10%,_rgba(0,_0,_0,_0.1)_100%)]"></div>
		</div>
		<div :class="screenSize()" class="absolute opacity-10 m-auto left-0 right-0 top-3 h-3/4 bg-TvScreenPixel"></div>
		<div id="stage-container"></div>
		<!-- <div id="stage-container" class="bg-contain bg-TvScreen-transparent bg-no-repeat bg-center"></div> -->
	</div>
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
	height: 75%;
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
	/* background-color:rgba(1,255,1,1); */
}

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
