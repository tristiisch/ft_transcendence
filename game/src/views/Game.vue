<script setup lang="ts">

import { ref, onMounted, onUpdated } from 'vue';
import Konva from 'konva'

const stage_ratio = 3989/2976
const ball_speed_quotient = 200 // the least, the faster
const ball_size_quotient = 100 // the least, the bigger
const ball_xpos_quotient = 2 // 2 being the center | min:1 max:inf
const ball_ypos_quotient = 2

const blocker_width_quotient = 50
const blocker_height_quotient = 5
const blocker_movements_delta = 30
const blocker_xpos_quotient = 10

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

	var blockers_width = computeBlockerWidth()
	var blockers_height = computeBlockerHeight()
	var p1_blocker: Konva.Rect = new Konva.Rect({
		width: blockers_width,
		height: blockers_height,
		x: stage.width() / blocker_xpos_quotient,
		y: stage.height() / 2 - blockers_height / 2,
		fill: 'purple'
	})
	var p2_blocker = new Konva.Rect({
		width: blockers_width,
		height: blockers_height,
		x: stage.width() - stage.width() / blocker_xpos_quotient,
		y: stage.height() / 2 - blockers_height / 2,
		fill: 'purple'
	})

	layer.add(ball)
	layer.add(p1_blocker)
	layer.add(p2_blocker)

	var ball_speed = computeBallSpeed()
	var dx = ball_speed
	var dy = ball_speed
	function check_stage_limits_collisions() {
		if (ball.x() + dx < ball_radius || ball.x() + dx > stage_width - ball_radius) { dx = -dx; }
		if (ball.y() + dy < ball_radius || ball.y() + dy > stage_height - ball_radius) { dy = -dy; }
	}
	function check_blockerp1_collisions() {
		if (haveIntersection())
			dx = -dx;
	}
	function haveIntersection() {
		return !(
			ball.x() + dx > p1_blocker.x() + p1_blocker.width() ||
			ball.x() + dx < p1_blocker.x() ||
			ball.y() + dy > p1_blocker.y() + p1_blocker.height() ||
			ball.y() + dy < p1_blocker.y()
		)
	}
	document.addEventListener("keydown", function(e) {
		console.log(e.key)
		if (e.key == 'ArrowDown') {
			if (p1_blocker.y() + p1_blocker.height() + blocker_movements_delta <= stage.height())
				p1_blocker.y(p1_blocker.y() + blocker_movements_delta)
		}
		else if (e.key == 'ArrowUp') {
			if (p1_blocker.y() - blocker_movements_delta >= 0)
				p1_blocker.y(p1_blocker.y() - blocker_movements_delta)
		}
	})

	var ball_animation = new Konva.Animation(function(frame) {
		check_stage_limits_collisions()
		check_blockerp1_collisions()
		ball.x(ball.x() + dx);
		ball.y(ball.y() + dy);
	}, layer)
	ball_animation.start();

	//--------------------------------------------------
	//	Resize whole stage once the window gets resized
	function resizeStage() {
		stage.height(computeStageHeight())
		stage.width(stage.height() * stage_ratio)

		var ratio = stage.height() / stage_height
		ball.x(ball.x() * ratio)
		ball.y(ball.y() * ratio)
		ball_speed = computeBallSpeed()
		dx = dx > 0 ? ball_speed : -ball_speed
		dy = dy > 0 ? ball_speed : -ball_speed
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
	//-------------------------------------------------

	stage.add(layer)
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
	background-color:rgba(1,255,1,1);
}

</style>
