<template>
    <div class="threeBox" ref="threeBox"></div>
    <div style="position:absolute;bottom: 0;">
        <el-button @click="playVideo">播放</el-button>
        <el-button @click="pauseVideo">停止</el-button>
        <el-button @click="openSound">声音</el-button>

    </div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue';
import { setControls, createVideoTexture, createTexture, loadFBX, loaderManager, getMaterials } from '../../three/threeApi';
import { createGUI } from '../../three/GUI'

const threeBox = ref()
let texture: any
onMounted(() => init(threeBox.value))

function playVideo() {
    texture.video.play()
}
function pauseVideo() {
    texture.video.pause()
}  
function openSound() {
    texture.video.muted = !texture.video.muted
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

    const GUI = createGUI(THREE, scene, camera, controls)
    onActivated(() => GUI.domElement.hidden = false)
    onDeactivated(() => GUI.domElement.hidden = true)
    onUnmounted(() => GUI.destroy())

    // 着色器 根据uv 贴合 texture 参数无效  异步解决警告
    texture = await createVideoTexture('http://vjs.zencdn.net/v/oceans.mp4')
    texture.video.muted = true
    texture.video.play()

    const geometry = new THREE.BoxGeometry(100, 100, 100);

    // 使用 shader 库中的phong材质 进行修改    mix 插值计算颜色 进行混合
    const shader = {
        uniforms: THREE.UniformsUtils.merge([
            THREE.ShaderLib['phong'].uniforms,
            {
                r: {
                    type: 'v2',
                    value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
                },
                t: {
                    type: 'f',
                    value: 0.0
                },
                colorTexture: { value: texture },
                calcType: {
                    value: 2
                }
            }
        ]),
        vertexShader: THREE.ShaderLib['phong'].vertexShader,
        fragmentShader: THREE.ShaderLib['phong'].fragmentShader,
    }
    GUI.add(shader.uniforms.calcType, 'value', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).name('混合类型')

    shader.vertexShader = shader.vertexShader.replace(/#include <common>/, `
        varying vec2 vUv;
        #include <common>    
    `)

    shader.vertexShader = shader.vertexShader.replace('void main() {', `
        void main() {
        vUv = uv; 
    `)

    shader.fragmentShader = shader.fragmentShader.replace(/#include <common>/, `
        precision highp float;
        varying vec2 vUv;
        uniform vec2 r;
        uniform float t;
        uniform float calcType;
        uniform sampler2D colorTexture;
        #include <common> 
    `)

    shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', `
       vec3 c;
        float l,z=t;
        for(int i=0;i<3;i++) {
            vec2 uv,p=gl_FragCoord.xy/r/2.0;
            uv=p +  2.0 * vUv;
            p-=.5;
            p.x*=r.x/r.y;
            z+=.07;
            l=length(p);
            uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z-z));
            c[i]=.01/length(mod(uv,1.)-.5);
        }
      vec3 color = texture2D( colorTexture, vUv ).rgb;
      vec3 mixedColor;
      if (calcType == 0.0)  mixedColor = max(color, c);
      else if(calcType == 1.0) mixedColor = min(color, c);
      else if(calcType == 2.0) mixedColor = mix(color, c, 0.5);
      else if(calcType == 3.0) mixedColor = mod(color, c);
      else if(calcType == 4.0) mixedColor = pow(color, c);
      else if(calcType == 5.0) mixedColor = step(color, c);
      else if(calcType == 6.0) mixedColor = color + c;
      else if(calcType == 7.0) mixedColor = color - c;
      else if(calcType == 8.0) mixedColor = c  - color;
      else if(calcType == 9.0) mixedColor = color + c - vec3(1.0) * c * color;
      else mixedColor = color;
      vec4 diffuseColor = vec4( diffuse * mixedColor, opacity );
    `)

    const material = new THREE.ShaderMaterial(shader);

    material.lights = true

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    render()
    function render() {
        shader.uniforms.t.value += 0.05
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

<!-- 

    GLSL中常用的两个vec3颜色计算生成新的颜色函数包括：

加法混合
vec3 result = color1 + color2;

上述代码将两个相同分量的颜色向量直接相加得到一个新的颜色向量，实现了颜色的加法混合效果。

减法混合
vec3 result = color1 - color2;

上述代码将两个相同分量的颜色向量直接相减得到一个新的颜色向量，实现了颜色的减法混合效果。

乘法混合
vec3 result = color1 * color2;

上述代码将两个相同分量的颜色向量对应分量值相乘得到一个新的颜色向量，实现了颜色的乘法混合效果。

取反混合
vec3 oneminusColor1 = vec3(1.0) - color1;
vec3 result = oneminusColor1 * color2;
上述代码先从纯白色向量 (1.0, 1.0, 1.0) 中减去 color1 得到另一向量 oneminusColor1, 再与 color2 做乘法运算，实现了取反混合效果。

叠加混合
vec3 result = color1 + color2 - vec3(1.0) * color1 * color2;
上述代码通过叠加和减少之间的混合得到一个新的颜色向量，实现了叠加混合效果。

滤色混合
vec3 result = vec3(1.0) - (vec3(1.0) - color1) * (vec3(1.0) - color2);
上述代码先将 each color 值从 1 中减去，接着把 them 按比例相乘，最后再将 resulting each color 值从 1 中减去。这样就能得到 from 两个输入颜色综合发生 "滤色" 的效果。
 -->