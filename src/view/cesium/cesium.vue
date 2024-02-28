<template>
    <div id="cesiumContainer" class="cesiumContainer"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { GisSceneEditor } from '@gdmp/gis-scene-editor'
onMounted(() => {
    new GisSceneEditor(document.getElementById('cesiumContainer'))
})

</script>

<style scoped>
.cesiumContainer {
    width: 100%;
    height: 100%;
}
</style>