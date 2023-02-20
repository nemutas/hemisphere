import gsap from 'gsap'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { gl } from './core/WebGL'
import { Assets, loadAssets } from './utils/assetLoader'
import { controls } from './utils/OrbitControls'

export class TCanvas {
  private model!: THREE.Group

  private assets: Assets = {
    model: { path: 'resources/hemispheres.glb' },
  }

  constructor(private parentNode: ParentNode) {
    loadAssets(this.assets).then(() => {
      this.init()
      this.createLights()
      this.createObjects()
      this.createGround()
      this.gsapAnimation()
      gl.requestAnimationFrame(this.anime)
    })
  }

  private init() {
    gl.setup(this.parentNode.querySelector('.three-container')!)
    gl.scene.background = new THREE.Color('#fafafa')
    gl.camera.position.set(1.5, 2, 2)

    // const axesHelper = new THREE.AxesHelper()
    // gl.scene.add(axesHelper)
  }

  private createLights() {
    const ambientLight = new THREE.AmbientLight('#fff', 0.3)
    gl.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight('#fff', 0.7)
    directionalLight.position.set(-1, 2, 0.5)
    directionalLight.castShadow = true
    const edge = 1.2
    directionalLight.shadow.camera = new THREE.OrthographicCamera(-edge, edge, edge, -edge, 0.01, 5)
    directionalLight.shadow.mapSize.set(2048, 2048)
    gl.scene.add(directionalLight)

    // const helper = new THREE.CameraHelper(directionalLight.shadow.camera)
    // gl.scene.add(helper)
  }

  private createObjects() {
    this.model = (this.assets.model.data as GLTF).scene

    const materil = new THREE.MeshStandardMaterial({
      emissive: '#222',
    })

    this.model.traverse((mesh) => {
      if (mesh instanceof THREE.Mesh) {
        mesh.material = materil
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
      if (mesh.name === 'Sphere1') {
        mesh.userData.rotate = { axis: 'z', dir: 1 }
      } else if (mesh.name === 'Sphere2') {
        mesh.userData.rotate = { axis: 'x', dir: -1 }
      } else if (mesh.name === 'Sphere3') {
        mesh.userData.rotate = { axis: 'z', dir: -1 }
      } else if (mesh.name === 'Sphere4') {
        mesh.userData.rotate = { axis: 'x', dir: 1 }
      }
    })

    gl.scene.add(this.model)
  }

  private createGround() {
    const geometry = new THREE.PlaneGeometry(5, 5)
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.ShadowMaterial({
      opacity: 0.1,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    mesh.position.y = -1.3
    gl.scene.add(mesh)
  }

  // ----------------------------------
  // animation
  private gsapAnimation() {
    const obj = {
      theta1: 0,
      theta2: 0,
    }

    const tl = gsap.timeline({
      repeat: -1,
      defaults: { duration: 2 },
      onUpdate: () => {
        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const axis = child.userData.rotate.axis as 'x' | 'y' | 'z'
            const dir = child.userData.rotate.dir as number
            child.rotation[axis] = dir * (obj.theta1 + obj.theta2)
          }
        })
      },
    })

    tl.fromTo(obj, { theta1: 0 }, { theta1: Math.PI, ease: 'none' })
    tl.fromTo(obj, { theta2: 0 }, { theta2: Math.PI, ease: 'power4.inOut' }, '<')
  }

  private anime = () => {
    controls.update()
    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}
