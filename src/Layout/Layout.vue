<template>
<div class="Layout">
    <div class="Layout-Left" v-if="minShow">
        <Nav />
    </div>
    <div class="Layout-Right">
       <!-- <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" :key="$route.fullPath" v-if="$route.fullPath='/keep'" />
            </keep-alive>
            <component :is="Component" :key="$route.fullPath" v-if="$route.fullPath!=='/keep'"   />
        </router-view> -->

        <router-view />
    </div>
    
</div>
</template>

<script lang="ts" setup>
import Nav from './Nav.vue'
import { ref } from 'vue';
import { useUserStore,  useAdminStore } from '../pinia'

const adminStore = useAdminStore()
const minShow = ref(false)

let LayoutSize:any =  ref(Number(localStorage.getItem('LayoutSize')) || 10)
let LayoutHeight = ref(LayoutSize.value * 10 + 'vh')
let LayoutWidth = ref(LayoutSize.value * 10+'vw')
let LayoutBack = ref(localStorage.getItem('LayoutBack') || '#123456')


// 键盘控制权限
document.onkeydown =  (e) =>{
    if (e.ctrlKey && e.code === 'Backquote') adminStore.$state.power = !adminStore.$state.power
    else if(e.code === 'Backquote' &&  adminStore.$state.power)  minShow.value = !minShow.value
    else if(adminStore.$state.power && e.shiftKey &&( e.code === 'Minus' || e.code === 'Equal') )  {
        e.code == 'Minus' ? LayoutSize.value-- : LayoutSize.value++
        LayoutWidth.value =   (LayoutSize.value || 10) * 10 + 'vw'
        LayoutHeight.value =   (LayoutSize.value || 10) * 10 + 'vh'
        localStorage.setItem('LayoutSize', LayoutSize.value)
    }
    else if(adminStore.$state.power && e.shiftKey && e.code == 'Digit1') {
        LayoutBack.value = '#'+(Math.random()*0xffffff<<0).toString(16)
        localStorage.setItem('LayoutBack', LayoutBack.value)
    }
    
}
</script>

<style lang="less" scoped>
@LayoutWidth: v-bind(LayoutWidth);
@LayoutHeight: v-bind(LayoutHeight);

.Layout {
    width: 100vw;
    height: 100vh;
    background-color: v-bind(LayoutBack);

    ::-webkit-scrollbar {
            height: 0px;
            width: 0px;
        }

    
    &-Right {
        height: 99.9%;
        width: 100%;
    }
}
</style>