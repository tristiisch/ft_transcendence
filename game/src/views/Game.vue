<script setup lang="ts">

import { ref, onMounted, onUpdated } from 'vue';
import Konva from 'konva'

const stage_ratio = 3989/2976
const ball_speed_quotient = 200 // the least, the faster
const ball_size_quotient = 100 // the least, the bigger
const ball_xpos_quotient = 2 // 2 being the center | min:1 max:inf
const ball_ypos_quotient = 2

const rect_width_quotient = 50
const rect_height_quotient = 5

onMounted(() => {
	function computeStageHeight(): number { return window.innerHeight * (75 / 100) }
	function computeBallSize(): number { return stage.width() / ball_size_quotient }
	function computeRectWidth(): number { return stage.width() / rect_width_quotient }
	function computeRectHeight(): number { return stage.height() / rect_height_quotient }

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

	var rect_p1 = new Konva.Rect({
		x: stage.width() / 10,
		y: stage.height() / 2.5,
		width: computeRectWidth(),
		height: computeRectHeight(),
		fill: 'purple'
	})

	layer.add(ball)
	layer.add(rect_p1)

	var ball_speed = stage.width() / ball_speed_quotient
	var dx = ball_speed
	var dy = ball_speed
	var ball_animation = new Konva.Animation(function(frame) {
		if (ball.x() + dx > stage_width - ball_radius || ball.x() + dx < ball_radius) { dx = -dx; }
		if (ball.y() + dy > stage_height - ball_radius || ball.y() + dy < ball_radius) { dy = -dy; }
		ball.x(ball.x() + dx);
		ball.y(ball.y() + dy);
	}, layer);

	ball_animation.start();

	//--------------------------------------------------
	//	Resize whole stage once the window gets resized
	function resizeStage() {
		stage.height(computeStageHeight())
		stage.width(stage.height() * stage_ratio)

		var ratio = stage.height() / stage_height
		ball.x(ball.x() * ratio)
		ball.y(ball.y() * ratio)
		ball_speed = stage.width() / ball_speed_quotient
		dx = dx > 0 ? ball_speed : -ball_speed
		dy = dy > 0 ? ball_speed : -ball_speed
		ball_radius = computeBallSize()
		ball.radius(ball_radius)

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
