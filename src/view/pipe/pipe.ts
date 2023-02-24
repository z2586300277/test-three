import * as THREE from 'three'

/**
 * 动态管道
 * @param curveList 曲线点组
 * @param longSection 长分段数目
 * @param radius 半径
 * @param radiusSection 半径分段 
 * @param isClose 是否闭合
 * @returns 
 */
export function createTube(curveList:any, url:any,opacity:any = 1,radius:any = 10, longSection:any = 640,radiusSection:any = 80, isClose:any = false) {
    
  // 生成曲线
  let curve = new THREE.CatmullRomCurve3(curveList.map((p:any) =>  new THREE.Vector3(...p)), false);
  const tubeGeometry = new THREE.TubeGeometry(curve, longSection, radius, radiusSection, isClose);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(url);

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
    opacity
  });

  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);

  return tube

}


export function worldP(scene:any) {
  const g = new THREE.BoxGeometry(10,10,10)
  const m = new THREE.MeshBasicMaterial({ color: 'blue'})
  var mesh = new THREE.Mesh(g, m);
  // mesh的本地坐标设置为(50, 0, 0)
  mesh.position.set(50, 0, 0);
  var group = new THREE.Group();
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
  var worldPosition = new THREE.Vector3();
  mesh.getWorldPosition(worldPosition);
  // console.log('世界坐标',worldPosition);
}