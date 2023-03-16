<template>
<div class="Layout">
    <div class="Layout-Left" v-if="minShow">
        <Nav />
    </div>
    <div class="Layout-Right">
       <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" :key="$route.fullPath" v-if="$route.fullPath" />
            </keep-alive>
            <component :is="Component" :key="$route.fullPath" v-if="!$route.fullPath"   />
        </router-view>
    </div>
    
</div>
</template>

<script lang="ts" setup>
import Nav from './Nav.vue'
import { useRoute } from 'vue-router';
import { ref } from 'vue';
const route = useRoute()
const minShow = ref(false)
document.onkeydown= (e) =>  e.code === 'Backquote' ? (minShow.value = !minShow.value) : ''
// console.log(route)
</script>

<style lang="less" scoped>
.Layout {
    display: flex;
    height: 100vh;
    width: 100vw;

    &-Left {
        height: 100%;
        width: 210px;
    }
    
    &-Right {
        height: 100%;
        width: 100%;
    }
}
</style>