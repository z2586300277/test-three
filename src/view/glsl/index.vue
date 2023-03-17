<template>
    <div class="flex">
        <div class="box" v-if="adminStore.$state.power">
            <el-button @click="getComponent('point')">webgl绘制点</el-button>
            <el-button @click="getComponent('shaderSky')">shader天空</el-button>
            <el-button @click="getComponent('shader1')">shader闪烁</el-button>
            <el-button @click="getComponent('shader2')">shader色元</el-button>
            <el-button @click="getComponent('shader3')">shader案例</el-button>
            <el-button @click="getComponent('shader4')">shader星</el-button>
            <el-button @click="getComponent('shader5')">shader5</el-button>
        </div>
        <div class="cmpt">
            <component :is="AsyncComp" ></component>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef} from 'vue'
import { useUserStore,  useAdminStore } from '../../pinia'

const adminStore = useAdminStore()

let AsyncComp:any = shallowRef()
const getComponent = (name:string) =>  {
    AsyncComp.value = defineAsyncComponent(() => new Promise((resolve, reject) =>  setTimeout(() =>  resolve(import(/* @vite-ignore */'./components/'+name+'.vue')), 500)))
    localStorage.setItem('glsl', name)
}
getComponent(localStorage.getItem('glsl') ?? 'point')

</script>

<style lang="less" scoped>
.box {
    display: flex;
    position: absolute;
}
.cmpt{
    height:100%;
}
.flex {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}
</style>