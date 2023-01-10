import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useHighlighterStore } from "../highlighter";
import { demoProvider, DEMO_PROVIDER_NAME } from "./demo";
import { TWITCH_PROVIDER_NAME, useTwitchAuthStore } from "./twitch";

type AuthInfo = {
    providerName: string;
}

function getInitialState(): AuthInfo {
    return {
        providerName: NONE_PROVIDER
    }
}

const key = "auth";
export const useAuthStore = defineStore(key, {
    state: () => useStorage(key, getInitialState()),
    getters: {
        isSignedIn: state => getAuthProvider(state.providerName).isSignedIn,
        providerIcon: state => getAuthProvider(state.providerName).providerIcon,
        isDemoMode: state => state.providerName === DEMO_PROVIDER_NAME,
        profileInfo: state => getAuthProvider(state.providerName).profileInfo
    },
    actions: {
        reset() {
            this.$patch(getInitialState());
        },

        signInWithSavedProvider() {
            getAuthProvider(this.providerName).restoreLogin();
            if (!this.isSignedIn) {
                this.reset();
            }
        },

        signOut() {
            getAuthProvider(this.providerName).signOut();
            this.reset();
            useHighlighterStore().resetSelection();
            navigateTo("/sign-in");
        },

        async getProfileInfo() {
            return await getAuthProvider(this.providerName).getProfileInfo();
        },

        signInWithDemoMode() {
            getAuthProvider(DEMO_PROVIDER_NAME).signIn("");
            this.providerName = DEMO_PROVIDER_NAME;
            navigateTo("/");
        }
    }
});

const NONE_PROVIDER = "none";
const noProvider: AuthProvider =({
    get isSignedIn() { return false; },
    get profileInfo() { return null; },
    get providerIcon() { return ""; },
    async restoreLogin() { },
    signIn(_) { throw new Error("No provider"); },
    signOut() { throw new Error("No provider"); },
    getProfileInfo() { throw new Error("No provider"); }
});

export const authProviders: Record<string, () => AuthProvider> = {
    [NONE_PROVIDER]: () => noProvider,
    [DEMO_PROVIDER_NAME]: () => demoProvider,
    [TWITCH_PROVIDER_NAME]: useTwitchAuthStore
}

function getAuthProvider(providerName: string): AuthProvider {
    return authProviders[providerName]();
}

export const registerAuthProvider = function(name: string, providerGetter: () => AuthProvider) {
    authProviders[name] = providerGetter; 
}

export interface AuthProvider {
    get isSignedIn(): boolean;
    get profileInfo(): ProfileInfo | null;
    restoreLogin(): Promise<void>;
    signIn(access_token: string): Promise<void>;
    signOut(): void;
    getProfileInfo(): Promise<ProfileInfo>
    get providerIcon(): string;
}

export type ProfileInfo = {
    profilePictureUrl: string;
    displayName: string;
}