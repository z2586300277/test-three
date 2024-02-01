<template>
    <el-button class="btn" @click="change">切换场景</el-button>
    <div class='tre'>
        <div ref="threeBox0" class="threeBox"></div>
    </div>
</template>

<script lang="ts" setup>
import {onMounted,ref} from 'vue'
import {ThreeSceneEditor} from '@gdmp/three-scene-editor-pro'
import s1 from './a.json'
import s2 from './b.json'
const show = ref(false)
const threeBox0 = ref()

let renderInnerHtml1 = ''
let renderInnerHtml2 = ''

function change(){

    show.value = !show.value

    if(show.value){
        renderInnerHtml1 = threeBox0.value.innerHTML
        threeBox0.value.innerHTML = ''
        
    } 

        
}

function setScene(DOM:any, i:any) {
    const { sceneParams, meshListParams, skyParams } = i
    return new ThreeSceneEditor({
        threeBoxRef: DOM.value,
        rendererParams: {
            fps: 60,
            pixelRatio: window.devicePixelRatio * 1.5,
            webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer: true },
            userPermissions: { autoPlace: false, proxy: false }
        },
        sceneParams,
        meshListParams,
        skyParams,
    })
}
onMounted(() => {
     setScene(threeBox0, s1)
     
})

</script>

<style lang="less" scoped>
.btn {
    position: absolute;
    left: 200px;
    z-index: 999;
}
.tre {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.threeBox {
  width: 100%;
    height: 100%;
}

</style>