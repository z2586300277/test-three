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
            <!-- <el-button @click="getComponent('shader7')">shader星辰</el-button> -->
            <el-button @click="getComponent('modelShader')">模型着色</el-button>
            <el-button @click="getComponent('modelShader2')">模型UV着色</el-button>
            <el-button @click="getComponent('modelShader3')">模型贴图非uv着色</el-button> <!--模型材质融合着色-->
            <el-button @click="getComponent('shaderWater')">shader水</el-button>
            <el-button @click="getComponent('shaderMountain')">shader山</el-button>
            <el-button @click="getComponent('shaderTree')">shaderTree</el-button>
            <el-button @click="getComponent('lightShader')">光照shgader</el-button>
            <el-button @click="getComponent('sLightShader')">光照材质特效融合</el-button>
        </div>
        <div class="cmpt">
            <component :is="AsyncComp" ></component>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef, ref} from 'vue'
import { useUserStore,  useAdminStore } from '../../pinia'

const adminStore = useAdminStore()

let AsyncComp:any = shallowRef()
const getComponent = (name:string) =>  {
    AsyncComp.value = defineAsyncComponent(() => new Promise((resolve, reject) =>  setTimeout(() =>  resolve(import(/* @vite-ignore */'./components/'+name+'.vue')), 500)))
    localStorage.setItem('glsl', name)
}
getComponent(localStorage.getItem('glsl') ?? 'shaderWater')

</script>

<style lang="less" scoped>
.box {
    display: grid;
    width: 100%;
    height: 80px;
    grid-template-columns: repeat(8,120px);
    grid-template-rows: repeat(2,1fr);
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