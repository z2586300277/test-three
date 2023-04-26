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
        u_color: { value: new THREE.Color("#5588aa") },
        u_tcolor: { value: new THREE.Color("#ff9800") },
        u_r: { value: 0.25 },
        u_length: { value: 80 },//扫过区域
        u_max: { value: 800 }//扫过最大值

    }

    var geometry = new THREE.PlaneGeometry( 2000, 2000 );
    var material = new THREE.ShaderMaterial( {
        uniforms,
        vertexShader: `
            varying vec3 vp;
                void main(){
                    vp = position; 
                    gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
        `,
        fragmentShader: `
               varying vec3 vp;
                uniform vec3 u_color;
                uniform vec3 u_tcolor;
                uniform float u_r;
                uniform float u_length;
                uniform float u_max;
                float getLeng(float x, float y){
                    return  sqrt((x-0.0)*(x-0.0)+(y-0.0)*(y-0.0));
                }
                void main(){ 
                    float uOpacity = 0.3; 
                    vec3 vColor = u_color;
                    float uLength = getLeng(vp.x,vp.y);
                    if ( uLength <= u_r && uLength > u_r - u_length ) { 
                        float op = sin( (u_r - uLength) / u_length ) * 0.6 + 0.3 ;
                        uOpacity = op; 
                        if( vp.y<0.0){
                            vColor  = u_tcolor * 0.6; 
                        }else{ 
                            vColor = u_tcolor;
                        };
                    } 
                    gl_FragColor = vec4(vColor,uOpacity);
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
            uniforms.u_r.value += 3;
            if (uniforms.u_r.value > uniforms.u_max.value) {
                uniforms.u_r.value = 0;
            }
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