<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted, onUnmounted, onActivated, onDeactivated} from 'vue';
import { setControls , loadFBX, loaderManager ,getMaterials} from '../three/threeApi';
import { createGUI } from '../three/GUI'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { SSRPass } from 'three/addons/postprocessing/SSRPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const threeBox = ref()
onMounted(() => { 
    init(threeBox.value)
})

let composer:any;
let ssrPass;
let controls;
let camera, scene, renderer;

function init(DOM:any) {

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10000005 );
    camera.position.set( 0.13271600513224902, 0.3489546826045913, 0.43921296427927076 );

    scene = new THREE.Scene()

    // Ground
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry( 80, 80 ),
        new THREE.MeshStandardMaterial( { color: 0xcbcbcb } )
    );
    plane.rotation.x = - Math.PI / 2;
    scene.add( plane );

    // Lights
    const abm = new THREE.AmbientLight( 0xffffff, 3 );
    scene.add( abm );

    let geometry, material, mesh;

    geometry = new THREE.ConeGeometry( .025, .05, 64 );
    material = new THREE.MeshStandardMaterial( { color: 'yellow' } );
    mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( - .05, .025, - .055 );
    scene.add( mesh );

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    DOM.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );

    composer = new EffectComposer( renderer );
    ssrPass = new SSRPass( {
        renderer,
        scene,
        camera,
        width: innerWidth,
        height: innerHeight,
    } );

    composer.addPass( ssrPass );

    animate()

    function animate() {

        requestAnimationFrame( animate );
        composer.render();


    }

}


</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
</style>