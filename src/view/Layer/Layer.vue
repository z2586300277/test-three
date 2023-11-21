<template>
    <div class="btn">
        <el-input  v-model="value"  />

        <div>
            <el-button @click="() => camera.layers.enable(value)">camera 增加与此图层联系</el-button>
            <el-button @click="() => camera.layers.disable(value)"> camera 取消与此图层联系</el-button>
            <el-button @click="() => camera.layers.toggle(value)">camera 切换与此图层的联系  有/无</el-button> 
            <el-button @click="() => camera.layers.set(value)"> camera 只与此图层联系</el-button>
            <el-button @click="() => camera.layers.enableAll()"> camera 与所有图层联系</el-button>
            <el-button @click="() => camera.layers.disableAll()"> camera 取消所有图层联系</el-button>
        </div>

        <div>
            <el-button @click="() => box.layers.enable(value)">box 增加与此图层联系</el-button>
            <el-button @click="() => box.layers.disable(value)"> box 取消与此图层联系</el-button>
            <el-button @click="() => box.layers.toggle(value)">box 切换与此图层的联系  有/无</el-button> 
            <el-button @click="() => box.layers.set(value)"> box 只与此图层联系</el-button>
            <el-button @click="() => box.layers.enableAll()"> box 与所有图层联系</el-button>
            <el-button @click="() => box.layers.disableAll()"> box 取消所有图层联系</el-button>
        </div>

        <div>
            <el-button @click="() => light.layers.enable(value)">light 增加与此图层联系</el-button>
            <el-button @click="() => light.layers.disable(value)"> light 取消与此图层联系</el-button>
            <el-button @click="() => light.layers.toggle(value)">light 切换与此图层的联系  有/无</el-button> 
            <el-button @click="() => light.layers.set(value)"> light 只与此图层联系</el-button>
            <el-button @click="() => light.layers.enableAll()"> light 与所有图层联系</el-button>
            <el-button @click="() => light.layers.disableAll()"> light 取消所有图层联系</el-button>
        </div>
    </div>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted, onActivated, onDeactivated} from 'vue';
import { setControls , loadFBX, loaderManager ,getMaterials} from '../three/threeApi';
import { createGUI } from '../three/GUI'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { MaskPass, ClearMaskPass } from 'three/examples/jsm/postprocessing/MaskPass.js';

const threeBox = ref()
const loading = ref(true)
const value = ref(0)
let camera
let box
let light 

onMounted(() => {
    let r = init(threeBox.value)
    camera = r.camera
    box = r.box
    light = r.light
})

function init(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)

    camera.position.set(0,0,10)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true, logarithmicDepthBuffer: true  })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.setClearColor( 0x000000 )
    DOM.appendChild(renderer.domElement)
    renderer.autoClear = false;
    const controls =  setControls(camera, renderer)
    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)

    const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'yellow'}))
    scene.add(box)

    const box1 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'Cyan'}))
    box1.position.set(0,2,0)
    box1.layers.set(1)
    scene.add(box1)

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'blue'}))
    box2.position.set(2,0,0)
    box2.layers.set(2)
    scene.add(box2)

    const box3 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'red'}))
    box3.position.set(0,0,2)
    box3.layers.set(3)
    scene.add(box3)
    
    const loader = new FontLoader();
    loader.load( '/font.json', function ( font ) {

        const geometry = new TextGeometry( 'Layers', {
            font,
            size: 1,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,                                                                                
            bevelThickness: 0,
            bevelSize: 0,
            bevelSegments: 5
        } )
        const text = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color:'pink'}))
        text.position.set(0,-2,0)

        scene.add(text)

    })

    const renderPass = new RenderPass(scene, camera);


    var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),1.5,0, 0);
    bloomPass.renderToScreen = true;

    // 创建一个用于 测试检测 物体图层位置的对象
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(1);

    const clearMask = new ClearMaskPass();

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);


    render()
    function render() {
    

    composer.render();
 
 
    camera.layers.set(0);
    renderer.render(scene, camera);
        threeBox.value &&  requestAnimationFrame(render)
    }

    return { camera, box, light }
}
</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
.btn {
    position: absolute;
    left: 50vw;
    z-index: 100;
}
</style>