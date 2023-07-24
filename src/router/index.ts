import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    //路由初始指向
    path: '/',
    name: 'screenshot',
    component: () => import('../views/screenshot/index.vue'),
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/test/index.vue'),
  },
  {
    path: '/dragResizable',
    name: 'dragResizable',
    component: () => import('../views/dragResizeComp/index.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
