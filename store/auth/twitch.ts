import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { twitchApi } from "~~/services/twitch-api";
import { registerAuthProvider, useAuthStore, ProfileInfo as ProfileInfo } from ".";
import { useHighlighterStore } from "../highlighter";

export const TWITCH_PROVIDER_NAME = "twitch";

interface TwitchAuthState {
    accessToken: string;
    userId: number;
    profileInfo: ProfileInfo | null;
}

function getInitialState(): TwitchAuthState {
    return {
        accessToken: "",
        userId: -1,
        profileInfo: null
    }
}

export async function doApiCall<T>(func: () => Promise<T>): Promise<T> {
    try {
        return await func();
    } catch (e: any) {
        if (e.response?.status == 401) {
            useAuthStore().signOut();
        }
        throw e;
    }
}

export type TwitchAuthStore = ReturnType<typeof useTwitchAuthStore>;

const key = "twitch-auth";
export const useTwitchAuthStore = defineStore(key, {
    state: () => useStorage(key, getInitialState()),
    getters: {
        isSignedIn: state => state.accessToken != null,
        providerIcon: _ => appLink("images/twitch-glitch-logo.svg")
    },
    actions: {
        reset() {
            this.$patch(getInitialState());
        },

        async restoreLogin() {
            if (this.isSignedIn) {
                await this.signIn(this.accessToken);
            }
        },

        async signIn(access_token: string) {
            await doApiCall(async () => {
                const info = await twitchApi.validate(access_token);
                this.$patch(<TwitchAuthState>{
                    accessToken: access_token,
                    userId: info.user_id
                });
                useAuthStore().providerName = TWITCH_PROVIDER_NAME;
                const highlighter = useHighlighterStore();
                if (!highlighter.channel) {
                    highlighter.channel = info.login;
                }
            });
        },

        signOut() {
            this.reset();
        },

        async getProfileInfo(): Promise<ProfileInfo> {
            return await doApiCall(async () => {
                const info = await twitchApi.getUser();
                const profileInfo = {
                    displayName: info.display_name,
                    profilePictureUrl: info.profile_image_url
                };

                this.profileInfo = profileInfo;

                return profileInfo;
            });
        },
    }
});
