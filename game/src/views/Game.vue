<script setup lang="ts">

import { ref, onMounted, onUpdated } from 'vue';
import Konva from 'konva'

const ratio = 3989/2976

onMounted(() => {
	var height = window.innerHeight * (75 / 100)
	var width = height * ratio
	var stage = new Konva.Stage({
		container: 'stage-container',
		visible: true,
		width: width,
		height: height
	})
	stage.getContent().style.backgroundColor = 'rgba(0, 0, 255, 0.2)'

	var layer = new Konva.Layer()

	var ball = new Konva.Circle({
		x: stage.width() / 2,
		y: stage.height() / 2,
		radius: stage.width() / 100,
		fill: 'red'
	})
	layer.add(ball)

	//--------------------------------------------------
	//	Resize whole stage once the window gets resized
	function resizeStage() {
		height = window.innerHeight * (75 / 100)
		width = height * ratio

		stage.width(width)
		stage.height(height)
		ball.x(stage.width () / 2)
		ball.y(stage.height () / 2)
		ball.radius(stage.width() / 100)
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
	height:75%;
	max-width:3989px;
	max-height:2976px;
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
