<script setup lang="ts">
import { CLIENT_ID } from '~~/globals';

const baseUrl = useRuntimeConfig().app.baseURL;

const redirectUri = window.location.origin + baseUrl + "/callback/twitch";
const scope = window.encodeURIComponent("");

const twitchAutorizationUri = "https://id.twitch.tv/oauth2/authorize"
+ `?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}`
+ `&response_type=token&scope=${scope}`;

const loading = ref(false);
const btnText = computed(() => {
    if (loading.value) {
        return "Redirecting to Twitch...";
    } else {
        return "Connect with Twitch";
    }
});

function click() {
    loading.value = !loading.value;
    window.location.assign(twitchAutorizationUri);
}
</script>

<template>
    <i-button type="button" :disabled="loading" class="_background:twitch btn-twitch" @click="click">
        <img v-if="!loading" :src="baseUrl + '/images/twitch-glitch-logo.svg'" class="_margin-right:1/2 inkline-icon -lg"/>
        <i-loader class="_margin-right:1/2" v-else color="light" size="lg"></i-loader>
        {{ btnText }}
    </i-button>
</template>

<style scoped>
.btn-twitch:hover {
    background-color: #7349c1!important;
}
</style>