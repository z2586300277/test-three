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
        <el-menu-item v-for="item,k in item0.children" :key="k" :index="k0+'-'+k" @click="$router.push(item.path)">
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
const routeList:any = ref(
  [
  {
    name: '案例',
    children: [
        {
            name: 'glsl',
            path: '/glsl'
        },
        {
            name: '管道',
            path: '/pipe'
        },
        {
            name: '光伏',
            path: '/three'
        },

    ]
  }
]
)
</script>

<style lang="less" scoped>
//element 样式调整
.el-menu-vertical-demo:not(.el-menu--collapse) {
  user-select: none;
  width: 210px;
  height: 100vh;
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