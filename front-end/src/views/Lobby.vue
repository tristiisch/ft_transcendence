<template>
    <div class="flex justify-center items-center w-full h-full">
        <div class="flex-col justify-center min-w-full xl:min-w-0 xl:w-4/6 min-h-[448px] md:min-h-[568px] bg-white bg-opacity-40 rounded-t-lg">
           <div class="flex flex-col justify-around bg-lime-400 rounded-t-lg  h-44 md:h-32">
                <div class="flex justify-between items-center">
                    <div class="flex flex-col items-center md:flex-row">
                        <img src="@/assets/trophy.png" class="h-20 ml-4 p-4" />
                        <h1 class="text-xl md:text-2xl text-white">Leaderboard</h1>
                    </div>
                    <div>
                        <base-button class="mr-8">Action</base-button>
                    </div>
                </div>
                <div class="flex justify-center items-center bg-lime-400 text-xl">
                    <div class="text-center flex-1">
                        <sort-button>
                            Player
                        </sort-button>
                    </div>
                    <div class="text-center flex-1">
                        <sort-button>
                            Status
                        </sort-button>
                    </div>
                    <div class="text-center flex-1">
                        <sort-button>
                            Rank
                        </sort-button>
                    </div>
                </div>
            </div>
            <div class="overflow-y-auto max-h-[316px] md:max-h-[444px]">
                <div class="relative grid grid-flow-col auto-cols-fr place-content-center h-16 md:h-24 myshadow2 m-3 overflow-hidden">
                    <img class="absolute -left-6 -top-3 h-24 w-24 md:-left-8 md:-top-4 md:w-36 md:h-36 rounded-full object-cover" src="@/assets/obama.jpeg" alt="Rounded avatar">
                    <div class="flex items-center pl-20 md:pl-32">Robert</div>
                    <div class="flex justify-center items-center">
                            <div class="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> 
                            Online
                    </div>
                    <div class="flex justify-center items-center"> 1 </div>
                </div>
                <div class="relative grid grid-flow-col auto-cols-fr place-content-center h-16 md:h-24 myshadow2 m-3 overflow-hidden">
                    <img class="absolute -left-6 -top-3 h-24 w-24 md:-left-8 md:-top-4 md:w-36 md:h-36 rounded-full object-cover" src="@/assets/obama.jpeg" alt="Rounded avatar">
                    <div class="pl-20 md:pl-32 py-4">Robert</div>
                    <div class="flex justify-center items-center py-4 pl-6">
                            <div class="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> 
                            Online
                    </div>
                    <div class="text-center py-4"> 1 </div>
                </div>
                <div class="relative grid grid-flow-col auto-cols-fr place-content-center h-16 md:h-24 myshadow2 m-3 overflow-hidden">
                    <img class="absolute -left-6 -top-3 h-24 w-24 md:-left-8 md:-top-4 md:w-36 md:h-36 rounded-full object-cover" src="@/assets/obama.jpeg" alt="Rounded avatar">
                    <div class="pl-20 md:pl-32 py-4">Robert</div>
                    <div class="flex justify-center items-center py-4 pl-6">
                            <div class="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> 
                            Online
                    </div>
                    <div class="text-center py-4"> 1 </div>
                </div>
                <div class="relative grid grid-flow-col auto-cols-fr place-content-center h-16 md:h-24 myshadow2 m-3 overflow-hidden">
                    <img class="absolute -left-6 -top-3 h-24 w-24 md:-left-8 md:-top-4 md:w-36 md:h-36 rounded-full object-cover" src="@/assets/obama.jpeg" alt="Rounded avatar">
                    <div class="pl-20 md:pl-32 py-4">Robert</div>
                    <div class="flex justify-center items-center py-4 pl-6">
                            <div class="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> 
                            Online
                    </div>
                    <div class="text-center py-4"> 1 </div>
                </div>
                <div class="relative grid grid-flow-col auto-cols-fr place-content-center h-16 md:h-24 myshadow2 m-3 overflow-hidden">
                    <img class="absolute -left-6 -top-3 h-24 w-24 md:-left-8 md:-top-4 md:w-36 md:h-36 rounded-full object-cover" src="@/assets/obama.jpeg" alt="Rounded avatar">
                    <div class="pl-20 md:pl-32 py-4">Robert</div>
                    <div class="flex justify-center items-center py-4 pl-6">
                            <div class="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> 
                            Online
                    </div>
                    <div class="text-center py-4"> 1 </div>
                </div>
                <div class="relative grid grid-flow-col auto-cols-fr place-content-center h-16 md:h-24 myshadow2 m-3 overflow-hidden">
                    <img class="absolute -left-6 -top-3 h-24 w-24 md:-left-8 md:-top-4 md:w-36 md:h-36 rounded-full object-cover" src="@/assets/obama.jpeg" alt="Rounded avatar">
                    <div class="pl-20 md:pl-32 py-4">Robert</div>
                    <div class="flex justify-center items-center py-4 pl-6">
                            <div class="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div> 
                            Online
                    </div>
                    <div class="text-center py-4"> 1 </div>
                </div>
            </div>
        </div>
  </div>
    <div class="background"></div>
</template>

<style>
.background {
  top: 0;
  left: 0;
  position: fixed;
  margin: 0;
  background-image: url(@/assets/brick.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: bottom;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
  transform: scale(1.2);
  /*background: radial-gradient(ellipse farthest-corner at center top, #f39264 0%, #f2606f 100%);*/
  z-index: -100;
}

.myshadow {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

.myshadow2 {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
} 

</style>
