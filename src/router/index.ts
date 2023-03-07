import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'


const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/pipe',
  },
  {
    path: '/three',
    component: () => import('../view/three/index.vue')
  },
  {
    path: '/pipe',
    component: () => import('../view/pipe/index.vue')
  },
  {
    path: '/lib',
    component: () => import('../view/lib/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


router.beforeEach((to, from, next) => {
  next()
})

export default router
