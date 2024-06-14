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
import { ThreeEditor } from 'three-editor-cores'
import { ref, onMounted } from 'vue'
const threeBox = ref(null)

const value = ref(0)
const plane = ref()
const date = ref(new Date())
const dateRef = ref()
const charts = ref()
let myChart: any = null
let options: any
let threeEditor: any = null


onMounted(() => {

      threeEditor = new (ThreeEditor as any)(threeBox.value)

      threeEditor.setCss3dDOM(plane.value, new THREE.Vector3(0, 0, 0)).scale.set(0.01, 0.01, 0.01)

      const mesh = threeEditor.setCss3dDOM(dateRef.value, new THREE.Vector3(0, 100, -100))

      mesh.scale.set(0.01, 0.01, 0.01)

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
      width: 1200px;
      height: 700px;
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