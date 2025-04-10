import * as THREE from 'three'
import { EffectComposer, OrbitControls, RenderPass } from 'three-stdlib'

const vertexShader = `
vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));

  float n000 = norm0.x * dot(g000, Pf0);
  float n010 = norm0.y * dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n100 = norm0.z * dot(g100, vec3(Pf1.x, Pf0.yz));
  float n110 = norm0.w * dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = norm1.x * dot(g001, vec3(Pf0.xy, Pf1.z));
  float n011 = norm1.y * dot(g011, vec3(Pf0.x, Pf1.yz));
  float n101 = norm1.z * dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n111 = norm1.w * dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

uniform float uTime;
uniform float uFrequency;

varying vec3 vColor;
varying vec2 vUv;
varying vec3 vNormal;
varying float vNoise;

void main() { 
    float distortion = pnoise(position * 2. + uTime * 0.5, vec3(2.));
    vec3 displacedPosition = position + normal * distortion * uFrequency;

    vUv = uv;
	vNormal = normal;
	vNoise = distortion;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`

const fragmentShader = `
uniform float uTime;

varying vec3 vColor;
varying vec2 vUv;
varying vec3 vNormal;
varying float vNoise;

void main() {
	vec3 light1Dir = normalize(vec3(-0.5, 0.5, 1.0));
	vec3 light2Dir = normalize(vec3(0.5, -0.5, -1.0));
	float diff1 = clamp(dot(normalize(vNormal),  light1Dir), 0.0, 0.8);
	float diff2 = clamp(dot(normalize(vNormal),  light2Dir), 0.0, 0.8);

	vec3 baseColor = vec3(0.1, 0.6, 0.9); // bluish
	vec3 lightColor = vec3(1.0, 0.9, 0.7); // warm light

	vec3 color = mix(baseColor, lightColor, diff1 + diff2);

    gl_FragColor = vec4(color, 1.0);
}
`

export class Scene {
	canvasEl: HTMLCanvasElement
	scene: THREE.Scene
	camera: THREE.PerspectiveCamera
	height: number
	width: number
	renderer: THREE.WebGLRenderer
	sphere: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial, THREE.Object3DEventMap>
	orbit: OrbitControls
	audioEl: HTMLAudioElement
	analyser: AnalyserNode
	soundDataArray: Uint8Array<ArrayBuffer>
	effectComposer: EffectComposer<THREE.WebGLRenderTarget<THREE.Texture>>

	constructor(canvas: HTMLCanvasElement, audio: HTMLAudioElement) {
		this.canvasEl = canvas
		this.audioEl = audio
		this.height = window.innerHeight
		this.width = window.innerWidth

		this.setup()

		window.addEventListener('resize', this.resize)
	}

	setup = () => {
		this.scene = new THREE.Scene()

		this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 10)
		this.camera.position.z = 5

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvasEl,
			alpha: true,
			antialias: true,
		})
		this.renderer.setSize(this.width, this.height)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setAnimationLoop(this.update)
		this.renderer.outputColorSpace = THREE.SRGBColorSpace
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping
		this.renderer.toneMappingExposure = 1.0
		const renderPass = new RenderPass(this.scene, this.camera)
		// const bloomPass = new UnrealBloomPass(
		// 	new THREE.Vector2(this.width, this.height),
		// 	0,
		// 	0.5,
		// 	0.1
		// )

		this.effectComposer = new EffectComposer(this.renderer)
		this.effectComposer.addPass(renderPass)
		// this.effectComposer.addPass(bloomPass)

		this.sphere = new THREE.Mesh(
			new THREE.SphereGeometry(2, 256, 256),
			new THREE.ShaderMaterial({
				// wireframe: true,
				uniforms: {
					uTime: { value: 0 },
					uFrequency: { value: 1 },
				},
				vertexShader,
				fragmentShader,
			})
		)
		this.scene.add(this.sphere)

		this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
		this.orbit.enableDamping = true
		// this.orbit.enabled = false

		const audioCtx = new AudioContext()
		this.analyser = audioCtx.createAnalyser()
		const source = audioCtx.createMediaElementSource(this.audioEl)

		source.connect(this.analyser)
		this.analyser.connect(audioCtx.destination)

		// Resume context on user gesture
		this.audioEl.addEventListener('play', () => {
			if (audioCtx.state === 'suspended') {
				audioCtx.resume().then(() => {
					console.log('AudioContext resumed')
				})
			}
		})

		this.analyser.fftSize = 64
		const bufferLength = this.analyser.frequencyBinCount
		this.soundDataArray = new Uint8Array(bufferLength)
	}

	resize = () => {
		this.height = window.innerHeight
		this.width = window.innerWidth

		this.camera.aspect = this.width / this.height
		this.camera.updateProjectionMatrix()

		this.renderer.setSize(this.width, this.height)
		this.renderer.setPixelRatio(window.devicePixelRatio)
	}

	update = (time: number) => {
		this.sphere.material.uniforms.uTime.value = time / 1000

		this.analyser.getByteFrequencyData(this.soundDataArray)
		const avgFrequency =
			this.soundDataArray.reduce((a, b) => a + b, 0) / this.soundDataArray.length

		this.sphere.material.uniforms.uFrequency.value = (avgFrequency + 2) / 100

		this.sphere.rotation.y = time * 0.0005
		this.sphere.rotation.x = time * 0.0005
		this.sphere.rotation.z = time * 0.0005

		this.effectComposer.render()

		// this.renderer.render(this.scene, this.camera)
		this.orbit.update()
	}
}
