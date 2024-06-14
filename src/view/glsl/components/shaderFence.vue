<template>
    <div ref="test" class="test">
 
    </div>
 </template>
 
 <script setup>
 
 import * as THREE from "three";
 import {onMounted, ref} from "vue";
 import  {OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
 
 const vertexs = `  varying vec2 vUv;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    
  }`
 
 
 const fragments = `
 
 uniform float time;
  uniform float opacity;
  uniform vec3 color;
  uniform float num;
  uniform float hiz;

  varying vec2 vUv;

  void main() {
    vec4 fragColor = vec4(0.);
    float sin = sin((vUv.y - time * hiz) * 10. * num);
    float high = 0.92;
    float medium = 0.4;
    if (sin > high) {
      fragColor = vec4(mix(vec3(.8, 1., 1.), color, (1. - sin) / (1. - high)), 1.);
    } else if(sin > medium) {
      fragColor = vec4(color, mix(1., 0., 1.-(sin - medium) / (high - medium)));
    } else {
      fragColor = vec4(color, 0.);
    }

    vec3 fade = mix(color, vec3(0., 0., 0.), vUv.y);
    fragColor = mix(fragColor, vec4(fade, 1.), 0.85);
    gl_FragColor = vec4(fragColor.rgb, fragColor.a * opacity * (1. - vUv.y));
  }
 `
 console.log(fragments)
 
 const custMaterial1 = new THREE.ShaderMaterial({
   uniforms: {
     time: {
       type: "pv2",
       value: 0,
     },
     color: {
       type: "uvs",
       value: new THREE.Color("#FF4127"),
     },
     opacity: {
       type: "pv2",
       value: 1.0,
     },
     num: {
       type: "pv2",
       value: 10,
     },
     hiz: {
       type: "pv2",
       value: 0.03,
     },
   },
   vertexShader: vertexs,
   fragmentShader: fragments,
   blending: THREE.AdditiveBlending,
   transparent: !0,
   depthWrite: !1,
   depthTest: !0,
   side: THREE.DoubleSide,
 });
 
 let test =  ref(null), renderer, scene, camera, controls, pmremGenerator
 
 onMounted(() => {
   initModel();
   test.value.appendChild(renderer.domElement)
   animal();
 })
 
 function animal() {
   renderer.render(scene, camera)
   if (custMaterial1) {
     custMaterial1.uniforms.time.value += 0.015;
   }
   requestAnimationFrame(animal)
 }
 
 function initModel() {
   renderer = new THREE.WebGLRenderer({
     antialias: true, //开启锯齿
   })
   renderer.physicallyCorrectLights = true;
   renderer.outputEncoding = THREE.sRGBEncoding;
   renderer.toneMapping = THREE.ACESFilmicToneMapping;
   renderer.toneMappingExposure = 0.85
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   renderer.setClearColor(0x000000, 0)
   let width = test.value.clientWidth
   let height = test.value.clientHeight
   renderer.setPixelRatio(window.devicePixelRatio) //设置设备像素比率,防止Canvas画布输出模糊。
   renderer.setSize(width, height) //设置渲染区域尺寸
 
   scene = new THREE.Scene()
   camera = new THREE.PerspectiveCamera(30, width / height, 1, 40000)
   camera.up.set(0, 0 ,1)
   controls = new OrbitControls(camera, renderer.domElement)
   camera.position.set(50, 50, 50)
   addShape()
   scene.add(new THREE.AxesHelper(50))
   let ambient = new THREE.AmbientLight(0xffffff, 0.8)
   scene.add(ambient)
   const hemiLight = new THREE.HemisphereLight(0x00AAFF, 0xFFAA00, 0.8);
   scene.add(hemiLight);

 }
 
 function addShape() {
  
   let c = [0,0, 10, 0, 10, 10, 0, 10, 0, 0]

   let posArr = [];

   let uvrr = [];

   let h = 10; //围墙拉伸高度

   for (let i = 0; i < c.length - 2; i += 2) {

     // 矩形的三角形1
     posArr.push(c[i], c[i + 1], 0, c[i + 2], c[i + 3], 0, c[i + 2], c[i + 3], h);

     // 矩形的三角形2
     posArr.push(c[i], c[i + 1], 0, c[i + 2], c[i + 3], h, c[i], c[i + 1], h);
 
     // 注意顺序问题，和顶点位置坐标对应
     uvrr.push(0, 0, 1, 0, 1, 1);

     uvrr.push(0, 0, 1, 1, 0, 1);

   }
   const geometry = new THREE.BufferGeometry(); //声明一个空几何体对象

   // 设置几何体attributes属性的位置position属性
   geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(posArr), 3);

   // 设置几何体attributes属性的位置uv属性
   geometry.attributes.uv = new THREE.BufferAttribute(new Float32Array(uvrr), 2);

   geometry.computeVertexNormals()
 
   const custMaterial = new  THREE.MeshLambertMaterial({

     color: 0X049ef4,

     side : THREE.DoubleSide

   })
 
   let mesh = new THREE.Mesh(geometry, custMaterial1); //网格模型对象Mesh

   scene.add(mesh);
   // mesh.rotateX(-Math.PI / 2);
 
 }
 
 </script>
 
 <style scoped lang="less">
 .test {
   height: 100%;
 }
 </style>
 
 