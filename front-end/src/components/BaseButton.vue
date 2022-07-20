<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

export interface Props {
  mode?: string
  link?: boolean
  to?: RouteLocationRaw
}

withDefaults(defineProps<Props>(), {
  mode: '',
  link: false,
  to: '/',
})
</script>

<template>
  <button v-if="!link" :class="mode">
    <slot></slot>
  </button>
  <router-link v-else :to="to" :class="mode">
    <slot></slot>
  </router-link>
</template>
