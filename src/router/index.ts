import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '../Layout/Layout.vue'
import { routers } from '../config/config'

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    component: Layout,
    redirect: '/glsl',
    children: routers.map(i => getRoute(i))
  },
  
]

function getRoute(str: string){
  const [ name, path, routerStr, title ]: Array<string> =  str.split('——')
  return {
    name,
    path,
    component: () => import(/* @vite-ignore */"../view"+routerStr+".vue"),
    meta: {
      title
    }
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes
})


router.beforeEach((to, from, next) => {
  next()
})

export default router
