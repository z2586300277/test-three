<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted} from 'vue';
import { setControls, setStats, setFpsClock, loadFBX , getMaterials} from '../../three/threeApi';
import { createGUI } from '../../three/GUI'


// vUv：表示当前像素在纹理贴图中的UV坐标。
//     uv：另一种表示当前像素在纹理贴图中UV坐标的变量。
//     position：表示当前顶点的位置坐标。
//     normal：表示当前顶点的法向量，用于计算光照。
//     projectionMatrix：表示摄像机将场景投影到 2D 屏幕上的矩阵。
//     modelViewMatrix：表示物体相对于摄像机的位置和旋转矩阵。
//     cameraPosition：表示摄像机的位置坐标。
//     time：表示当前时间（以秒为单位），可用于创建动画效果。
//     resolution：表示输出画布的分辨率，以像素为单位。

// 判断uv
// #ifdef USE_UV
//     uv *= vUv;
// #else
//     uv *= vec2(0.0);
// #endif

const threeBox = ref()

onMounted(() => init(threeBox.value))

function init(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true, logarithmicDepthBuffer: true  })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.setClearColor( 0x000000 )
    DOM.appendChild(renderer.domElement)

    const controls = setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI = createGUI(THREE,scene,camera,controls)
    onUnmounted(() => GUI.destroy())

    const uniforms:any = {
        iResolution: {
            type: 'v2',
            value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
        },
        iTime: {
            type: 'f',
            value: 1.0
        }
    }

    
    loadFBX('http://guangfu/tileset.FBX',  ((object3d:any) => {

            scene.add(object3d)

            const materials = getMaterials(object3d)
            
            materials.map( basicMaterial => {            
                   /* 材质加工 */
                    basicMaterial.onBeforeCompile = (shader:any,renderer:any)=>{

                    shader.uniforms.iResolution = uniforms.iResolution
                    shader.uniforms.iTime = uniforms.iTime
                    
                    // 判断携带自身贴图还是颜色
                    shader.uniforms.colorOrMap = {
                        value:  basicMaterial.map ? 1 : 0
                    }
                    
                    shader.uniforms.materialColor = {
                        type: 'v3',
                        value:  new THREE.Vector3(basicMaterial.color.r,basicMaterial.color.g,basicMaterial.color.b)
                    }
                    shader.uniforms.colorTexture = {
                        value:  basicMaterial.map
                    }
                    
                    /* 注意 如果使用原本自身的着色器进行部分替换  vUv 是已经存在的不用重新传递 */
                    shader.fragmentShader = shader.fragmentShader.replace(/#include <common>/,`
                        uniform vec2 iResolution;
                        uniform float iTime;
                        #include <common> 
                    `)

                    shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );',`
                        vec3 c;
                        float l,z=iTime;
                        for(int i=0;i<3;i++) {
                            vec2 uv,p=gl_FragCoord.xy/iResolution/2.0;
                            uv=p +  2.0;

                            #ifdef USE_UV
                             uv *= vUv;
                            #else
                             uv *= vec2(0.0);
                            #endif
                            
                            p-=.5;
                            p.x*=iResolution.x/iResolution.y;
                            z+=.07;
                            l=length(p);
                            uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z-z));
                            c[i]=.01/length(mod(uv,1.)-.5);
                        }
                            
                        vec4 diffuseColor = vec4( diffuse * c, opacity );
                    `)

                    }
            })
        })
    )
    window.onresize = () => uniforms.iResolution.value = new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)

    // 帧率显示
    const stats = setStats()

    const fpsRender = setFpsClock(140)

    render()
    function render() {
        fpsRender(() => {
            stats && stats.update()
            uniforms.iTime.value += 0.005;
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