<template>
    <div ref="threeDom" class="threeDom" ></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted,watch,watchEffect , reactive,onActivated,onDeactivated } from 'vue';
import * as THREE from 'three';
import { 
    shaderSky, floorPlane,setSceneBackground, 
    setControls,getMaterials,objectDragHelper, 
    loadFBX ,setFpsClock, setOutLinePass , setStats,
    getWebGLMouse , clickIntersect,formatVertices, 
    setPointsLineFaceGeometry,transFormControls,loadHDRTexture,loadEXRTexture,loadGltf
} from '../three/threeApi'
import { loadTiles, TilesUpadate, TilesBatchTable}  from '../three/tilesApi'
import { createGUI } from '../three/GUI'

onMounted(() => viewer = initScene(threeDom.value))
onUnmounted(() =>( viewer.GUI && viewer.GUI.destroy()))
onActivated(() => { viewer.GUI.domElement.hidden = false })
onDeactivated(() => viewer.GUI.domElement.hidden = true)

const threeDom = ref()
let viewer:any;



function initScene(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true, logarithmicDepthBuffer: true  })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor( 0xf5f5f6 )
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)

    const controls =  setControls(camera, renderer)
    controls.addEventListener('change', () => (controls.target.y < 0)? controls.target.y = 0 : false)

    const sceneTexture = setSceneBackground(scene)
    const texture = new THREE.TextureLoader().load( 'https://img1.baidu.com/it/u=422078137,1307526884&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1684602000&t=0fca7d998a168e3581f32153d8eb55e7' )
    texture.mapping = THREE.EquirectangularReflectionMapping;
    const hdrTexture = loadHDRTexture('/envMap/env.hdr',renderer)
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    const exrTexture = loadEXRTexture('/envMap/env.exr',renderer)
    

    // 环境贴图物体
    const geometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff, map: null } );
    material.needsUpdate = true
    const cube = new THREE.Mesh( geometry, material );
    cube.position.set(0,1500,0)
    scene.add( cube );

    const GUI = createGUI(THREE,scene,camera,controls)

    GUI.add({name:'种类'},'name', ['立体', '普通单张', 'hdr单张', 'exr单张']).onChange((v:any) => {
        env(v)
    })

    let materials:any = []
    loadFBX('http://guangfu/zlcky/zlcky.FBX',  ((object3d:any) => {
        scene.add(object3d)
        materials = getMaterials(object3d)
        env('普通单张')
    }))

    // loadGltf('http://guangfu/resource/test/树测试.glb', (o:any) => {
    //     scene.add(o)
    //     materials = getMaterials(o)
    //     env('普通单张')
    // })

    function env(v:any) {
        if(v=== '立体') {
          material.envMap = sceneTexture
          materials.forEach((i:any) => i.envMap = sceneTexture)
       }
       else if (v==='普通单张') {
            material.envMap = texture
            materials.forEach((i:any) => i.envMap = texture)
       }
       else if (v==='hdr单张'){
            
            material.envMap =  hdrTexture
            materials.forEach((i:any) => i.envMap = hdrTexture)
       }
       else if (v==='exr单张'){
            material.envMap =  exrTexture
            materials.forEach((i:any) => i.envMap = exrTexture)
            
       }
    }

    const stats = setStats()

    const rederFps = setFpsClock(50)
    render()

    function render() {
        rederFps(() => {
           /* 渲染 */
            stats && stats.update()
            renderer.render(scene, camera)
            /* 渲染 */
        })   
        threeDom.value && requestAnimationFrame(render)
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
    width: 100%;
    height: 100%;
    
}
</style>