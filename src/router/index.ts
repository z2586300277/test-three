import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '../Layout/Layout.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    component: Layout,
    redirect: '/glsl',
    children: [
      {
        path: '/three',
        component: () => import('../view/three/index.vue')
      },
      {
        path: '/pipe',
        component: () => import('../view/pipe/index.vue')
      },
      {
        path: '/glsl',
        component: () => import('../view/glsl/index.vue')
      },
      {
        path: '/vector',
        component: () => import('../view/vector/vector.vue')
      },
      {
        path: '/FBX',
        component: () => import('../view/FBX/FBX.vue')
      }
    ]
  },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


router.beforeEach((to, from, next) => {
  next()
})

export default router
