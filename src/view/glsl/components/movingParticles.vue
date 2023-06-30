<template>
  <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref, onMounted } from 'vue';
import { setControls, setParticleEffect } from '../../three/threeApi';

const threeBox = ref()
onMounted(() => init(threeBox.value))
function init(DOM: any) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
  scene.add(camera);
  camera.position.set(0, 300, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true })
  renderer.setSize(DOM.clientWidth, DOM.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio * 2)
  DOM.appendChild(renderer.domElement)
  setControls(camera, renderer)
 
  const { geometry, geometryRender } = setParticleEffect(100000, 0, 1000, 0.01)

  const material = new THREE.PointsMaterial({
    size: 10,
    color: Math.random() * 0xffffff,
    map: new THREE.TextureLoader().load('/snow.png'),
    transparent: true,
    sizeAttenuation: true, // 开启根据距离进行大小衰减
    alphaTest: 0.4,// 控制透明度显示的阈值，越低则显示效果越好
    blending: THREE.AdditiveBlending,
    depthTest: true
  });
  console.log(material)

  const particleGeometry = new THREE.Points(geometry, material);
  scene.add(particleGeometry);

  function animate() {
    geometryRender()
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();


}
</script>

<style lang="less" scoped>
.threeBox {
  width: 100%;
  height: 100%;
}
</style>