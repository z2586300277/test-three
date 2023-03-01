<template>
    <div ref="threeDom" class="threeDom" @dblclick="modelClick"></div>
    <div class="btn">
        <el-button @click="clear">清除点</el-button>
        <el-button @click="setCurve">生成管道</el-button>
        <el-button @click="clearPipe">清除管道</el-button>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted} from 'vue';
import * as THREE from 'three';
import { shaderSky, setFpsClock ,curveMove,floorPlane,mixerAnimation, pointCube, createTube,createCurve, setControls, loadFBX , setOutLinePass , setStats,  getWebGLMouse , clickIntersect,getModelBox} from '../three/threeApi'
import { createGUI } from '../three/GUI'
import { worldP} from './pipe' 

const threeDom = ref()
let viewer:any;
let pointList:any = []
let cubeArr:Array<any> = []
let PIPE:any
let PIPE_OPTION:any = {
    clipWayName: '',
    clipAnimation: null,
    clipSpeed: 0.8,
    pipeRadius: 5
}
let MIXER:any
let curveMoveAnimation:any

onMounted(() =>  viewer = initScene(threeDom.value))

onUnmounted(() =>( viewer.GUI && viewer.GUI.destroy()))

// 清除点
function clear() {
    cubeArr.map((i:any) => viewer.scene.remove(i))
    cubeArr = []
    pointList = []
}
// 清除管子
function clearPipe() {
    viewer.scene.remove(PIPE)
    PIPE = null
}



function setCurve() {

    // 生成曲线
    const curve = createCurve(pointList);

    // 生成管道
    PIPE = createTube(curve, 'https://img0.baidu.com/it/u=2087560284,3492925789&fm=253&fmt=auto&app=138&f=JPEG?w=1023&h=500', 0.85,PIPE_OPTION.pipeRadius ) 
    viewer.scene.add(PIPE)
    
    // 生成管道动画 
    const {clipFace_Way, pipeAnimation}:any = getModelBox(PIPE);
    clipFace_Way['x'].clip.constant -= clipFace_Way['x'].width
    viewer.outlinePass.selectedObjects = [PIPE]
6
    // 曲线路径运动
    const cube = pointCube([0,0,0], 20, 'blue')
    viewer.scene.add(cube)

    // 正向操作
    curveMoveAnimation = curveMove(curve, cube, 0.01,() => {

        // 执行反操作
        curveMoveAnimation = curveMove(curve, cube, 0.01,() => {

            curveMoveAnimation = null
            
            // 创建动画
            PIPE_OPTION.clipAnimation = pipeAnimation('_x')

            viewer.GUI.add(PIPE_OPTION,'clipSpeed').min(0.01).max(5).name('动画播放速度')
            viewer.GUI.add(PIPE_OPTION,'clipWayName',['y','_y','x','_x','z','_z']).name('动画播放方式').onChange((i:any) =>(PIPE_OPTION.clipAnimation = pipeAnimation('_x')))

        }, 'back')

    }, 'go')

}

function modelClick (e: any) {
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {
        const { object, face, point} = intersect

        // 增加点
        const pointMesh = pointCube(point)
        viewer.scene.add(pointMesh)  

        pointList.push(point)
        cubeArr.push(pointMesh)

    }
}

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
    renderer.localClippingEnabled = true;
    renderer.localClippingEnabled = true; // 剪裁
    DOM.appendChild(renderer.domElement)
    
    const controls =  setControls(camera, renderer)
    controls.addEventListener('change', () => (controls.target.y < 0) && (controls.target.y = 0))   

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI:any = createGUI(THREE,scene,camera,controls)
    GUI.add(PIPE_OPTION,'pipeRadius').min(1).max(30).name('管子大小')

    // 模型加载
    loadFBX('http://guangfu/chuankuayue.FBX', (o:any) => {
        const folder = GUI.addFolder('模型[' + Date.now() + ']');
        ['x', 'y', 'z'].forEach(i => folder.add(o.position, i).min(-500).max(500).name(i + '轴坐标'));
        ['x', 'y', 'z'].forEach(i => folder.add(o.scale, i).min(0).max(10).name(i + '缩放'));
        scene.add(o)

        // 模型动画
        // MIXER = mixerAnimation(o)
        // MIXER.runAction(MIXER.actions[0], 5).play()
    })
    
    // 后期制作
    const { Composer, outlinePass } = setOutLinePass(scene, camera, renderer, DOM)

    // 帧率显示
    const stats = setStats()

    const fpsRender = setFpsClock(60)
    render()

    function render() {
        fpsRender(() => {
            /* 渲染 */
            stats && stats.update()
            MIXER && MIXER.mixerRender()
            PIPE && (PIPE.material.map.offset.x -= 0.01)
            curveMoveAnimation && curveMoveAnimation()
            PIPE_OPTION.clipAnimation && PIPE_OPTION.clipAnimation(PIPE_OPTION.clipSpeed, () => PIPE_OPTION.clipAnimation = null)
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
.btn{
    position: absolute;
    right: 50px;
    top: 500px;
}
</style>