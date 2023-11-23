<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted} from 'vue';
import { setControls, setStats, setFpsClock, loadFBX , getMaterials} from '../../three/threeApi';
import { createGUI } from '../../three/GUI'
import { Material } from 'three';

const threeBox = ref()

onMounted(() => init(threeBox.value))

function init(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true, logarithmicDepthBuffer: true  })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.setClearColor( 0x000000 )
    DOM.appendChild(renderer.domElement)

    const controls = setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI = createGUI(THREE,scene,camera,controls)
    onUnmounted(() => GUI.destroy())

    const uniforms:any = {
        innerCircleWidth: {
                        value: 0
                    },
        circleWidth: {
            value: 300
        },
        diff: {
            value: new THREE.Color(0.2, 0.2, 0.2)
        },
        color: {
            value: new THREE.Color(0.0, 0.0, 1.0)
        },
        opacity: {
            value: 0.3
        },
        center: {
            value: new THREE.Vector3(0, 0, 0)
        }
    }

    GUI.addColor({ color: 0xFFFFFF}, 'color').onChange((v:any) => uniforms.color.value = new THREE.Color(v)).name('修改发光颜色')
    GUI.addColor({ color: 0xFFFFFF}, 'color').onChange((v:any) => uniforms.diff.value = new THREE.Color(v)).name('修改diffuse颜色')

    function shaderAnimate() {
        if ( uniforms.innerCircleWidth.value < 1000) {
                uniforms.innerCircleWidth.value += 10
        }
        else {
            uniforms.innerCircleWidth.value = 0
        }
    }

    var geometry = new THREE.PlaneGeometry( 2000, 2000 );
    var material = new THREE.ShaderMaterial( {
        uniforms,
        vertexShader: `
            varying vec2 vUv;
            varying vec3 v_position;
            void main() {
                vUv = uv;
                v_position = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
        varying vec2 vUv;
        varying vec3 v_position;

        uniform float innerCircleWidth;
        uniform float circleWidth;
        uniform float opacity;
        uniform vec3 center;
        
        uniform vec3 color;
        uniform vec3 diff;

        void main() {
            float dis = length(v_position - center);
            if(dis < (innerCircleWidth + circleWidth) && dis > innerCircleWidth) {
                float r = (dis - innerCircleWidth) / circleWidth;
               
                gl_FragColor = mix(vec4(diff, 0.1), vec4(color, opacity), r);
            }else {
                gl_FragColor = vec4(diff, 0.1);
            }

        }
            `
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    
    loadFBX('http://guangfu/resource/aroundBuilding.FBX',  ((object3d:any) => {

            scene.add(object3d)

            object3d.traverse((c:any) => c.material = material)

        })
    )


    // 帧率显示
    const stats = setStats()

    const fpsRender = setFpsClock(140)

    render(null)
    function render(dalte:any) {
        fpsRender(() => {
            stats && stats.update()
            shaderAnimate()
            renderer.render(scene,camera)
        })
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

