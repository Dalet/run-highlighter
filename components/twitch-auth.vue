<script setup lang="ts">
import { CLIENT_ID } from '~~/globals';

const redirectUri = window.location.origin + appLink("callback/twitch");
const scope = window.encodeURIComponent("");

const twitchAutorizationUri = "https://id.twitch.tv/oauth2/authorize"
+ `?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}`
+ `&response_type=token&scope=${scope}`;

const twitchLogoUrl = appLink("images/twitch-glitch-logo.svg");
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
        <img v-if="!loading" :src="twitchLogoUrl" class="provider-icon _margin-right:1/2"/>
        <i-loader class="_margin-right:1/2" v-else color="light" size="lg"></i-loader>
        {{ btnText }}
    </i-button>
</template>

<style scoped>
.btn-twitch:hover {
    background-color: #7349c1!important;
}

.provider-icon {
    height: 17px;
}
</style>