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
        iResolution: {
            type: 'v2',
            value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
        },
        iTime: {
            type: 'f',
            value: 1.0
        }
    }

    
    loadFBX('http://guangfu/aroundBuilding.FBX',  ((object3d:any) => {

            scene.add(object3d)

            const materials = getMaterials(object3d)

            materials.map( basicMaterial => 
            /* 材质加工 */
            basicMaterial.onBeforeCompile = (shader:any,renderer:any)=>{
               shader.uniforms.iResolution = uniforms.iResolution
               shader.uniforms.iTime = uniforms.iTime
               console.log(shader.vertexShader)
               shader.vertexShader = `
               varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                    gl_Position = projectionMatrix * mvPosition;
                }
                `,
               shader.fragmentShader = `
                // 屏幕尺寸
                varying vec2 vUv;
                precision highp float;
                uniform vec2 iResolution;
                uniform float iTime;
                const float TAU = 6.28318530718;
                const int MAX_ITER = 5;

                void main() 
                {
                    float time = iTime * .5+23.0;
                    // uv should be the 0-1 uv of texture...
                    vec2 uv = gl_FragCoord.xy / iResolution.xy * vUv;
                    
                #ifdef SHOW_TILING
                    vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
                #else
                    vec2 p = mod(uv*TAU, TAU)-250.0;
                #endif
                    vec2 i = vec2(p);
                    float c = 1.0;
                    float inten = .005;

                    for (int n = 0; n < MAX_ITER; n++) 
                    {
                        float t = time * (1.0 - (3.5 / float(n+1)));
                        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
                        c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
                    }
                    c /= float(MAX_ITER);
                    c = 1.17-pow(c, 1.4);
                    vec3 colour = vec3(pow(abs(c), 8.0));
                    colour = clamp(colour + vec3(0.0, 0.35, 0.5), 0.0, 1.0);

                    #ifdef SHOW_TILING
                    // Flash tile borders...
                    vec2 pixel = 2.0 / iResolution.xy;
                    uv *= 2.0;
                    float f = floor(mod(iTime*.5, 2.0)); 	// Flash value.
                    vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
                    uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
                    colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line
                    #endif
                    
                    gl_FragColor = vec4(colour, 1.0);
                }

                `
                console.log(shader.fragmentShader)
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