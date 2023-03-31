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
    camera.position.set(10,10,10)
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
        iResolution: {
            type: 'v2',
            value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
        },
        iTime: {
            type: 'f',
            value: 1.0
        }
    }
    const geometry = new THREE.BoxGeometry( 10, 10, 10 );

    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
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
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;

        float water_caustics(vec3 pos) {
            vec4 n = snoise( pos );

            pos -= 0.07*n.xyz;
            pos *= 1.62;
            n = snoise( pos );

            pos -= 0.07*n.xyz;
            n = snoise( pos );

            pos -= 0.07*n.xyz;
            n = snoise( pos );
            return n.w;
        }

        void main()
        {
            vec2 p = (-iResolution.xy + 2.0*gl_FragCoord) / iResolution.y;
            
            vec2 uv = gl_FragCoord.xy/iResolution.xy*12. * vUv;
            uv *= vec2(1, iResolution.y/iResolution.x);

            float w = mix(water_caustics(vec3(uv, iTime*0.75)), water_caustics(vec3(uv, iTime*0.75) + 1.), 0.5);

            float intensity = exp(w*3. - 0.5);
            
            gl_FragColor = vec4(mix(vec3(0.65, 0.74, 0.85), vec3(0.86, 0.94, 1.0), intensity), 1.);
        }
        `
    } );

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    window.onresize = () => uniforms.iResolution.value = new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
    render()
    function render() {
        uniforms.iTime.value += 0.03
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