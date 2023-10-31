<template>
    <div id="threeBox0" class="threeBox"></div>
    <div id="threeBox1" class="threeBox"></div>
    <div id="threeBox2" class="threeBox"></div>
    <div id="threeBox3" class="threeBox"></div>
</template>

<script  setup>
import {onMounted} from 'vue'
import {ThreeSceneEditor} from '@gdmp/three-scene-editor-pro'



onMounted(() => {

    const option = {
    threeBoxRef: document.getElementById('threeBox0'),
    rendererParams: {
        fps: 60,
        pixelRatio: window.devicePixelRatio * 1.5,
        webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer: true },
        userPermissions: { autoPlace: true, proxy: false }
    }
}
    const threeSceneEditor = new ThreeSceneEditor(option)
})




</script>

<style lang="less" scoped>
.threeBox {
    width: 200px;
    height: 200px;
    background-color: #000;
}

</style>