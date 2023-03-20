<template>
<el-menu
  default-active="2"
  class="el-menu-vertical-demo "
  collapse-transition
  background-color="#001529"
  active-text-color="#fff"
  text-color="#fff"
  :default-openeds="['0']"
>
  <!-- 配置一级导航 -->
    <el-sub-menu :index="String(k0)" v-for="item0,k0 in routeList" :key="k0">
      <template #title>
        <span>{{item0.name}}</span>
      </template>
        <!-- 二级导航 -->
        <el-menu-item v-for="item,k in item0.children" :key="k" :index="k0+'-'+k" @click="goRouter(item)">
            <template #title>
                {{item.name}}
          </template>
        </el-menu-item>
        <!-- 二级导航 -->
    </el-sub-menu>
  <!-- 配置一级导航 -->
</el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { routers } from '../config/config'

const router = useRouter()
const routeList:any = ref(
  [
  {
    name: '案例',
    children: routers.map(i => {
      const r = i.split('——')
      return {
        name: r[0],
        path: r[1]
      }
    })
  }
]
)
function goRouter(item:any) {
  localStorage.setItem('path', item.path)
  router.push(item.path)
}
</script>

<style lang="less" scoped>
//element 样式调整
.el-menu-vertical-demo:not(.el-menu--collapse) {
  user-select: none;
  width: 210px;
  height: 100%;
  border: none;
  color: white;
  .el-menu-item{
    user-select: none;
    &:hover{
      background: #0960BD;
    }
  }
  .is-active{
    background: #0960BD;
  }
}
.el-menu--collapse{
  border: none;
}

</style>