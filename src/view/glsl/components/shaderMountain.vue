<template>
    <div class="threeBox" ref="threeBox"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { ref , onMounted} from 'vue';
import { setControls } from '../../three/threeApi';

const threeBox = ref()

onMounted(() => init(threeBox.value))

function init(DOM:any) {

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50,DOM.clientWidth / DOM.clientHeight, 0.1, 100000)
    camera.position.set(10,10,10)
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true, logarithmicDepthBuffer: true  })
    renderer.setSize(DOM.clientWidth, DOM.clientHeight)
    renderer.setPixelRatio( window.devicePixelRatio * 2)
    renderer.setClearColor( 0x000000 )
    DOM.appendChild(renderer.domElement)

    const controls =  setControls(camera, renderer)

    const axes = new THREE.AxesHelper(5500)
    scene.add(axes)

    const uniforms:any = {
        iResolution: {
            type: 'v2',
            value: new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
        },
        iTime: {
            type: 'f',
            value: 1.0
        },
        u: {
            type: 'v2',
            value:  new THREE.Vector2(0, 0)
        }
    }
    const geometry = new THREE.BoxGeometry( 10, 10, 10 );

    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
        }
        `,
        fragmentShader: `
        varying vec2 vUv;

        precision highp float;
        uniform vec2 iResolution;
        uniform vec2 u;
        uniform float iTime;

        
        mat2 rot(float a) {
            return mat2(cos(a),sin(a),-sin(a),cos(a));	
        }

        const vec3 l = vec3(1.);
        const vec3 sundir = normalize( vec3(.3,.1,1.) );
        const vec3 suncol = vec3(1.,.8,.5);

        float cloud(in vec3 p) {
            float s=.5,e=(2.7-p.y)*(5.-p.y)+5.;
            p.xz *=.7;
            for(int i=0;i<7;i++)
                    p.xz*=rot(1.),
                    e-=abs(dot(sin(p*s+2.*cos(1.7*p.zxy*s)),l*.5))/s,
                    s*=1.7;
            return .5*e;
        }


        float ground(in vec3 p) {
            
            float s=2.,f;	
            for(f=p.y;s<1e3;s*=1.7)
                    p.xz*=rot(1.),            
                    f+=dot(sin(p.xz*s*.4+2.*cos(.7*p.zx*s*.4))/s,l.xz);    
            return f*.52;
        }

        vec3 sky( in vec3 ro, in vec3 rd ,in vec2 res)
        {
        
            // background sky : modified from IQ clouds        
            float sun = max( dot(sundir,rd), 0.0);    
            vec3 col = vec3(0.6,0.6,0.78) - abs(rd.y)*0.5*vec3(1.0,0.4,.05);    
            col += suncol*pow( sun+.001, 500.0 ); 
            // clouds        
            float k = res.x, c = res.y;
            if(c>.0)
            col *= 1.-.8*c,
            col += 3.*(.4+k)*c*suncol,
            col += 2.*vec3(0.2,0.08,0.04)*pow( sun, 3.0 )*k;    
            // Godrays
            float sh = 1., dt = 5., d;
            vec3 q = ro+40.*rd;
            for(int i=0; i<40; ++i)
            {
                d = cloud(q+sundir*dt);
                sh = min(sh,1./(1.+exp(-d)));
                dt += d;
                q += rd*.6;
            }
            col += 2.*pow((1.-sh)*sun,3.)*suncol;
            return col;
        }


        vec3 raycast( in vec3 ro, vec3 rd )
        {
            float t = 4.,e,e1,f,de=0.,df,d,c=1.,dt=.3,r=1.,a;
            vec3 col= vec3(0.),p,skycol;
            for( int i=0; i<100; i++ )
            {                
                p = ro+t*rd;
                if(p.y<0.)rd.y = -rd.y, ro = p, t = .2, r=.5;
                e = cloud(p), f=ground(p),             
                d = min(min(f,p.y+.1),max(e,.07));
                t += .7*d;
                if(e<.001)
                    e1 = cloud(p + dt*sundir),
                    de += max(e1-e,0.)/dt/(1.+ exp(-16.*e1));
                c *= 1./(1.+ exp(-16.*e));        	
            }
            skycol = r*sky(ro,rd,vec2(.1*de,(1.-c)*.2));        
            if(f>.5)return skycol;
            a = max(ground(p-.02)-f,.0)*15.;
            df = max(ground(p+.02*sundir)-f,.0)*50.+.5;
            f = .55-exp(-f*f);
            col = vec3(f, f*f,f*f*f)*(df+a);
            float maxd = 50.;    
            col = mix(col, skycol, smoothstep(.2, .99, min(t, maxd)/maxd));
            return r*col;
        }


        void main()
        {
            float t = iTime;
            vec2  R = iResolution.xy,
                q = ( u+u - R ) / R.y * vUv;   
            
            // camera
            
            vec3 ro = vec3(0.), rd = normalize(vec3(q,3.) );
            rd.yz*=rot(-.15); 
            rd.xz*=rot(0.1*t);
            ro.x -=t*.4;
            ro.y += 2.;

            // raymarch 
            
            vec3 col = raycast(ro,rd);
                
            // shade
            
            col = log(1.+col);
            col = clamp(col,0.,1.);
            gl_FragColor = vec4( col, 1.0 );

        }

        `
    } );

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    window.onresize = () => uniforms.iResolution.value = new THREE.Vector2(DOM.clientWidth, DOM.clientHeight)
    render()
    function render() {
        uniforms.iTime.value += 0.03
        renderer.render(scene,camera)
        threeBox.value && requestAnimationFrame(render)
    }
}
</script>

<style lang="less" scoped>
.threeBox {
    width: 100%;
    height: 100%;
}
</style>