<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted} from 'vue';
import { setControls, getWebGLMouse} from '../../three/threeApi';

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
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
        `,
        fragmentShader: `
       
        varying vec2 vUv;
        uniform vec2 iResolution;
        uniform float iTime;
    
        void main()
        {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            uv.y -= 2.0;
            float time = iTime * 0.0;
            float roll = PI + sin(iTime)/14.0 + cos(iTime/2.0)/14.0 ;
            float pitch = PI*1.021 + (sin(iTime/2.0)+ cos(iTime))/40.0 
                + (1./iResolution.y - .8)*PI/3.0  ;
            float yaw = 1./iResolution.x * PI * 4.0;
            vec3 ang = vec3(roll,pitch,yaw);
            vec3 ori = vec3(0.0,3.5,time*3.0);
            vec3 dir = normalize(vec3(uv.xy,-1.6)); 
            dir = normalize(dir) * fromEuler(ang);
            vec3 p;
            heightMapTracing(ori,dir,p);
            vec3 dist = p - ori;
            vec3 n = getNormal(p,  dot(dist,dist)  * EPSILON_NRM  );
            vec3 light = normalize(vec3(0.0,1.0,0.8)); 
            vec3 seaColor = getSeaColor(p,n,light,dir,dist);
            vec3 color =seaColor;
            gl_FragColor = vec4(pow(color,vec3(0.9)), 1.0);
        }
        `
    } );

    material.side = THREE.DoubleSide

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

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