<template>
      <div class="test" ref="plane">

            <el-button @click="click">点击</el-button>
            <div>{{ value }}</div>
            <div class="charts" ref="charts"></div>
      </div>

      <div class="test2" ref="dateRef">
            <el-calendar v-model="date"></el-calendar>
            <el-steps :active="0" finish-status="success">
                  <el-step title="步骤 1"></el-step>
                  <el-step title="步骤 2"></el-step>
                  <el-step title="步骤 3"></el-step>
            </el-steps>
            <el-image class="img" src="https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg"></el-image>
      </div>
      <div ref="threeBox" class="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import * as echarts from 'echarts'
import { ThreeSceneEditor } from '@gdmp/three-scene-editor'
import { ref, onMounted } from 'vue'
const threeBox = ref(null)

const value = ref(0)
const plane = ref()
const date = ref(new Date())
const dateRef = ref()
const charts = ref()
let myChart: any = null
let options: any
let threeSceneEditor: any = null


onMounted(() => {
      const option: any = {
            threeBoxRef: threeBox.value,
            rendererParams: {
                  fps: 60,
                  pixelRatio: window.devicePixelRatio * 1.5,
                  webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer: true },
                  userPermissions: { autoPlace: true, proxy: true } // 权限
            },
            sceneParams: JSON.parse(localStorage.getItem('sceneParams') as any),
            meshListParams: JSON.parse(localStorage.getItem('meshListParams') as any),
            skyParams: JSON.parse(localStorage.getItem('skyParams') as any),
            saveEditorCallBack: (sceneParams: any, meshListParams: any) => {
                  localStorage.setItem('sceneParams', JSON.stringify(sceneParams))
                  localStorage.setItem('meshListParams', JSON.stringify(meshListParams))
            },
            clickEventCallback: () => { }
      }
      threeSceneEditor = new (ThreeSceneEditor as any)(option)

      threeSceneEditor.setCss3dDOM(plane.value, new THREE.Vector3(0, 0, 0))

      const mesh = threeSceneEditor.setCss3dDOM(dateRef.value, new THREE.Vector3(0, 100, -100))

      mesh.scale.set(0.1, 0.1, 0.1)

      myChart = echarts.init(charts.value);

      options = {

            xAxis: {
                  type: 'category',
                  boundaryGap: false,
                  data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                  type: 'value'
            },
            series: [
                  {
                        data: [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000],
                        type: 'line',
                        areaStyle: {}
                  }
            ]
      };

      myChart.setOption(options);

})

function click() {

      value.value += 1

      const option = {

            xAxis: {
                  type: 'category',
                  boundaryGap: false,
                  data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                  type: 'value'
            },
            series: [
                  {
                        data: [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000],
                        type: 'line',
                        areaStyle: {}
                  }
            ]
      };
      myChart.setOption(option)
}


</script>

<style lang="less" scoped>
.threeBox {
      width: 100%;
      height: 100%;
}

.test,
.test2 {
      position: absolute;
      top: 0px;
      left: 0px;
}

.img {
      width: 100px;
      height: 100px;
}

.charts {
      width: 500px;
      height: 500px;
}
</style>