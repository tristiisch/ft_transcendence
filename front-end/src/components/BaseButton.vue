<template>
  <button v-if="!link" :class="mode">
    <slot></slot>
  </button>
  <router-link v-else :to="to" :class="mode">
    <slot></slot>
  </router-link>
</template>

<script setup lang="ts">
export interface Props {
  mode?: string
  link?: boolean
  to?: string
}

withDefaults(defineProps<Props>(), {
  mode: '',
  link: false,
  to: '/',
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');

@font-face {
  font-family: neon;
  src: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/707108/neon.ttf);
}

@font-face {
  font-family: Noir_regular;
  src: url(@/assets/font/Noir_regular.otf);
}

button,
a {
  font: inherit;
  cursor: pointer;
}

button {
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.6);
  color: white;
  padding: 0.5rem 1.5rem;
}

button:hover,
button:active {
  background-color: #f1cf3b;
  border-color: #270041;
}

a.text-button {
  font-size: 1.6rem;
  font-family: Noir_regular;
  letter-spacing: 0.8rem;
  text-shadow: 0 0 0.1vw #fa1c16, 0 0 0.3vw #fa1c16, 0 0 1vw #fa1c16,
    0 0 1vw #fa1c16, 0 0 0.04vw #fed128, 0.05vw 0.05vw 0.01vw #806914;
  color: #ffff00;
  outline: none;
  display: inline-block;
}

a.text-button:hover,
a.text-button:active {
  text-shadow: 0 0 0.1vw #fa1c16, 0 0 0.3vw #fa1c16, 0 0 1vw #fa1c16,
    0 0 1vw #fa1c16, 0 0 0.04vw #fed128, 0.05vw 0.05vw 0.01vw #806914;
  color: #ffff;
  filter: brightness(1.75);
}

.button-play {
  position: absolute;
  bottom: 16vw;
  font-family: neon;
  font-size: 6vw;
  text-shadow: 0 0 0.1vw #fa1c16, 0 0 0.3vw #fa1c16, 0 0 1vw #fa1c16,
    0 0 1vw #fa1c16, 0 0 0.04vw #fed128, 0.05vw 0.05vw 0.01vw #806914;
  color: #ffff;
}

.button-play:hover,
.button-play:active {
  color: #f1cf3b;
}
</style>
