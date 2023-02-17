import * as THREE from 'three'
import { TilesRenderer } from '3d-tiles-renderer';
import {
	UniformsUtils,
	Color,
    ShaderMaterial,
    ShaderLib
} from 'three'

let box = new THREE.Box3();
let sphere = new THREE.Sphere();

export const TilesUpadate = (tilesRenderer:any) =>{
    // update tiles center 根据包围盒子或者包围球使用边界框来定义合理的中心，然后像这样偏移网格的位置来自动进行重新定位
    if (tilesRenderer.getBounds(box)) {

        box.getCenter(tilesRenderer.group.position);

        tilesRenderer.group.position.multiplyScalar(- 1);

    }
    else if (tilesRenderer.getBoundingSphere(sphere)) {

        tilesRenderer.group.position.multiplyScalar(-1);

    }

    tilesRenderer.update();
}

export const loadTiles = (camera:any, renderer:any, scene:any, url:string) => {

    // 读取3dtiles
    const tilesRenderer:any = new TilesRenderer( url )

    // 设置相机
    tilesRenderer.setCamera(camera);

    // 设置渲染
    tilesRenderer.setResolutionFromRenderer( camera, renderer );
    
    //加载时候修改材质
    tilesRenderer.onLoadModel = function(group:any) {
      group.traverse((c:any )=> {
          
            if ( c.isMesh ) {
               
                // c.material = new ShaderMaterial( batchIdHighlightShaderMixin( ShaderLib.standard ) );

            }
        });
    };

    const model:any = new THREE.Group();
    model.add(tilesRenderer.group);
    model.rotation.set(5.5865, 0, 12.105 );
    scene.add(model)

    return tilesRenderer
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
        const _batchid_array = batchidAttr.array;

        for (let index = 0; index < _batchid_array.length; index++) {
            const _batchid = batchidAttr.getX(index);
            if (_batchid === hoveredBatchid) {

                const pIndex = index;
                const targetP = new THREE.Vector3(p.getX(pIndex), p.getY(pIndex), p.getZ(pIndex));
                targetP.applyMatrix4(object.matrixWorld);
                
                return  { name , hoveredBatchid, targetP};
            }
        }
        
    }
    else return null;
}

export function batchIdHighlightShaderMixin( shader:any ) {

	const newShader = { ...shader };
	newShader.uniforms = {
		highlightedBatchId: { value: - 1 },
		highlightColor: { value: new Color( 0xFFC107 ).convertSRGBToLinear() },
		...UniformsUtils.clone( shader.uniforms ),
	};
	newShader.extensions = {
		derivatives: true,
	};
	newShader.lights = true;
	newShader.vertexShader =
		`
			attribute float _batchid;
			varying float batchid;
		` +
		newShader.vertexShader.replace(
			/#include <uv_vertex>/,
			`
			#include <uv_vertex>
			batchid = _batchid;
			`
		);
	newShader.fragmentShader =
		`
			varying float batchid;
			uniform float highlightedBatchId;
			uniform vec3 highlightColor;
		` +
		newShader.fragmentShader.replace(
			/vec4 diffuseColor = vec4\( diffuse, opacity \);/,
			`
			vec4 diffuseColor =
				abs( batchid - highlightedBatchId ) < 0.5 ?
				vec4( highlightColor, opacity ) :
				vec4( diffuse, opacity );
			`
		);

	return newShader;

}
