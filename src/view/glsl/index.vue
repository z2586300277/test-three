<template>
    <div class="flex">
        <div class="box">
            <el-button @click="getComponent('point')">绘制点</el-button>
            <el-button @click="getComponent('shaderSky')">webgl</el-button>
            <el-button @click="getComponent('shader1')">shader</el-button>
        </div>
        <div class="cmpt">
            <component :is="AsyncComp" ></component>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef} from 'vue'

let AsyncComp:any = shallowRef()
const getComponent = (name:string) =>  AsyncComp.value = defineAsyncComponent(() => new Promise((resolve, reject) =>  setTimeout(() =>  resolve(import(/* @vite-ignore */'./components/'+name+'.vue')), 500)))
getComponent('shaderSky')
</script>

<style lang="less" scoped>
.box {
    display: flex;
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