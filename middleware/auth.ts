import { useAuthStore } from "~~/store/auth";

const store = useAuthStore();

export default defineNuxtRouteMiddleware((_, __) => {
    if (!store.isSignedIn) {
        return navigateTo("/sign-in");
    }
});
  