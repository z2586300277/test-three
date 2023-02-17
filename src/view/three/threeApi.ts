import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export const shaderSky = () => {
    // 顶点着色
    const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;
    // 片元
    const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
        float h = normalize( vWorldPosition + offset ).y;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
    }`
    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color('aliceblue') },
      offset: { value: 400 },
      exponent: { value: 0.6 },
    };
    const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide,
    });
    return new THREE.Mesh(skyGeo, skyMat)
}

// 贴图地面
export const floorPlane = (url:any) => {
    // 地面
    const gt = new THREE.TextureLoader().load(url);
    const gg = new THREE.CircleGeometry(700, 700);
    const gm = new THREE.MeshPhongMaterial({ color: 0xffffff, map: gt, side: THREE.DoubleSide });
    const ground:any = new THREE.Mesh(gg, gm);
    ground.rotation.x = -Math.PI / 2;
    ground.material.map.repeat.set(64, 64);
    ground.position.y = -8;
    ground.material.map.wrapS = THREE.RepeatWrapping;
    ground.material.map.wrapT = THREE.RepeatWrapping;
    ground.material.map.encoding = THREE.sRGBEncoding;
    return ground
}

export function setControls(camera:any, renderer:any) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minZoom = 1000;
    controls.minDistance = 25;
    controls.maxDistance = 250;
    controls.maxPolarAngle = Math.PI / 2.5;
    return controls
}

export const loadFBX = (scene:any,url:string='model/西宿舍楼/xisushelou02.FBX') => {
    //加载器
    const loader = new FBXLoader();
   
    //加载模型
    loader.load(url, (object3d: any) => {
        
        // 遍历对象
        object3d.traverse( (obj:any) => {
           
            //  产生投影
            obj.castShadow = true;

            // 接受阴影
            obj.receiveShadow= true  

            // 如果存在材质
            if (obj.material) {

                // 处理模型材质
                if (Array.isArray(obj.material)) obj.material.map((item:any) => changeModelMaterial(item))
                else changeModelMaterial(obj.material)

                function changeModelMaterial(material:any) {

                    // 双面渲染
                    material.side = THREE.DoubleSide;

                    //是否使用顶点着色
                    material.vertexColors = false;

                }
                    
            }
        })

        object3d.rotation.y = (-180 * Math.PI) / 180;
        object3d.position.set(61.59, -6.1, -58.5);
        scene.add(object3d)

    })
}


