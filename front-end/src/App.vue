<script setup lang="ts"></script>

<template>
    <router-view></router-view>
</template>

<style>
@font-face {
  font-family: Noir_regular;
  src: url(@/assets/font/Noir_regular.otf);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

*, *:before, *:after {
  box-sizing: border-box;
}

html, body, #app { height: 100%; width: 100%; margin:0; padding:0; }
</style>
