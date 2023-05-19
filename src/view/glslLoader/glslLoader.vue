<template>
    <div class="control">
        <el-input v-model="channel"></el-input>
        <el-select v-model="frag" class="m-2" placeholder="Select" size="large" @change="changeFrag">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </div>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue';
import { setControls, asyncCreateTexture, createTexture, loadFBX, loaderManager, getMaterials } from '../three/threeApi';
import { createGUI } from '../three/GUI'

let shader: any = null
let mesh: any = null
let GUI: any = null
const threeBox: any = ref()

const channel = ref('https://img2.baidu.com/it/u=639935574,2199430260&fm=253&fmt=auto&app=138&f=JPEG?w=658&h=494')
const frag = ref('')
const options: any = ref([])

onMounted(async () => {
    const res:any = await listFiles('http://guangfu/shader/')
    options.value = res.map((item:any) => ({label: item.name, value: `http://guangfu/shader/${item.name}`}))
    frag.value = options.value[0].value
    init(threeBox.value)
})
onActivated(() => {
   if(GUI) GUI.domElement.hidden = false
})
onDeactivated(() => {
    if(GUI)GUI.domElement.hidden = true
})
onUnmounted(() => GUI?.destroy())


async function changeFrag() {

    // 使用 shader 库中的phong材质 进行修改
    shader = {
        uniforms: THREE.UniformsUtils.merge([
            THREE.ShaderLib['phong'].uniforms,
            {
                u_resolution: {
                    type: 'v2',
                    value: new THREE.Vector2(threeBox.value.clientWidth, threeBox.value.clientHeight)
                },
                u_time: {
                    type: 'f',
                    value: 0.0
                },
                channel: { value: await asyncCreateTexture(channel.value) },
                u_mouse: {
                    type: 'v2',
                    value: new THREE.Vector2(0, 0)
                }
            }
        ]),
        side: THREE.DoubleSide,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: await fetch(frag.value).then(res => res.text()),
    }

    shader.fragmentShader = shader.fragmentShader.replace(/gl_FragCoord/, 'vUv * gl_FragCoord')
    shader.fragmentShader = shader.fragmentShader.replace(/uniform float u_time;/, `
        uniform float u_time;
        varying vec2 vUv;
    `)

    const material = new THREE.ShaderMaterial(shader);

    mesh.material.dispose()

    mesh.material = material

}

// 翻译文件列表
function parseFileList(html: any) {
    const fileList = []
    const regex = /<a href="([^"]+)">([^<]+)<\/a>\s+(\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2})\s+(\d+)/g
    let match

    while ((match = regex.exec(html)) !== null) {
        fileList.push({
            name: match[2],
            url: match[1],
            created: new Date(match[3]),
            size: parseInt(match[4])
        })
    }

    return fileList
}

// 获取文件列表
function listFiles(url: any) {

    const xhr = new XMLHttpRequest()

    // 发送 GET 请求
    xhr.open('GET', url)
    xhr.send()

    return new Promise((resolve, reject) =>
        xhr.onload = () => {
            if (xhr.status === 200) resolve(parseFileList(xhr.responseText))
            else reject(xhr.statusText)
        }
    )

}

async function init(DOM: any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50, DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio * 2)
    renderer.setClearColor(0x000000)
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)

    const controls = setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    GUI = createGUI(THREE, scene, camera, controls)

    const geometry = new THREE.BoxGeometry(100, 100, 100);

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);

    changeFrag()

    render()

    function render() {
        shader && (shader.uniforms.u_time.value += 0.05)
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

.control {
    position: absolute;
    z-index: 1;
    width: 400px;
}
</style>