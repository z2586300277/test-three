<template>
    <div class="flex">
        <el-button @click="getComponent('videoVr')">全景视频</el-button>
    </div>
    <component :is="cmpt" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, shallowRef } from 'vue';


let cmpt:any = shallowRef()

onMounted(() => getComponent('videoVr'))

function getComponent(name) {

    cmpt.value = defineAsyncComponent(() => import(/* @vite-ignore */'./'+name+'.vue'))

}
</script>

<style lang="less" scoped>
.flex {
    position: absolute;
    top: 0;
}
</style>
