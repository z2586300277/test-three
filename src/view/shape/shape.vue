<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue';
import { setControls, loadFBX, loaderManager, simplePointsToFace } from '../three/threeApi';
import { createGUI } from '../three/GUI'
import proj4 from 'proj4'


// 配置墨卡托投影的转换参数
const threeBox = ref()
onMounted(() => init(threeBox.value))

// 设置模型原点为中心点
function setCenterOrigin(mesh: any) {

    // 计算模型的包围盒
    var boundingBox = new THREE.Box3().setFromObject(mesh);

    // 计算模型的中心点
    var center = boundingBox.getCenter(new THREE.Vector3());

    // 计算平移向量
    var translation = new THREE.Vector3();

    translation.subVectors(new THREE.Vector3(), center);

    // 平移模型
    mesh.position.add(translation);

}

async function init(DOM: any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50, DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true })
    renderer.setClearColor(0x000000)
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    DOM.appendChild(renderer.domElement)

    const controls = setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI = createGUI(THREE, scene, camera, controls)
    onActivated(() => GUI.domElement.hidden = false)
    onDeactivated(() => GUI.domElement.hidden = true)
    onUnmounted(() => GUI.destroy())

    const heartShape = new THREE.Shape();

    heartShape.moveTo( 10, 10 );
    heartShape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
    heartShape.bezierCurveTo( - 30, 0, - 30, 35, - 30, 35 );
    heartShape.bezierCurveTo( - 30, 55, - 10, 77, 25, 95 );
    heartShape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
    heartShape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
    heartShape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );

    const extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

    const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );

    const mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );

    scene.add( mesh );

    render()

    function render() {
        renderer.render(scene, camera)
        threeBox.value && requestAnimationFrame(render)
    }
}
</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
</style>