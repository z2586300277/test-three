<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted} from 'vue';
import { setControls } from '../../three/threeApi';

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

    const controls =  setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const uniforms:any = {
        u_resolution: {
            type: 'v2',
            value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
        }
    }

    var geometry = new THREE.PlaneGeometry( 2, 2 );
    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: `
        void main() {
            gl_Position = vec4( position, 1.0 );
        }
        `,
        fragmentShader: `
        // 屏幕尺寸
        uniform vec2 u_resolution;

        void main() {
            // uv坐标
            vec2 uv = gl_FragCoord.xy/u_resolution;
            // 输出
            gl_FragColor = vec4(uv.x,uv.y,0.0,1.0);
        }
        `
    } );

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    window.onresize = () => uniforms.u_resolution.value = new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
    render()
    function render() {
        renderer.render(scene,camera)
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