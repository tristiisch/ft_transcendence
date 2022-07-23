<template>
  <div :class="mode">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  mode?: string;
}
const props = withDefaults(defineProps<Props>(), {
  mode: ''
});
</script>

<style scoped>
.card {
  padding: 0.5rem 1.5rem;

}
.card2 {
  border-radius: 0 20px 20px 0;
  padding: 0.5rem 2.5rem;
  background-color: black;
}
</style>
