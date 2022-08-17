<script setup lang="ts">
    import ButtonGradient1 from '@/components/ButtonGradient1.vue';
    import UsersService from '@/services/UserService';
    import { computed, ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import { useUserStore } from '@/stores/userStore';

    const userStore = useUserStore();
    const route = useRoute();
    const friends = ref([] as string[]);
    const displayPart = ref('Player Stats');


    function isUser() {
        if (route.params.username === userStore.userData.username)
            return true;
        return false;
    };

    function setDisplayedPart( button:number )
    {
        if (button === 1)
            if (displayPart.value === 'Player Stats')
                displayPart.value = 'Notifications'
            else
                displayPart.value = 'Player Stats'
        else
            if (displayPart.value === 'Player Stats')
                displayPart.value = 'Settings'
            else if (displayPart.value === 'Settings' )
                displayPart.value = 'Notifications'
            else
                displayPart.value = 'Settings'
        emit('changeDisplay', displayPart.value)
    }

    async function treatFriendRequest() {
        if (friendButton.value === 'Add friend') await UsersService.sendFriendRequest(userStore.userData.username, route.params.username as string);
        else await UsersService.sendUnfriendRequest(userStore.userData.username, route.params.username as string);
        await fetchfriends();
    }

     const friendButton = computed(() => {
        for (let i = 0; i < friends.value.length; i++) {
            if (route.params.username === friends.value[i])
                return 'Remove friend';
        }
        return 'Add friend';
    });

    const button1Name = computed(() => {
        if (displayPart.value === 'Notifications' || displayPart.value === 'Settings')
            return 'Player Stats'
        else
            return 'Notifications'
    });

    const button2Name = computed(() => {
        if (displayPart.value === 'Settings')
            return 'Notifications'
        else
            return 'Settings'
    });

    async function fetchfriends() {
        await UsersService.getUserfriends(userStore.userData.username)
            .then((response) => {
                friends.value = response.data;
                console.log(response.data);
            })
            .catch((e: Error) => {
                console.log(e);
            });
    }

    const emit = defineEmits<{
    (e: 'changeDisplay', displayedPart:string): void
    }>()

    onMounted(() => {
	if (route.params.username != userStore.userData.username)
        fetchfriends();
    });
</script>

<template>
    <div v-if="!isUser()" class="flex flex-col gap-4">
        <button-gradient1 @click="treatFriendRequest()">
            {{ friendButton }}
        </button-gradient1>
        <button-gradient1>
            Block
        </button-gradient1>
    </div>
    <div v-else class="flex flex-col gap-4">
        <button-gradient1  @click="setDisplayedPart(1)">
            {{ button1Name }}
        </button-gradient1>
        <button-gradient1 @click="setDisplayedPart(2)">
            {{ button2Name }}
        </button-gradient1>
    </div>
</template>
