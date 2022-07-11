<template>
  <button v-if="!link" :class="mode">
    <slot></slot>
  </button>
  <router-link v-else :to="to" :class="mode">
    <div class="neon">
      <slot></slot>
    </div>
  </router-link>
</template>

<script setup lang="ts">
interface Props {
  mode?: string;
  link?: boolean;
  to?: string;
}
const props = withDefaults(defineProps<Props>(), {
  mode: null,
  link: false,
  to: '/',
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');

button,
a {
  font: inherit;
  cursor: pointer;
  display: inline-block;
}

@font-face {
  font-family: Retroligh;
  src: url(@/assets/font/Retrolight.ttf);
}

@import url(//db.onlinewebfonts.com/c/4cca58c08ca306511227b61c232a34c2?family=Graphique+Next);

@font-face {
  font-family: neon;
  src: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/707108/neon.ttf);
}

@font-face {
  font-family: Noir_regular;
  src: url(@/assets/font/Noir_regular.otf);
}

a.outline {
  /*border-bottom: 0.1rem solid #F1CF3B;*/
  /*background-color: rgba(255, 140, 0, 0.1);*/
  margin-right: 9rem;
  margin-left: 9rem;
  font-size: 1.6rem;
  /*-webkit-text-stroke: 0.1px black;*/
  font-family: Noir_regular;
  letter-spacing: 0.8rem;
  text-shadow: 0 0 0.1vw #fa1c16, 0 0 0.3vw #fa1c16, 0 0 1vw #fa1c16,
    0 0 1vw #fa1c16, 0 0 0.04vw #fed128, 0.05vw 0.05vw 0.01vw #806914;
  color: #ffff00;
  outline: none;
  /*background:-webkit-linear-gradient(top,  black 50%, #E6BE8A 70%);
  background-clip:text;
  -webkit-background-clip:text;
  color:transparent;*/
}

/*
.neon {
  animation: neon 3s ease infinite;
  -moz-animation: neon 2s ease infinite;
  -webkit-animation: neon 2s ease infinite;
}


@keyframes neon {
  0%,
  100% {
    text-shadow: 0 0 .1vw #FA1C16, 0 0 .3vw #FA1C16, 0 0 1vw #FA1C16, 0 0 1vw #FA1C16, 0 0 .04vw #FED128, .05vw .05vw .01vw #806914;
    color: #FED128;
  }
  50% {
    text-shadow: 0 0 .05vw #800E0B, 0 0 .15vw #800E0B, 0 0 .5vw #800E0B, 0 0 .5vw #800E0B, 0 0 .02vw #800E0B, .05vw .05vw .01vw #40340A;
    color: #806914;
  }
}*/

/*a {
  border-bottom: 2px solid #F1CF3B;
  margin-right: 9rem;
  margin-left: 9rem;
  padding: 0.2rem 0rem;
  font-size: 1.5rem;
  font-family: 'Righteous', cursive;
  color: white;
  background:-webkit-linear-gradient(top,  white 50%, #E6BE8A 70%);
  background-clip:text;
  -webkit-background-clip:text;
  color:transparent;
}*/

button {
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.6);
  color: white;
  padding: 0.5rem 1.5rem;
}

a.outline:hover,
a.outline:active {
  text-shadow: 0 0 0.1vw #fa1c16, 0 0 0.3vw #fa1c16, 0 0 1vw #fa1c16,
    0 0 1vw #fa1c16, 0 0 0.04vw #fed128, 0.05vw 0.05vw 0.01vw #806914;
  color: #ffff;
  filter: brightness(1.75);
}

button:hover,
button:active {
  background-color: #f1cf3b;
  border-color: #270041;
}

.play-button {
  font-family: neon;
  /*background-color: rgba(255, 255, 255, 0.5);*/
  font-size: 6vw;
  color: gold;
  text-shadow: 0 0 0.1vw #fa1c16, 0 0 0.3vw #fa1c16, 0 0 1vw #fa1c16,
    0 0 1vw #fa1c16, 0 0 0.04vw #fed128, 0.05vw 0.05vw 0.01vw #806914;
  color: #ffff;
}

.play-button:hover,
.play-button:active {
  color: #f1cf3b;
}
</style>
