<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted, onActivated, onDeactivated} from 'vue';
import { setControls ,createTexture, loadFBX, loaderManager ,getMaterials} from '../../three/threeApi';
import { createGUI } from '../../three/GUI'

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
    renderer.outputEncoding = THREE.sRGBEncoding;
    DOM.appendChild(renderer.domElement)

    const controls =  setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI = createGUI(THREE,scene,camera,controls)
    onActivated(() => GUI.domElement.hidden = false )
    onDeactivated(() =>GUI.domElement.hidden = true)
    onUnmounted(() => GUI.destroy())

    
    // loadFBX('http://guangfu/zlcky/zlcky.FBX', (o:any) => {
    //        scene.add(o)
    // })

    const uniforms:any = {
        r: {
            type: 'v2',
            value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
        },
        t: {
            type: 'f',
            value: 0.0
        },
        colorTexture: { value: createTexture('https://img2.baidu.com/it/u=1042245905,2107164082&fm=253&fmt=auto&app=138&f=JPEG?w=1333&h=500') }
    }
    const geometry = new THREE.BoxGeometry( 10, 10, 10 );

    var material = new THREE.ShaderMaterial( {
        // uniforms: THREE.UniformsUtils.merge( [
        //     THREE.ShaderLib[ 'standard' ].uniforms,
        //     uniforms
        // ]),
        uniforms,
        vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
        }
        `,
        fragmentShader: `
        varying vec2 vUv;

        uniform vec2 r;
        uniform float t;
        uniform sampler2D colorTexture;

        void main(){
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
            gl_FragColor=vec4(c/l * color ,t);

        }

        `
    } );
    // material.lights = true
    // console.log(THREE.ShaderLib,material.uniforms)

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    render()
    function render() {
        uniforms.t.value += 0.03
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