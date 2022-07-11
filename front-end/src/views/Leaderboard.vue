<template>
  <div>
    <base-button> Logout </base-button>
  </div>
  <div>
    <ul id="example-1">
      <li v-for="item in items" :key="item.message">
        <base-card> {{ item.message }} </base-card>
      </li>
    </ul>
  </div>
  <div class="align">
    <base-button mode="flat" link to="/Chat"> Chat </base-button>
    <base-button mode="outline" link to="/Leaderboard">
      Leaderboard
    </base-button>
    <base-button link to="/Lobby"> Lobby </base-button>
  </div>
</template>

<script setup lang="ts"></script>
