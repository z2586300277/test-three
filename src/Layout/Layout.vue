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
import { ref } from 'vue';
import { useUserStore,  useAdminStore } from '../pinia'

const minShow = ref(false)
const adminStore = useAdminStore()

// 初始化加载权限
const token = localStorage.getItem('token')
if(token === 'admin') adminStore.$state.power = true

// 键盘控制权限
document.onkeydown =  (e) =>{
    if (e.ctrlKey && e.code === 'Backquote') adminStore.$state.power = !adminStore.$state.power
    else if(e.code === 'Backquote' &&  adminStore.$state.power)  minShow.value = !minShow.value
}
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