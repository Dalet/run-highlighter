export function appLink(path: string) {
    const baseUrl = useRuntimeConfig().app.baseURL;
    if (!baseUrl.endsWith("/")) {
        throw new Error("'app.baseURL' in nuxt.config.ts must end with a slash.");
    }
    while (path.startsWith("/")) {
        path = path.slice(1);
    }
    return baseUrl + path;
}
