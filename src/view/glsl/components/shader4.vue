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

        mat2 rot(float a) {
            float c = cos(a), s = sin(a);
            return mat2(c,s,-s,c);
        }

        const float pi = acos(-1.0);
        const float pi2 = pi*2.0;

        vec2 pmod(vec2 p, float r) {
            float a = atan(p.x, p.y) + pi/r;
            float n = pi2 / r;
            a = floor(a/n)*n;
            return p*rot(-a);
        }

        float box( vec3 p, vec3 b ) {
            vec3 d = abs(p) - b;
            return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
        }

        float ifsBox(vec3 p) {
            for (int i=0; i<5; i++) {
                p = abs(p) - 1.0;
                p.xy *= rot(iTime*0.3);
                p.xz *= rot(iTime*0.1);
            }
            p.xz *= rot(iTime);
            return box(p, vec3(0.4,0.8,0.3));
        }

        float map(vec3 p, vec3 cPos) {
            vec3 p1 = p;
            p1.x = mod(p1.x-5., 10.) - 5.;
            p1.y = mod(p1.y-5., 10.) - 5.;
            p1.z = mod(p1.z, 16.)-8.;
            p1.xy = pmod(p1.xy, 5.0);
            return ifsBox(p1);
        }

        void main() {
            vec2 p = (gl_FragCoord.xy * 2.0 * vUv - iResolution.xy) / min(iResolution.x, iResolution.y);

            vec3 cPos = vec3(0.0,0.0, -3.0 * iTime);
            // vec3 cPos = vec3(0.3*sin(iTime*0.8), 0.4*cos(iTime*0.3), -6.0 * iTime);
            vec3 cDir = normalize(vec3(0.0, 0.0, -1.0));
            vec3 cUp  = vec3(sin(iTime), 1.0, 0.0);
            vec3 cSide = cross(cDir, cUp);

            vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir);

            float acc = 0.0;
            float acc2 = 0.0;
            float t = 0.0;
            for (int i = 0; i < 99; i++) {
                vec3 pos = cPos + ray * t;
                float dist = map(pos, cPos);
                dist = max(abs(dist), 0.02);
                float a = exp(-dist*3.0);
                if (mod(length(pos)+24.0*iTime, 30.0) < 3.0) {
                    a *= 2.0;
                    acc2 += a;
                }
                acc += a;
                t += dist * 0.5;
            }

            vec3 col = vec3(acc * 0.01, acc * 0.011 + acc2*0.002, acc * 0.012+ acc2*0.005);
            gl_FragColor = vec4(col, 1.0 - t * 0.03);
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