<script setup lang="ts">
import UsersService from '@/services/UserService'
import type User from '@/types/User'
import { ref, onMounted } from 'vue'

const users = ref<User[]>()

async function fetchUsers() {
  return await UsersService.getAll()
    .then((response) => {
      users.value = response.data
      console.log(users.value)
    })
    .catch((e: Error) => {
      console.log(e)
    })
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="flex justify-center items-start w-full h-full">
    <div
      class="flex-col justify-center h-2/4 w-6/12 mt-56 max-h-screen bg-white bg-opacity-40 rounded-t-lg"
    >
      <div class="flex start items-center h-1/5 rounded-t-lg bg-lime-400">
        <img src="@/assets/trophy.png" class="max-h-20 ml-10 py-4" />
        <h1 class="ml-10 text-2xl text-white">Leaderboard</h1>
      </div>
      <div>
        <table class="w-full text-left border-separate border-spacing-3">
          <thead class="border-b border-slate-700 myshadow2 h-16">
            <tr class="text-white">
              <th>Rank</th>
              <th>Player Name</th>
              <th>Points past 30days</th>
              <th>All time points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="myshadow2 h-16">
              <td>1</td>
              <td>bob</td>
              <td>300</td>
              <td>score</td>
              <td>online</td>
            </tr>
            <tr class="myshadow2 h-16">
              <td>1</td>
              <td>bob</td>
              <td>300</td>
              <td>score</td>
              <td>oflfine</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="background"></div>
</template>

<style scoped>
.myshadow {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

.myshadow2 {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
}

.background {
  top: 0;
  left: 0;
  position: fixed;
  margin: 0;
  background-image: url(@/assets/background.png);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: bottom;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  transform: scale(1.2);
  filter: blur(4px);
  /*background: radial-gradient(ellipse farthest-corner at center top, #f39264 0%, #f2606f 100%);*/
  z-index: -100;
}
</style>
