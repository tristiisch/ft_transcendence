<template>
  <div class="flex flex-col justify-between h-full font-Noir mx-[8vw]">
    <the-header></the-header>
    <div class="flex flex-col justify-center sm:flex-row min-w-full xl:min-w-0 xl:w-4/6 self-center min-h-[420px] md:min-h-[488px] xl:min-h-[552px] bg-black [box-shadow:_0_0_20px_rgba(0,_0,_0,_0.8)]"></div>
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

</style>