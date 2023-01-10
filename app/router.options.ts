import type { RouterConfig } from '@nuxt/schema'
import { createWebHistory } from 'vue-router'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
    history: base => createWebHistory(base)
}
