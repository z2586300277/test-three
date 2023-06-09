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
    
    loadFBX('http://guangfu/aroundBuilding.FBX',  ((object3d:any) => {

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

/* 扫光平面 */
export const setScanPlane = () => {

const uniforms = {
    innerCircleWidth: {
        value: 5,
        type: 'number'
    },
    circleWidth: {
        value: 10,
        type: 'number'
    },
    circleMax: {
        value: 100,
        type: 'number'
    },
    circleSpeed: {
        value: 1,
        type: 'number'
    },
    diff: {
        value: new THREE.Color(0, 0, 0),
        type: 'color'
    },
    color: {
        value: new THREE.Color(0.0, 0.0, 1.0),
        type: 'color'
    },
    opacity: {
        value: 0.3,
        type: 'opacity'
    },
    opacity2: {
        value: 0.8,
        type: 'opacity'
    },
    center: {
        value: new THREE.Vector3(0, 0, 0),
        type: 'position'
    }
}

function ShaderAnimateRender() {

    uniforms.innerCircleWidth.value < uniforms.circleMax.value ? uniforms.innerCircleWidth.value += uniforms.circleSpeed.value : uniforms.innerCircleWidth.value = 0

}

const geometry = new THREE.BoxGeometry(1, 150, 150)
const basicMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, color: 'red' })
const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    extensions: {
        derivatives: false, // set to use derivatives
        fragDepth: true, // set to use fragment depth values
        drawBuffers: false, // set to use draw buffers
        shaderTextureLOD: false // set to use shader texture LOD
    },
    // derivatives: 这个扩展允许在着色器中通过 dFdx()、dFdy() 和 fwidth() 等函数计算二阶导数和变化率，通常用于实现凹凸映射等效果。
    // fragDepth: 这个扩展允许在着色器中写入深度值（gl_FragDepth），可以用于实现自定义的深度测试等效果。
    // drawBuffers: 这个扩展允许使用多个颜色缓冲区进行渲染，可以用于实现后期处理等效果。
    // shaderTextureLOD: 这个扩展允许在着色器中使用 texture2DLod() 和 textureCubeLod() 等函数获取特定 mip 级别的纹理像素颜色，可以用于优化纹理采样等效果。
    /* 可观察此操作 */
    // gl_Position.z = logDepth;

    uniforms,
    vertexShader: `
        varying vec2 vUv;
        varying vec3 v_position;
        void main() {
            vUv = uv;
            v_position = position;
           
            vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            float ndcDepth = pos.z / pos.w; 
            float logDepth = 2.0/log2(1000.0 + 1.0) * log2(clamp(ndcDepth*1000.0 + 1.0, 1.0, 1000.0));
            gl_Position = pos; 
            gl_Position.z = logDepth;
        }
    `,
    fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        varying vec3 v_position;
        

        uniform float innerCircleWidth;
        uniform float circleWidth;
        uniform float opacity;
        uniform float opacity2;
        uniform vec3 center;
        
        uniform vec3 color;
        uniform vec3 diff;

        void main() {
            float dis = length(v_position - center);
            if(dis < (innerCircleWidth + circleWidth) && dis > innerCircleWidth) {
                float r = (dis - innerCircleWidth) / circleWidth;
            
                gl_FragColor = mix(vec4(diff, opacity2), vec4(color, opacity), r);
            }else {
                gl_FragColor = vec4(1.,1.,1., 0.);
            }

        }
     `
})

const mesh = new THREE.Mesh(geometry, [material, ...Array(5).fill(basicMaterial)])
material.isCustomMaterial = true
mesh.rotation.z = -Math.PI / 2;

return { mesh, ShaderAnimateRender, uniforms }
}

</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
</style>

