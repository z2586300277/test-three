<template>
    <div ref="threeDom" class="threeDom" @dblclick="modelClick"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted} from 'vue';
import * as THREE from 'three';
import { shaderSky, floorPlane, setControls, loadFBX , setOutLinePass} from './threeApi'
import { loadTiles, TilesUpadate, getWebGLMouse , clickIntersect}  from './tilesApi'
import { createGUI } from './GUI'

const threeDom = ref()
let viewer:any;

onMounted(() => {
  viewer = initScene(threeDom.value)
})

function modelClick (e: any) {
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {
        const { object } = intersect
        viewer.outlinePass.selectedObjects = [object]
        // console.log(viewer)
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
    const sky = shaderSky()
    const sceneTexture = new THREE.CubeTextureLoader()
    .load([
        'http://guangfu//scene/LF.jpg',
        'http://guangfu//scene/RT.jpg',
        'http://guangfu//scene/UP.jpg',
        'http://guangfu//scene/DN.jpg',
        'http://guangfu//scene/FR.jpg',
        'http://guangfu//scene/BK.jpg',
    ]);
    sceneTexture.encoding = THREE.sRGBEncoding;
    scene.background = sceneTexture;

    const floor = floorPlane('http://guangfu/floor.jpg')
    scene.add(floor)

    loadFBX(scene,'http://guangfu/tileset.FBX')

    const tilesRenderer = loadTiles(camera,renderer,scene, 'http://guangfu/tileset.json')

    const GUI = createGUI(THREE,scene,camera,controls)

    const { Composer, outlinePass } = setOutLinePass(scene, camera, renderer, DOM)


    // 创建一个时钟对象Clock
    const clock = new THREE.Clock();
    // 设置渲染频率为30FBS，也就是每秒调用渲染器render方法大约30次
    const FPS = 45;
    const renderT = 1 / FPS; //单位秒  间隔多长时间渲染渲染一次
    // 声明一个变量表示render()函数被多次调用累积时间
    // 如果执行一次renderer.render，timeS重新置0
    let timeS = 0;
    
    render()
    function render() {

        const T = clock.getDelta();
        timeS = timeS + T;
        if (timeS > renderT) {
            // 控制台查看渲染器渲染方法的调用周期，也就是间隔时间是多少
            
            /* 渲染 */
            tilesRenderer && TilesUpadate(tilesRenderer)
            if(viewer && viewer.outlinePass.selectedObjects.length > 0) Composer.render() 
            else  renderer.render(scene, camera)
            /* 渲染 */

            //renderer.render每执行一次，timeS置0
            timeS = 0;
        }
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