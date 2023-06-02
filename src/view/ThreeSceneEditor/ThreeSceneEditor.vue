<template>
      <div ref="threeBox" class="threeBox"></div>
</template>

<script lang="ts" setup>
import { ThreeSceneEditor } from 'guang-three-scene-editor'
import { ref, onMounted } from 'vue'
const threeBox = ref(null)

onMounted(() => {
      const option: any = {
            threeBoxRef: threeBox.value,
            rendererParams: {
                  fps: 60,
                  pixelRatio: window.devicePixelRatio * 1.5,
                  webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer: true },
                  userPermissions: { autoPlace: true, meshTreeFolderPower: false, meshMaterialsPower: false } // 权限
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
      const threeSceneEditor = new (ThreeSceneEditor as any)(option)

      threeSceneEditor.setThreeSceneEditor();
})
</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
</style>