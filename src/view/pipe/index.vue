<template>
    <div ref="threeDom" class="threeDom" @dblclick="modelClick"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted} from 'vue';
import * as THREE from 'three';
import { shaderSky, floorPlane, setControls, loadFBX , setOutLinePass , setStats,  getWebGLMouse , clickIntersect,} from '../three/threeApi'
import { createGUI } from '../three/GUI'

const threeDom = ref()
let viewer:any;

onMounted(() => {
  viewer = initScene(threeDom.value)
})

function modelClick (e: any) {
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {
        const { object, face } = intersect
        viewer.outlinePass.selectedObjects = [object]
    }
}

onUnmounted(() =>( viewer.GUI && viewer.GUI.destroy()))

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
    controls.addEventListener('change', () => {
        if(controls.target.y < 0)  controls.target.y = 0
    })



    const GUI = createGUI(THREE,scene,camera,controls)

    loadFBX('http://guangfu/pipe.FBX', (o:any) => scene.add(o))


    const { Composer, outlinePass } = setOutLinePass(scene, camera, renderer, DOM)

    const stats = setStats()
    
    render()
    function render() {
        /* 渲染 */
        stats && stats.update()
        if(viewer && viewer.outlinePass.selectedObjects.length > 0) Composer.render() 
        else  renderer.render(scene, camera)
        /* 渲染 */
        requestAnimationFrame(render)
     
    } 

    window.onresize = () => {
        camera.aspect = DOM.clientWidth / DOM.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    }

    return { scene, camera, renderer, controls, GUI , outlinePass}

}
</script>

<style lang="less" scoped>
.threeDom {
    width: 100vw;
    height: 100vh;
    margin: auto;
}
</style>