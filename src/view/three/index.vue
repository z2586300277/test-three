<template>
    <div ref="threeDom" class="threeDom"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted} from 'vue';
import * as THREE from 'three';
import { shaderSky, floorPlane, setControls, loadFBX} from './threeApi'
import { loadTiles, TilesUpadate }  from './tilesApi'
import { createGUI } from './GUI'

const threeDom = ref()
let DatGUI:any;
onMounted(() => {
 const { GUI } = initScene(threeDom.value)
 DatGUI = GUI
})

onUnmounted(() =>( DatGUI && DatGUI.destroy()))

function initScene(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
        antialias:true,
        alpha: true,
        logarithmicDepthBuffer: true
    })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor( 0xf5f5f6 )
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)

    const controls =  setControls(camera, renderer)

    const sky = shaderSky()
    scene.add(sky)

    const floor = floorPlane('http://guangfu/floor.jpg')
    scene.add(floor)

    loadFBX(scene,'http://guangfu/tileset.FBX')

    const tilesRenderer = loadTiles(camera,renderer,scene, 'http://guangfu/tileset.json')

    const GUI = createGUI(THREE,scene,camera,controls)
    
    render()
    function render() {
        tilesRenderer && TilesUpadate(tilesRenderer)
        renderer.render(scene, camera)
        requestAnimationFrame(render)
    } 

    window.onresize = () => {
        camera.aspect = DOM.clientWidth / DOM.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    }

    return { scene, camera, renderer, controls, GUI }

}
</script>

<style lang="less" scoped>
.threeDom {
    width: 100vw;
    height: 100vh;
}
</style>