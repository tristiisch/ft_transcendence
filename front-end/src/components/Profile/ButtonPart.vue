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

    const friendButton = computed(() => {
        for (let i = 0; i < friends.value.length; i++) {
            if (route.params.username === friends.value[i]) return 'Remove friend';
        }
        return 'Add friend';
    });

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
                displayPart.value = '2Fa'
            else if (displayPart.value === '2Fa' )
                displayPart.value = 'Notifications'
            else
                displayPart.value = '2Fa'
        emit('changeDisplay', displayPart.value)
    }


    const button1Name = computed(() => {
        if (displayPart.value === 'Notifications' || displayPart.value === '2Fa')
            return 'Player Stats'
        else
            return 'Notifications'
    });

    const button2Name = computed(() => {
        if (displayPart.value === '2Fa')
            return 'Notifications'
        else
            return '2Fa'
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

    function treatFriendRequest() {
        if (friendButton.value === 'Add friend') UsersService.sendFriendRequest(userStore.userData.username, route.params.username as string);
        else UsersService.sendUnfriendRequest(userStore.userData.username, route.params.username as string);
        fetchfriends();
    }

    const emit = defineEmits<{
    (e: 'changeDisplay', displayedPart:string): void
    }>()

    onMounted(() => {
	fetchfriends();
    });
</script>

<template>
    <div v-if="!isUser()" class="flex flex-col gap-4 3xl:gap-6">
        <button-gradient1 @click="treatFriendRequest()">
            {{ friendButton }}
        </button-gradient1>
        <button-gradient1>
            Message
        </button-gradient1>
    </div>
    <div v-else class="flex flex-col gap-4 3xl:gap-6">
        <button-gradient1  @click="setDisplayedPart(1)">
            {{ button1Name }}
        </button-gradient1>
        <button-gradient1 @click="setDisplayedPart(2)">
            {{ button2Name }}
        </button-gradient1>
    </div>
</template>
