<script setup lang="ts">
import { useAuthStore } from "~~/store/auth";

definePageMeta({
    middleware: (_, from) => {
        const state = useAuthStore();
        if (state.isSignedIn) {
            const redirect = from.name != "sign-in" ? from : "/";
            return navigateTo(redirect, { replace: true });
        }
    }
})

function activateDemoMode() {
    useAuthStore().signInWithDemoMode();
}
</script>

<template>
<i-container>
    <i-row center>
        <h3>Sign in to get started</h3>
    </i-row>
    <i-row class="_margin-bottom:2/3" center>
        <twitch-auth></twitch-auth>
    </i-row>
    <i-row center>
        <i-button @click="activateDemoMode">Try demo mode</i-button>
    </i-row>
</i-container>
</template>