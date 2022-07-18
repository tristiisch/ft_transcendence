<template>
    <nav class="flex flex-col justify-end sm:justify-center font-Noir">
        <ul class="flex flex-col items-center sm:flex-row sm:justify-around">
            <li class="p-1">
                <base-button link to="/chat" class="text-lg sm:text-2xl text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914] hover:text-white hover:brightness-200">
                    Chat
                </base-button>
            </li>
            <li class="p-1">
                <base-button link to="/leaderboard" class="text-lg sm:text-2xl text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914] hover:text-white hover:brightness-200">
                    Leaderboard
                </base-button>
            </li>
            <li class="p-1">
                <base-button link to="/lobby" class="text-lg sm:text-2xl text-yellow-300 tracking-[0.6rem] [text-shadow:0_0_0.1vw_#fa1c16,0_0_0.3vw_#fa1c16,0_0_1vw_#fa1c16,0_0_1vw_#fa1c16,0_0_0.04vw_#fed128,0.05vw_0.05vw_0.01vw_#806914] hover:text-white hover:brightness-200">
                    Lobby
                </base-button>
            </li>
        </ul>
    </nav>
</template>