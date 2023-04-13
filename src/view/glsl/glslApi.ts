/* webgl 内置变量 */ 
// gl_PointSize：在点渲染模式中，控制方形点区域渲染像素大小（注意这里是像素大小，而不是three.js单位，因此在移动相机是，所看到该点在屏幕中的大小不变）
// gl_Position：控制顶点选完的位置
// gl_FragColor：片元的RGB颜色值
// gl_FragCoord：片元的坐标，同样是以像素为单位
// gl_PointCoord：在点渲染模式中，对应方形像素坐标

/* three.js 内置变量 */
// projectionMatrix 投影矩阵
// modelViewMatrix 模型矩阵
// uv 模型uv

// vec2 vuv：表示当前像素在纹理图像中对应的坐标（范围从0.0到1.0）。
// vec3 position：表示当前像素在世界坐标系中的位置。
// vec3 normal：表示当前像素在世界坐标系中的法向量。
// mat4 modelmatrix：表示当前对象的模型矩阵，用于将顶点从局部坐标系转换为世界坐标系。
// mat4 viewmatrix：表示当前相机的视图矩阵，用于将顶点从世界坐标系转换为相机视角下的坐标系。
// mat4 projectionmatrix：表示当前相机的投影矩阵，用于将顶点从相机视角下的坐标系转换为裁剪空间坐标系。
// mat3 normalmatrix：表示当前对象的法线矩阵，用于将法向量从局部坐标系转换为世界坐标系。
// float opacity：表示当前对象的不透明度。
// vec3 color：表示当前对象的颜色。
// float time：表示当前时间（以秒为单位）。
// float deltatime：表示自上一帧以来经过的时间（以秒为单位）。
export default {}