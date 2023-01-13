import { AuthProvider, ProfileInfo } from ".";
import { useHighlighterStore } from "../highlighter";
import { registerAuthProvider } from "./provider-registry";

export const DEMO_PROVIDER_NAME = "demo";

let demoProfileInfo: ProfileInfo | null = null;
function getDemoProfileInfo(): ProfileInfo {
    if (!demoProfileInfo) {
        demoProfileInfo = {
            displayName: "Demo_user",
            profilePictureUrl: appLink("images/demo-user-profile-picture.png")
        }
    }
    return demoProfileInfo;
}

export const demoProvider: AuthProvider = reactive({
    demoEnabled: false,
    get isSignedIn() { return this.demoEnabled; },
    get profileInfo() { return getDemoProfileInfo() },
    get providerIcon() { return appLink("images/twitch-glitch-logo.svg"); },
    async signIn(_: string) {
        useHighlighterStore().channel = "demo_user";
        this.demoEnabled = true;
    },
    async signOut() { this.demoEnabled = false; },
    async restoreLogin() { this.signOut(); },
    async getProfileInfo() { return getDemoProfileInfo(); }
});

registerAuthProvider(DEMO_PROVIDER_NAME, () => demoProvider);