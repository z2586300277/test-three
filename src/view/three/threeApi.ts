import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm//postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Flow } from 'three/examples/jsm/modifiers/CurveModifier.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export function pointCube(point:any, size:number= 10, color:any = 'red') {
    
    const g = new THREE.BoxGeometry(size,size,size)

    const m = new THREE.MeshBasicMaterial({ color })

    const mesh = new THREE.Mesh(g , m)

    mesh.position.set(...point)

    return mesh
}

// 着色器天空
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

// 场景背景
export function setSceneBackground(scene:any) {
    const sceneTexture = new THREE.CubeTextureLoader()
    .load([
        'http://guangfu//scene/LF.jpg',
        'http://guangfu//scene/RT.jpg',
        'http://guangfu//scene/UP.jpg',
        'http://guangfu//scene/DN.jpg',
        'http://guangfu//scene/FR.jpg',
        'http://guangfu//scene/BK.jpg',
    ]);
    sceneTexture.encoding = THREE.sRGBEncoding;
    scene.background = sceneTexture;
    return sceneTexture
}

//获取材质列表
export function getMaterials(object3d:any) {

    let materialArr:any = []
        
    object3d.traverse((c:any )=> {
    
      // 对象图层
      c.layers.enable(3)

      if ( c.isMesh ) { 
        if( Array.isArray(c.material)) c.material.forEach((i:any) => materialArr.push(i))
        else  materialArr.push(c.material);
      }

    });

    let materials:Array<any> = [...new Set(materialArr)]

    return materials
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
    controls.minDistance = 10;
    controls.maxDistance = 50000;
    controls.maxPolarAngle = Math.PI / 2;
    return controls
}

// 模型加载管理器
export const loaderManager =  () => {

    const manager = new THREE.LoadingManager();

    manager.onStart = function ( url:any, itemsLoaded:any, itemsTotal:any ) {

    };

    manager.onLoad = function ( ) {

    };

    manager.onProgress = function ( url:any, itemsLoaded:any, itemsTotal:any ) {

    };

    manager.onError = function ( url:any ) {

    };

    return manager
}

export const loadFBX = ( url:string = 'model/西宿舍楼/xisushelou02.FBX', callback: any, manager?:any) => {
    //加载器
    const loader = new FBXLoader(manager);

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

    },(xhr) =>{/* console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) */})

    return loader
}

export const loadGltf = (url:string = '', callback: any = () => {}) => {

    //创建加载器
    const loader = new GLTFLoader()

    //加载模型
    loader.load(
        
        url,

        (gltf:any) =>  callback(gltf.scene),

        //加载
        (xhr) =>  {/* console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ); */},

        //加载失败
        (e) => {}
    )
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
    outlinePass.edgeStrength = 2 //粗
    outlinePass.edgeGlow = 2 //发光
    outlinePass.edgeThickness = 1.5 //光晕粗
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
export function clickIntersect(mouse:any,CAMERA:any, SCENE:any, isList: any = false) :any {

     //创建射线
     const raycaster = new THREE.Raycaster()

     //设置射线的起点
     raycaster.setFromCamera(mouse, CAMERA)

     //获取射线碰撞的物体
     const intersects = raycaster.intersectObjects(SCENE.children)

     if(isList) return intersects

     //如果有碰撞 //获取碰撞的第一个物体
     if(intersects.length > 0)return  intersects[0]

     else return null;
}

// 顶点格式化
export const  formatVertices = (value:[]) => value.reduce((j:any, i:any) => [ ...j, i.x, i.y, i.z], [])

// 线物体
export function lineGeometry(arr:any) {

    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array(arr);

    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    const material = new THREE.LineBasicMaterial( {color: 'red' } );
    
    const mesh = new THREE.Line( geometry, material );

    return mesh
}
// point 生成线
export function createLine(points:any, color:any = 'red') {

    let geometry = new THREE.BufferGeometry(); //声明一个几何体对象Geometry

	// setFromPoints方法从points中提取数据改变几何体的顶点属性vertices
	geometry.setFromPoints(points);

	//材质对象
	let material = new THREE.LineBasicMaterial({
	  color,
	});
    
	//线条模型对象
	return new THREE.Line( geometry, material );

}

// 多变形顶点组算法处理  生成 索引组 面点组 uv组
export function multShapeGroup(pList:any, way:any = 'indexFace' || 'pointFace', scene:any = null) {
   
    // 直接格式化成顶点组
    if (way === 'pointFace') {

        const faceGroup = pList.map((i:any,k:any, o:any) => (k >= 2) ? [o[0], o[k - 1], o[k]]:false ).filter((i:any) => i).reduce((i:any,j:any) => [...i,...j],[]).reduce((j:any, i:any) => [...j,i.x, i.y, i.z], [])
        
        return {faceGroup}
    }

    // 根据索引设置面可以重复使用点
    else {
        
        const indexGroup = pList.map((i:any,k:any, o:any) => (k >= 2) ? [0, k-1, k] :false ).filter((i:any) => i).reduce((i:any,j:any) => [...i,...j],[])

        const faceGroup = pList.reduce((j:any, i:any) => [...j, i.x, i.y, i.z], [])
        
        const uvMaxMin = pList.reduce((p:any, i:any) => ({x: [...p['x'],i['x']],y: [...p['y'],i['y']],z: [...p['z'],i['z']]}), {x: [], y:[], z: []})
        
        // vu 点计算 二维面
        let Maxp = new THREE.Vector3(Math.max(...uvMaxMin.x), Math.max(...uvMaxMin.y), Math.max(...uvMaxMin.z))  // 最大点
        let Minp = new THREE.Vector3(Math.min(...uvMaxMin.x), Math.min(...uvMaxMin.y), Math.min(...uvMaxMin.z))  // 最小点
        let Maxc = new THREE.Vector3(Maxp.x, Maxp.y , Minp.z) // 镜像点1 对称
        let Minc = new THREE.Vector3(Minp.x, Minp.y , Maxp.z) // 镜像点2 
        let W = Maxp.x  - Minp.x
        let H = Maxp.z  - Minp.z
        const L = W > H ? W : H  // 以最大为基准
     
        if (scene) {
            const g = new THREE.BoxGeometry(10,10,10)
            const m = new THREE.MeshBasicMaterial({ color: 0xffffff * Math.random()})
            const mesh = new THREE.Mesh(g , m)
            const a = mesh.clone()
            const d = mesh.clone()
            const e = mesh.clone()
            a.position.set(Maxp.x, Maxp.y, Maxp.z)
            mesh.position.set(Minp.x, Minp.y, Minp.z)
            d.position.set(Maxc.x, Maxc.y, Maxc.z)
            e.position.set(Minc.x, Minc.y, Minc.z)
            scene.add(a)  
            scene.add(mesh)  
            scene.add(d)  
            scene.add(e)  
        }

        // 顶点uv计算
        const uvGroup = pList.map((i:any, k:any, o:any) => {

           // 顶点uv计算 [[0, 0], [0, 1], [1, 1], [1, 0]][k % 4] // 固定方式不准确弃用
            let uv = new THREE.Vector2((i.x - Minp.x) / L, (i.z - Minp.z) / L)
            let uv2 = new THREE.Vector2((i.x - Maxc.x) / L, (i.z - Maxc.z) / L)
            let uv3 = new THREE.Vector2((i.x - Minc.x) / L, (i.z - Minc.z) / L) 

            return uv || uv2 || uv3
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
    texture.encoding = THREE.sRGBEncoding
    

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );

    const material = new THREE.MeshBasicMaterial( { side:THREE.DoubleSide,map: texture , transparent: true, opacity: 0.8} );
    
    const mesh = new THREE.Mesh( geometry, material );

    return mesh
}
 
// 点模型物体
export function pointsGeometry(vertices:any,color:any = 'red', size:any = 10) {

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    const material = new THREE.PointsMaterial( { color: new THREE.Color(color), size } );

    const points = new THREE.Points( geometry, material );

    return points
}

export function simplePointsToFace(arr:any,name:any, color:any) {

    const faceGroup = arr.map((i:any,k:any, o:any) => (k >= 2) ? [o[0], o[k - 1], o[k]]:false ).filter((i:any) => i).reduce((i:any,j:any) => [...i,...j],[]).reduce((j:any, i:any) => [i.x, i.y, i.z, ...j], [])

    const geometry = new THREE.BufferGeometry();

    // 因为在两个三角面片里，这两个顶点都需要被用到。
    const vertices = new Float32Array(faceGroup);

    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    const material = new THREE.MeshBasicMaterial( { side:THREE.DoubleSide, color: color , transparent: true, opacity: 0.6} );
    
    const mesh = new THREE.Mesh( geometry, material );

    mesh.name = name;

    return mesh
}


export function setPointsLineFaceGeometry(object:any,pointsArr:any, scene:any) {

    // 格式化顶点格式 如果使用 setFrom 则不需要格式化
    const arr = formatVertices(pointsArr)
      
      // 生成点物体
     if(!object.points) {
          object.points = pointsGeometry(arr, 0xffffff * Math.random())
          scene.add(object.points)
      }
      else {
          // 使用geometry api 更新顶点  此形式不用格式化成一个数组  ||    /* 设置属性方式 需要格式化数组 */
          object.points.geometry.setFromPoints(pointsArr) ||  object.points.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( arr, 3 ) )
      }

      // 生成线物体
      if(!object.line) {
          object.line = lineGeometry(arr)
          scene.add(object.line)
      } else {
          object.line.geometry.setFromPoints(pointsArr)
      }
      
      // 生成面物体
      if(!object.area){
          const {indexGroup, faceGroup, uvGroup } = multShapeGroup(pointsArr, 'indexFace')
          object.area = multShapePlaneGeometry(faceGroup,indexGroup, uvGroup)
          object.area.position.y += 10
          scene.add(object.area)
      }
      else {
          const {indexGroup, faceGroup, uvGroup } = multShapeGroup(pointsArr, 'indexFace')
          object.area.geometry.setIndex(indexGroup)
          object.area.geometry.setAttribute('position', new THREE.Float32BufferAttribute(faceGroup, 3))
          object.area.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvGroup, 2))
      }
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

    const position = new THREE.Vector3();
    mesh.getWorldPosition(position);

    // 包围盒点可视化
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

    // 包围盒面可视化
    const T = simplePointsToFace([ponit_arr[0], ponit_arr[1], ponit_arr[5], ponit_arr[2]], 'top_plane', 'red');
    const B = simplePointsToFace([ponit_arr[3], ponit_arr[6], ponit_arr[4], ponit_arr[7]], 'bottom_plane', 'yellow');
    const L = simplePointsToFace([ponit_arr[1], ponit_arr[6], ponit_arr[4], ponit_arr[5]], 'left_plane', 'blue');
    const R = simplePointsToFace([ponit_arr[0], ponit_arr[3], ponit_arr[7], ponit_arr[2]], 'right_plane', 'green');
    const F = simplePointsToFace([ponit_arr[1], ponit_arr[0], ponit_arr[3], ponit_arr[6]], 'front_plane', 'DarkSlateGray');
    const K = simplePointsToFace([ponit_arr[5], ponit_arr[2], ponit_arr[7], ponit_arr[4]], 'back_plane', 'Indigo');
    const plane_arr =  [T,B,L,R,F,K]
 
    // 生成切面
    const clipFace_arr = []
    clipFace_arr[0] = new THREE.Plane(new THREE.Vector3(0, -1, 0),max.y); // 上
    clipFace_arr[1] = new THREE.Plane(new THREE.Vector3(0, 1, 0), -min.y); // 下
    clipFace_arr[2] = new THREE.Plane(new THREE.Vector3(1, 0, 0), -min.x); // 左
    clipFace_arr[3] = new THREE.Plane(new THREE.Vector3(-1, 0, 0),max.x); // 右
    clipFace_arr[4] = new THREE.Plane(new THREE.Vector3(0, 0, -1),max.z); // 前
    clipFace_arr[5] = new THREE.Plane(new THREE.Vector3(0, 0, 1), -min.z); // 后    

    // 切割配置
    const clipFace_Way:any = {
        x: { clip: clipFace_arr[2], width: max.x - min.x, end: clipFace_arr[2].constant },
        _x: { clip: clipFace_arr[3], width: max.x - min.x, end: clipFace_arr[3].constant },
        y: { clip: clipFace_arr[1], width: max.y - min.y, end: clipFace_arr[1].constant },
        _y: { clip: clipFace_arr[0], width: max.y - min.y, end: clipFace_arr[0].constant },
        z: { clip: clipFace_arr[4], width: max.z - min.z, end: clipFace_arr[4].constant },
        _z: { clip: clipFace_arr[5], width: max.z - min.z, end: clipFace_arr[5].constant },
        reset: () => {
            ['x','y', 'z'].forEach((i:any) => {
                clipFace_Way[i].clip.constant = clipFace_Way[i].end
                clipFace_Way['_'+ i].clip.constant = clipFace_Way['_'+ i].end
            })
        }
    } 

    // 动画渲染
    const pipeAnimation = (i:any) =>{
        clipFace_Way.reset()
        clipFace_Way[i].clip.constant -= clipFace_Way[i].width
        return (speed:any ,callback:any) => {  
            if (clipFace_Way[i].clip.constant + speed > clipFace_Way[i].end)  callback()
            else clipFace_Way[i].clip.constant += speed
        }
    }

    // 材质 克隆 防止相同材质出问题
    if (Array.isArray(mesh.material)) mesh.material =  mesh.material.map((i:any) => i.clone())
    else mesh.material = mesh.material.clone();

    // 将切面赋予材质
    mesh.material.clippingPlanes = clipFace_arr
  
    // 可视化开发
    if( scene) {
        // 可视化显示包围面
        plane_arr.forEach((i:any) => scene.add(i))

        // 可视化显示包围点
        ponit_arr.map((i:any) => {
            const g = new THREE.BoxGeometry(10,10,10)
            const m = new THREE.MeshBasicMaterial({ color: 'red'})
            const c = new THREE.Mesh(g , m)
            c.position.set(...i)
            scene.add(c)  
        })

        // 通过PlaneHelper辅助可视化显示剪裁平面Plane
        clipFace_arr.forEach((a:any) => scene.add(new THREE.PlaneHelper(a, 300, 0xffff00)))
    }
    
    return  { max, min , plane_arr, ponit_arr , clipFace_arr ,clipFace_Way, pipeAnimation, position}
}

// 创造曲线
export const createCurve = (curveList:any) => new THREE.CatmullRomCurve3(curveList.map((p:any) =>  new THREE.Vector3(...p)), false)

// 模型反向
export const modelReverse = (model:any) =>   {
    const {x, y, z} = model.rotation
    const p2 = Math.PI * 2
    model.rotation.set(p2 - x, p2- y, p2 - z)
}

// 计算点位偏移 等同于 mesh.lookAt(point)
export function doublePointOffsetRotate(mesh:any , point:any){

     //模型的偏移量
     let offsetAngle = Math.PI;
     
     //创建一个4维矩阵
     let mtx = new THREE.Matrix4();

     mtx.lookAt(mesh.position.clone(), point, mesh.up);

     mtx.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, offsetAngle, 0)));

     //计算出需要进行旋转的四元数值
     let toRot = new THREE.Quaternion().setFromRotationMatrix(mtx);

     //根据以上值调整角度
     mesh.quaternion.slerp(toRot, 0.2)

}

// 曲线运动
export const curveMove = (curve: any, model:any, speed:any= 0.0001,way:any= 'go' || 'back', insertCallback:any = () =>{},endCallback:any = () => {}) => {

    let time = (way === 'go' ? 0.0001 : 1)

    let process = 0

    return way === 'go' ? () => {

        time += speed
        if(time > 1) time = 1

        const p = curve.getPointAt(time)  // 是getPoint 修正版本
        
        insertCallback(model,p, time)

        model.position.set(p.x,p.y,p.z)

        if(time === 1) return endCallback()
        
    } : () => {

        time -= speed
        if(time < 0) time = 0

        const p = curve.getPoint(time)

        insertCallback(model,p, time)
        
        model.position.copy(p)  

        if(time === 0) return endCallback()
    }
} 

/* hdr */
export function loadHDRTexture(url:any) {

    const texture = new RGBELoader().load( url);
    return texture

}


/**
 * 动态管道
 * @param curveList 曲线点组
 * @param longSection 长分段数目
 * @param radius 半径
 * @param radiusSection 半径分段 
 * @param isClose 是否闭合
 * @returns 
 */
export function createTube(curve:any, url:any,opacity:any = 1,radius:any = 10, longSection:any = 640,radiusSection:any = 80, isClose:any = false) {
    
    const tubeGeometry = new THREE.TubeGeometry(curve, longSection, radius, radiusSection, isClose);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(url);
    // texture.encoding = THREE.sRGBEncoding
  
    // 设置阵列模式 RepeatWrapping
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
  
    // 设置x方向的重复数(沿着管道路径方向)
    // 设置y方向的重复数(环绕管道方向)
    texture.repeat.x = 10;
    texture.repeat.y = 4;
  
    // 设置管道纹理偏移数,便于对中
    texture.offset.y = 0.9;
  
    const tubeMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      opacity
    });
  
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
  
    return tube
  
}



// 创建贴图
export function createTexture(url:any) {

    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load(url);

    texture.encoding = THREE.sRGBEncoding

    // 设置阵列模式 RepeatWrapping
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    // 设置x方向的重复数(沿着管道路径方向)
    // 设置y方向的重复数(环绕管道方向)
    texture.repeat.x = 10;
    texture.repeat.y = 4;

    // 设置管道纹理偏移数,便于对中
    texture.offset.y = 0.9;

    return texture
    
}

// 贴图img 形式
export async function  asyncCreateTexture(url:any) {

    var texture = new THREE.Texture();

    const image:any = new Image()
    image.crossOrigin = 'anonymous';
    image.src = url
    
    await new Promise((r:any,j:any) => {
        
        image.onload = () => {
            texture.image = image
            r(true)
        }
    })

    texture.encoding = THREE.sRGBEncoding

    // 设置阵列模式 RepeatWrapping
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    // 设置x方向的重复数(沿着管道路径方向)
    // 设置y方向的重复数(环绕管道方向)
    texture.repeat.x = 10;
    texture.repeat.y = 4;

    // 设置管道纹理偏移数,便于对中
    texture.offset.y = 0.9;
   
    texture.needsUpdate = true;

    return texture
}

// viedo 贴图
export async function createVideoTexture(url:any) {

    const video = document.createElement('video')
    video.crossOrigin = 'anonymous';
    video.src = url
    video.loop = true
    video.muted = true
    video.play()

    await new Promise((r:any,j:any) => {
        video.onloadeddata = () => {
            r(true)
        }
    })

    const texture = new THREE.VideoTexture(video)
    texture.encoding = THREE.sRGBEncoding

    return texture
}

// 设置时钟 fps
export function setFpsClock(FPS:number = 144) {
        
    // 创建一个时钟对象Clock
    const clock = new THREE.Clock();

    // 设置渲染频率为30FBS，也就是每秒调用渲染器render方法大约30次
    const renderT = 1 / FPS; //单位秒  间隔多长时间渲染渲染一次

    // 声明一个变量表示render()函数被多次调用累积时间
    // 如果执行一次renderer.render，timeS重新置0
    let timeS = 0;

    return (render:any) => {

        const T = clock.getDelta();
        timeS = timeS + T;
        
        if (timeS > renderT) {
            // 控制台查看渲染器渲染方法的调用周期，也就是间隔时间是多少
            render()   
            //renderer.render每执行一次，timeS置0
            timeS = 0;
        }
    }
}

// 动画播放
export function mixerAnimation (object3d: any) {

    const clock = new THREE.Clock();

    // 动画混合器
    const mixer = new THREE.AnimationMixer(object3d);

    // 获取第一个动画
    let actions = object3d.animations;

    // 动画控制
    const runAction = (action:any, speed:any = 1, startTime:any = 0) => {
        const animationAction = mixer.clipAction(action);
        animationAction.loop = THREE.LoopOnce // 不循环
        animationAction.time = startTime // 不循环
        animationAction.timeScale = speed // 播放速度
        animationAction.clampWhenFinished = true //停留到最后一帧
        return animationAction
    }

    const mixerRender = () => {

        //获取间隔时间  两帧之间的间隔
        const deltaTime = clock.getDelta()
        
        mixer.update( deltaTime );

    }

    return { mixer, actions , runAction, mixerRender }
   
}

/* 对比世界坐标和本地坐标 */
export function diffLocalAndWorldPosition(scene:any) {

    const g = new THREE.BoxGeometry(10,10,10)
    const m = new THREE.MeshBasicMaterial({ color: 'blue'})
    let mesh = new THREE.Mesh(g, m);

    // mesh的本地坐标设置为(50, 0, 0)
    mesh.position.set(50, 0, 0);

    let group = new THREE.Group();
    // group本地坐标设置和mesh一样设置为(50, 0, 0)
    // mesh父对象设置position会影响得到mesh的世界坐标
    group.position.set(50, 0, 0);
    group.add(mesh);
    scene.add(group);

    // .position属性获得本地坐标
    // console.log('本地坐标',mesh.position);
    // getWorldPosition()方法获得世界坐标
    //该语句默认在threejs渲染的过程中执行,如果渲染之前想获得世界矩阵属性、世界位置属性等属性，需要通过代码更新
    scene.updateMatrixWorld(true);
    let worldPosition = new THREE.Vector3();
    mesh.getWorldPosition(worldPosition);
    console.log('世界坐标',worldPosition);

}

// 视角控制器
export function angleViewControls(controls:any, type: any = 'deg') {

    // 数学球
    let spherical = new THREE.Spherical();

    // 四元组 旋转
    let quat = new THREE.Quaternion().setFromUnitVectors( controls.object.up,  new THREE.Vector3(0, 1, 0));

    // 相机位置
    let position = controls.object.position;
    
    //向量减法.sub()
    let offset = new THREE.Vector3().copy(position).sub(controls.target);
    
    // 偏移旋转计算
    spherical.setFromVector3(offset);

    const mode:any = {
        vertical: () =>  spherical.phi = 0.001,
        horizontal: () =>  spherical.phi = Math.PI / 2,
        deg: () => spherical.theta += Math.PI / 4,
    }
    mode[type]()

    offset.setFromSpherical(spherical);
    offset.applyQuaternion(quat);
    
    // 加法运算
    position.copy(controls.target).add(offset);

    controls.target.y = 0;
    controls.update();
}

// 拖动控制器
export function objectDragHelper(objects:any, camera:any, renderer:any , controls:any):any {

    const dragControls = new DragControls(objects , camera, renderer.domElement );

    dragControls.addEventListener( 'dragstart', function ( event:any ) {

        controls.enabled = false

    } );

    dragControls.addEventListener( 'dragend', function ( event:any ) {

        controls.enabled = true

    } );

    return dragControls
}

export function transFormControls(renderer:any,camera:any, orbitControl:any, render: any ) {
    
    const control = new TransformControls( camera, renderer.domElement );

    control.addEventListener( 'change', render );

    control.addEventListener( 'dragging-changed', function ( event ) {

        orbitControl.enabled = ! event.value;

    } );

    window.addEventListener( 'keydown', function ( event:any ) {

        console.log(event.keyCode)

        switch ( event.keyCode ) {

            case 16: // Shift
                control.setTranslationSnap( 100 );
                control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
                control.setScaleSnap( 0.25 );
                break;

            case 87: // W
                control.setMode( 'translate' );
                break;

            case 69: // E
                control.setMode( 'rotate' );
                break;

            case 82: // R
                control.setMode( 'scale' );
                break;

            case 107: // +, =, num+
                control.setSize( control.size + 0.1 );
                break;

            case 189:
            case 109: // -, _, num-
                control.setSize( Math.max( control.size - 0.1, 0.1 ) );
                break;

            case 32: // Spacebar
                control.enabled = ! control.enabled;
                break;

            case 27: // Esc
                control.reset();
                break;

        }

    } );

    window.addEventListener( 'keyup', function ( event:any ) {

        switch ( event.keyCode ) {

            case 16: // Shift
                control.setTranslationSnap( null );
                control.setRotationSnap( null );
                control.setScaleSnap( null );
                break;

        }

    } );

    return control
}