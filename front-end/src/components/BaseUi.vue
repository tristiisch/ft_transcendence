<template>
    <div class="flex flex-col justify-between h-full font-Noir mx-[8vw]">
        <the-header></the-header>
        <div class="flex flex-col justify-center sm:flex-row min-w-full xl:min-w-0 xl:w-4/6 self-center min-h-[420px] md:min-h-[488px] xl:min-h-[552px] [box-shadow:_0_0_20px_rgba(0,_0,_0,_0.8)]">
            <slot></slot>
        </div>
        <the-footer></the-footer>
    </div>
</template>