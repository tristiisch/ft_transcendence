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

