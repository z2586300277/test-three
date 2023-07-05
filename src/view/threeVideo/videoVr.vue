<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted, onActivated, onDeactivated} from 'vue';
import { setControls , loadFBX, loaderManager ,getMaterials} from '../three/threeApi';
import { createGUI } from '../three/GUI'

const threeBox = ref()
onMounted(() => init(threeBox.value))

function init(DOM:any) {

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true, logarithmicDepthBuffer: true  })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)

    const controls =  setControls(camera, renderer)
    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI:any = createGUI(THREE,scene,camera,controls)
    onActivated(() => GUI.domElement.hidden = false )
    onDeactivated(() =>GUI.domElement.hidden = true)
    onUnmounted(() => GUI.destroy())

    render()
    function render() {
        renderer.render(scene,camera)
        threeBox.value &&  requestAnimationFrame(render)
    }

}
</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
</style>