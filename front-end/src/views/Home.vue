<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
</script>

<template>
  <div class="flex flex-col justify-between h-full">
    <the-header class="1/6"></the-header>
    <!--
      <div class="div-title">
        <span>W</span>
        <span>E</span>
        <span>L</span>
        <span>C</span>
        <span>O</span>
        <span>M</span>
        <span>E</span>
      </div>
    //-->
    <div class="relative flex justify-center h-4/6">
      <img src="../assets/TV2.png" class="absolute w-full sm:w-[500px] lg:w-[600px] xl:w-[700px] -bottom-6" />
      <div class="absolute w-1/3 bottom-[120px] -z-10 min-w-[200px] overflow-hidden bg-[rgb(32, 32, 32)] [background:_radial-gradient(circle,rgba(85,_107,_47,_1)_0%,rgba(32,_32,_32,_1)_75%)] [filter:_blur(10px)_contrast(0.98)_sepia(0.25)] [animation:_flicker_0.15s_infinite alternate]">
        <div class="refresh"></div>
      </div>
      <base-button mode="button-play" link to="/game"> PLAY </base-button>
    </div>
    <the-footer class="h-1/6"></the-footer>
  </div>
  <div class="background"></div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@700&display=swap');

.container-top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 18vh;
}

.avatar {
  border: 0.1rem solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  object-fit: cover;
  width: 7rem;
  height: 7rem;
}

.avatar:hover,
.avatar:active {
  border-color: #f1cf3b;
}

.div-logout {
  text-align: right;
}

.div-title {
  color: white;
  font-size: 4.2rem;
  font-family: Noir_regular;
  text-transform: uppercase;
  align-self: flex-end;
}

span {
  padding-left: 2.8rem;
  padding-right: 2.8rem;
}

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
  z-index: -100;
}

.tv {
  position: absolute;
  height: 36vw;
  bottom: 13vh;
  bottom: 0;
  z-index: -2;
}

.tv-background {
  position: absolute;
  width: 30vw;
  height: 23vw;
  bottom: 12vw;
  background: rgb(32, 32, 32);
  background: radial-gradient(
    circle,
    rgba(85, 107, 47, 1) 0%,
    rgba(32, 32, 32, 1) 75%
  );
  filter: blur(10px) contrast(0.98) sepia(0.25);
  overflow: hidden;
  animation: flicker 0.15s infinite alternate;
  z-index: -3;
}

.refresh {
  position: absolute;
  width: 100%;
  height: 80px;
  background: linear-gradient(
    0deg,
    #00ff00,
    rgba(255, 255, 255, 0.25) 10%,
    rgba(0, 0, 0, 0.1) 100%
  );
  opacity: 0.1;
  animation: refresh 8s linear infinite;
}

.container-bottom {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 14vh;
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
