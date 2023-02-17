import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'


const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/three',
  },
  {
    path: '/three',
    component: () => import('../view/three/index.vue')
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
