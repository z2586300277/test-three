<template>
    <!--canvas标签创建一个宽高均为500像素，背景为蓝色的矩形画布-->
    <canvas ref="webglcanvas" width="500" height="500" style="background-color: black"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { initShader } from './glslApi'

const webglcanvas:any = ref()

onMounted(() => init())

function init() {

    //通过getElementById()方法获取canvas画布
    var canvas = webglcanvas.value;

    //通过方法getContext()获取WebGL上下文
    var gl = canvas.getContext('webgl');

    //顶点着色器源码
    var vertexShaderSource = '' +
        'void main(){' +
        //给内置变量gl_PointSize赋值像素大小
        '   gl_PointSize=200.0;' +
        //顶点位置，位于坐标原点
        '   gl_Position =vec4(0.0,0.0,0.0,2.0);' +
        '}';

    //片元着色器源码
    var fragShaderSource = '' +
        'void main(){' +
        //定义片元颜色
        '   gl_FragColor = vec4(1.0,0.0,0.0,1.0);' +
        '}';

    //初始化着色器
    var program = initShader(gl, vertexShaderSource, fragShaderSource);
    
    //开始绘制，显示器显示结果
    gl.drawArrays(gl.POINTS, 0, 1);

}


</script>