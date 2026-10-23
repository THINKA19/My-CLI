import { createRouter, createWebHistory } from 'vue-router'
import { environment } from '@/shared/config/env'

export function pageTitle(title?: string) {
  return title ? title + ' · ' + environment.title : environment.title
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../pages/HomeView.vue'), meta: { title: '首页' } },
    { path: '/error/403', name: 'forbidden', component: () => import('../pages/ForbiddenView.vue'), meta: { title: '无法访问' } },
    { path: '/error/500', name: 'server-error', component: () => import('../pages/ServerErrorView.vue'), meta: { title: '服务异常' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../pages/NotFoundView.vue'), meta: { title: '页面未找到' } },
  ],
  scrollBehavior(_to, _from, savedPosition) { return savedPosition || { top: 0 } },
})
router.afterEach((to) => { document.title = pageTitle(to.meta.title) })
export default router
