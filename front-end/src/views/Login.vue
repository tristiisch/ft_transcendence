<template>
	<img class="background"/>
  <div class="button-42">
      <base-button mode="flat" link to="/Home"> 
        <img src="../assets/42_white.png">
      </base-button>
  </div>
</template>

<style scoped>

.background {
  position: fixed;
  margin: 0;
  background-image: url(@/assets/background.png);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: bottom;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  filter: blur(4px);
  transform: scale(1.2)
}

.button-42 {
  position: fixed;
  width:32vw;
  top: 0; 
  left: 0;
  transform: translate(calc(50vw - 53%), calc(50vh - 55%));
}

.tv {
	position: fixed;
	width: 38vw;
	bottom: 18vh;
	min-width: 300px;
	left: 0;
	right: 0;
	margin: 0 auto;
	z-index: -1;
}

</style>