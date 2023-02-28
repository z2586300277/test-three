<template>
    <div ref="threeDom" class="threeDom" @dblclick="modelClick"></div>
    <div class="btn">
        <el-button @click="clear">清除点</el-button>
        <el-button @click="setPipe">生成管道</el-button>
        <el-button @click="clearPipe">清除管道</el-button>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted} from 'vue';
import * as THREE from 'three';
import { shaderSky, setFpsClock ,floorPlane,mixerAnimation, createTube, setControls, loadFBX , setOutLinePass , setStats,  getWebGLMouse , clickIntersect,getModelBox} from '../three/threeApi'
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
    clipSpeed: 0.3,
    pipeRadius: 5
}
let MIXER:any

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


function setPipe() {
    PIPE = createTube(
        pointList,
        'https://img0.baidu.com/it/u=2087560284,3492925789&fm=253&fmt=auto&app=138&f=JPEG?w=1023&h=500',
        0.85,
        PIPE_OPTION.pipeRadius
    ) 
    viewer.scene.add(PIPE)
    viewer.outlinePass.selectedObjects = [PIPE]

    console.log(PIPE)

    // 管道动画
    const {clipFace_Way }:any = getModelBox(PIPE);
    
    
    viewer.GUI.add(PIPE_OPTION,'clipSpeed').min(0.01).max(5).name('动画播放速度')
    viewer.GUI.add(PIPE_OPTION,'clipWayName',['y','_y','x','_x','z','_z']).name('动画播放方式').onChange((i:any) => {
        clipFace_Way.reset()
        clipFace_Way[i].clip.constant -= clipFace_Way[i].width
        PIPE_OPTION.clipAnimation = () => {  
            if (clipFace_Way[i].clip.constant + PIPE_OPTION.clipSpeed > clipFace_Way[i].end) PIPE_OPTION.clipAnimation = null
            else clipFace_Way[i].clip.constant += PIPE_OPTION.clipSpeed
        }
     })
     

}


onMounted(() => {
  viewer = initScene(threeDom.value)
})

function modelClick (e: any) {
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {
        const { object, face, point} = intersect
        
        const modelHead = viewer.scene.getObjectByName('G01');
        console.log(modelHead.position)
        var group = new THREE.Group();
        group.add(modelHead);
        viewer.scene.add(group);
        ['x', 'y', 'z'].forEach(i => viewer.GUI.add(group.rotation, i).min(-500).max(500).name(i + '轴坐标'));
        return viewer.outlinePass.selectedObjects = [group]

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
    renderer.setClearColor( 0xf5f5f5 )
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.localClippingEnabled = true;
    // 开启模型对象的局部剪裁平面功能如果不设置为true，设置剪裁平面的模型不会被剪裁
    renderer.localClippingEnabled = true;
    DOM.appendChild(renderer.domElement)
    

    const controls =  setControls(camera, renderer)
    controls.addEventListener('change', () => {
        if(controls.target.y < 0)  controls.target.y = 0
    })

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
        MIXER = mixerAnimation(o)
        MIXER.runAction(MIXER.actions[0], 5).play()
    })
    
    // 后期制作
    const { Composer, outlinePass } = setOutLinePass(scene, camera, renderer, DOM)

    // 帧率显示
    const stats = setStats()

    // 世界坐标
    worldP(scene)
    
    const fpsRender = setFpsClock(60)
    render()

    function render() {
        fpsRender(() => {
            /* 渲染 */
            stats && stats.update()
            MIXER && MIXER.mixerRender()
            PIPE && (PIPE.material.map.offset.x -= 0.01)
            PIPE_OPTION.clipAnimation && PIPE_OPTION.clipAnimation()
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