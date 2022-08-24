<script setup lang="ts">
import type Channel from '@/types/Channel';
import Status from '@/types/ChannelStatus';

const props = defineProps<{ channel: Channel; }>();

function colorPublic() { 
    
    if (props.channel.type === Status.PUBLIC)
        return '#64748B'
    else
        return '#1E293B'
}

function colorPrivate() { 
    
    if (props.channel.type === Status.PRIVATE)
        return '#64748B'
    else
        return '#1E293B'
}

function colorProtected() { 
    
    if (props.channel.type === Status.PROTECTED)
        return '#64748B'
    else
        return '#1E293B'
}

function isPrivate() { return props.channel.type === Status.PRIVATE}

function channelAvatar()
{
	if(props.channel.avatar)
		return props.channel.avatar
	else
		return "src/assets/ChannelDefault.png"
}
</script>

<template>
     <button class="flex justify-between items-center w-full h-[60px] border-b-[1px] border-slate-600 pr-2">
        <div class="shrink-0 flex items-center h-full">
            <img class="w-8 h-8 sm:h-12 sm:w-12 rounded object-cover border-[1px] border-slate-400" :src="channelAvatar()" alt="Rounded avatar">
        </div>
        <p class="px-2 break-words truncate text-slate-700">{{ channel.name }}</p>
        <div class="flex flex-col justify-around items-center">
            <svg width="18" height="18" clip-rule="evenodd" :fill="colorPublic()" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 5c-4.078 0-7.742 3.093-9.853 6.483-.096.159-.145.338-.145.517s.048.358.144.517c2.112 3.39 5.776 6.483 9.854 6.483 4.143 0 7.796-3.09 9.864-6.493.092-.156.138-.332.138-.507s-.046-.351-.138-.507c-2.068-3.403-5.721-6.493-9.864-6.493zm.002 3c2.208 0 4 1.792 4 4s-1.792 4-4 4-4-1.792-4-4 1.792-4 4-4zm0 1.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z" fill-rule="nonzero"/></svg>
            <svg width="18" height="18" :fill="colorPrivate()" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m17.5 11c2.484 0 4.5 2.016 4.5 4.5s-2.016 4.5-4.5 4.5-4.5-2.016-4.5-4.5 2.016-4.5 4.5-4.5zm-5.346 6.999c-.052.001-.104.001-.156.001-4.078 0-7.742-3.093-9.854-6.483-.096-.159-.144-.338-.144-.517s.049-.358.145-.517c2.111-3.39 5.775-6.483 9.853-6.483 4.143 0 7.796 3.09 9.864 6.493.092.156.138.332.138.507 0 .179-.062.349-.15.516-1.079-1.178-2.629-1.916-4.35-1.916-.58 0-1.141.084-1.671.24-.498-1.643-2.025-2.84-3.829-2.84-2.208 0-4 1.792-4 4 0 2.08 1.591 3.792 3.622 3.982-.014.171-.022.343-.022.518 0 .893.199 1.74.554 2.499zm6.053-2.499s.642-.642 1.061-1.061c.187-.187.187-.519 0-.707-.188-.187-.52-.187-.707 0-.419.419-1.061 1.061-1.061 1.061s-.642-.642-1.061-1.061c-.187-.187-.519-.187-.707 0-.187.188-.187.52 0 .707.419.419 1.061 1.061 1.061 1.061s-.642.642-1.061 1.061c-.187.187-.187.519 0 .707.188.187.52.187.707 0 .419-.419 1.061-1.061 1.061-1.061s.642.642 1.061 1.061c.187.187.519.187.707 0 .187-.188.187-.52 0-.707-.419-.419-1.061-1.061-1.061-1.061zm-6.259-2.001c-1.356-.027-2.448-1.136-2.448-2.499 0-1.38 1.12-2.5 2.5-2.5 1.193 0 2.192.837 2.44 1.955-1.143.696-2.031 1.768-2.492 3.044z" fill-rule="nonzero"/></svg>
            <svg class="mb-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" :fill="colorProtected()" viewBox="0 0 24 24"><path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-10 0v-4c0-2.206 1.794-4 4-4s4 1.794 4 4v4h-8z"/></svg>
        </div>
  </button>
</template>