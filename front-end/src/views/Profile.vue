<template>
    <div id="card">
        <div class="container-left">
            <div class="top2">
                <img src="../assets/rank_logo.png" class="img-trophy">
                <base-card mode="card2"> 
                    <p class="rank">{{ user.rank }}</p>
                </base-card>
            </div>
            <div class="div-avatar">
                <base-button link to="/profile">
                    <img src="../assets/obama.jpeg" class="avatar">
                </base-button>
            </div>
            <h1>{{ user.name }}</h1>
        </div>
        <div class="container-right">
            <base-card class="card-dimension" mode="card">
                <div class="wrap-row">
                    <img src="../assets/trophy.png" class="img-trophy">
                    <div>
                        <h2>WIN:</h2>
                        <h1 class="color-green">{{ user.nbVictory }}</h1>
                    </div>
                    <div>
                        <h2>LOSSES:</h2>
                        <h1 class="color-red">{{ user.nbDefeat }}</h1>
                    </div>
                </div>
            </base-card>
            <base-card class="card-dimension" mode="card">
                <div class="wrap-column">
                    <div class="title-card"> 
                        <h1>MATCH HISTORY</h1>
                    </div>
                    <p class="color-green match-list">(10 | 8) - WON AGAINST TOTO</p>
                </div>
            </base-card>
        </div>
    </div>
	<div class="background"></div>
</template>


<script setup lang="ts">
import { useLoggedInUserStore } from "@/stores/loggedInUser";
import { ref, computed } from "vue";

const user=useLoggedInUserStore()

</script>




<style scoped>
.container-left {
    position: relative;
    display: flex;
    flex-direction: column;
	align-items: center;
    height: 100%;
    width: 40%;
    background-color: #f1cf3b;
}

.container-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
	align-items: center;
    width: 60%;
}

h1 {
    font-size: 4vw;
    font-weight: bold;
    color: white;
    font-family: Noir_regular;
}

.title-card {
    height: 12%;
    text-align: center;
    margin: 2.5vh;
}
.title-card h1 {
    margin: auto;
    font-size: 2vw;
}

h2 {
    font-size: 1.2vw;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.3);
    height: 2vh;
    display: inline-block;
}

p {
    color: white;
    font-size: 3vw;
}

p.match-list {
    font-size: 1vw;
    margin: 1vh;
}


#card {
    display: flex;
    height: 60vh;
    margin: 20vh 20vw;
    background-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
    
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
	z-index: -100;
}

.avatar {
    margin-top: 4vh;
	border: 0.1rem solid rgba(255, 255, 255, 0.6);
	border-radius: 50%;
	object-fit: cover;
	width: 8vw;
	height: 8vw;
}

.top2 {
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 4vh;
    bottom: 4vh;
    left: 0;
}

.wrap-column {
    display: flex;
    flex-direction: column; 
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height:100%;
}

.wrap-row{
    display: flex;
    flex-direction: row; 
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height:100%;
}

.img-trophy {
    width: 20%;
}

.color-red
{
    color: #ab381f ;
}

.color-green
{
    color: #a3e145 
}

.rank {
    font-size: 2vw;

}

.card-dimension {
    width: 90%;
    height: 50%;
    margin: 2%; 
}
</style>

