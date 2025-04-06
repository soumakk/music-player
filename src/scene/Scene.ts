import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'

const vertexShader = `
//	Classic Perlin 3D Noise 
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
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
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

uniform float uTime;

varying vec3 vColor;
varying vec2 vUv;

void main() { 
    float amp = 1.;
    float freq = 2.;
    float n = amp * cnoise(position * freq + vec3(0.0, uv.y, uTime * 0.1));
    vec3 newPosition = position + normal * n ;

    
    vUv = uv;
    vColor = vec3(0.5 + 0.5 * normal + 0.5 * n);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`

const fragmentShader = `
uniform float uTime;

varying vec3 vColor;
varying vec2 vUv;

void main() {
    vec3 c = vec3(0.0, 0.0, 0.0);
    vec3 color1 = vec3(0.1, 0.4, 0.6); // blue
    vec3 color2 = vec3(0.9, 0.3, 0.1); // red-orange
    vec3 color3 = vec3(0.1, 0.2, 0.3); // dark

    if (vUv.y < 0.5) {
        c = mix(color1, color2, vUv.y * 2.0);
    } else {
        c = mix(color2, color3, (vUv.y - 0.5) * 2.0);
    }

    gl_FragColor = vec4(vColor, 1.0);
}
`

export class Scene {
	root: HTMLCanvasElement
	scene: THREE.Scene
	camera: THREE.PerspectiveCamera
	height: number
	width: number
	renderer: THREE.WebGLRenderer
	plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial, THREE.Object3DEventMap>
	orbit: OrbitControls
	constructor(root: HTMLCanvasElement) {
		this.root = root
		this.height = window.innerHeight
		this.width = window.innerWidth

		this.setup()

		window.addEventListener('resize', this.resize)
	}

	setup = () => {
		this.scene = new THREE.Scene()

		this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 10)
		this.camera.position.z = 1

		this.renderer = new THREE.WebGLRenderer({ canvas: this.root, alpha: true })
		this.renderer.setSize(this.width, this.height)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setAnimationLoop(this.update)

		this.plane = new THREE.Mesh(
			new THREE.PlaneGeometry(5, 5, 200, 200),
			new THREE.ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
				},
				vertexShader,
				fragmentShader,
			})
		)
		this.scene.add(this.plane)

		this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
		this.orbit.enableDamping = true
		this.orbit.enabled = false
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
		this.plane.material.uniforms.uTime.value = time / 1000
		this.renderer.render(this.scene, this.camera)
		this.orbit.update()
	}
}
