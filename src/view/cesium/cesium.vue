<template>
    <div id="cesiumContainer" class="cesiumContainer"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as Cesium from 'cesium'
import "cesium/Build/Cesium/Widgets/widgets.css"
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjOWM5N2FlYy0wNTIyLTRhZDAtYTM2Yi04ZGEzYzMzNTRjYmQiLCJpZCI6NTcwNzEsImlhdCI6MTYyMjAxMjY3MH0.IRCEryIGGPZeCGqJ8lpMESuZO9DTIlLnF-WS-w9YYzc"
onMounted(() => {
    const viewer = new Cesium.Viewer(document.getElementById('cesiumContainer') as HTMLElement, {
        infoBox: false,
    })
})
</script>

<style scoped>
.cesiumContainer {
    width: 100%;
    height: 100%;
}
</style>