<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted, onActivated, onDeactivated} from 'vue';
import { setControls ,asyncCreateTexture,createTexture, loadFBX, loaderManager ,getMaterials} from '../../three/threeApi';
import { createGUI } from '../../three/GUI'

const threeBox = ref()

onMounted(() => init(threeBox.value))

async function init(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true, logarithmicDepthBuffer: true  })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.setClearColor( 0x000000 )
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)

    const controls =  setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI = createGUI(THREE,scene,camera,controls)
    GUI.add( {fn:() => {
        shader.uniforms.colorTexture.value = createTexture('https://img0.baidu.com/it/u=1409096983,2384906094&fm=253&fmt=auto&app=138&f=JPEG?w=867&h=500')
    }}, 'fn').name('切换网络材质')
    
    onActivated(() => GUI.domElement.hidden = false )
    onDeactivated(() =>GUI.domElement.hidden = true)
    onUnmounted(() => GUI.destroy())

    // 着色器 根据uv 贴合 texture 参数无效  异步解决警告
    const texture = await asyncCreateTexture('https://img2.baidu.com/it/u=639935574,2199430260&fm=253&fmt=auto&app=138&f=JPEG?w=658&h=494')
 
    const geometry = new THREE.BoxGeometry( 10, 10, 10 );
    
    // 使用 shader 库中的phong材质 进行修改
    const shader = {
        uniforms: THREE.UniformsUtils.merge( [
            THREE.ShaderLib[ 'phong' ].uniforms,
            {
                r: {
                    type: 'v2',
                    value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
                },
                t: {
                    type: 'f',
                    value: 0.0
                },
                colorTexture: { value: texture }
            }
        ]),
        vertexShader: THREE.ShaderLib[ 'phong' ].vertexShader,
        fragmentShader: THREE.ShaderLib[ 'phong' ].fragmentShader,
    }

    shader.vertexShader = shader.vertexShader.replace(/#include <common>/,`
        varying vec2 vUv;
        #include <common>    
    `)
    
    shader.vertexShader = shader.vertexShader.replace('void main() {',`
        void main() {
        vUv = uv; 
    `)

    shader.fragmentShader = shader.fragmentShader.replace(/#include <common>/,`
        varying vec2 vUv;
        uniform vec2 r;
        uniform float t;
        uniform sampler2D colorTexture;
        #include <common> 
    `)

    shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',`
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
      vec4 diffuseColor = vec4( diffuse * color * c, opacity );
    `)

    const material = new THREE.ShaderMaterial( shader );

    material.lights = true
    
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    render()
    function render() {
        shader.uniforms.t.value += 0.05
        renderer.render(scene,camera)
        requestAnimationFrame(render)
    }
}
</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
</style>