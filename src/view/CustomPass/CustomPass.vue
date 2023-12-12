<template>
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
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const threeBox = ref()
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
    renderer.setClearColor( 0xffffff )
    DOM.appendChild(renderer.domElement)
    renderer.autoClear = false;
    const controls =  setControls(camera, renderer)
    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)

    const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'yellow'}))
    scene.add(box)


    const renderPass = new RenderPass(scene, camera);

    var bloomPass = new ShaderPass({
    name: 'ScreenBlackMaskShader',
    uniforms: {
        tDiffuse: { value: null },
        opacity: { value: 1.0 },
    },
    vertexShader: /* glsl */ `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

    fragmentShader: /* glsl */ `
		uniform float opacity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
		void main() {
        float R = 0.2;
        // 阴影颜色
        vec3 maskColor = vec3(0.5, 0.5, 0.5);
                vec4 texel = texture2D( tDiffuse, vUv );
        // 距离中心的距离
        float dist = sqrt((vUv.x-0.5)*(vUv.x-0.5)+(vUv.y-0.5)*(vUv.y-0.5));
        // 渐变, sr 是开始黑色参数
        float sr = 1.2;
        float rr = (sr - smoothstep(R, R + 0.5, dist));
        // 叠加黑色
        texel *= vec4(maskColor * rr, 1.0);
        gl_FragColor = opacity * texel;
		}`,
});

    // 创建一个用于 测试检测 物体图层位置的对象
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(1);

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    render()
    function render() {

    composer.render();
 
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