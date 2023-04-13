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
            <el-button @click="getComponent('modelShader')">无贴图shader模型uv着色1</el-button>
            <el-button @click="getComponent('modelShader2')">无贴图shader模型uv着色2</el-button>
            <el-button @click="getComponent('modelShader3')">模型贴图和shader非uv着色</el-button> <!--模型材质融合着色无法对应光照-->
            <el-button @click="getComponent('modelShaderLight')">原材质+特效+光照着色无uv</el-button><!--模型材质融合着色+光照-->
            <el-button @click="getComponent('modelShaderLightUv')">原材质+特效+光照着色带uv</el-button><!--模型材质融合着色+光照 + uv-->
            <el-button @click="getComponent('modelShaderLightUvClick')">块模型加特效</el-button><!--一块模型材质融合着色+光照 + uv-->
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
    grid-template-columns: repeat(8,170px);
    grid-template-rows: repeat(3,1fr);
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