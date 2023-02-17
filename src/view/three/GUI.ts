import * as dat from 'dat.gui'

export function createGUI(THREE: any, scene: any, camera: any, controls:any) {
    
    // GUI 对象
    const GUI = new dat.GUI()
    
    // 选项参数
    const Option:any = {

        // 光源类型
        lightType: '平行光',  
  
        // 光源类型对照组
        allLight: {
            '点光源': 'PointLight',
            '聚光灯': 'SpotLight',
            '平行光': 'DirectionalLight',
            '环境光': 'AmbientLight',
        },

        // 阴影参数
        hasCastShadow: ['点光源','聚光灯','平行光'],

        // 最大轴长
        axesLong: 3000,

        // 灯光记忆
        rememberLight: []

    };

    //基础面板
    const Basic = GUI.addFolder('基础配置');

    //保存当前配置
    Basic.add({
        fn: () => {
            const localLight = Option.rememberLight.map((i:any)=> {
                const { visible, castShadow, color , position,intensity } =  i.light
                return {
                    folderName: i.folderName,
                    lightType: i.lightType,
                    params: { visible, castShadow, color , position,intensity }
                }
            })
            localStorage.setItem('light', JSON.stringify(localLight))
            localStorage.setItem('camera', JSON.stringify(camera.position))
        }
    }, 'fn').name('@保存当前配置');

    //展开
    Basic.open()

    // 灯光配置
    const BasicLight = Basic.addFolder('灯光配置');

    // 灯光下拉
    BasicLight.add(Option, "lightType", ['点光源', '聚光灯', '平行光', '环境光']).name('光源类型');

    // 最大参数
    BasicLight.add(Option, "axesLong").name('灯光最大坐标值');

    //手动新增灯光
    BasicLight.add({

        fn: () => {

            // 添加灯光
            const light = new THREE[Option.allLight[Option.lightType]];
            scene.add(light)  

            // 添加文件夹
            let folderName = Option.lightType + '[' + Date.now() + ']'
            addLightGUI(light,folderName, Option.axesLong,Option.lightType);
         
        }

    }, 'fn').name('点击添加光源');

    // 本地存储
    if(localStorage.getItem('light')) {
        
        JSON.parse(localStorage.getItem('light') as any).map((i:any) => addLightAndGUI(i,THREE,scene))

    }
    if(localStorage.getItem('camera')) {
        const {x,y,z} = JSON.parse(localStorage.getItem('camera') as any)
        camera.position.x = x
        camera.position.y = y
        camera.position.z = z
        controls.update();
    }

    // 增加灯光和GUI
    function addLightAndGUI(item:any,THREE:any,scene:any){

        const { params , folderName , lightType} = item

        //还原灯光类型
        const light = new THREE[Option.allLight[lightType]];

        // 还原灯光位置
        light.position.x = params.position.x
        light.position.y = params.position.y
        light.position.z = params.position.z

        // 还原其他参数
        light.visible = params.visible  
        light.castShadow = params.castShadow  
        light.intensity = params.intensity  
        light.color.set(params.color); 
        scene.add(light)
         
        // 还原GUI 面板
        addLightGUI(light,folderName, Option.axesLong,lightType);
    }

  
    
    //相机控制
    const BasicCamera = Basic.addFolder('相机配置');
    BasicCamera.add(camera, 'fov').min(0).max(200).name('相机视锥体垂直视野角度')
    BasicCamera.add(camera, 'near').min(0).max(100).name('相机视锥体近端')
    BasicCamera.add(camera, 'far').min(1000).max(10000000).name('相机视锥体远端');
    ['x', 'y', 'z'].forEach(i => BasicCamera.add(camera.position, i).min(-100).max(100).name(i + '轴坐标'));
    BasicCamera.add({ fn: () => camera.updateProjectionMatrix() }, 'fn').name('更新相机矩阵');
   

    //添加光源面板
    function addLightGUI(light: any, folderName: any, num = 1000,lightType:any) {

        const hasCastShadow = Option.hasCastShadow.includes(lightType)
        
        const folder = GUI.addFolder(folderName + '配置');

        folder.add(light, 'visible').name('可见性');
        
        if (hasCastShadow) folder.add(light, 'castShadow').name('投射阴影');

        folder.add(light, 'intensity').min(-1).max(4).name('光照强度');
        
        ['x', 'y', 'z'].forEach(i => folder.add(light.position, i).min(-num).max(num).name(i + '轴坐标'));

        // 灯光色板
        folder.addColor({ color: 0xffffff }, 'color').onChange((v: any) => light.color.set(v)).name('光照颜色');
        
        // 销毁配置
        folder.add({
            fn: () => {
                GUI.removeFolder(folder)
                Option.rememberLight.splice(Option.rememberLight.findIndex( (i:any) => i.folderName === folderName), 1)
                scene.remove(light);
            }
        }, 'fn').name('销毁灯光')

        // 保存参数配置
           const rememberItem = {
            folderName,
            lightType,
            light
        }

        // 根据面板增加记忆功能
        Option.rememberLight.push(rememberItem);

    }
    

    return GUI


}