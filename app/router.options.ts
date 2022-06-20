import type { RouterConfig } from '@nuxt/schema'
import { createWebHistory } from 'vue-router'

// https://router.vuejs.org/api/#routeroptions
export default <RouterConfig>{
    history: createWebHistory()
}
