<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted} from 'vue';
import { setControls, setStats, setFpsClock, loadFBX , getMaterials} from '../../three/threeApi';
import { createGUI } from '../../three/GUI'
// 直接重新赋值 形式着色

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
            object3d.children[0].position.set(0,0,0)
            object3d.children[0].scale.set(0.1,0.1,0.1)

            const materials = getMaterials(object3d)
            
            materials.map( basicMaterial => {            
                   /* 材质加工 */
                    basicMaterial.onBeforeCompile = (shader:any,renderer:any)=>{
                    shader.uniforms.iResolution = uniforms.iResolution  //iResolution 分辨率
                    shader.uniforms.iTime = uniforms.iTime  // 动效时间参数
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
                   /*  vec3 textureColor = texture2D( colorTexture, vUv ).rgb;     接受的贴图
                            vec3 fragColor =  col * (10.,10.,10.);  // shader特效参数
                            if( colorOrMap > 0.5 ) fragColor = fragColor * textureColor; // 判断模型携带的材质是颜色还是贴图
                            else fragColor = fragColor * materialColor;
                            gl_FragColor = vec4(fragColor ,1.0); */ 

                    shader.vertexShader = `
                        varying vec2 vUv;
                            void main() {
                                vUv = uv;
                                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                                gl_Position = projectionMatrix * mvPosition;
                            }
                        `,
                    shader.fragmentShader = `
                        varying vec2 vUv;
                        precision lowp float;
                        uniform vec2 iResolution;
                        uniform float iTime;
                        uniform float colorOrMap;
                        uniform vec3 materialColor;
                        uniform sampler2D colorTexture;
                    
                                    
                        vec3 hsv2rgb( vec3 c ){
                            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                                    6.0)-3.0)-1.0,
                                            0.0,
                                            1.0 );
                            rgb = rgb*rgb*(3.0-2.0*rgb);
                            return c.z * mix(vec3(1.0), rgb, c.y);
                        }

                        float rand(vec2 v){
                            v = fract(v * vec2(70.26593, 1.6682));
                            v += dot(v, v+23.45);
                            return fract(v.x*v.y);
                        }

                        vec2 rand_2(vec2 v){
                            float n = rand(v);
                            return vec2(n, rand(v + n));
                        }

                        float dist_line(vec2 which, vec2 p1, vec2 p2){
                            float r = clamp(dot(which - p1, p2 - p1) / dot(p2 - p1, p2 - p1), .0, 1.);
                            return length((which - p1)-(p2 - p1)*r);
                        }

                        float drawline(vec2 which, vec2 p1, vec2 p2, float w){
                            float dis = dist_line(which, p1, p2);
                            return smoothstep(.015*w, .005*w, dis)*smoothstep(.8, .0, distance(p1, p2)-.25);
                        }

                        vec2 Getpos(vec2 v){
                            vec2 p = rand_2(v);
                            return vec2(.5)+.4*vec2(cos(p.x*(iTime+5.)), sin(p.y*(iTime+5.)));
                        }

                        vec3 layer(vec2 uv, float w){
                            float m=.0;
                            
                            
                            vec2 fl_uv = floor(uv);
                            vec2 fr_uv = fract(uv);
                            
                            vec2 id = Getpos(fl_uv);
                            m = smoothstep(.08*w, .01*w, distance(fr_uv, id))*abs(sin((iTime+id.x)*4.));
                            
                            vec2 p[9];
                            int num = 0;
                            for(float i=-1.; i<=1.; i++){
                                for(float j=-1.; j<=1.; j++){
                                    p[num++] = vec2(i,j)+Getpos(fl_uv + vec2(i,j));
                                }
                            }

                            for(int i=0; i<9; i++){
                            m += drawline(fr_uv, p[4], p[i], w);
                            }
                            m += drawline(fr_uv, p[1], p[3], w);
                            m += drawline(fr_uv, p[1], p[5], w);
                            m += drawline(fr_uv, p[3], p[7], w);
                            m += drawline(fr_uv, p[5], p[7], w);
                            return vec3(m);
                        }


                        void main()
                        {
                            vec2 uv = gl_FragCoord.xy / iResolution.xy;
                            float yy = uv.y;
                            uv -= .5;
                            uv.x *= iResolution.x / iResolution.y;
                            uv *= .5;
                            
                            float t = iTime*.1;
                            float rs = sin(2.*t);
                            float rc = cos(2.*t);
                            uv *= mat2(rc, -rs, rs, rc);
                            
                            float m = .0;
                            vec3 v3 = vec3(1.);
                            vec2 fl_uv = floor(uv);
                            vec2 fr_uv = fract(uv);
                            
                            vec2 id = Getpos(fl_uv);
                            vec3 col = vec3(.0);
                            
                            for(float i=.0; i<1.; i+=1./8.){
                                float z = fract(i+t);
                                float size = mix(10., .5, z);
                                float al = smoothstep(.0, .8, z) * smoothstep(1., .8, z);
                                v3 = 0.5 + 0.5*cos(-1.2*z+iTime+uv.xyx+vec3(0,2,4));
                            col += layer(uv*size + i*27.385, 1.)*al*v3;
                            col += layer(uv*size + i*27.385, .4)*pow(al, 2.);
                            }
                            
                            //col *= smoothstep(1., .7, yy)*smoothstep(.0, .3, yy);
                            v3 = 0.5 + 0.5*cos(iTime-1.2+uv.xyx+vec3(0,2,4));
                            col += vec3(.8*yy)*.3*v3;
                            col += vec3(.2*(1.-yy))*.3*v3;
                            
                            vec3 textureColor = texture2D( colorTexture, vUv ).rgb;
                            vec3 fragColor =  col * (10.,10.,10.);
                            if( colorOrMap > 0.5 ) fragColor = fragColor * textureColor;
                            else fragColor = fragColor * materialColor;
                            gl_FragColor = vec4(fragColor ,1.0);
                        }
                        `
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