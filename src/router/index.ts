import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Layout from '../Layout/Layout.vue'
import { routers } from '../config/config'

const children:any = Object.values(routers).flat().map((i:any) => getRoute(i))

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    component: Layout,
    redirect: localStorage.getItem('path') || '/glsl',
    children 
  },
  
]

function getRoute(str: string){
  const [ name, path, routerStr, title ]: Array<string> =  str.split('——')

  const url = "../view"+routerStr+".vue"

  return {
    name,
    path,
    component: () => import(/* @vite-ignore */(import.meta as any).resolve(url)),
    meta: {
      title
    }
  }
}

const router = createRouter({
  history: createWebHashHistory(),
  routes
})


router.beforeEach((to, from, next) => {
  next()
})

export default router
