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
proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs");
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
    renderer.setClearColor(0xffffff)
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    DOM.appendChild(renderer.domElement)

    const controls = setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI = createGUI(THREE, scene, camera, controls)
    onActivated(() => GUI.domElement.hidden = false)
    onDeactivated(() => GUI.domElement.hidden = true)
    onUnmounted(() => GUI.destroy())

    const groupGeo = new THREE.Group()

    scene.add(groupGeo)

    const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json').then(r => r.json())

    setGeo(res.features)

    setCenterOrigin(groupGeo)

    // 目标旋转中心不在原点时，设置旋转中心

    function setGeo(features: any) {

        features.forEach((i: any) => {

            if (i.geometry.type === 'MultiPolygon') {

                i.geometry.coordinates.forEach((j: any) => {

                    j.forEach((z: any) => {

                        setShape(z, null)

                    })

                })

            }

            else if (i.geometry.type === 'Polygon') {   

                i.geometry.coordinates.forEach((j: any) => {

                    setShape(j, [])

                })

            }

        })
    }

    function setShape(coordinates: any, center: any) {

        const color = 0xffffff * Math.random()

        const curvePoints = coordinates.map((k: any) =>  coordToVector2(k))

        const shape = new THREE.Shape(curvePoints)

        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 20, bevelEnabled: false })

        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true })

        const mesh = new THREE.Mesh(geometry, material)

        groupGeo.add(mesh)


        
    }

    // 经纬度转换为三维坐标
    function coordToVector2(coord: any) {

        const [lng, lat] = coord

        const [x , y ] = proj4("EPSG:4326", "EPSG:3857", [lng, lat]);
        
        return new THREE.Vector2(x / 10000, y/ 10000)
    }


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