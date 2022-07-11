<template>
  <div class="background"></div>
  <div class="top-container">
    <div class="div-avatar">
      <base-button mode="flat" link to="/profile">
        <img src="../assets/obama.jpeg" class="avatar" />
      </base-button>
    </div>
    <div class="title">
      <span>W</span>
      <span>E</span>
      <span>L</span>
      <span>C</span>
      <span>O</span>
      <span>M</span>
      <span>E</span>
    </div>
    <div class="logout">
      <base-button mode="logout-button"> Logout </base-button>
    </div>
  </div>
  <div class="button-centered">
    <img src="../assets/TV2.png" class="tv" />
    <base-button mode="play-button" link to="/game"> PLAY </base-button>
  </div>
  <div class="align">
    <base-button mode="outline" link to="/chat"> Chat </base-button>
    <base-button mode="outline" link to="/leaderboard">
      Leaderboard
    </base-button>
    <base-button mode="outline" link to="/lobby"> Lobby </base-button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@700&display=swap');
@font-face {
  font-family: RousseauDeco;
  src: url(@/assets/font/RousseauDeco.ttf);
}
@font-face {
  font-family: Noir_regular;
  src: url(@/assets/font/Noir_regular.otf);
}

@font-face {
  font-family: Ailerons-Regular;
  src: url(@/assets/font/Ailerons-Regular.otf);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.background {
  margin: 0;
  background-image: url(@/assets/background.png);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: bottom;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  transform: scale(1.1);
}

.top-container {
  margin-left: 7%;
  margin-right: 7%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 20vh;
}

.div-avatar {
}

.avatar {
  border: 0.1rem solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  height: 100px;
  width: 100px;
  object-fit: cover;
}

.avatar:hover,
.avatar:active {
  border-color: #f1cf3b;
}

.logout {
}

.title {
  color: white;
  font-family: Noir_regular;
  text-transform: uppercase;
  text-align: center;
  font-size: 3vw;
  align-self: flex-end;
  flex-grow: 1;
}

.title span {
  padding-left: 3rem;
  padding-right: 3rem;
}

.button-centered {
  position: fixed;
  text-align: center;
  bottom: 45vh;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}

.tv {
  position: fixed;
  width: 38vw;
  bottom: 18vh;
  min-width: 300px;
  left: 0;
  right: 0;
  margin: 0 auto;
  z-index: -1;
}

.align {
  position: fixed;
  bottom: 10%;
  text-align: center;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}
</style>
