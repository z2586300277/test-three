<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted, onActivated, onDeactivated} from 'vue';
import { setControls , setStats, setFpsClock , setOutLinePass, getWebGLMouse, clickIntersect,pointCube} from '../three/threeApi';
import { createGUI } from '../three/GUI' 
import { loadTiles, TilesUpadate, TilesBatchTable}  from '../three/tilesApi'

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
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)

    const controls =  setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI = createGUI(THREE,scene,camera,controls)
    onActivated(() => GUI.domElement.hidden = false )
    onDeactivated(() =>GUI.domElement.hidden = true)
    onUnmounted(() => GUI.destroy())

    const tilesRenderer = loadTiles(camera,renderer, 'http://guangfu/tileset.json',(object3d:any) => scene.add(object3d),DOM) 

    const { Composer, outlinePass } = setOutLinePass(scene, camera, renderer, DOM)

    const stats = setStats()

    const rederFps = setFpsClock(50)

    render()

    DOM.addEventListener('dblclick', modelClick)

    let lastModel:any = null
    // 模型选中
    function modelClick (e: any) {
        const webGLMosue = getWebGLMouse(e)
        const intersect = clickIntersect(webGLMosue,camera,scene);
        if(intersect) {
            const { object, face } = intersect
            // outlinePass.selectedObjects = [object]
            
            // tiles 
            const tilesBatch = TilesBatchTable(face, object)
            if ( object && tilesBatch ){

                // 旧的物体着色器数值重置
                if(lastModel) {
                    lastModel.uniformHigh.highlightedBatchId.value = -1
                    lastModel.uniformHigh.time.value = 0.1
                }
                object.uniformHigh.highlightedBatchId.value =  tilesBatch.hoveredBatchid
                lastModel = object
            }
        }
    }

    function render() {
        rederFps(() => {
            stats && stats.update()
            tilesRenderer && TilesUpadate(tilesRenderer)
            lastModel && (lastModel.uniformHigh.time.value +=0.1)
            renderer.render(scene,camera)
            if(outlinePass.selectedObjects.length > 0) Composer.render() 
            else  renderer.render(scene, camera)
        })
       
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