<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref, onMounted } from 'vue';
import { setControls } from '../../three/threeApi';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const threeBox = ref()

onMounted(() => init(threeBox.value))

function init(DOM: any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50, DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio * 2)
    renderer.setClearColor(0x000000)
    DOM.appendChild(renderer.domElement)

    const controls = setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    // 创建飞线路径几何体
    var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4, 0, 0),
        new THREE.Vector3(0, 4, 0),
        new THREE.Vector3(4, 0, 0)
    ]);
    var points = curve.getPoints(50);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);

    // 创建顶点颜色数组
    var colors = [];
    for (var i = 0; i < points.length; i++) {
        colors.push(1, 1, 1); // 设置默认白色
    }
    console.log(points)

    // 将顶点位置属性和颜色属性添加到几何体中
    geometry.setFromPoints(points)
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // 创建飞线的材质
    var material = new LineMaterial({
        vertexColors: THREE.VertexColors, // 使用顶点颜色
        linewidth: 20 // 设置线宽度
    });

    // 创建飞线对象并将其添加到场景中
    var line = new THREE.Line(geometry, material);
    scene.add(line);

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