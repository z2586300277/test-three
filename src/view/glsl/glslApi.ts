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

/* 1.算术函数

abs(x)：返回x的绝对值

ceil(x)：返回不小于x的最小整数
floor(x)：返回不大于x的最大整数
fract(x)：返回一个数的小数部分
max(x,y)：返回x,y中较大的那个数
min(x,y)：返回x,y中较小的那个数
mod(x,y)：返回x除以y的余数
pow(x,y)：返回y的x次幂
exp(x)：返回e的x次幂
log(x)：返回以e为底的对数
sqrt(x)：返回x的平方根
inversesqrt(x)：返回1/sqrt(x)
2.三角函数

sin(x)：返回角度x的正弦值
cos(x)：返回角度x的余弦值
tan(x)：返回角度x的正切值
asin(x)：返回x的反正弦值
acos(x)：返回x的反余弦值
atan(y,x)：返回点（x，y）的反正切值
radians(degrees)：把角度转换成弧度
degrees(radians)：把弧度转换成角度
3.矩阵和向量运算函数

dot(x,y)：返回x与y的点积
cross(x,y)：返回x与y的叉积
length(x)：返回向量x的长度
distance(x,y)：返回两个向量之间的距离
normalize(x)：返回向量x的单位向量
faceforward(N,I,Nref)：如果点积Nref和I的结果小于零，则返回N，否则返回-N
reflect(I,N)：返回向量I相对于法线N的反射向量
refract(I,N,eta)：返回向量I通过从一个介质到另一个介质的界面时的折射向量，其中eta是两个介质的折射率比
4.几何函数

normalizeNormal(N)：返回向量N的单位法线
faceforwardNormal(N,I)：返回面向观察者方向的法线（沿视线方向计算）
reflectVertex(V,N)：返回顶点V相对于法线N的反射向量
refractVertex(V,N,eta)：返回顶点V通过从一个介质到另一个介质的界面时的折射向量，其中eta是两个介质的折射率比
ftransform()：返回当前顶点经过透视变换和模型视图变换后的坐标
5.纹理函数

texture2D(sampler2D, vec2)：从一个二维纹理中采样颜色
textureCube(samplerCube, vec3)：从一个立方体贴图中采样颜色
6.其他函数

length()：返回向量的长度
mix(x,y,a)：按照系数a线性插值x,y之间的值（即返回 x*(1-a)+y*a）
smoothstep(edge0,edge1,x)：对x进行平滑阈值函数操作，返回一个平滑过渡到目标区域的输出值
step(edge,x)：当x小于等于edge时返回1.0，否则返回0.0
clamp(x,minVal,maxVal)：将x限制在[minVal,maxVal]范围内 */