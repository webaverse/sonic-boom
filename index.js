import * as THREE from 'three';

import metaversefile from 'metaversefile';
const {useApp, useFrame, useLocalPlayer, useCameraManager, useLoaders, useInternals} = metaversefile;
const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');
import { Electronicball } from './electronicball.js';


export default () => {
  const app = useApp();
  const localPlayer = useLocalPlayer();
  const cameraManager = useCameraManager();
  const {renderer, camera} = useInternals();
  let narutoRunTime=0; 
  const textureLoader = new THREE.TextureLoader()
  const wave2 = textureLoader.load(`${baseUrl}/textures/wave2.jpeg`)
  const wave20 = textureLoader.load(`${baseUrl}/textures/wave20.png`)
  const wave9 = textureLoader.load(`${baseUrl}/textures/wave9.png`)
  const textureR = textureLoader.load(`${baseUrl}/textures/r.jpg`);
  const textureG = textureLoader.load(`${baseUrl}/textures/g.jpg`);
  const textureB = textureLoader.load(`${baseUrl}/textures/b.jpg`);
    //################################################ trace narutoRun Time ########################################
    {
        useFrame(() => {
            
            //console.log(camera.rotation.y-localPlayer.rotation.y);
            //console.log(localPlayer.actionInterpolants.jump)
            if (localPlayer.hasAction('narutoRun') && !localPlayer.hasAction('fly') && !localPlayer.hasAction('jump')){
                    narutoRunTime++;
                    
                }
                else{
                    narutoRunTime=0;
                    
                }
                
            
        });
    }
    
    //################################################# front wave #################################################
    {
        const geometry = new THREE.SphereBufferGeometry(1.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.4);
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: {
              type: "f",
              value: 0.0
            },
            color: {
              value: new THREE.Vector3(0.400, 0.723, 0.910)
            },
            strength: {
              value: 0.01
            },
            perlinnoise: {
              type: "t",
              value: wave2
            },
            
          },
          vertexShader: `\
              
            ${THREE.ShaderChunk.common}
            ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
           
          
            varying vec2 vUv;
    
            void main() {
                vUv = uv;
                vec3 pos = vec3(position.x,position.y,position.z);
                if(pos.y >= 1.87){
                    pos = vec3(position.x*(sin((position.y - 0.6)*1.27)-0.16),position.y,position.z*(sin((position.y - 0.6)*1.27)-0.16));
                } else{
                    pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.75),position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.75));
                }
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 ); 
                ${THREE.ShaderChunk.logdepthbuf_vertex}
            }`,
          fragmentShader: `\
            
            
            ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
            varying vec2 vUv;
            uniform sampler2D perlinnoise;
            uniform vec3 color;
            uniform float strength;
            uniform float uTime;
        
            vec3 rgbcol(vec3 col) {
                return vec3(col.r/255.,col.g/255.,col.b/255.);
            }
        
            void main() {
                vec3 noisetex = texture2D(perlinnoise,vec2(vUv.x,mod(vUv.y+(20.*uTime),1.))).rgb;    
                gl_FragColor = vec4(noisetex.rgb,1.0);
        
                if(gl_FragColor.r >= 0.5){
                    gl_FragColor = vec4(color,(0.9-vUv.y)/3.);
                }else{
                    gl_FragColor = vec4(0.,0.,1.,0.);
                }
                gl_FragColor *= vec4(sin(vUv.y) - strength);
                gl_FragColor *= vec4(smoothstep(0.01,0.928,vUv.y));
                gl_FragColor.b*=20.;
                gl_FragColor.a*=20.;
                ${THREE.ShaderChunk.logdepthbuf_fragment}
            }
          `,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
    
        const material2 = new THREE.ShaderMaterial({
          uniforms: {
            uTime: {
              type: "f",
              value: 0.0
            },
            perlinnoise: {
              type: "t",
              value: wave20
            },
            iResolution: {
              value: new THREE.Vector3() 
            },
            strength: {
                value: 0.01
            },
            color: {
                value: new THREE.Vector3(0.25,0.45,1.25)
            },
            
          },
          vertexShader: `\
              
            ${THREE.ShaderChunk.common}
            ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
           
          
            varying vec2 vUv;
            varying vec3 vPos;
    
            void main() {
                vUv = uv;
                vPos=position;
                vec3 pos = vec3(position.x,position.y,position.z);
                if(pos.y >= 1.87){
                    pos = vec3(position.x*(sin((position.y - 0.6)*1.27)-0.16),position.y,position.z*(sin((position.y - 0.6)*1.27)-0.16));
                } else{
                    pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.75),position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.75));
                }
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 ); 
                ${THREE.ShaderChunk.logdepthbuf_vertex}
            }`,
          fragmentShader: `\
            
            ${THREE.ShaderChunk.emissivemap_pars_fragment}
            ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
            varying vec2 vUv;
            varying vec3 vPos;
            uniform sampler2D perlinnoise;
            uniform vec3 color;
            uniform float uTime;
            uniform float strength;
            uniform vec3 iResolution;
            
                  #define PI 3.1415926
    
                  float pat(vec2 uv,float p,float q,float s,float glow)
                  {
                      float z =  cos(p * uv.y/0.5) + cos(q  * uv.y/2.2) ;
    
                      z += mod((uTime*100.0 + uv.x+uv.y * s*10.)*0.5,5.0);	// +wobble
                      float dist=abs(z)*(.1/glow);
                      return dist;
                  }
    
           
            void main() {
                        
    
    
                vec2 uv = vPos.zy;
                float d = pat(uv, 1.0, 2.0, 10.0, 0.35);		
                vec3 col = color*0.5/d;
                vec4 fragColor = vec4(col,1.0);
    
                vec3 noisetex = texture2D(
                    perlinnoise,
                    mod(1.*vec2(1.*vUv.x+uTime*10.,1.5*vUv.y + uTime*10.),1.)
                ).rgb; 
    
                gl_FragColor = vec4(noisetex.rgb,1.0);
                
                if(gl_FragColor.r >= 0.1){
                   gl_FragColor = fragColor;
                }else{
                    gl_FragColor = vec4(0.,0.,1.,0.);
                }
                
                gl_FragColor *= vec4(sin(vUv.y) - strength);
                gl_FragColor *= vec4(smoothstep(0.01,0.928,vUv.y));
                gl_FragColor.xyz /=4.;
                gl_FragColor.b*=2.;
                gl_FragColor.a*=20.;
    
                
                ${THREE.ShaderChunk.logdepthbuf_fragment}
                ${THREE.ShaderChunk.emissivemap_fragment}
            }`,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
      
    
        let frontwave=new THREE.Mesh(geometry,material);
        frontwave.position.y=1;
        frontwave.setRotationFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -90 * Math.PI / 180 );
        
        let frontwave2=new THREE.Mesh(geometry,material2);
        frontwave2.position.y=1;
        frontwave2.setRotationFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -90 * Math.PI / 180 );
        
        const group = new THREE.Group();
        group.add(frontwave);
        group.add(frontwave2);
        app.add(group);
        
        useFrame(({timestamp}) => {
            group.position.copy(localPlayer.position);
            group.position.y-=1.5;
            group.rotation.copy(localPlayer.rotation);
            
            let dum = new THREE.Vector3();
            localPlayer.getWorldDirection(dum)
            dum = dum.normalize();
            group.position.x+=0.6*dum.x;
            group.position.z+=0.6*dum.z;
        
            if(narutoRunTime>10){
                group.scale.set(1,1,1);
            
            }
            else{
                group.scale.set(0,0,0);
            }
        
            // material.uniforms.strength.value=Math.sin(timestamp/1000);
            // material2.uniforms.strength.value=Math.sin(timestamp/1000);
        
        
            material.uniforms.uTime.value = timestamp/5000;
            material2.uniforms.uTime.value = timestamp/10000;
            material2.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
            app.updateMatrixWorld();
            
        
        });
    }
    //########################################## wind #############################################
    {
        const group = new THREE.Group();
        const vertrun = `
            ${THREE.ShaderChunk.common}
            ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = vec3(position.x,position.y,position.z);
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                ${THREE.ShaderChunk.logdepthbuf_vertex}
            }
        `;

        const fragrun = `
            ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
            varying vec2 vUv;
            uniform sampler2D perlinnoise;
            uniform vec3 color4;
            uniform float uTime;
            varying vec3 vNormal;
            vec3 rgbcol(vec3 col) {
                return vec3(col.r/255.,col.g/255.,col.b/255.);
            }
            void main() {
                vec3 noisetex = texture2D(
                    perlinnoise,
                    vec2(
                        mod(1.*vUv.x+(2.),1.),
                        mod(.5*vUv.y+(40.*uTime),1.)
                        
                    )
                ).rgb;      
                gl_FragColor = vec4(noisetex.rgb,1.0);
                if(gl_FragColor.r >= 0.8){
                    gl_FragColor = vec4(vec3(1.,1.,1.),(0.9-vUv.y)/2.);
                }else{
                    gl_FragColor = vec4(0.,0.,1.,0.);
                }
                gl_FragColor *= vec4(smoothstep(0.2,0.628,vUv.y));
                ${THREE.ShaderChunk.logdepthbuf_fragment}
            
                
            }
        `;
        let windMaterial;
        function windEffect() {
            const geometry = new THREE.CylinderBufferGeometry(0.5, 0.9, 5.3, 50, 50, true);
            windMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    perlinnoise: {
                        type: "t",
                        value:wave2
                    },
                    color4: {
                        value: new THREE.Vector3(200, 200, 200)
                    },
                    uTime: {
                        type: "f",
                        value: 0.0
                    },
                },
                // wireframe:true,
                vertexShader: vertrun,
                fragmentShader: fragrun,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
            const mesh = new THREE.Mesh(geometry, windMaterial);
            mesh.setRotationFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -90 * Math.PI / 180 );
            
            group.add(mesh);
           
            // mesh.scale.set(1.5, 1.7, 1.5);
            app.add(group);
        }
        windEffect();
        
        

        useFrame(({timestamp}) => {
            group.position.copy(localPlayer.position);
            group.position.y-=0.5;
            group.rotation.copy(localPlayer.rotation);

            let dum = new THREE.Vector3();
            localPlayer.getWorldDirection(dum)
            dum = dum.normalize();
            group.position.x+=2.2*dum.x;
            group.position.z+=2.2*dum.z;
            if(narutoRunTime>10){
                group.scale.set(1,1,1);
                
            }
            else{
                group.scale.set(0,0,0);
            }
            
            windMaterial.uniforms.uTime.value=timestamp/10000;
            
            app.updateMatrixWorld();

        });
    }
    //########################################## flame ##########################################
    {
        const group = new THREE.Group();
        const vertflame = `
            ${THREE.ShaderChunk.common}
            ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 playerRotation;
            uniform float strength;
            uniform sampler2D perlinnoise;
            void main() {
                vUv = uv*strength;
                
                vec3 pos = vec3(position.x,position.y,position.z);
                vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y+uTime*40.,vUv.x + uTime*1.),1.)).rgb;
                if(pos.y >= 1.87){
                    pos = vec3(position.x*(sin((position.y - 0.64)*1.27)-0.12),position.y,position.z*(sin((position.y - 0.64)*1.27)-0.12));
                } else{
                    pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.79),position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.79));
                }
                mat3 rotZ;
                
                float ry=playerRotation.z;
                
                float lerp=mix(ry,playerRotation.x,pow(vUv.y,1.)/1.);
                 
                if(abs((ry/PI*180.)-(playerRotation.x/PI*180.))>75.){
                    lerp=mix(playerRotation.x,playerRotation.x,pow(vUv.y,1.)/1.); 
                }   
                rotZ = mat3(
                    cos(lerp), sin(lerp), 0.0,
                    -sin(lerp), cos(lerp), 0.0, 
                    0.0, 0.0 , 1.0
                );
                
                pos.xz *= noisetex.r;
                pos *= rotZ;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                ${THREE.ShaderChunk.logdepthbuf_vertex}
            }
        `;

        const fragflame = `
            ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
            varying vec2 vUv;
            uniform sampler2D perlinnoise;
            uniform float uTime;
            
            uniform vec3 color;
            varying vec3 vNormal;
            
            void main() {
                vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y+uTime*2.,vUv.x - uTime*1.),1.)).rgb;
        
                gl_FragColor = vec4(noisetex.r);
                if(gl_FragColor.r >= 0.1){
                    gl_FragColor = vec4(color,gl_FragColor.r);
                }
                else{
                    gl_FragColor = vec4(0.);
                }
                gl_FragColor *= vec4(smoothstep(0.2,0.628,vUv.y));
                gl_FragColor.xyz/=1.5;
                //gl_FragColor.a/=2.;
                ${THREE.ShaderChunk.logdepthbuf_fragment}
                
            }
        `;



        let flameMaterial;
        let prev=0;
        function flame() {
            const geometry = new THREE.CylinderBufferGeometry(0.5, 0.1, 4.5, 50, 50, true);
            flameMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    perlinnoise: {
                        type: "t",
                        value: wave9
                    },
                    color: {
                        value: new THREE.Vector3(0.120, 0.280, 1.920)
                    },
                    uTime: {
                        type: "f",
                        value: 0.0
                    },
                    playerRotation: {
                        value: new THREE.Vector3(localPlayer.rotation.y, localPlayer.rotation.y, localPlayer.rotation.y)
                    },
                    strength: {
                        type: "f",
                        value: 0.0
                    },
                },
                // wireframe:true,
                vertexShader: vertflame,
                fragmentShader: fragflame,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
            });
        
            const mesh = new THREE.Mesh(geometry, flameMaterial);
            mesh.setRotationFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -90 * Math.PI / 180 );
            group.add(mesh);
            app.add(group);
        }
        flame();
        
        let playerRotation=[];
       
        useFrame(({timestamp}) => {
            group.position.copy(localPlayer.position);
            group.position.y-=0.55;
            //group.rotation.copy(localPlayer.rotation);
            //console.log(localPlayer.rotation.x);
            let dum = new THREE.Vector3();
            localPlayer.getWorldDirection(dum)
            dum = dum.normalize();
            group.position.x+=2.2*dum.x;
            group.position.z+=2.2*dum.z;

            if(narutoRunTime>10 ){
                group.scale.set(1,1,1);
                flameMaterial.uniforms.strength.value=1.0;
            }
            else{
                //group.scale.set(0,0,0);
                flameMaterial.uniforms.strength.value-=0.015;
            }
            // if(narutoRunTime>0 && narutoRunTime<90){
            //     group.scale.set(0,0,0);
            // }
            if(!localPlayer.hasAction('fly') && !localPlayer.hasAction('jump')){
                group.scale.set(1,1,1);
            }
            else{
                group.scale.set(0,0,0);
            }
            
            flameMaterial.uniforms.uTime.value=timestamp/20000;
            
            
            if(Math.abs(localPlayer.rotation.x)>0){
                playerRotation.push(localPlayer.rotation.y+Math.PI); 
            }
            else{
                playerRotation.push(-localPlayer.rotation.y);
            }
            if(playerRotation.length>=50){
                flameMaterial.uniforms.playerRotation.value=new THREE.Vector3( playerRotation[playerRotation.length-1],playerRotation[playerRotation.length-1],playerRotation[playerRotation.length-5]);
            }
            app.updateMatrixWorld();

        });
    }
    //########################################## lightning ##########################################
    {
        const group = new THREE.Group();
        const vertlightning = `
            ${THREE.ShaderChunk.common}
            ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 playerRotation;
            uniform float strength;
            uniform sampler2D perlinnoise;
            void main() {
                vUv = uv*strength;
                
                vec3 pos = vec3(position.x,position.y,position.z);
                vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y+uTime*40.,vUv.x + uTime*1.),1.)).rgb;
                if(pos.y >= 1.87){
                    pos = vec3(position.x*(sin((position.y - 0.64)*1.27)-0.12),position.y,position.z*(sin((position.y - 0.64)*1.27)-0.12));
                } else{
                    pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.79),position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.79));
                }
                mat3 rotZ;
                
                float ry=playerRotation.z;
                
                float lerp=mix(ry,playerRotation.x,pow(vUv.y,1.)/1.);
                 
                if(abs((ry/PI*180.)-(playerRotation.x/PI*180.))>75.){
                    lerp=mix(playerRotation.x,playerRotation.x,pow(vUv.y,1.)/1.); 
                }   
                rotZ = mat3(
                    cos(lerp), sin(lerp), 0.0,
                    -sin(lerp), cos(lerp), 0.0, 
                    0.0, 0.0 , 1.0
                );
                
                pos.xz *= noisetex.r;
                pos *= rotZ;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                ${THREE.ShaderChunk.logdepthbuf_vertex}
            }
        `;

        const fraglightning = `
            ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
            varying vec2 vUv;
            uniform sampler2D perlinnoise;
            uniform float uTime;
            uniform float random;
            uniform vec3 color;
            varying vec3 vNormal;
            #define PI 3.1415926

            float pat(vec2 uv,float p,float q,float s,float glow)
            {
                float t =abs(cos(uTime))+1.;
                float z = cos(q *random * uv.x) * cos(p *random * uv.y) + cos(q * random * uv.y) * cos(p * random * uv.x);

                z += sin(uTime*50.0 - uv.y-uv.y * s)*0.35;	
                float dist=abs(z)*(5./glow);
                return dist;
            }
            void main() {
                vec2 uv = vUv.yx;
                float d = pat(uv, 1.0, 2.0, 10.0, 0.35);	
                vec3 col = color*0.5/d;
                vec4 fragColor = vec4(col,1.0);



                vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y+uTime*2.,vUv.x - uTime*1.),1.)).rgb;
        
                gl_FragColor = vec4(noisetex.r);
                if(gl_FragColor.r >= 0.0){
                    gl_FragColor = fragColor;
                }
                else{
                    gl_FragColor = vec4(0.);
                }
                gl_FragColor *= vec4(smoothstep(0.2,0.628,vUv.y));
                //gl_FragColor.a*=cos(uTime*10.);
                ${THREE.ShaderChunk.logdepthbuf_fragment}
                
            }
        `;



        let lightningMaterial;
        let prev=0;
        function flame() {
            const geometry = new THREE.CylinderBufferGeometry(0.65, 0.15, 4.5, 50, 50, true);
            lightningMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    perlinnoise: {
                        type: "t",
                        value: wave9
                    },
                    color: {
                        value: new THREE.Vector3(0.120, 0.280, 1.920)
                    },
                    uTime: {
                        type: "f",
                        value: 0.0
                    },
                    random: {
                        type: "f",
                        value: 0.0
                    },
                    playerRotation: {
                        value: new THREE.Vector3(localPlayer.rotation.y, localPlayer.rotation.y, localPlayer.rotation.y)
                    },
                    strength: {
                        type: "f",
                        value: 0.0
                    },
                },
                // wireframe:true,
                vertexShader: vertlightning,
                fragmentShader: fraglightning,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
            });
        
            const mesh = new THREE.Mesh(geometry, lightningMaterial);
            mesh.setRotationFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -90 * Math.PI / 180 );
            group.add(mesh);
            app.add(group);
        }
        flame();
        
        let playerRotation=[];
        let lightningfreq=0;
        useFrame(({timestamp}) => {
            group.position.copy(localPlayer.position);
            group.position.y-=0.55;
            //group.rotation.copy(localPlayer.rotation);
            //console.log(localPlayer.rotation.x);
            let dum = new THREE.Vector3();
            localPlayer.getWorldDirection(dum)
            dum = dum.normalize();
            group.position.x+=2.2*dum.x;
            group.position.z+=2.2*dum.z;

            if(narutoRunTime>10 ){
                group.scale.set(1,1,1);
                lightningMaterial.uniforms.strength.value=1.0;
            }
            else{
                //group.scale.set(0,0,0);
                lightningMaterial.uniforms.strength.value-=0.015;
            }
            // if(narutoRunTime>0 && narutoRunTime<90){
            //     group.scale.set(0,0,0);
            // }
            if(!localPlayer.hasAction('fly') && !localPlayer.hasAction('jump')){
                group.scale.set(1,1,1);
            }
            else{
                group.scale.set(0,0,0);
            }
            
            lightningMaterial.uniforms.uTime.value=timestamp/20000;
            
            
            if(Math.abs(localPlayer.rotation.x)>0){
                playerRotation.push(localPlayer.rotation.y+Math.PI); 
            }
            else{
                playerRotation.push(-localPlayer.rotation.y);
            }

            if(playerRotation.length>=50){
                lightningMaterial.uniforms.playerRotation.value=new THREE.Vector3( playerRotation[playerRotation.length-1],playerRotation[playerRotation.length-1],playerRotation[playerRotation.length-5]);
            }
            if(lightningfreq%1==0){
                lightningMaterial.uniforms.random.value=Math.random()*Math.PI;
            }
            
            //lightningMaterial.uniforms.strength.value=Math.abs(Math.cos(timestamp/10000));
            
            lightningfreq++;
            app.updateMatrixWorld();

        });
    }
    //########################################## vertical trail ######################################
    {
        const planeGeometry = new THREE.BufferGeometry();
    
        let position= new Float32Array(18);
        let uv = new Float32Array(12);
    
        
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {
                    value: 0,
                },
                opacity: {
                    value: 0,
                },
                textureR: { type: 't', value: textureR },
                textureG: { type: 't', value: textureG },
                textureB: { type: 't', value: textureB },
                t: { value: 0.9 }
            },
            vertexShader: `\
                 
                ${THREE.ShaderChunk.common}
                ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
               
             
                uniform float uTime;
        
                varying vec2 vUv;
               
                void main() {
                  vUv=uv;
                  vUv.y*=1.0;
                  //vUv.x=1.-vUv.x;
                  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                  vec4 viewPosition = viewMatrix * modelPosition;
                  vec4 projectionPosition = projectionMatrix * viewPosition;
        
                  gl_Position = projectionPosition;
                  ${THREE.ShaderChunk.logdepthbuf_vertex}
                }
              `,
              fragmentShader: `\
              ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
              uniform sampler2D textureR;
              uniform sampler2D textureG;
              uniform sampler2D textureB;
              uniform float uTime;
              uniform float opacity;
              varying vec2 vUv;
              void main() {
                  
      
                  vec3 texColorR = texture2D(
                      textureR,
                      vec2(
                          mod(1.*vUv.x+uTime*5.,1.),
                          mod(2.*vUv.y+uTime*5.,1.)
                          
                      )
                  ).rgb;  
                  vec3 texColorG = texture2D(
                      textureG,
                      vec2(
                          mod(1.*vUv.x+uTime*5.,1.),
                          mod(2.*vUv.y+uTime*5.,1.)
                          
                      )
                  ).rgb;  
                  vec3 texColorB = texture2D(
                      textureB,
                      vec2(
                          mod(1.*vUv.x,1.),
                          mod(2.5*vUv.y+uTime*2.5,1.)
                          
                      )
                  ).rgb;  
                  gl_FragColor = vec4(texColorB.b)*((vec4(texColorR.r)+vec4(texColorG.g))/2.);
                  
    
                  if( gl_FragColor.b >= 0.1 ){
                      gl_FragColor = vec4(mix(vec3(0.020, 0.180, 1.920),vec3(0.284, 0.922, 0.980),gl_FragColor.b),gl_FragColor.b);
                  }else{
                      gl_FragColor = vec4(0.);
                  }
                   gl_FragColor *= vec4(sin(vUv.y) - 0.1);
                   gl_FragColor *= vec4(smoothstep(0.3,0.628,vUv.y));
                   if(abs(vUv.x)>0.9 || abs(vUv.x)<0.1)
                        gl_FragColor.a=0.;
                    
                    gl_FragColor.a*=3.;
                    gl_FragColor.a*=opacity;
                    //gl_FragColor.a*=(1.-vUv.y)*5.;
                    //gl_FragColor = vec4(vec3(texColor), texColor.b);
                    //gl_FragColor.a*=(vUv.x)*5.;
                    //gl_FragColor = vec4(vUv, 1.0, 1.0);
                ${THREE.ShaderChunk.logdepthbuf_fragment}
              }
            `,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
      });
    
      
      
    
      let plane=new THREE.Mesh(planeGeometry,material);
      app.add(plane);
      plane.position.y=1;
      plane.frustumCulled = false;
    
    
      let deletePosTimer = 0;
     
    
    
    
      
      useFrame(({timestamp}) => {
        
        
        
        
        
        if (deletePosTimer % 2 == 0 || position.length > 18*100) {
          if (position.length > 18) {
              let temp = new Float32Array(position.length - 18);
              for (let i = 0; i < position.length - 18; i++) {
                  temp[i] = position[i];
              }
              position = temp;
              plane.geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    
          }
        }
    
        let planeNumber = (position.length + 18) / 18;

        let tempPosition = new Float32Array(planeNumber * 18);
        tempPosition[0] = localPlayer.position.x;
        tempPosition[1] = localPlayer.position.y-1.;
        tempPosition[2] = localPlayer.position.z;
    
        tempPosition[3] = localPlayer.position.x;
        tempPosition[4] = localPlayer.position.y-2.;
        tempPosition[5] = localPlayer.position.z;
    
        tempPosition[6] = position[0];
        tempPosition[7] = position[1];
        tempPosition[8] = position[2];
    
        tempPosition[9] = position[3];
        tempPosition[10] = position[4];
        tempPosition[11] = position[5];
    
        tempPosition[12] = position[0];
        tempPosition[13] = position[1];
        tempPosition[14] = position[2];
    
        tempPosition[15] = localPlayer.position.x;
        tempPosition[16] = localPlayer.position.y-2.;
        tempPosition[17] = localPlayer.position.z;
    
        for (let i = 0; i < position.length; i++) {
            tempPosition[i + 18] = position[i];
        }
    
        position = tempPosition;
        planeGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    
    
        let uv = new Float32Array(planeNumber * 12);
        let fraction = 1;
        let ratio = 1 / planeNumber;
        for (let i = 0; i < planeNumber; i++) {
            uv[i * 12 + 0] = 0;
            uv[i * 12 + 1] = fraction;
    
            uv[i * 12 + 2] = 1;
            uv[i * 12 + 3] = fraction;
    
            uv[i * 12 + 4] = 0;
            uv[i * 12 + 5] = fraction - ratio;
    
            uv[i * 12 + 6] = 1;
            uv[i * 12 + 7] = fraction - ratio;
    
            uv[i * 12 + 8] = 0;
            uv[i * 12 + 9] = fraction - ratio;
    
            uv[i * 12 + 10] = 1;
            uv[i * 12 + 11] = fraction;
    
            fraction -= ratio;
    
        }
        planeGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        
        
        deletePosTimer++;
        //material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
        //material.uniforms.iTime.value = timestamp/1000;
        material.uniforms.uTime.value = timestamp/1000;
        if(narutoRunTime>=10){
            material.uniforms.opacity.value = 1;
        }
        else{
            material.uniforms.opacity.value -= 0.02;
        }
        if(narutoRunTime>0 && narutoRunTime<10){
            material.uniforms.opacity.value = 0;
        }
       
        
        app.updateMatrixWorld();
          
      
      });
    }
    //########################################## horizontal trail ######################################
    {
        const planeGeometry = new THREE.BufferGeometry();
    
        let position= new Float32Array(18);
        let uv = new Float32Array(12);
       
        
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {
                    value: 0,
                },
                opacity: {
                    value: 0,
                },
                textureR: { type: 't', value: textureR },
                textureG: { type: 't', value: textureG },
                textureB: { type: 't', value: textureB },
                t: { value: 0.9 }
            },
            vertexShader: `\
                 
                ${THREE.ShaderChunk.common}
                ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
               
             
                uniform float uTime;
        
                varying vec2 vUv;
               
                void main() {
                  vUv=uv;
                  vUv.y*=1.0;
                  //vUv.x=1.-vUv.x;
                  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                  vec4 viewPosition = viewMatrix * modelPosition;
                  vec4 projectionPosition = projectionMatrix * viewPosition;
        
                  gl_Position = projectionPosition;
                  ${THREE.ShaderChunk.logdepthbuf_vertex}
                }
              `,
              fragmentShader: `\
              ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
              uniform sampler2D textureR;
              uniform sampler2D textureG;
              uniform sampler2D textureB;
              uniform float uTime;
              uniform float opacity;
              varying vec2 vUv;
              void main() {
                  
      
                  vec3 texColorR = texture2D(
                      textureR,
                      vec2(
                          mod(1.*vUv.x+uTime*5.,1.),
                          mod(2.*vUv.y+uTime*5.,1.)
                          
                      )
                  ).rgb;  
                  vec3 texColorG = texture2D(
                      textureG,
                      vec2(
                          mod(1.*vUv.x+uTime*5.,1.),
                          mod(2.*vUv.y+uTime*5.,1.)
                          
                      )
                  ).rgb;  
                  vec3 texColorB = texture2D(
                      textureB,
                      vec2(
                          mod(1.*vUv.x,1.),
                          mod(2.5*vUv.y+uTime*2.5,1.)
                          
                      )
                  ).rgb;  
                  gl_FragColor = vec4(texColorB.b)*((vec4(texColorR.r)+vec4(texColorG.g))/2.);
                  
    
                  if( gl_FragColor.b >= 0.1 ){
                      gl_FragColor = vec4(mix(vec3(0.020, 0.180, 1.920),vec3(0.284, 0.922, 0.980),gl_FragColor.b),gl_FragColor.b);
                  }else{
                      gl_FragColor = vec4(0.);
                  }
                   gl_FragColor *= vec4(sin(vUv.y) - 0.1);
                   gl_FragColor *= vec4(smoothstep(0.3,0.628,vUv.y));
                   if(abs(vUv.x)>0.9 || abs(vUv.x)<0.1)
                        gl_FragColor.a=0.;
                    
                    gl_FragColor.a*=3.;
                    gl_FragColor.a*=opacity;
                    
                  //gl_FragColor = vec4(vec3(texColor), texColor.b);
                  //gl_FragColor.a*=(vUv.x)*5.;
                  //gl_FragColor = vec4(vUv, 1.0, 1.0);
                ${THREE.ShaderChunk.logdepthbuf_fragment}
              }
            `,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
      });
    
      let plane=new THREE.Mesh(planeGeometry,material);
      app.add(plane);
      plane.position.y=1;
      plane.frustumCulled = false;
    
    
      let deletePosTimer = 0;
     
      const geometryp = new THREE.PlaneGeometry( 0.1, 0.1 );
      const materialp = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide, transparent:true, opacity:0, depthWrite:false} );
      const point1 = new THREE.Mesh( geometryp, materialp );
      app.add( point1 );
      const point2 = new THREE.Mesh( geometryp, materialp );
      app.add( point2 );
   
      useFrame(({timestamp}) => {
        
       if(localPlayer.rotation.x!==0){
            point1.position.copy(localPlayer.position);
            point1.rotation.copy(localPlayer.rotation);
            
            point1.rotation.y+=Math.PI/2;
            
            
            let dum = new THREE.Vector3();
            point1.getWorldDirection(dum)
            dum = dum.normalize();
            point1.position.x+=0.6*dum.x;
            point1.position.z+=0.6*dum.z;
    
    
            point2.position.copy(localPlayer.position);
            point2.rotation.copy(localPlayer.rotation);
            
            
            point2.rotation.y-=Math.PI/2;
            
            
            dum = new THREE.Vector3();
            point2.getWorldDirection(dum)
            dum = dum.normalize();
            point2.position.x+=0.6*dum.x;
            point2.position.z+=0.6*dum.z;
       }
       else{
            point1.position.copy(localPlayer.position);
            point1.rotation.copy(localPlayer.rotation);
            
            point1.rotation.y-=Math.PI/2;
            
            
            let dum = new THREE.Vector3();
            point1.getWorldDirection(dum)
            dum = dum.normalize();
            point1.position.x+=0.6*dum.x;
            point1.position.z+=0.6*dum.z;
    
    
            point2.position.copy(localPlayer.position);
            point2.rotation.copy(localPlayer.rotation);
            
            
            point2.rotation.y+=Math.PI/2;
            
            
            dum = new THREE.Vector3();
            point2.getWorldDirection(dum)
            dum = dum.normalize();
            point2.position.x+=0.6*dum.x;
            point2.position.z+=0.6*dum.z;
       }
        
        
        
        if (deletePosTimer % 2 == 0 || position.length > 18*100) {
          if (position.length > 18) {
              let temp = new Float32Array(position.length - 18);
              for (let i = 0; i < position.length - 18; i++) {
                  temp[i] = position[i];
              }
              position = temp;
              plane.geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    
          }
        }
    
        let planeNumber = (position.length + 18) / 18;
        // let bottom=2.55;
        // let top=0.45;
        // localPlayer.getWorldDirection(dum)
        // dum = dum.normalize();
    
        
        
        let tempPosition = new Float32Array(planeNumber * 18);
        tempPosition[0] = point1.position.x;
        tempPosition[1] = localPlayer.position.y-1.55;
        tempPosition[2] = point1.position.z;
    
        tempPosition[3] = point2.position.x;
        tempPosition[4] = localPlayer.position.y-1.55;
        tempPosition[5] = point2.position.z;
    
        tempPosition[6] = position[0];
        tempPosition[7] = position[1];
        tempPosition[8] = position[2];
    
        tempPosition[9] = position[3];
        tempPosition[10] = position[4];
        tempPosition[11] = position[5];
    
        tempPosition[12] = position[0];
        tempPosition[13] = position[1];
        tempPosition[14] = position[2];
    
        tempPosition[15] = point2.position.x;
        tempPosition[16] = localPlayer.position.y-1.55;
        tempPosition[17] = point2.position.z;
        
    
        for (let i = 0; i < position.length; i++) {
            tempPosition[i + 18] = position[i];
        }
    
        position = tempPosition;
        planeGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    
    
        uv = new Float32Array(planeNumber * 12);
        let fraction = 1;
        let ratio = 1 / planeNumber;
        for (let i = 0; i < planeNumber; i++) {
            uv[i * 12 + 0] = 0;
            uv[i * 12 + 1] = fraction;
    
            uv[i * 12 + 2] = 1;
            uv[i * 12 + 3] = fraction;
    
            uv[i * 12 + 4] = 0;
            uv[i * 12 + 5] = fraction - ratio;
    
            uv[i * 12 + 6] = 1;
            uv[i * 12 + 7] = fraction - ratio;
    
            uv[i * 12 + 8] = 0;
            uv[i * 12 + 9] = fraction - ratio;
    
            uv[i * 12 + 10] = 1;
            uv[i * 12 + 11] = fraction;
    
            fraction -= ratio;
    
        }
    
        planeGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        
        
          
    
        
        
        deletePosTimer++;
        //material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
        //material.uniforms.iTime.value = timestamp/1000;
        if(narutoRunTime>=10){
            material.uniforms.opacity.value = 1;
        }
        else{
            material.uniforms.opacity.value -= 0.02;
        }
        if(narutoRunTime>0 && narutoRunTime<10){
            material.uniforms.opacity.value = 0;
        }
        material.uniforms.uTime.value = timestamp/1000;
        
        app.updateMatrixWorld();
          
      
      });
    }
    //########################################## flame ##########################################
    // {
    //     const group = new THREE.Group();
    //     const vertflame = `
    //         ${THREE.ShaderChunk.common}
    //         ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
    //         varying vec2 vUv;
    //         uniform float uTime;
    //         uniform float strength;
    //         uniform sampler2D perlinnoise;
    //         void main() {
    //             vUv = uv*strength;
                
    //             vec3 pos = vec3(position.x,position.y,position.z);
    //             vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y+uTime*50.,vUv.x + uTime*1.),1.)).rgb;
    //             if(pos.y >= 1.87){
    //                 pos = vec3(position.x*(sin((position.y - 0.64)*1.27)-0.12),position.y,position.z*(sin((position.y - 0.64)*1.27)-0.12));
    //             } else{
    //                 pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.79),position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.79));
    //             }
    //             pos.xz *= noisetex.r;
    //             gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    //             ${THREE.ShaderChunk.logdepthbuf_vertex}
    //         }
    //     `;

    //     const fragflame = `
    //         ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
    //         varying vec2 vUv;
    //         uniform sampler2D perlinnoise;
    //         uniform float uTime;
            
    //         uniform vec3 color;
    //         varying vec3 vNormal;
            
    //         void main() {
    //             vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y+uTime*2.,vUv.x - uTime*1.),1.)).rgb;
        
    //             gl_FragColor = vec4(noisetex.r);
    //             if(gl_FragColor.r >= 0.1){
    //                 gl_FragColor = vec4(color,gl_FragColor.r);
    //             }
    //             else{
    //                 gl_FragColor = vec4(0.);
    //             }
    //             gl_FragColor *= vec4(smoothstep(0.2,0.628,vUv.y));
    //             gl_FragColor.xyz/=1.5;
    //             //gl_FragColor.a/=2.;
    //             ${THREE.ShaderChunk.logdepthbuf_fragment}
                
    //         }
    //     `;



    //     let flameMaterial;
    //     function flame() {
    //         const geometry = new THREE.CylinderBufferGeometry(0.5, 0.1, 5.3, 50, 50, true);
    //         flameMaterial = new THREE.ShaderMaterial({
    //             uniforms: {
    //                 perlinnoise: {
    //                     type: "t",
    //                     value: new THREE.TextureLoader().load(
    //                         "/practice/sonic-boom/wave9.png"
    //                     )
    //                 },
    //                 color: {
    //                     value: new THREE.Vector3(0.120, 0.280, 1.920)
    //                 },
    //                 uTime: {
    //                     type: "f",
    //                     value: 0.0
    //                 },
    //                 strength: {
    //                     type: "f",
    //                     value: 0.0
    //                 },
    //             },
    //             // wireframe:true,
    //             vertexShader: vertflame,
    //             fragmentShader: fragflame,
    //             transparent: true,
    //             depthWrite: false,
    //             blending: THREE.AdditiveBlending,
    //             side: THREE.DoubleSide,
    //         });
        
    //         const mesh = new THREE.Mesh(geometry, flameMaterial);
    //         mesh.setRotationFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -90 * Math.PI / 180 );
    //         group.add(mesh);
    //         //app.add(group);
    //     }
    //     flame();
        
        

    //     useFrame(({timestamp}) => {
    //         group.position.copy(localPlayer.position);
    //         group.position.y-=0.55;
    //         group.rotation.copy(localPlayer.rotation);

    //         let dum = new THREE.Vector3();
    //         localPlayer.getWorldDirection(dum)
    //         dum = dum.normalize();
    //         group.position.x+=2.5*dum.x;
    //         group.position.z+=2.5*dum.z;

    //         if(narutoRunTime>=90 ){
    //             group.scale.set(1,1,1);
    //             flameMaterial.uniforms.strength.value=1.0;
    //         }
    //         else{
    //             //group.scale.set(0,0,0);
    //             flameMaterial.uniforms.strength.value-=0.015;
    //         }
    //         if(narutoRunTime>0 && narutoRunTime<90){
    //             group.scale.set(0,0,0);
    //         }
            
    //         flameMaterial.uniforms.uTime.value=timestamp/20000;
            
            
    //         app.updateMatrixWorld();

    //     });
    // }
    //########################################## lightning ##########################################
    // {
    //     const group = new THREE.Group();
    //     const vertlightning = `
    //         ${THREE.ShaderChunk.common}
    //         ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
    //         varying vec2 vUv;
    //         varying vec3 vPos;
    //         uniform float uTime;
    //         uniform float strength;
    //         uniform sampler2D perlinnoise;
    //         void main() {
    //             vUv = uv*strength;
    //             vPos=position;
    //             vec3 pos = vec3(position.x,position.y,position.z);
    //             vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y+uTime*50.,vUv.x + uTime*1.),1.)).rgb;
    //             if(pos.y >= 1.87){
    //                 pos = vec3(position.x*(sin((position.y - 0.64)*1.27)-0.12),position.y,position.z*(sin((position.y - 0.64)*1.27)-0.12));
    //             } else{
    //                 pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.79),position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.79));
    //             }
    //             pos.xz *= noisetex.r;
    //             gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    //             ${THREE.ShaderChunk.logdepthbuf_vertex}
    //         }
    //     `;

    //     const fraglightning = `
    //         ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
    //         varying vec2 vUv;
    //         uniform sampler2D perlinnoise;
    //         uniform float uTime;
    //         uniform float random;
            
    //         uniform vec3 color;
    //         varying vec3 vNormal;
    //         #define PI 3.1415926

    //         float pat(vec2 uv,float p,float q,float s,float glow)
    //         {
    //             float t =abs(cos(uTime))+1.;
    //             float z = cos(q *random * uv.x) * cos(p *random * uv.y) + cos(q * random * uv.y) * cos(p * random * uv.x);

    //             z += sin(uTime*50.0 - uv.y-uv.y * s)*0.35;	
    //             float dist=abs(z)*(5./glow);
    //             return dist;
    //         }
    //         void main() {
    //             vec2 uv = vUv.yx;
    //             float d = pat(uv, 1.0, 2.0, 10.0, 0.35);	
    //             vec3 col = color*0.5/d;
    //             vec4 fragColor = vec4(col,1.0);



    //             vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y+uTime*2.,vUv.x - uTime*1.),1.)).rgb;
        
    //             gl_FragColor = vec4(noisetex.r);
    //             if(gl_FragColor.r >= 0.0){
    //                 gl_FragColor = fragColor;
    //             }
    //             else{
    //                 gl_FragColor = vec4(0.);
    //             }
    //             gl_FragColor *= vec4(smoothstep(0.2,0.628,vUv.y));
    //             //gl_FragColor.a*=cos(uTime*10.);
    //             ${THREE.ShaderChunk.logdepthbuf_fragment}
                
    //         }
    //     `;



    //     let lightningMaterial;
    //     function lightning() {
    //         const geometry = new THREE.CylinderBufferGeometry(0.65, 0.15, 5.3, 50, 50, true);
    //         lightningMaterial = new THREE.ShaderMaterial({
    //             uniforms: {
    //                 perlinnoise: {
    //                     type: "t",
    //                     value: new THREE.TextureLoader().load(
    //                         "/practice/sonic-boom/wave9.png"
    //                     )
    //                 },
    //                 color: {
    //                     value: new THREE.Vector3(0.120, 0.280, 1.920)
    //                 },
    //                 uTime: {
    //                     type: "f",
    //                     value: 0.0
    //                 },
    //                 random: {
    //                     type: "f",
    //                     value: 0.0
    //                 },
    //                 strength: {
    //                     type: "f",
    //                     value: 0.0
    //                 },
    //             },
    //             // wireframe:true,
    //             vertexShader: vertlightning,
    //             fragmentShader: fraglightning,
    //             transparent: true,
    //             depthWrite: false,
    //             blending: THREE.AdditiveBlending,
    //             side: THREE.DoubleSide
    //         });
        
    //         const mesh = new THREE.Mesh(geometry, lightningMaterial);
    //         mesh.setRotationFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -90 * Math.PI / 180 );
    //         mesh.rotation.y=Math.PI;
    //         group.add(mesh);
    //         //app.add(group);
    //     }
    //     lightning();
        
        
    //     let lightningfreq=0;
    //     useFrame(({timestamp}) => {
    //         group.position.copy(localPlayer.position);
    //         group.position.y-=0.55;
    //         group.rotation.copy(localPlayer.rotation);

    //         let dum = new THREE.Vector3();
    //         localPlayer.getWorldDirection(dum)
    //         dum = dum.normalize();
    //         group.position.x+=2.5*dum.x;
    //         group.position.z+=2.5*dum.z;

    //         if(narutoRunTime>=90 ){
    //             group.scale.set(1,1,1);
    //             lightningMaterial.uniforms.strength.value=1.0;
                
    //         }
    //         else{
    //             //group.scale.set(0,0,0);
    //             lightningMaterial.uniforms.strength.value-=0.015;
    //         }

    //         if(narutoRunTime>0 && narutoRunTime<90){
    //             group.scale.set(0,0,0);
    //         }
          
    //         if(lightningfreq%1==0){
    //             lightningMaterial.uniforms.random.value=Math.random()*Math.PI;
    //         }
    //         lightningMaterial.uniforms.uTime.value=timestamp/10000;
            
    //         //lightningMaterial.uniforms.strength.value=Math.abs(Math.cos(timestamp/10000));
            
    //         app.updateMatrixWorld();
    //         lightningfreq++;

    //     });
    // }
    //########################################### electronic ball #############################################
    
    {
        let electronicball;
        electronicball = new Electronicball();
        app.add(electronicball);
        app.add(electronicball.batchRenderer);
        app.updateMatrixWorld();

        const startTime = Date.now();
        let lastTimestamp = startTime;
        electronicball.update(0,-1);
        useFrame(({timestamp}) => {
            
            const now = Date.now();
            const timeDiff = (now - lastTimestamp) / 1000.0;
            lastTimestamp = now;


            
            electronicball.position.copy(localPlayer.position);
            let dum = new THREE.Vector3();
            localPlayer.getWorldDirection(dum)
            dum = dum.normalize();
            //console.log(dum);
            electronicball.position.x-=1.2*dum.x;
            electronicball.position.z-=1.2*dum.z;
            
            
            
            if(!localPlayer.hasAction('fly') && !localPlayer.hasAction('jump')){
                electronicball.position.y-=0.6;
            }
            else{
                electronicball.position.y-=50000;
            }
            if(narutoRunTime==0){
                electronicball.update(timeDiff,0);
                
                electronicball.position.x+=1.2*dum.x;
                electronicball.position.z+=1.2*dum.z;
            }
            else if(narutoRunTime==1){
                electronicball.update(timeDiff,10);
                
            }
            // else if(narutoRunTime>0 && narutoRunTime<80){
                
            //     electronicball.update(timeDiff,1);
                
            // }
            else if(narutoRunTime>0 && narutoRunTime<10){
                electronicball.update(timeDiff,2);
                
            }
            else if(narutoRunTime>=10){
                electronicball.update(timeDiff,3);
                
            }
            

            app.updateMatrixWorld();
           
        
        });
    }
    
    
  

  //############################################# shock wave ######################################################
  
//   {
//     const localVector = new THREE.Vector3();
//     const _shake = () => {
//         localVector.setFromMatrixPosition(localPlayer.matrixWorld);
//         cameraManager.addShake( localVector, 0.5, 10, 5);
//     };
//     let wave;
//     (async () => {
//         const u = `${baseUrl}wave3.glb`;
//         wave = await new Promise((accept, reject) => {
//             const {gltfLoader} = useLoaders();
//             gltfLoader.load(u, accept, function onprogress() {}, reject);
            
//         });
//         wave.scene.position.y+=0.05;
//         wave.scene.position.y=-5000;
//         //app.add(wave.scene);
        
//         wave.scene.children[0].material= new THREE.ShaderMaterial({
//             uniforms: {
//                 uTime: {
//                     value: 0,
//                 },
//                 avatarPos:{
//                     value: new THREE.Vector3(0,0,0)
//                 },
//                 iResolution: { value: new THREE.Vector3() },
//             },
//             vertexShader: `\
                 
//                 ${THREE.ShaderChunk.common}
//                 ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
               
             
//                 uniform float uTime;
        
//                 varying vec2 vUv;
//                 varying vec3 vPos;

               
//                 void main() {
//                   vUv=uv;
//                   vPos=position;
//                   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
//                   vec4 viewPosition = viewMatrix * modelPosition;
//                   vec4 projectionPosition = projectionMatrix * viewPosition;
        
//                   gl_Position = projectionPosition;
//                   ${THREE.ShaderChunk.logdepthbuf_vertex}
//                 }
//               `,
//             fragmentShader: `\
//                 ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
//                 uniform float uTime;
//                 uniform vec3 iResolution;
//                 uniform vec3 avatarPos;
//                 varying vec2 vUv;
//                 varying vec3 vPos;



                
//                 float noise(vec3 point) { 
//                     float r = 0.; 
//                     for (int i=0;i<16;i++) {
//                         vec3 D, p = point + mod(vec3(i,i/4,i/8) , vec3(4.0,2.0,2.0)) +
//                         1.7*sin(vec3(i,5*i,8*i)), C=floor(p), P=p-C-.5, A=abs(P);
//                         C += mod(C.x+C.y+C.z,2.) * step(max(A.yzx,A.zxy),A) * sign(P);
//                         D=34.*sin(987.*float(i)+876.*C+76.*C.yzx+765.*C.zxy);P=p-C-.5;
//                         r+=sin(6.3*dot(P,fract(D)-.5))*pow(max(0.,1.-2.*dot(P,P)),4.);
//                     } 
//                     return .5 * sin(r); 
//                 }
                
//                 void mainImage( out vec4 fragColor, in vec2 fragCoord ){
                    
//                     fragColor = vec4(
//                         vec3(0.5,0.8,0.4)
//                         +vec3(
//                             noise(10.6*vec3(vPos.z*sin(mod(uTime,1.)/3.),vPos.z,vPos.x*cos(mod(uTime,1.)/3.))
//                         ))
//                         , distance(avatarPos,vPos)-.95);//pow(distance(avatarPos,vPos)-.95,1.)
//                 }
                
//                 void main() {
//                     mainImage(gl_FragColor, vUv * iResolution.xy);
//                     gl_FragColor.a*=2.;
//                     //gl_FragColor.xyz*=10.;
//                   ${THREE.ShaderChunk.logdepthbuf_fragment}
//                 }
//               `,
//             //side: THREE.DoubleSide,
//             transparent: true,
//             depthWrite: false,
//             blending: THREE.AdditiveBlending,
//         });


//     })();

    
//     app.updateMatrixWorld();

//     useFrame(({timestamp}) => {
//         let dum = new THREE.Vector3();
//         localPlayer.getWorldDirection(dum)
//         dum = dum.normalize();
        
//         if(wave){
//             if(ioManager.keys.doubleTap === true){
//                 if(wave.scene.scale.x>5){
//                     wave.scene.scale.set(10,10,10);
//                     wave.scene.position.y=-5000;
//                 }
//                 else{
//                     wave.scene.scale.set(wave.scene.scale.x+.1,wave.scene.scale.y+0.03,wave.scene.scale.z+.1);
//                     wave.scene.position.copy(localPlayer.position);
//                     wave.scene.position.y=0.5;
//                     //_shake();
//                 }
                 
//             }
//             else{
//                 wave.scene.scale.set(1,1,1);
//                 wave.scene.position.y=-5000;
//             }

//             wave.scene.children[0].material.uniforms.uTime.value=timestamp/1000;
//             wave.scene.children[0].material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
//             wave.scene.children[0].material.uniforms.avatarPos.x=localPlayer.position.x;
//             wave.scene.children[0].material.uniforms.avatarPos.y=localPlayer.position.y;
//             wave.scene.children[0].material.uniforms.avatarPos.z=localPlayer.position.z;
//         }
//         app.updateMatrixWorld();
//     });
//   }

  //#################################### shockwave2 ########################################
  {
    const localVector = new THREE.Vector3();
    const _shake = () => {
        localVector.setFromMatrixPosition(localPlayer.matrixWorld);
        cameraManager.addShake( localVector, 0.5, 10, 50);
    };
    let wave;
    let group = new THREE.Group();
    (async () => {
        const u = `${baseUrl}/assets/wave3.glb`;
        wave = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);
            
        });
        wave.scene.position.y+=0.05;
        wave.scene.position.y=-5000;
        wave.scene.rotation.x=Math.PI/2;
        group.add(wave.scene);
        app.add(group);
        
        wave.scene.children[0].material= new THREE.ShaderMaterial({
            uniforms: {
                uTime: {
                    value: 0,
                },
                opacity: {
                    value: 0,
                },
                avatarPos:{
                    value: new THREE.Vector3(0,0,0)
                },
                iResolution: { value: new THREE.Vector3() },
            },
            vertexShader: `\
                 
                ${THREE.ShaderChunk.common}
                ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
               
             
                uniform float uTime;
        
                varying vec2 vUv;
                varying vec3 vPos;

               
                void main() {
                  vUv=uv;
                  vPos=position;
                  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                  vec4 viewPosition = viewMatrix * modelPosition;
                  vec4 projectionPosition = projectionMatrix * viewPosition;
        
                  gl_Position = projectionPosition;
                  ${THREE.ShaderChunk.logdepthbuf_vertex}
                }
              `,
            fragmentShader: `\
                ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
                uniform float uTime;
                uniform float opacity;
                uniform vec3 iResolution;
                uniform vec3 avatarPos;
                varying vec2 vUv;
                varying vec3 vPos;

                float noise(vec3 point) { 
                    float r = 0.; 
                    for (int i=0;i<16;i++) {
                        vec3 D, p = point + mod(vec3(i,i/4,i/8) , vec3(4.0,2.0,2.0)) +
                        1.7*sin(vec3(i,5*i,8*i)), C=floor(p), P=p-C-.5, A=abs(P);
                        C += mod(C.x+C.y+C.z,2.) * step(max(A.yzx,A.zxy),A) * sign(P);
                        D=34.*sin(987.*float(i)+876.*C+76.*C.yzx+765.*C.zxy);P=p-C-.5;
                        r+=sin(6.3*dot(P,fract(D)-.5))*pow(max(0.,1.-2.*dot(P,P)),4.);
                    } 
                    return .5 * sin(r); 
                }
                
                void mainImage( out vec4 fragColor, in vec2 fragCoord ){
                    
                    fragColor = vec4(
                        mix(vec3(0.205, 0.350, 0.930),vec3(0.205, 0.550, 0.530),vUv.x)
                        +vec3(
                            noise(5.6*vec3(vPos.z*sin(mod(uTime*1.,1.)/0.9),vPos.z,vPos.x*cos(mod(uTime*1.,1.)/0.9)))
                        )
                        , distance(avatarPos,vPos)-.95);
                        //pow(distance(avatarPos,vPos)-.95,1.)

                        // vec2 u = vPos.xz*10.;
    
                        // vec2 s = vec2(1.,1.732);
                        // vec2 a = mod(u     ,s)*2.-s;
                        // vec2 b = mod(u+s*.5,s)*2.-s;
                        
                        // fragColor = vec4(.2*min(dot(a,a),dot(b,b)));


                        
                    
                }
                
                void main() {
                    mainImage(gl_FragColor, vUv * iResolution.xy);
                    gl_FragColor.a*=1.5;
                    gl_FragColor.a-=opacity;
                    //gl_FragColor.xyz*=10.;
                  ${THREE.ShaderChunk.logdepthbuf_fragment}
                }
              `,
            //side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });


    })();


    
    app.updateMatrixWorld();

    useFrame(({timestamp}) => {
        let dum = new THREE.Vector3();
        localPlayer.getWorldDirection(dum)
        dum = dum.normalize();

        if(wave){
            if(narutoRunTime>0){
                // if(wave.scene.scale.x>5){
                //     // wave.scene.scale.set(10,10,10);
                //     // wave.scene.position.y=-5000;
                // }
                // else{
                    wave.scene.scale.set(wave.scene.scale.x+.1,wave.scene.scale.y+0.0005,wave.scene.scale.z+.1);
                    group.position.copy(localPlayer.position);
                    let dum = new THREE.Vector3();
                    localPlayer.getWorldDirection(dum)
                    dum = dum.normalize();
                    group.position.x-=0.2*dum.x;
                    group.position.z-=0.2*dum.z;
                    group.rotation.copy(localPlayer.rotation);
                    wave.scene.position.y=-1.;
                    if(wave.scene.scale.x<=5){
                        _shake();
                        
                    }
                    else{
                        wave.scene.children[0].material.uniforms.opacity.value+=0.005;
                    }
                    
                //}
                
                 
            }
            else{
                wave.scene.scale.set(1,1,1);
                wave.scene.position.y=-5000;
                wave.scene.children[0].material.uniforms.opacity.value=0;
            }

            wave.scene.children[0].material.uniforms.uTime.value=timestamp/1000;
            wave.scene.children[0].material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
            wave.scene.children[0].material.uniforms.avatarPos.x=localPlayer.position.x;
            wave.scene.children[0].material.uniforms.avatarPos.y=localPlayer.position.y;
            wave.scene.children[0].material.uniforms.avatarPos.z=localPlayer.position.z;
        }
        
        
        app.updateMatrixWorld();
    });
  }

  
  app.setComponent('renderPriority', 'low');
  
  return app;
};


