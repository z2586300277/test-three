<template>
    <div class="box">
        <el-button @click="getComponent('point')">绘制点</el-button>
        <el-button @click="getComponent('webgl')">webgl</el-button>
    </div>
    <component :is="AsyncComp" ></component>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef} from 'vue'

let AsyncComp:any = shallowRef()
const getComponent = (name:string) => {
    AsyncComp.value = defineAsyncComponent(() => new Promise((resolve, reject) =>  setTimeout(() =>  resolve(import('./components/'+name+'.vue')), 500)))
}
</script>

<style lang="less" scoped>
.box {
    display: flex;
}
</style>