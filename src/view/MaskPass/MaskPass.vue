<template>
    <div id="container" />
  </template>
  
  <script>
  import * as THREE from 'three'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
  import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
  import {
    MaskPass,
    ClearMaskPass
  } from 'three/examples/jsm/postprocessing/MaskPass.js'
  import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
  import { SepiaShader } from 'three/examples/jsm/shaders/SepiaShader.js'
  import { ColorifyShader } from 'three/examples/jsm/shaders/ColorifyShader.js'
  
  export default {
    data() {
      return {
        camera: null,
        cameraBG: null,
        sceneEarth: null,
        sceneMars: null,
        sceneBG: null,
        earchMesh: null,
        marsMesh: null,
        renderer: null,
        orbitControls: null,
        clock: null,
        composer: null
      }
    },
    mounted() {
      this.init()
    },
    methods: {
      formatTooltip(val) {
        return val
      },
      // 初始化
      init() {
        this.createScene() // 创建场景
        this.createModels() // 创建模型
        this.createLight() // 创建光源
        this.createCamera() // 创建相机
        this.createRender() // 创建渲染器
        this.createControls() // 创建控件对象
        this.createComposer() // 创建效果组合器
        this.render() // 渲染
      },
      // 创建场景
      createScene() {
        this.sceneEarth = new THREE.Scene()
        this.sceneMars = new THREE.Scene()
        this.sceneBG = new THREE.Scene()
      },
  
      // 创建模型
      createModels() {
        this.createEarth()
        this.createMars()
        this.createBG()
      },
      createEarth() {
        const publicPath = 'http://guangfu/channels/world.jpeg'
        const planetTexture = new THREE.TextureLoader().load(
            publicPath
        )
        const specularTexture = new THREE.TextureLoader().load(
            publicPath
        )
        const normalTexture = new THREE.TextureLoader().load(
            publicPath
        )
  
        const planetMaterial = new THREE.MeshPhongMaterial()
        planetMaterial.specularMap = specularTexture
        planetMaterial.specular = new THREE.Color(0x4444aa)
        // planetMaterial.shininess = 2
  
        planetMaterial.normalMap = normalTexture
        planetMaterial.map = planetTexture
        // planetMaterial.shininess = 150
        const sphereGeom = new THREE.SphereGeometry(16, 40, 40)
        this.earchMesh = new THREE.Mesh(sphereGeom, planetMaterial)
        this.earchMesh.position.x = -10
  
        this.sceneEarth.add(this.earchMesh)
      },
      createMars() {
        const publicPath = 'http://guangfu/channels/world.jpeg'
        const planetTexture = new THREE.TextureLoader().load(
            publicPath
        )
        const normalTexture = new THREE.TextureLoader().load(
            publicPath
        )
  
        const planetMaterial = new THREE.MeshPhongMaterial()
        planetMaterial.normalMap = normalTexture
        planetMaterial.map = planetTexture
  
        const sphereGeom = new THREE.SphereGeometry(8, 40, 40)
        this.marsMesh = new THREE.Mesh(sphereGeom, planetMaterial)
        this.marsMesh.position.x = 20
  
        this.sceneMars.add(this.marsMesh)
      },
  
      createBG() {
        const publicPath = 'http://guangfu/channels/world.jpeg'
        const materialColor = new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load(
            publicPath
          ),
          depthTest: false
        })
        const bgPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          materialColor
        )
        bgPlane.position.z = -100
        bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1)
        this.sceneBG.add(bgPlane)
      },
  
      // 创建光源
      createLight() {
        //给地球场景添加光源
        const ambientLight1 = new THREE.AmbientLight(0x181818) // 创建环境光
        this.sceneEarth.add(ambientLight1) // 将环境光添加到场景
  
        const spotLight1 = new THREE.DirectionalLight(0xffffff)
        spotLight1.position.set(550, 100, 550)
        spotLight1.intensity = 0.6
        this.sceneEarth.add(spotLight1)
  
        //给火星场景添加光源
        const ambientLight2 = new THREE.AmbientLight(0x181818) // 创建环境光
        this.sceneMars.add(ambientLight2) // 将环境光添加到场景
  
        const spotLight2 = new THREE.DirectionalLight(0xffffff)
        spotLight2.position.set(550, 100, 550)
        spotLight2.intensity = 0.6
        this.sceneMars.add(spotLight2)
      },
      // 创建相机
      createCamera() {
        const element = document.getElementById('container')
        const width = element.clientWidth // 窗口宽度
        const height = element.clientHeight // 窗口高度
        const k = width / height // 窗口宽高比
        // PerspectiveCamera( fov, aspect, near, far )
        this.camera = new THREE.PerspectiveCamera(45, k, 0.1, 1000)
        this.camera.position.set(-15, 30, 40) // 设置相机位置
  
        this.camera.lookAt(new THREE.Vector3(0, 0, 0)) // 设置相机方向
  
        //创建输出背景的相机
        this.cameraBG = new THREE.OrthographicCamera(
          -width,
          width,
          height,
          -height,
          -10000,
          10000
        )
        this.cameraBG.position.z = 50
      },
      // 创建渲染器
      createRender() {
        const element = document.getElementById('container')
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        this.renderer.setSize(element.clientWidth, element.clientHeight) // 设置渲染区域尺寸
        this.renderer.shadowMap.enabled = true // 显示阴影
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setClearColor(0x000000, 1) // 设置背景颜色
        element.appendChild(this.renderer.domElement)
      },
  
      // 创建效果组合器
      createComposer() {
        //创建背景渲染器通道
        const backgroundRenderPass = new RenderPass(this.sceneBG, this.cameraBG)
  
        //创建地球渲染器通道
        const earthRenderPass = new RenderPass(this.sceneEarth, this.camera)
        earthRenderPass.clear = false // 是否清除前一帧绘图，默认true
  
        //创建火星渲染器通道
        const marsRenderPass = new RenderPass(this.sceneMars, this.camera)
        marsRenderPass.clear = false // 是否清除前一帧绘图，默认true
  
        //创建效果复制通道
        const effectCopy = new ShaderPass(CopyShader)
        effectCopy.renderToScreen = true
  
        //清除掩膜通道
        const clearMask = new ClearMaskPass()
  
        //创建包含地球的掩膜通道
        const earthMask = new MaskPass(this.sceneEarth, this.camera)
  
        //创建包含火星的掩膜通道
        const marsMask = new MaskPass(this.sceneMars, this.camera)
  
        //创建SepiaShader后期处理通道
        const effectSepia = new ShaderPass(SepiaShader)
  
        //创建ColorifyShader后期处理通道
        const effectColorify = new ShaderPass(ColorifyShader)
        effectColorify.uniforms['color'].value.setRGB(0.5, 0.5, 1)
  
        this.composer = new EffectComposer(this.renderer)
        this.composer.renderTarget1.stencilBuffer = true
        this.composer.renderTarget2.stencilBuffer = true
  
        this.composer.addPass(backgroundRenderPass) //添加背景渲染通道
        this.composer.addPass(earthRenderPass) //添加地球渲染通道
        this.composer.addPass(marsRenderPass) //添加火星渲染通道
        this.composer.addPass(marsMask) //添加火星掩膜通道，使后续处理效果只作用于该通道上的物体
        this.composer.addPass(effectColorify) //火星做Colorify效果处理
        this.composer.addPass(clearMask) // 清除火星掩膜通道
        this.composer.addPass(earthMask) //添加地球掩膜通道，使后续处理效果只作用于该通道上的物体
        this.composer.addPass(effectSepia) //地球做Sepia效果处理
        this.composer.addPass(clearMask) // 清除地球掩膜通道
        this.composer.addPass(effectCopy) //添加效果复制通道，将最终的结果复制到屏幕
      },
  
      render() {
        const delta = this.clock.getDelta() // 获取自上次调用的时间差
        this.orbitControls.update(delta) // 相机控制更新
        this.earchMesh.rotation.y += 0.003
        this.marsMesh.rotation.y -= 0.002
  
        this.renderer.autoClear = false // 是否自动清除后期处理效果
        requestAnimationFrame(this.render)
  
        this.composer.render(delta) //效果组合器更新
      },
      // 创建控件对象
      createControls() {
        this.clock = new THREE.Clock() // 创建THREE.Clock对象，用于计算上次调用经过的时间
        this.orbitControls = new OrbitControls(
          this.camera,
          this.renderer.domElement
        )
      }
    }
  }
  </script>
  
  <style>
  #container {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  </style>
  
  