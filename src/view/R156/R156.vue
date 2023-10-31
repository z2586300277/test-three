<template>
    R156 测试
    <div ref="threeBox" class="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, ref } from 'vue';

const threeBox = ref()

onMounted(() => setScene())

function setScene() {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(75, threeBox.value.clientWidth / threeBox.value.clientHeight, 0.1, 1000)

    camera.position.set(10, 10, 10)

    const renderer = new THREE.WebGLRenderer();

    (window as any).renderer = renderer

    renderer.setClearColor(0xffffff, 0)

    renderer.setSize(threeBox.value.clientWidth, threeBox.value.clientHeight)

    threeBox.value.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    
    const axesHelper = new THREE.AxesHelper(5000)

    scene.add(axesHelper)

    const geometry = new THREE.BoxGeometry()

    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })

    const cube = new THREE.Mesh(geometry, material)

    scene.add(cube);

    const light = new THREE.PointLight(0xffffff, 1, 100, 0)

    light.position.set(20, 20, 20)

    scene.add(light);

    

    render()

    function render() {

        renderer.render(scene, camera)

        threeBox.value && requestAnimationFrame(render)

    }

}








</script>

<style lang="less" scoped>
.threeBox {
    width: 800px;
    height: 600px;
    border: 1px solid #000;
}
</style>