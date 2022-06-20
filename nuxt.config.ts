import { defineNuxtConfig } from "nuxt"

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    buildModules: [
        "@pinia/nuxt",
        "@inkline/nuxt"
    ],
    inkline: {
        colorMode: "dark"
    },
    app: {
        baseURL: "/run-highlighter",
        head: {
            script: [
                {
                    children: `
                    (function(l) {
                        if (l.search[1] === '/' ) {
                          var decoded = l.search.slice(1).split('&').map(function(s) { 
                            return s.replace(/~and~/g, '&')
                          }).join('?');
                          window.history.replaceState(null, null,
                              l.pathname.slice(0, -1) + decoded + l.hash
                          );
                        }
                      }(window.location))
                    `,
                    type: "text/javascript"
                }
            ],
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
