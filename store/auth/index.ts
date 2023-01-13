import { defineStore } from "pinia";
import { useHighlighterStore } from "../highlighter";
import { DEMO_PROVIDER_NAME } from "./demo";
import { AuthProviderFactory, getAuthProvider, registerAuthProvider } from "./provider-registry";

function getInitialState() {
    return {
        providerName: NONE_PROVIDER
    }
}

export const useAuthStore = defineStore("auth", {
    state: () => getInitialState(),
    persist: true,
    getters: {
        useProvider: state => getAuthProvider(state.providerName),
        isSignedIn(): boolean { return this.useProvider().isSignedIn; },
        providerIcon(): string { return this.useProvider().providerIcon; },
        profileInfo(): ProfileInfo | null { return this.useProvider().profileInfo; },
        isDemoMode: state => state.providerName === DEMO_PROVIDER_NAME
    },
    actions: {
        reset() {
            this.$patch(getInitialState());
        },

        signInWithSavedProvider() {
            this.useProvider().restoreLogin();
            if (!this.isSignedIn) {
                this.reset();
            }
        },

        async signOut() {
            this.useProvider().signOut();
            this.reset();
            useHighlighterStore().resetSelection();
            await navigateTo("/sign-in");
        },

        async getProfileInfo() {
            return await this.useProvider().getProfileInfo();
        },

        async signInWithDemoMode() {
            this.providerName = DEMO_PROVIDER_NAME;
            await this.useProvider().signIn("");
            await navigateTo("/");
        }
    }
});

const NONE_PROVIDER = "none";
const noProvider: AuthProvider = ({
    get isSignedIn() { return false; },
    get profileInfo() { return null; },
    get providerIcon() { return ""; },
    async restoreLogin() { },
    signIn(_) { throw new Error("No provider"); },
    signOut() { throw new Error("No provider"); },
    getProfileInfo() { throw new Error("No provider"); }
});

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

registerAuthProvider(NONE_PROVIDER, () => noProvider);