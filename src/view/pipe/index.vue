<template>
    <div ref="threeDom" class="threeDom" @dblclick="modelClick"></div>
    <div class="btn">
        <el-button @click="clear">清除点</el-button>
        <el-button @click="setPipe">生成管道</el-button>
        <el-button @click="clearPipe">清除管道</el-button>
        <el-button @click="clipPlane">生成切面</el-button>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted} from 'vue';
import * as THREE from 'three';
import { shaderSky, floorPlane, setControls, loadFBX , setOutLinePass , setStats,  getWebGLMouse , clickIntersect,getModelBox} from '../three/threeApi'
import { createGUI } from '../three/GUI'
import { createTube , worldP} from './pipe' 

const threeDom = ref()
let viewer:any;
let pointList:any = []
let cubeArr:Array<any> = []
let PIPE:any

function clear() {
    cubeArr.map((i:any) => viewer.scene.remove(i))
    cubeArr = []
    pointList = []
}

function setPipe() {
    PIPE = createTube(
    pointList,
    'https://img0.baidu.com/it/u=712032368,526149248&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=889',
    0.85
    ) 
    viewer.scene.add(PIPE)
    console.log(PIPE)
    viewer.outlinePass.selectedObjects = [PIPE]
    
}

function clearPipe() {
    viewer.scene.remove(PIPE)
    PIPE = null
}

function clipPlane() {
        // 面裁切
    // Plane作为元素创建数组，Plane的方向法向量、位置根据需要随意定义
    const plane =   new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
    console.log(plane);
    ['x', 'y', 'z'].forEach(i => viewer.GUI.add(plane.normal, i).min(-500).max(500).name(i + '切面法线轴坐标'));
    viewer.GUI.add(plane, 'constant').min(-500).max(500).name('切面位置');
    var PlaneArr = [
        //创建一个垂直x轴的平面，方向沿着x轴负方向，沿着x轴正方向平移20,
        plane
      ,
    ];
    viewer.renderer.localClippingEnabled = true;
    viewer.renderer.clippingPlanes = PlaneArr;

    
    // 通过PlaneHelper辅助可视化显示剪裁平面Plane
    var helper = new THREE.PlaneHelper(PlaneArr[0], 300, 0xffff00);
    viewer.scene.add(helper);

}

onMounted(() => {
  viewer = initScene(threeDom.value)
})

function modelClick (e: any) {
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {
        const { object, face, point} = intersect
        const box= getModelBox(object, viewer.scene);
        console.log(box);
      
        return viewer.outlinePass.selectedObjects = [object]
        const g = new THREE.BoxGeometry(10,10,10)
        const m = new THREE.MeshBasicMaterial({ color: 'red'})
        const mesh = new THREE.Mesh(g , m)
        mesh.position.set(...point)

        pointList.push(point)
        cubeArr.push(mesh)

        viewer.scene.add(mesh)  
      
    }
}


onUnmounted(() =>( viewer.GUI && viewer.GUI.destroy()))

function initScene(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.001, 100000)
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
    renderer.setClearColor( 0x000000 )
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)
    

    const controls =  setControls(camera, renderer)
    controls.addEventListener('change', () => {
        if(controls.target.y < 0)  controls.target.y = 0
    })

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI:any = createGUI(THREE,scene,camera,controls)

    loadFBX('http://guangfu/pipe.FBX', (o:any) => {
        const folder = GUI.addFolder('模型[' + Date.now() + ']');
        ['x', 'y', 'z'].forEach(i => folder.add(o.position, i).min(-500).max(500).name(i + '轴坐标'));
        ['x', 'y', 'z'].forEach(i => folder.add(o.scale, i).min(0).max(10).name(i + '缩放'));
        scene.add(o)
    })
  
    const { Composer, outlinePass } = setOutLinePass(scene, camera, renderer, DOM)

    const stats = setStats()

    // 世界坐标
    worldP(scene)



    // 开启模型对象的局部剪裁平面功能
    // 如果不设置为true，设置剪裁平面的模型不会被剪裁
    renderer.localClippingEnabled = true;
    
    render()
    function render() {
        /* 渲染 */
        stats && stats.update()
        PIPE && (PIPE.material.map.offset.x -= 0.01)
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
.btn{
    position: absolute;
    right: 50px;
    top: 500px;
}
</style>