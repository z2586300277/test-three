<template>
    <div v-loading="loading" class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted} from 'vue';
import { setControls , loadFBX, loaderManager} from '../three/threeApi';
import { createGUI } from '../three/GUI'

const threeBox = ref()
const loading = ref(true)
onMounted(() => init(threeBox.value))

function init(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true, logarithmicDepthBuffer: true  })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.setClearColor( 0x000000 )
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)

    const controls =  setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    createGUI(THREE,scene,camera,controls)

    const manager = loaderManager()

    manager.onProgress = (u:any,i:any,t:any) => (i/t ===1)?loading.value = false : null;
    
    loadFBX('http://guangfu/shexian/shexian.FBX', (o:any) => {
           scene.add(o)
    },manager)

    render()
    function render() {
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
}
</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
</style>