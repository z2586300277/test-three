import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { EffectComposer } from 'three/examples/jsm//postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export const shaderSky = () => {
    // 顶点着色
    const vertexShader = `
    letying vec3 vWorldPosition;
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
    letying vec3 vWorldPosition;
    void main() {
        float h = normalize( vWorldPosition + offset ).y;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
    }`
    const uniforms = {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color('aliceblue') },
        offset: { value: 400 },
        exponent: { value: 0.6 },
        map: {
            encoding: THREE.sRGBEncoding
        }
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
export const floorPlane = (url: any) => {
    // 地面
    const gt = new THREE.TextureLoader().load(url);
    const gg = new THREE.CircleGeometry(4000, 4000);
    const gm = new THREE.MeshPhongMaterial({ color: 0xffffff, map: gt, side: THREE.DoubleSide });
    const ground: any = new THREE.Mesh(gg, gm);
    ground.rotation.x = -Math.PI / 2;
    ground.material.map.repeat.set(64, 64);
    ground.position.y = -8;
    ground.material.map.wrapS = THREE.RepeatWrapping;
    ground.material.map.wrapT = THREE.RepeatWrapping;
    ground.material.map.encoding = THREE.sRGBEncoding;
    return ground
}

export function setControls(camera: any, renderer: any) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minZoom = 1000;
    controls.minDistance = 25;
    // controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
    return controls
}

export const loadFBX = ( url:string = 'model/西宿舍楼/xisushelou02.FBX', callback: any) => {
    //加载器
    const loader = new FBXLoader();

    //加载模型
    loader.load(url, (object3d: any) => {

        // 遍历对象
        object3d.traverse((obj: any) => {

            //  产生投影
            obj.castShadow = true;

            // 接受阴影
            obj.receiveShadow = true

            // 如果存在材质
            if (obj.material) {

                // 处理模型材质
                if (Array.isArray(obj.material)) obj.material.map((item: any) => changeModelMaterial(item))
                else changeModelMaterial(obj.material)

                function changeModelMaterial(material: any) {

                    // 双面渲染
                    material.side = THREE.DoubleSide;

                    //是否使用顶点着色
                    material.vertexColors = false;

                }

            }
        })

        callback(object3d)

    })
}

export function setOutLinePass(scene: any, camera: any, renderer: any, threeDom: any, ModelList: Array<any> = []) {

    //创建效果组合器对象，可以在该对象上添加后期处理通道，通过配置该对象，使它可以渲染我们的场景，并应用额外的后期处理步骤，在render循环中，使用EffectComposer渲染场景、应用通道，并输出结果。
    const Composer = new EffectComposer(renderer)
    Composer.setSize(threeDom.offsetWidth, threeDom.offsetHeight);
    Composer.setPixelRatio(window.devicePixelRatio * 2)

    // 多场景渲染
    const renderPass = new RenderPass(scene, camera)
    Composer.addPass(renderPass);

    // 添加 GammaCorrectionShader 颜色校正器
    const effectColorSpaceConversion = new ShaderPass(GammaCorrectionShader);
    Composer.addPass(effectColorSpaceConversion);

    //锯齿处理
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (threeDom.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (threeDom.offsetHeight * pixelRatio);

    // 需要选中的物体对象, 传入需要边界线进行高亮处理的对象
    const outlinePass: any = new OutlinePass(new THREE.Vector2(threeDom.offsetWidth, threeDom.offsetHeight), scene, camera, ModelList);
    outlinePass.renderToScreen = true;
    outlinePass.edgeStrength = 4 //粗
    outlinePass.edgeGlow = 2 //发光
    outlinePass.edgeThickness = 2.5 //光晕粗
    outlinePass.pulsePeriod = 1 //闪烁
    outlinePass.usePatternTexture = false //是否使用贴图
    outlinePass.visibleEdgeColor.set('#4169E1'); // 设置显示的颜色
    outlinePass.hiddenEdgeColor.set('#F0F8FF'); // 设置隐藏的颜色
    // 眩光通道outLinePass插入到composer
    Composer.addPass(outlinePass)

    return { Composer, outlinePass }
}

export function setStats(){
    // 创建性能监视器
    let stats = new (Stats as any)()

    // 设置监视器面板，传入面板id（0: fps, 1: ms, 2: mb）
    stats.setMode(0)

    // 设置监视器位置
    stats.domElement.style.position = 'absolute'
    stats.domElement.style.left = '0px'
    stats.domElement.style.top = '0px'

    document.body.appendChild(stats.domElement)

    return stats
}



// 鼠标位置
export function getWebGLMouse(event:any){
    //获取鼠标位置 转化webgl 坐标
    return new THREE.Vector2(
        (event.offsetX / event.target.clientWidth) * 2 - 1,
        -(event.offsetY /  event.target.clientHeight) * 2 + 1
    )
}

// 鼠标射线
export function clickIntersect(mouse:any,CAMERA:any, SCENE:any) :any {

     //创建射线
     const raycaster = new THREE.Raycaster()

     //设置射线的起点
     raycaster.setFromCamera(mouse, CAMERA)

     //获取射线碰撞的物体
     const intersects = raycaster.intersectObjects(SCENE.children)

     //如果有碰撞 //获取碰撞的第一个物体
     if(intersects.length > 0)return  intersects[0]

     else return null;
}

// 顶点格式化
export const  formatVertices = (value:[]) => value.reduce((j:any, i:any) => [i.x, i.y, i.z, ...j], [])

// 线物体
export function lineGeometry(arr:any) {

    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array(arr);

    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    const material = new THREE.LineBasicMaterial( {color: 'red', lineWidth: 10 } );
    
    const mesh = new THREE.Line( geometry, material );

    return mesh
}

// 多变形顶点组算法处理  生成面组
export function multShapeGroup(pList:any, way:any = 'indexFace' || 'pointFace', scene:any = null) {
   
    // 直接格式化成顶点组
    if (way === 'pointFace') {

        const faceGroup = pList.map((i:any,k:any, o:any) => (k >= 2) ? [o[0], o[k - 1], o[k]]:false ).filter((i:any) => i).reduce((i:any,j:any) => [...i,...j],[]).reduce((j:any, i:any) => [i.x, i.y, i.z, ...j], [])
        
        return {faceGroup}
    }

    // 根据索引设置面可以重复使用点
    else {
        
        const indexGroup = pList.map((i:any,k:any, o:any) => (k >= 2) ? [0, k-1, k] :false ).filter((i:any) => i).reduce((i:any,j:any) => [...i,...j],[])

        const faceGroup = pList.reduce((j:any, i:any) => [i.x, i.y, i.z, ...j], [])

        const uvMaxMin = pList.reduce((p:any, i:any) => ({x: [...p['x'],i['x']],y: [...p['y'],i['y']],z: [...p['z'],i['z']]}), {x: [], y:[], z: []})
        
        // vu 点计算 二维面
        let Maxp = new THREE.Vector3(Math.max(...uvMaxMin.x), Math.max(...uvMaxMin.y), Math.max(...uvMaxMin.z))  // 最大点
        let Minp = new THREE.Vector3(Math.min(...uvMaxMin.x), Math.min(...uvMaxMin.y), Math.min(...uvMaxMin.z))  // 最小点
        let Maxc = new THREE.Vector3(Maxp.x, Maxp.y , Minp.z) // 镜像点1
        let Minc = new THREE.Vector3(Minp.x, Minp.y , Maxp.z) // 镜像点2
        let W = Maxp.x  - Minp.x
        let H = Maxp.z  - Minp.z
        const L = W > H ? W : H  // 以最大为基准
     
        if(scene) {
            const g = new THREE.BoxGeometry(10,10,10)
            const m = new THREE.MeshBasicMaterial({ color: 0xffffff * Math.random()})
            const mesh = new THREE.Mesh(g , m)
            const a = mesh.clone()
            const d = mesh.clone()
            const e = mesh.clone()
            a.position.set(...Maxp)
            mesh.position.set(...Minp)
            d.position.set(...Maxc)
            e.position.set(...Minc)
            scene.add(a)  
            scene.add(mesh)  
            scene.add(d)  
            scene.add(e)  
        }

        const uvGroup = pList.map((i:any, k:any, o:any) => {
            // return[(i.x - Minp.x) / W, (i.z - Minp.z) / H]
            return [[0, 0], [0, 1], [1, 1], [1, 0]][k % 4] // 固定方式弃用
        }).reduce((i:any, j:any) => [...i, ...j], []);

        return { indexGroup , faceGroup , uvGroup}
    }
    
}

// 根据顶点组生成物体
export  function multShapePlaneGeometry(faceGroup:any, indexGroup:any, uvGroup:any,textureMap:any = 'https://img0.baidu.com/it/u=981218435,2998857702&fm=253&app=120&size=w931&n=0&f=JPEG&fmt=auto?sec=1677603600&t=455d091ed3eb38bf61a72df4b1285a9d') {

    const geometry = new THREE.BufferGeometry();

    // 因为在两个三角面片里，这两个顶点都需要被用到。
    const vertices = new Float32Array(faceGroup);

    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    // 索引组 面
    if(indexGroup) {

        // 格式化索引面组
        let indexs = new Uint16Array(indexGroup);

        // 添加索引组
        geometry.index = new THREE.BufferAttribute(indexs, 1)

    }

    // uv 是二维坐标相当于三维物体展开图
    if(uvGroup) geometry.attributes.uv = new THREE.Float32BufferAttribute(  uvGroup, 2)

    //导入纹理
    const textureLoader = new THREE.TextureLoader()

    //加载纹理图
    const texture = textureLoader.load(textureMap)

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 2, 2 );

    const material = new THREE.MeshBasicMaterial( { side:THREE.DoubleSide,map: texture , transparent: true, opacity: 0.8} );
    
    const mesh = new THREE.Mesh( geometry, material );

    return mesh
}
 
// 点模型物体
export function pointsGeometry(vertices:any) {

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const material = new THREE.PointsMaterial( { color: 'red', size: 80 } );

    const points = new THREE.Points( geometry, material );

    return points
}

// 获取模型包围盒子
 /*
       6----7
      /|   /|
     2----3 |
     | |  | |
     | 4--|-5
     |/   |/
     0----1
  */
export function getModelBox(mesh:any ,scene:any = null) {
    let { max, min }:any = new THREE.Box3().setFromObject(mesh);
    let point_max =new THREE.Vector3(max.x,max.y,max.z);
    let point_max_right =new THREE.Vector3(min.x,max.y,max.z);
    let point_max_behind =new THREE.Vector3(max.x,max.y,min.z);
    let point_max_under =new THREE.Vector3(max.x,min.y,max.z);
    let point_min =new THREE.Vector3(min.x,min.y,min.z);
    let point_min_front =new THREE.Vector3(min.x,max.y,min.z);
    let point_min_top =new THREE.Vector3(min.x,min.y,max.z);
    let point_min_left =new THREE.Vector3(max.x,min.y,min.z);
    let ponit_arr = [point_max, point_max_right, point_max_behind, point_max_under, point_min, point_min_front, point_min_top, point_min_left]


    console.log(THREE.Face3)

    // 可视化开发
    if( scene) {
        ponit_arr.map((i:any) => {
            const g = new THREE.BoxGeometry(10,10,10)
            const m = new THREE.MeshBasicMaterial({ color: 'red'})
            const c = new THREE.Mesh(g , m)
            c.position.set(...i)
            scene.add(c)  
        })

        
    }
    
    return  { max, min }
}