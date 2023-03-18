<template>
    <div ref="threeDom" class="threeDom" @mousedown.prevent.stop="modelClick" @mousemove="pointMove"></div>
    <div class="btn">
        <div><el-button @click="clear">清除点</el-button></div>
        <div><el-button @click="setCurve(CURVE)">根据曲线生成管道</el-button></div>
        <div> <el-button @click="stop=!stop">暂停</el-button></div>
        <div><el-button @click="closeDraw=false">绘制/继续绘制</el-button></div>
        <div><el-button @click="angleViewControls(viewer.controls)">偏移</el-button></div>
        <div><el-button @click="actionStop">动画停止</el-button></div>
        <div><el-button @click="reAction">重播</el-button></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, onActivated, onDeactivated} from 'vue';
import * as THREE from 'three';
import { shaderSky, setFpsClock , createTexture,createLine, loadGltf, curveMove,angleViewControls,modelReverse,floorPlane,mixerAnimation, doublePointOffsetRotate,pointCube, createTube,createCurve, setControls, loadFBX , setOutLinePass , setStats,  getWebGLMouse , clickIntersect,getModelBox} from '../three/threeApi'
import { createGUI } from '../three/GUI'

const threeDom = ref()
let viewer:any;
let pointList:any = []
let cubeArr:Array<any> = []
let PIPE_ARR:any = [null,null,null]
let PIPE_OPTION:any = {
    clipSpeed: 0.006,
    pipeRadius: 8
}

let MIXER:any
let curveMoveAnimation:any
let pipeHead:any

const stop = ref(false)

onMounted(() =>  viewer = initScene(threeDom.value))
onUnmounted(() =>( viewer.GUI && viewer.GUI.destroy()))
onActivated(() => { viewer.GUI.domElement.hidden = false })
onDeactivated(() => viewer.GUI.domElement.hidden = true)

function actionStop() {
    MIXER.Now.time = 0.2
    MIXER.Now.paused = true
}
function reAction() {
    pipeHead.position.set(...pointList[0])
    PIPE_ARR.map((i:any) => viewer.scene.remove(i))
    PIPE_ARR = [null,null,null]
    setCurve(CURVE)
}

// 清除点
function clear() {
    cubeArr.map((i:any) => viewer.scene.remove(i))
    cubeArr = []
    pointList = []
}



function setCurve(curve:any) {

    viewer.outlinePass.selectedObjects = [pipeHead]
    pipeHead.position.set(...pointList.at(0))

    /* 第一根管道 */
    PIPE_ARR[0] = createTube(curve, 'https://img2.baidu.com/it/u=2867681562,1586644503&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1677862800&t=ca5f653200ddc4f64f164b75d22b44c2', 0.85, PIPE_OPTION.pipeRadius / 4)
    PIPE_ARR[0].material = viewer.scene.getObjectByName('G033').material.clone()
    viewer.scene.add(PIPE_ARR[0])
    const pipeClip0 = getModelBox(PIPE_ARR[0]); // 生成管道切割动画控制器
    pipeClip0.clipFace_Way['_x'].clip.constant -= pipeClip0.clipFace_Way['_x'].width
    
    /* 第一次动画组合 */
    curveMoveAnimation = curveMove(curve, pipeHead, PIPE_OPTION.clipSpeed, 'go',
        // 执行中
        (mesh: any, p: any) => {
            const diff_x = p.x - mesh.position.x
            pipeClip0.clipFace_Way['_x'].clip.constant += diff_x 
            mesh.rotation.x += 1
            mesh.lookAt(p)

        },
        function () {

            /* 第二根管道 */
            PIPE_ARR[1] = createTube(curve, 'https://img1.baidu.com/it/u=543378194,3252169155&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1677862800&t=b08f53a622ceb0c466234f3aff61a379', 1, PIPE_OPTION.pipeRadius)
            PIPE_ARR[1].material = viewer.scene.getObjectByName('Object023').material.clone()
            viewer.scene.add(PIPE_ARR[1])
            const pipeClip1 = getModelBox(PIPE_ARR[1]);
            pipeClip1.clipFace_Way['z'].clip.constant -= pipeClip1.clipFace_Way['z'].width / 5
            pipeClip1.clipFace_Way['x'].clip.constant -= pipeClip1.clipFace_Way['x'].width

            /* 第二次组合动画 */
            curveMoveAnimation = curveMove(curve, pipeHead, PIPE_OPTION.clipSpeed, 'back', (mesh: any, p: any) => {
                const diff_x = p.x - mesh.position.x
                pipeClip1.clipFace_Way['x'].clip.constant -= diff_x
                mesh.lookAt(p)
            }, function () {
                
                /* 第三根管道 */
                PIPE_ARR[2] = createTube(curve, 'https://img1.baidu.com/it/u=2858466579,1111354287&fm=253&fmt=auto&app=138&f=JPEG?w=499&h=375', 1, PIPE_OPTION.pipeRadius / 2.5)
                PIPE_ARR[2].material = viewer.scene.getObjectByName('Object041').material.clone()
                viewer.scene.add(PIPE_ARR[2])
                const pipeClip2 = getModelBox(PIPE_ARR[2]);

                /* 第三次动画 */
                curveMoveAnimation = curveMove(curve, pipeHead, PIPE_OPTION.clipSpeed, 'back', (mesh: any, p: any) => {
                    const diff_x = p.x - mesh.position.x
                    pipeClip2.clipFace_Way['x'].clip.constant -= diff_x
                    mesh.lookAt(p)
                }, function () {
                    curveMoveAnimation = null
                }
                )


            })


        }
    )

}


// 生成曲线
let CURVE:any
let line:any = null 
let closeDraw = true;
function modelClick (e: any) {
    if(closeDraw) return
    if(e.button === 2)  return closeDraw = true
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {
        const { object, face, point} = intersect
        point.z += PIPE_OPTION.pipeRadius
        // 增加点
        const pointMesh = pointCube(point)
        viewer.scene.add(pointMesh)  

        // 钻头
        pipeHead.lookAt(point)
        pipeHead.position.copy(point)
        

        pointList.push(point)
        cubeArr.push(pointMesh)

    }
}


function pointMove(e:any) {
    if (closeDraw && pointList.length>1) {
        CURVE = createCurve(pointList)
        line.geometry.setFromPoints(CURVE.getPoints(100))
        return
    }
    
    const webGLMosue = getWebGLMouse(e)
    const intersect = clickIntersect(webGLMosue,viewer.camera, viewer.scene);
    if(intersect) {

        const { point} = intersect
        point.z += PIPE_OPTION.pipeRadius

        if (pointList.length < 1) return
        const curve = createCurve([...pointList, point])
        const points = curve.getPoints(100); 
        
        // 线条创建或者更新
        if(!line) {
            line = createLine(points,'white', 50)
            viewer.scene.add(line)
        }
        else line.geometry.setFromPoints(points)
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
    renderer.gammaInput  = true; // 伽马校正
    renderer.gammaOutput = true; // 伽马校正
    renderer.gammaFactor = 2.2; //伽马校正
    renderer.autoClear = true;
    renderer.setClearColor( 0xffffff )
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.localClippingEnabled = true; // 剪裁
    DOM.appendChild(renderer.domElement)
    
    const controls =  setControls(camera, renderer)
    controls.addEventListener('change', () => (controls.target.y < 0) && (controls.target.y = 0))   

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI:any = createGUI(THREE,scene,camera,controls)
    GUI.add(PIPE_OPTION,'pipeRadius').min(1).max(30).name('管子大小')
    GUI.add(PIPE_OPTION,'clipSpeed').min(0.0001).max(0.01).name('速度')

    // 模型加载
    loadFBX('http://guangfu/zlcky/zlcky.FBX', (o:any) => {
        const folder = GUI.addFolder('模型[' + Date.now() + ']');
        ['x', 'y', 'z'].forEach(i => folder.add(o.position, i).min(-500).max(500).name(i + '轴坐标'));
        ['x', 'y', 'z'].forEach(i => folder.add(o.scale, i).min(0).max(10).name(i + '缩放'));
        scene.add(o)

        // 模型动画
        MIXER = mixerAnimation(o)
        MIXER.runAction(MIXER.actions[0], 8)
        MIXER.Now = MIXER.runAction(MIXER.actions[0], 8)
        MIXER.Now.play()
    })

    loadGltf('http://guangfu/car.gltf', (o:any) => {
        pipeHead = o;
        o.scale.set(100, 100 , 100);
        scene.add(o)
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
            stats && stats.update() // fps 
            MIXER && MIXER.mixerRender() // 模型动画
            !stop.value && curveMoveAnimation && curveMoveAnimation()  // 曲线动画
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
    width: 100%;
    height: 100%;
    margin: auto;
}
.btn{
    position: absolute;
    right: 50px;
    top: 500px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
}
</style>