<script setup lang="ts">
import { useTwitchAuthStore } from '~~/store/auth/twitch';

const fragments: { access_token?: string } = {};
useRoute().hash.substring(1).split("&")
    .every(s => {
        const parts = s.split("=");
        fragments[parts[0]] = parts[1];
    });

if (!fragments.access_token) {
    navigateTo("/sign-in", { replace: true });
}
else {
    const state = useTwitchAuthStore();
    const { data, error } = useLazyAsyncData("sign-in", () => state.signIn(fragments.access_token!));

    watch(data, () => {
        navigateTo("/", { replace: true })
    });
    watch(error, () => {
        navigateTo("/sign-in", { replace: true })
    });
}
</script>

<template>
<i-container>
    <i-row center>
     <p>Logging in with Twitch...</p>
    </i-row>
    <i-row center>
     <i-loader size="lg" color="primary" />
    </i-row>
</i-container>
</template>