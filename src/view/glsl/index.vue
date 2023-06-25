<template>
    <div class="flex">
        <div class="box" v-if="adminStore.$state.power">
            <el-button plain  @click="getComponent('point')">原生webgl</el-button>
            <el-button plain  @click="getComponent('shaderSky')">shader天空</el-button>
            <el-button plain  @click="getComponent('shader1')">shader闪烁案例</el-button>
            <el-button plain  @click="getComponent('shader2')">shader色元</el-button>
            <el-button plain  @click="getComponent('shader3')">平面+四方波shader</el-button>
            <el-button plain  @click="getComponent('shaderWater')">正方体+UV+水shader</el-button>
            <el-button plain  @click="getComponent('shaderMountain')">正方体+UV+山shader</el-button>
            <el-button plain  @click="getComponent('shaderTree')">正方体+UV+树shader</el-button>
            <el-button plain  @click="getComponent('textureWithShader')">两面shader+4面贴图</el-button>
            <el-button plain  @click="getComponent('textureSpecialShader')">贴图和shaer特效融合</el-button> 
            <el-button plain  @click="getComponent('lightMoveShader')">模型扫光</el-button> 
            <el-button plain  @click="getComponent('modelShader')">模型+着色+非光照+UV案例1</el-button>
            <el-button plain  @click="getComponent('modelShader2')">模型+着色+非光照+UV案例2</el-button>
            <el-button plain  @click="getComponent('modelShader3')">模型贴图+着色+非光照+无UV</el-button> <!--模型材质融合着色无法对应光照-->
            <el-button plain  @click="getComponent('lightShader')">光照+shader贴图</el-button>
            <el-button plain  @click="getComponent('lightSpecialShader')">光照+shader贴图+着色</el-button>
            <el-button plain  @click="getComponent('modelShaderLight')">模型贴图+着色+光照+无UV</el-button><!--模型材质融合着色+光照-->
            <el-button plain  @click="getComponent('modelShaderLightUv')">模型贴图+着色+光照+UV</el-button><!--模型材质融合着色+光照 + uv-->
            <el-button plain  @click="getComponent('modelShaderLightUvClick')">块+模型贴图+着色+光照+UV</el-button><!--一块模型材质融合着色+光照 + uv-->
            <el-button plain  @click="getComponent('customBlendShader')">特效多种函数混合着色</el-button>
            <el-button plain  @click="getComponent('customBlendVideoShader')">特效视频混合着色</el-button>
            <el-button plain  @click="getComponent('shaderFence')">围栏效果</el-button>
            <el-button plain  @click="getComponent('flyLine')">飞线</el-button>
        </div>
        <div class="cmpt">
            <component :is="AsyncComp" ></component>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, shallowRef, ref} from 'vue'
import { useUserStore,  useAdminStore } from '../../pinia'
import { ElMessage } from 'element-plus'

const adminStore = useAdminStore()

let AsyncComp:any = shallowRef()
const getComponent = (name:string) =>  {
    ElMessage(name)
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
    grid-template-columns: repeat(6,200px);
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