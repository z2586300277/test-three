<template>
    <div ref="threeDom" class="threeDom" @dblclick="modelClick"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted,watch,watchEffect , reactive} from 'vue';
import * as THREE from 'three';
import { 
    shaderSky, floorPlane,setSceneBackground, 
    setControls,getMaterials,objectDragHelper, 
    loadFBX ,setFpsClock, setOutLinePass , setStats,
    getWebGLMouse , clickIntersect,formatVertices, 
    lineGeometry, multShapeGroup, pointsGeometry, multShapePlaneGeometry
} from './threeApi'
import { loadTiles, TilesUpadate, TilesBatchTable}  from './tilesApi'
import { createGUI } from './GUI'

const threeDom = ref()
let viewer:any;
let point_arr:any = ref([])

onMounted(() => viewer = initScene(threeDom.value))
onUnmounted(() =>( viewer.GUI && viewer.GUI.destroy()))

// 模型选中
function modelClick (e: any) {
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {
        const { object, face } = intersect
        viewer.outlinePass.selectedObjects = [object]
        
        // tiles 
        // const tilesBatch = TilesBatchTable(face, object)
        // if ( object && tilesBatch ) object.traverse( (c:any) => c.isMesh && (c.material.uniforms.highlightedBatchId.value = tilesBatch.hoveredBatchid))
    }
}

/* 绘制技术 */
function clickDraw(e: any) {
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {
        const { object, face, point} = intersect
        point_arr.value.push(point)
    }

    // 绘制点线面
    watch(point_arr.value,() => {

        const arr = formatVertices(point_arr.value)

        const points = pointsGeometry(arr)
        const line = lineGeometry(arr)
        const {indexGroup, faceGroup, uvGroup } = multShapeGroup(point_arr.value, 'indexFace', viewer.scene)
        const area = multShapePlaneGeometry(faceGroup,indexGroup, uvGroup)
        area.position.y += 10

        // 生成后 后续直接更新点信息
        viewer.scene.add(points)
        viewer.scene.add(line)
        viewer.scene.add(area)
    })
}



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

    setSceneBackground(scene)

    const floor = floorPlane('http://guangfu/floor.jpg')
    scene.add(floor)

    const GUI = createGUI(THREE,scene,camera,controls)

    loadFBX('http://guangfu/tileset.FBX', (object3d:any) => {
        object3d.rotation.y = (-180 * Math.PI) / 180;
        object3d.position.set(61.59, -6.1, -58.5);
        const folder = GUI.addFolder('模型[' + Date.now() + ']');
        ['x', 'y', 'z'].forEach(i => folder.add(object3d.position, i).min(-50).max(50).name(i + '轴坐标'));
        ['x', 'y', 'z'].forEach(i => folder.add(object3d.scale, i).min(0).max(10).name(i + '缩放'));

        scene.add(object3d)
        objectDragHelper([object3d], camera, renderer, controls)
    })

     loadFBX('http://guangfu/aroundBuilding.FBX',  ((object3d:any) => {
        
        getMaterials(object3d).forEach(i => {
            i.color.set(0xFFFFFF*Math.random())
            i.transparent = true
            i.opacity = 0.25   
        })

        const folder = GUI.addFolder('模型[' + Date.now() + ']');
        ['x', 'y', 'z'].forEach(i => folder.add(object3d.position, i).min(-50).max(50).name(i + '轴坐标'));
                   
        scene.add(object3d)

     }))

    const tilesRenderer = loadTiles(camera,renderer,scene, 'http://guangfu/tileset.json')

    const { Composer, outlinePass } = setOutLinePass(scene, camera, renderer, DOM)

    const stats = setStats()

    const rederFps = setFpsClock(50)
    render()

    function render() {
        rederFps(() => {
           /* 渲染 */
            tilesRenderer && TilesUpadate(tilesRenderer)
            stats && stats.update()
            if(viewer && viewer.outlinePass.selectedObjects.length > 0) Composer.render() 
            else  renderer.render(scene, camera)
            /* 渲染 */
        })   
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