import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', name: 'home', component: HomeView }],
})
