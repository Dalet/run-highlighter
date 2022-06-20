import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useTwitchAuthStore } from "./twitch";
import { useHighlighterStore } from "../highlighter";

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
        isDemoMode: state => state.providerName === DEMO_PROVIDER,
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
            getAuthProvider(DEMO_PROVIDER).signIn("");
            this.providerName = DEMO_PROVIDER;
            navigateTo("/");
        }
    }
});

let demoProfileInfo: ProfileInfo | null = null;
function getDemoProfileInfo(): ProfileInfo {
    if (!demoProfileInfo) {
        demoProfileInfo = {
            displayName: "Demo_user",
            profilePictureUrl: useRuntimeConfig().app.baseURL + "/images/demo-user-profile-picture.png"
        }
    }
    return demoProfileInfo;
}
const DEMO_PROVIDER = "demo";
const demoProvider: AuthProvider = reactive({
    demoEnabled: false,
    get isSignedIn() { return this.demoEnabled; },
    get profileInfo() { return getDemoProfileInfo() },
    get providerIcon() { return useTwitchAuthStore().providerIcon; },
    async signIn(_: string) {
        useHighlighterStore().channel = "demo_user";
        this.demoEnabled = true;
    },
    async signOut() { this.demoEnabled = false; },
    async restoreLogin() { this.signOut(); },
    async getProfileInfo() { return getDemoProfileInfo(); }
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

const authProviders: Record<string, () => AuthProvider> = {
    [NONE_PROVIDER]: () => noProvider,
    [DEMO_PROVIDER]: () => demoProvider
}

function getAuthProvider(providerName: string): AuthProvider {
    return authProviders[providerName]();
}

export function registerAuthProvider(name: string, providerGetter: () => AuthProvider) {
    authProviders[name] = providerGetter; 
}

interface AuthProvider {
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