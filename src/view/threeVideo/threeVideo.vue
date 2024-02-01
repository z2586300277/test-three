<template>
    <div class="flex">
        <el-button @click="getComponent('basicVideo')">基础视频</el-button>
        <el-button @click="getComponent('vrVideo')">全景视频</el-button>
    </div>
    <component :is="cmpt" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, shallowRef } from 'vue';


let cmpt:any = shallowRef()

onMounted(() => getComponent('vrVideo'))

function getComponent(name:any) {

    cmpt.value = defineAsyncComponent(() => import(/* @vite-ignore */'./'+name+'.vue'))

}
</script>

<style lang="less" scoped>
.flex {
    position: absolute;
    top: 0;
}
</style>
