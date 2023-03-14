<template>
   <div class="box">
    计算向量
        <el-input v-model="vec1" placeholder="向量1"></el-input>
        <el-input v-model="vec2" placeholder="向量2"></el-input>
        <el-button @click="add">计算向量相加</el-button>
        <el-button @click="sub">计算向量相减</el-button>
        <el-button @click="dot">计算向量点乘</el-button>
        <el-button @click="cross">计算向量叉乘</el-button>
   </div>
    <hr>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref } from 'vue';

let vec1 = ref('1,0,0')
let vec2 = ref('0,1,1')
let v1:any,v2:any
function getResult() {
    
    v1 = new THREE.Vector3(...vec1.value.split(',').map(i => Number(i)))
    v2 = new THREE.Vector3(...vec2.value.split(',').map(i => Number(i)))
    console.log(v1,v2)
}
function add() {
    getResult()
    let v = v1.add(v2)
    console.log(v)
}
function sub() {
    getResult()
    let v = v1.sub(v2)
    console.log(v)
}
function dot() {
    getResult()
    let v = v1.dot(v2)
    console.log(v)
}
function cross() {
//     假设向量a=(a.x,a.y,a.z),b=(b.x,b.y,b.z),c=(c.x,c.y,c.z)，
// 则c=a×b=(a.x,a.y,a.z)×(b.x,b.y,b.z)=(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)
    getResult()
    let v = v1.cross(v2)
    console.log(v)
}



</script>

<style lang="less" scoped>
.box {
    width: 300px;
}
</style>