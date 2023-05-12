import * as THREE from 'three'
import { TilesRenderer } from '3d-tiles-renderer';


let box = new THREE.Box3();
let sphere = new THREE.Sphere();

export const TilesUpadate = (tilesRenderer:any) =>{

    /* 可再此增加其他渲染操作 */

    tilesRenderer.update();
    
}

export const loadTiles = (camera:any, renderer:any, url:string, callback:any, DOM:any) => {

    // 读取3dtiles
    const tilesRenderer:any = new TilesRenderer( url )

    // 设置相机
    tilesRenderer.setCamera(camera);

    // 设置渲染
    tilesRenderer.setResolutionFromRenderer( camera, renderer );
    
    //每一个切片加载 时候修改材质
    tilesRenderer.onLoadModel = function(group:any) {

        group.traverse((c:any )=> {
            if ( c.isMesh ) {
                 c.material.transparent = true;
                 c.uniformHigh = batchIdHighlightShaderMixin(c.material,DOM);

            }
        })

    };

    // 模型加载时
    tilesRenderer.onLoadTileSet = (g:any) => {
       
        // 纠正模型位置 根据包围盒子或者包围球使用边界框来定义合理的中心，然后像这样偏移网格的位置来自动进行重新定位
        if (tilesRenderer.getBounds(box)) {

            box.getCenter(tilesRenderer.group.position);
    
            tilesRenderer.group.position.multiplyScalar(- 1);
    
        }
        else if (tilesRenderer.getBoundingSphere(sphere)) {
    
            tilesRenderer.group.position.multiplyScalar(-1);
    
        }

     }

    const model:any = new THREE.Group();
    model.add(tilesRenderer.group);
    model.rotation.set(5.5865, 0, 12.105 );
    
    callback(model)

    return tilesRenderer
}

export function batchIdHighlightShaderMixin(basicMaterial:any, DOM:any) {
    const uniforms = {
        highlightedBatchId: { value: - 1 },
        time: {
            type: "f",
            value: 0.0
        },
        resolution: {
            type: 'v2',
            value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
        }
    }

    basicMaterial.onBeforeCompile = (shader:any)=>{
        // 变量传递
        shader.uniforms.highlightedBatchId = uniforms.highlightedBatchId
        shader.uniforms.time = uniforms.time
        shader.uniforms.resolution = uniforms.resolution
        shader.vertexShader =
		`
			attribute float _batchid;
			varying float batchid;
		` +
		shader.vertexShader.replace(
			/#include <uv_vertex>/,
			`
			#include <uv_vertex>
			batchid = _batchid;
			`
		);
	    shader.fragmentShader =
		`
			varying float batchid;
			uniform float highlightedBatchId;
            uniform float time; 
		` +
		shader.fragmentShader.replace(
			/vec4 diffuseColor = vec4\( diffuse, opacity \);/,
			`
			vec4 diffuseColor =
				abs( batchid - highlightedBatchId ) < 0.5 ?
                vec4(0.,0.,0.0,0.0) :
				vec4( diffuse, opacity );
			`
		);
     }

     return uniforms
}

export function TilesBatchTable(face:any,object:any) {

    // 获取几何属性 所有组成的点表
    const batchidAttr = object.geometry.getAttribute('_batchid');
    
    // 如果有点表
    if (batchidAttr) {

        // 获取当前点击名称索引
        const hoveredBatchid = batchidAttr.getX( face.a );

        // 遍历父节点获取批处理表 直到找到带batchTable 的对象
        let batchTableObject = object;
        while (!batchTableObject.batchTable) {
            batchTableObject = object.parent;
        }

        // 获取批量表格数据
        const batchData = batchTableObject.batchTable.getData('name');
        const name =  batchData[hoveredBatchid];
        const g = object.geometry;
        const p = g.getAttribute('position');
    

        // 位置点表遍历
        const index = batchidAttr.array.findIndex((i:any,k:any) => batchidAttr.getX(k) === hoveredBatchid)
     
        const targetP = new THREE.Vector3(p.getX(index), p.getY(index), p.getZ(index));
        targetP.applyMatrix4(object.matrixWorld);
        
        return  { name , hoveredBatchid, targetP};
                              
        
    }
    else return null;
}

