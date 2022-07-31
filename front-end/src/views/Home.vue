<script setup lang="ts"></script>

<template>
	<div class="flex flex-col justify-between h-full mx-[8vw]">
		<the-header :isHomePage="true"></the-header>
		<div class="relative flex justify-center h-4/6">
			<img src="../assets/TV2.png" class="absolute w-[280px] sm:w-[500px] lg:w-[600px] xl:w-[650px] -bottom-10" />
			<div
				class="absolute -z-10 bottom-[50px] w-[210px] h-[160px] sm:bottom-[120px] sm:w-[360px] sm:h-[280px] lg:bottom-[150px] lg:w-[420px] lg:h-[330px] xl:bottom-[140px] xl:w-[500px] xl:h-[360px] overflow-hidden bg-[rgb(32, 32, 32)] [background:_radial-gradient(circle,rgba(85,_107,_47,_1)_0%,rgba(32,_32,_32,_1)_75%)] [filter:_blur(10px)_contrast(0.98)_sepia(0.25)] [animation:_flicker_0.15s_infinite alternate]"
			>
				<div
					class="absolute w-full h-[80px] opacity-10 [background:_linear-gradient(0deg,#00ff00,rgba(255, 255, 255, 0.25)_10%,rgba(0,_0,_0,_0.1)_100%)] [animation:_refresh_8s_linear_infinite]"
				></div>
			</div>
			<base-button
				link
				:to="{ name: 'Game' }"
				class="absolute text-white font-BPNeon brightness-200 text-[3rem] bottom-[85px] sm:text-[5rem] sm:bottom-[180px] lg:text-[6rem] lg:bottom-[210px] xl:text-[8rem] xl:bottom-[210px] hover:text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914]"
			>
				PLAY
			</base-button>
		</div>
		<the-footer></the-footer>
	</div>
	<div class="background"></div>
</template>

<style scoped>
.background {
	top: 0;
	left: 0;
	position: fixed;
	margin: 0;
	background-image: url(@/assets/brick.jpg);
	background-size: cover;
	background-repeat: no-repeat;
	background-position: bottom;
	background-attachment: fixed;
	height: 100%;
	width: 100%;
	transform: scale(1.2);
	/*background: radial-gradient(ellipse farthest-corner at center top, #f39264 0%, #f2606f 100%);*/
	z-index: -100;
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
</style>
