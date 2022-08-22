<script setup lang="ts">

import { onMounted } from 'vue';
import Konva from 'konva'
import { socket  } from '@/main'

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
	function computeBallSpeed(): number { return stage.width() / ball_speed_quotient }
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
	stage.getContent().style.backgroundColor = 'rgba(0, 0, 255, 0.2)'

	var layer = new Konva.Layer()

	var ball_radius = computeBallSize()
	var ball = new Konva.Circle({
		x: stage.width() / ball_xpos_quotient,
		y: stage.height() / ball_ypos_quotient,
		radius: ball_radius,
		fill: 'red'
	})

	// var blockers_width = computeBlockerWidth()
	// var blockers_height = computeBlockerHeight()
	// var p1_blocker: Konva.Rect = new Konva.Rect({
	// 	width: blockers_width,
	// 	height: blockers_height,
	// 	x: stage.width() / blocker_xpos_quotient,
	// 	y: stage.height() / 2 - blockers_height / 2,
	// 	fill: 'purple'
	// })
	// var p2_blocker = new Konva.Rect({
	// 	width: blockers_width,
	// 	height: blockers_height,
	// 	x: stage.width() - stage.width() / blocker_xpos_quotient,
	// 	y: stage.height() / 2 - blockers_height / 2,
	// 	fill: 'purple'
	// })

	// function getBlobPointsArray(): Array<number>
	// {
	// 	return ([
	// 		stage.width() / 2, stage.height() / 40, // 0 1
	// 		stage.width() / 1.09, stage.height() / 10.5, // 2 3
	// 		stage.width() / 1.02, stage.height() / 2, // 4 5
	// 		stage.width() / 1.09, stage.height() / 1.111, // 6 7
	// 		stage.width() / 2, stage.height() / 1.023, // 8 9
	// 		stage.width() / 12.7, stage.height() / 1.11, // 10 11
	// 		stage.width() / 55, stage.height() / 2, // 12 13
	// 		stage.width() / 14, stage.height() / 10 // 14 15
	// 	])
	// }
	// var blob = new Konva.Line({
	// 	points: getBlobPointsArray(),
	// 	fill: 'rgba(0, 0, 0, 0.5)',
	// 	closed: true,
	// 	tension: 0.,
	// });

	layer.add(ball)
	// layer.add(p1_blocker)
	// layer.add(p2_blocker)
	// layer.add(blob)

	// var ball_speed = computeBallSpeed()
	// var dx = ball_speed
	// var dy = ball_speed
	// document.addEventListener("keydown", function(e) {
	// 	// console.log(e.key)
	// 	if (e.key == 'ArrowDown') {
	// 		if (p1_blocker.y() + p1_blocker.height() + blocker_movements_delta <= stage.height())
	// 			p1_blocker.y(p1_blocker.y() + blocker_movements_delta)
	// 	}
	// 	else if (e.key == 'ArrowUp') {
	// 		if (p1_blocker.y() - blocker_movements_delta >= 0)
	// 			p1_blocker.y(p1_blocker.y() - blocker_movements_delta)
	// 	}
	// })
	// // --- old way of checking blocker's collisions
	// //
	// // function checkCollisionWithBlocker(blocker: Konva.Rect) {
	// // 	if (!(ball.x() + dx > blocker.x() + blocker.width() ||
	// // 		ball.x() + dx < blocker.x() ||
	// // 		ball.y() + dy > blocker.y() + blocker.height()||
	// // 		ball.y() + dy < blocker.y() )) {
	// // 			if (ball.y() > blocker.y() && ball.y() < blocker.y() + blocker.height())
	// // 				dx = -dx
	// // 			else
	// // 				dy = -dy
	// // 	}
	// // }
	// function checkCollisions() {
	// 	//console.log(layer.canvas.getContext().getImageData(ball.x(), ball.y(), 1, 1).data)
	// 	var ctx_x = layer.canvas.context.getImageData(ball.x() + dx, ball.y(), 1, 1).data 
	// 	if (ctx_x[0] != 0 || ctx_x[1] != 0 || ctx_x[2] != 0 || ctx_x[3] != 128)
	// 		dx = -dx
	// 	if (layer.canvas.context.getImageData(ball.x(), ball.y() + dy, 1, 1).data[3] != 128)
	// 		dy = -dy
	// }
	// var ball_animation = new Konva.Animation(function(frame) {
	// 	if (ball.x() + dx < ball_radius || ball.x() + dx > stage_width - ball_radius) { dx = -dx; }
	// 	if (ball.y() + dy < ball_radius || ball.y() + dy > stage_height - ball_radius) { dy = -dy; }
	// 	// checkCollisions()
	// 	ball.x(ball.x() + dx);
	// 	ball.y(ball.y() + dy);
	// }, layer)
	// ball_animation.start();

	//--------------------------------------------------
	//	Resize whole stage once the window gets resized
	function resizeStage() {
		stage.height(computeStageHeight())
		stage.width(stage.height() * stage_ratio)

		// blob.points(getBlobPointsArray())
		// var ratio = stage.height() / stage_height
		// ball.x(ball.x() * ratio)
		// ball.y(ball.y() * ratio)
		// ball_speed = computeBallSpeed()
		// dx = dx > 0 ? ball_speed : -ball_speed
		// dy = dy > 0 ? ball_speed : -ball_speed
		ball_radius = computeBallSize()
		ball.radius(ball_radius)

		// blockers_width = computeBlockerWidth()
		// blockers_height = computeBlockerHeight()
		// p1_blocker.width(blockers_width)
		// p1_blocker.height(blockers_height)
		// p1_blocker.x(p1_blocker.x() * ratio)
		// p1_blocker.y(p1_blocker.y() * ratio)
		// p2_blocker.width(blockers_width)
		// p2_blocker.height(blockers_height)
		// p2_blocker.x(p2_blocker.x() * ratio)
		// p2_blocker.y(p2_blocker.y() * ratio)

		stage_height = stage.height()
		stage_width = stage.width()
	}
	window.onresize = resizeStage
	// -------------------------------------------------

	stage.add(layer)
	socket.on("ball", (x, y) => {
		// console.log('[SOCKET.IO]', 'CLIENT', 'ball', x, y);
		ball.x(x * (stage.width() / 3989))
		ball.y(y * (stage.width() / 3989))
	});
	socket.emit("start_match");


})

</script>

<template>
	<div class="h-full w-full bg-[#9f9e89] bg-TvScreen-texture">
		<div id="stage-container" class="bg-contain bg-TvScreen bg-no-repeat bg-center"></div>
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
	max-width: 3989px;
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
	/* background-color:rgba(1,255,1,1); */
}

</style>
