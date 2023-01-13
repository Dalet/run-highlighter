<script setup lang="ts">
import { useAuthStore } from '~~/store/auth';

const auth = useAuthStore();

async function fetchUserInfo() {
    if (auth.isSignedIn && !auth.profileInfo) {
        await auth.getProfileInfo();
    }
}

const profilePictureUrl = computed(() => auth.profileInfo?.profilePictureUrl);
const providerIcon = computed(() => auth.providerIcon);
const displayName = computed(() => auth.profileInfo?.displayName);

await fetchUserInfo();
watch(() => auth.isSignedIn, fetchUserInfo);
</script>

<template>
<div>
    <i-dropdown class="user-btn-dropdown">
        <i-button>
            <img v-if="profilePictureUrl" class="profile-picture _margin-right:1/2" :src="profilePictureUrl" />
            {{ displayName }}
            <img v-if="providerIcon" class="provider-icon _margin-left:1" :src="providerIcon"/>
        </i-button>
        <template #body>
            <i-dropdown-item @click="auth.signOut" class="_text-align:center">Sign out</i-dropdown-item>
        </template>
    </i-dropdown>
</div>
</template>

<style scoped>
.profile-picture {
    height:32px;
    border-radius: 50%;
}

.provider-icon {
    height: 17px;
}

.user-btn-dropdown .dropdown {
    min-width: 7em;
}

.user-btn-dropdown .dropdown-body {
    padding-top: 0.5em !important;
    padding-bottom: 0.5em !important;
}
</style>