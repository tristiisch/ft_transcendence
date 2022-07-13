<template>
  <div :class="mode">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mode?: string;
}
const props = withDefaults(defineProps<Props>(), {
  mode: null
});
</script>

<style scoped>
.card {
  padding: 0.5rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}
.card2 {
  border-radius: 0 20px 20px 0;
  padding: 0.5rem 2.5rem;
  background-color: black;
}
</style>
