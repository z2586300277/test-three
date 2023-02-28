import * as THREE from 'three'

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