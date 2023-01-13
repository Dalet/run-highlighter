import { defineNuxtConfig } from "nuxt/config"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        "@pinia/nuxt",
        "@pinia-plugin-persistedstate/nuxt",
        "@inkline/nuxt",
    ],
    inkline: {
        colorMode: "dark"
    },
    piniaPersistedstate: {
        storage: "localStorage"
    },
    app: {
        baseURL: "/run-highlighter/",
        head: {
            link: [
                { rel: "icon", type: "image/gif", href: "favicon.gif" }
            ],
            meta: [
                { name: "description", content: "Twitch highlighting tool for speedruns"},
                { name: "twitter:card", content: "summary" },
                { name: "twitter:site", content: "@dalleth_" },
                { name: "twitter:title", content: "Run Highlighter" },
                { name: "twitter:description", content: "Twitch highlighting tool for speedruns" },
            ]
        }
    },
    ssr: false
})
