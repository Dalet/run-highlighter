import { defineNuxtConfig } from "nuxt/config"

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    modules: [
        "@pinia/nuxt",
        "@inkline/nuxt",
        "@vueuse/nuxt"
    ],
    inkline: {
        colorMode: "dark"
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
