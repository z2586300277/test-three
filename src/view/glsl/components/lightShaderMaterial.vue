<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue';
import { setControls, asyncCreateTexture, createTexture, loadFBX, loaderManager, getMaterials } from '../../three/threeApi';
import { createGUI } from '../../three/GUI'

const threeBox = ref()

onMounted(() => init(threeBox.value))


/* 生成粒子效果 数量 内半径  外半径  */
function createParticleGeometry(particlesSum: any, inner: any, outer: any, maxVelocity: any, sportType: any) {

    // 粒子位置
    const positions: any = new Float32Array(particlesSum * 3);

    // 粒子速度
    const velocities: any = new Float32Array(particlesSum * 3);

    const setVelocities: any = ({

        '全随机': (i: any) => {

            velocities[i * 3] += (Math.random() - 0.5) * maxVelocity / 1000

            velocities[i * 3 + 1] += (Math.random() - 0.5) * maxVelocity / 1000

            velocities[i * 3 + 2] += (Math.random() - 0.5) * maxVelocity / 1000

        },

        '随机向上': (i: any) => {

            velocities[i * 3] += (Math.random() - 0.5) * maxVelocity / 1000

            velocities[i * 3 + 1] += Math.abs((Math.random() - 0.5) * maxVelocity / 100000)

            velocities[i * 3 + 2] += (Math.random() - 0.5) * maxVelocity / 1000

        },

        '随机向下': (i: any) => {

            velocities[i * 3] += (Math.random() - 0.5) * maxVelocity / 1000

            velocities[i * 3 + 1] -= Math.abs((Math.random() - 0.5) * maxVelocity / 100000)

            velocities[i * 3 + 2] += (Math.random() - 0.5) * maxVelocity / 1000

        },

        '直线匀速向上': (i: any) => {

            velocities[i * 3] = 0

            velocities[i * 3 + 1] += maxVelocity / 2 / 100000

            velocities[i * 3 + 2] = 0

        },

        '直线匀速向下': (i: any) => {

            velocities[i * 3] = 0

            velocities[i * 3 + 1] -= maxVelocity / 2 / 100000

            velocities[i * 3 + 2] = 0

        }

    } as any)[sportType]

    function getPosition() {

        let x, y, z

        do {

            x = Math.random() * 2 * outer - outer;

            y = Math.random() * 2 * outer - outer;

            z = Math.random() * 2 * outer - outer;

        } while (Math.abs(x) <= inner && Math.abs(y) <= inner && Math.abs(z) <= inner);

        return [x, y, z]

    }

    for (let i = 0; i < particlesSum; i++) {

        positions.set(getPosition(), i * 3)

    }

    const geometry = new THREE.BufferGeometry()

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    function geometryRender() {

        for (let i = 0; i < particlesSum; i++) {

            setVelocities(i)

            positions[i * 3] += velocities[i * 3];

            positions[i * 3 + 1] += velocities[i * 3 + 1];

            positions[i * 3 + 2] += velocities[i * 3 + 2];

            if (
                Math.abs(positions[i * 3]) > outer ||
                Math.abs(positions[i * 3 + 1]) > outer ||
                Math.abs(positions[i * 3 + 2]) > outer ||
                Math.abs(positions[i * 3]) < inner &&
                Math.abs(positions[i * 3 + 1]) < inner &&
                Math.abs(positions[i * 3 + 2]) < inner
            ) {

                const [x, y, z] = getPosition()

                positions[i * 3] = x

                positions[i * 3 + 1] = y

                positions[i * 3 + 2] = z

                velocities[i * 3] = 0

                velocities[i * 3 + 1] = 0

                velocities[i * 3 + 2] = 0

            }

        }

        geometry.attributes.position.needsUpdate = true;

    }

    function setMaxVelocity(value: any) {

        maxVelocity = value

    }

    return { geometry, geometryRender, setMaxVelocity }

}


async function init(DOM: any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50, DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)

    DOM.appendChild(renderer.domElement)

    const controls = setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const GUI = createGUI(THREE, scene, camera, controls)


    onActivated(() => GUI.domElement.hidden = false)
    onDeactivated(() => GUI.domElement.hidden = true)
    onUnmounted(() => GUI.destroy())

    // 着色器 根据uv 贴合 texture 参数无效  异步解决警告


    const shaderMaterial = new THREE.ShaderMaterial({

        uniforms: {

            size: {
                value: 20,
            
                iResolution: {
                    type: 'v2',
                    value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
                },
                iTime: {
                    type: 'f',
                    value: 0.0
                },
            },

            pointTexture: { value: new THREE.TextureLoader().load('https://img1.baidu.com/it/u=928879359,2870156212&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1695920400&t=5890e6bb4e4513f7cba50a3e77a9885d') }

        },
        vertexShader: `
        uniform float size;

            varying vec3 vColor;

            void main() {

                vColor = color;

                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

                gl_PointSize = size * ( 300.0 / -mvPosition.z );

                gl_Position = projectionMatrix * mvPosition;

            }
        `,
        fragmentShader: `
        precision highp float;

        uniform vec2 iResoultion;
        uniform float iTime;
         varying vec3 vColor;

         vec2 Rot(vec2 uv, float amount)
        {
            float rot = iTime * amount;
            return vec2(uv.y*sin(rot)+uv.x*cos(rot), uv.y*cos(rot)-uv.x*sin(rot));
        }


        float TriSDF(vec2 uv, float r)
        {
            const float k = sqrt(3.);
            uv.x = abs(uv.x) - r;
            uv.y = uv.y + r/k;
            if(uv.x+k*uv.y>0.) uv=vec2(uv.x-k*uv.y,-k*uv.x-uv.y)/2.;
            uv.x -= clamp(uv.x,-2.*r, 0.);
            return -length(uv)*sign(uv.y);
        }



            void main() {

                u = (gl_FragCoord.xy+gl_FragCoord.xy-iResolution.xy)/iResolution.y;
                
                for(float i = 0.; i < 5; i++)
                {
                    vec2 ruv = Rot(u,i*0.2);
                    float scale = 3.5*fract(iTime/3.5 + i*1./5.);//0.5;
                    float tri = abs(TriSDF(ruv, 3.5*fract((i*1./5.)+iTime*.2)));
                    tri = smoothstep(0.01,0.,tri)+smoothstep(0.2,0.,tri)*.15;
                    vec3 col = vec3(cos(i+iTime+vec3(0.,1.,2.))+1.2);

                }

                gl_FragColor = vec4( vColor , 1.0 );

                gl_FragColor = gl_FragColor;

        }`,

        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true

    });

    console.log(shaderMaterial)

    const { geometry, geometryRender, setMaxVelocity } = createParticleGeometry(10000, 0, 2000, 0.01, '全随机')

    setMaxVelocity(500)
    const mesh = new THREE.Points(geometry, shaderMaterial);

    scene.add(mesh)


    render()


    function render() {
        geometryRender()

        renderer.render(scene, camera)

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