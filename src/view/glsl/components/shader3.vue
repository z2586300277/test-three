<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted} from 'vue';
import { setControls, setStats, setFpsClock} from '../../three/threeApi';

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

    setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    let geometry = new THREE.PlaneGeometry( 2, 2 );
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
    /* 
    
        precision highp float;


        float gTime = 0.;
        const float REPEAT = 5.0;

        // 回転行列
        mat2 rot(float a) {
            float c = cos(a), s = sin(a);
            return mat2(c,s,-s,c);
        }

        float sdBox( vec3 p, vec3 b )
        {
            vec3 q = abs(p) - b;
            return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
        }

        float box(vec3 pos, float scale) {
            pos *= scale;
            float base = sdBox(pos, vec3(.4,.4,.1)) /1.5;
            pos.xy *= 5.;
            pos.y -= 3.5;
            pos.xy *= rot(.75);
            float result = -base;
            return result;
        }

        float box_set(vec3 pos, float iTime) {
            vec3 pos_origin = pos;
            pos = pos_origin;
            pos .y += sin(gTime * 0.4) * 2.5;
            pos.xy *=   rot(.8);
            float box1 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
            pos = pos_origin;
            pos .y -=sin(gTime * 0.4) * 2.5;
            pos.xy *=   rot(.8);
            float box2 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
            pos = pos_origin;
            pos .x +=sin(gTime * 0.4) * 2.5;
            pos.xy *=   rot(.8);
            float box3 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);	
            pos = pos_origin;
            pos .x -=sin(gTime * 0.4) * 2.5;
            pos.xy *=   rot(.8);
            float box4 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);	
            pos = pos_origin;
            pos.xy *=   rot(.8);
            float box5 = box(pos,.5) * 6.;	
            pos = pos_origin;
            float box6 = box(pos,.5) * 6.;	
            float result = max(max(max(max(max(box1,box2),box3),box4),box5),box6);
            return result;
        }

        float map(vec3 pos, float iTime) {
            vec3 pos_origin = pos;
            float box_set1 = box_set(pos, iTime);

            return box_set1;
        }


        void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
            vec2 p = (fragCoord.xy * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);
            vec3 ro = vec3(0., -0.2 ,iTime * 4.);
            vec3 ray = normalize(vec3(p, 1.5));
            ray.xy = ray.xy * rot(sin(iTime * .03) * 5.);
            ray.yz = ray.yz * rot(sin(iTime * .05) * .2);
            float t = 0.1;
            vec3 col = vec3(0.);
            float ac = 0.0;


            for (int i = 0; i < 99; i++){
                vec3 pos = ro + ray * t;
                pos = mod(pos-2., 4.) -2.;
                gTime = iTime -float(i) * 0.01;
                
                float d = map(pos, iTime);

                d = max(abs(d), 0.01);
                ac += exp(-d*23.);

                t += d* 0.55;
            }

            col = vec3(ac * 0.02);

            col +=vec3(0.,0.2 * abs(sin(iTime)),0.5 + sin(iTime) * 0.2);


            fragColor = vec4(col ,1.0 - t * (0.02 + 0.02 * sin (iTime)));
        }

        /** SHADERDATA
        {
            "title": "Octgrams",
            "description": "Lorem ipsum dolor",
            "model": "person"
        }
        */

    let material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: `
        void main() {
            gl_Position = vec4( position, 1.0 );
        }
        `,
        fragmentShader: `
        // 屏幕尺寸
        
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;



        float gTime = 0.;
        const float REPEAT = 5.0;

        // 回転行列
        mat2 rot(float a) {
            float c = cos(a), s = sin(a);
            return mat2(c,s,-s,c);
        }

        float sdBox( vec3 p, vec3 b )
        {
            vec3 q = abs(p) - b;
            return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
        }

        float box(vec3 pos, float scale) {
            pos *= scale;
            float base = sdBox(pos, vec3(.4,.4,.1)) /1.5;
            pos.xy *= 5.;
            pos.y -= 3.5;
            pos.xy *= rot(.75);
            float result = -base;
            return result;
        }

        float box_set(vec3 pos, float iTime) {
            vec3 pos_origin = pos;
            pos = pos_origin;
            pos .y += sin(gTime * 0.4) * 2.5;
            pos.xy *=   rot(.8);
            float box1 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
            pos = pos_origin;
            pos .y -=sin(gTime * 0.4) * 2.5;
            pos.xy *=   rot(.8);
            float box2 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
            pos = pos_origin;
            pos .x +=sin(gTime * 0.4) * 2.5;
            pos.xy *=   rot(.8);
            float box3 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);	
            pos = pos_origin;
            pos .x -=sin(gTime * 0.4) * 2.5;
            pos.xy *=   rot(.8);
            float box4 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);	
            pos = pos_origin;
            pos.xy *=   rot(.8);
            float box5 = box(pos,.5) * 6.;	
            pos = pos_origin;
            float box6 = box(pos,.5) * 6.;	
            float result = max(max(max(max(max(box1,box2),box3),box4),box5),box6);
            return result;
        }

        float map(vec3 pos, float iTime) {
            vec3 pos_origin = pos;
            float box_set1 = box_set(pos, iTime);

            return box_set1;
        }
        
        void main() {
            vec2 p = (gl_FragCoord.xy * 1. - iResolution.xy) / min(iResolution.x, iResolution.y);
            vec3 ro = vec3(0., -0.2 ,iTime * 4.);
            vec3 ray = normalize(vec3(p, 1.5));
            ray.xy = ray.xy * rot(sin(iTime * .03) * 5.);
            ray.yz = ray.yz * rot(sin(iTime * .05) * .2);
            float t = 0.1;
            vec3 col = vec3(0.);
            float ac = 0.0;


            for (int i = 0; i < 99; i++){
                vec3 pos = ro + ray * t;
                pos = mod(pos-2., 4.) -2.;
                gTime = iTime -float(i) * 0.01;
                
                float d = map(pos, iTime);

                d = max(abs(d), 0.01);
                ac += exp(-d*23.);

                t += d* 0.55;
            }

            col = vec3(ac * 0.02);

            col +=vec3(0.,0.2 * abs(sin(iTime)),0.5 + sin(iTime) * 0.2);


            gl_FragColor = vec4(col ,1.0 - t * (0.02 + 0.02 * sin (iTime)));
        }
        `
    } );

    let mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    window.onresize = () => uniforms.iResolution.value = new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)

    // 帧率显示
    const stats = setStats()

    const fpsRender = setFpsClock(140)

    render()
    function render() {
        fpsRender(() => {
            stats && stats.update()
            uniforms.iTime.value += 0.05;
            renderer.render(scene,camera)
        })
        threeBox.value && requestAnimationFrame(render)
        
    }
}
</script>

<style lang="less" scoped>
.threeBox {
    width: 800px;
    height: 800px;
}
</style>