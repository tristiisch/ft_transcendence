<template>
    <div class="flex flex-col justify-between h-full font-Noir mx-[8vw] gap-4">
        <the-header></the-header>
        <div class="min-w-full lg:min-w-0 lg:w-[80%] xl:w-[70%] 2xl:w-[60%] self-center h-3/5 sm:h-1/2 min-h-[500px] [box-shadow:_0_0_20px_rgba(0,_0,_0,_0.8)]">
            <slot></slot>
        </div>
        <the-footer></the-footer>
    </div>
    <div class="h-full w-full fixed bg-brick bg-fixed bg-bottom bg-cover top-0 left-0 -z-10 [transform:_scale(1.2)]"></div>
</template>