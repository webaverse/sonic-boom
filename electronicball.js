import { AdditiveBlending, Group, NormalBlending, TextureLoader, Vector4} from 'three';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useInternals, useLocalPlayer} = metaversefile;
import * as THREE from 'three';
import {
    BatchedParticleRenderer, ColorOverLife, ParticleSystem, PointEmitter, RenderMode,
    ConstantValue, ConstantColor, SphereEmitter, SizeOverLife, PiecewiseBezier, Bezier, ColorRange,
    IntervalValue, RandomColor, ConeEmitter, FrameOverLife, RotationOverLife, Gradient
} from './three.quarks.esm.js';
const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export class Electronicball extends THREE.Group {

    constructor() {

        super();

        this.batchRenderer = new BatchedParticleRenderer();

        const texture = new THREE.TextureLoader().load(`${baseUrl}/textures/texture1.png`);
        const texture2 = new THREE.TextureLoader().load(`${baseUrl}/textures/texture2.png`);
        const texture3 = new THREE.TextureLoader().load(`${baseUrl}/textures/electronic-ball2.png`);
        
        this.mainbean = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: true,
            startLife: new ConstantValue(1),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(0.75*1.5),
            startColor: new ConstantColor(new Vector4(0.3984,.4921,0.7656,0.772549)),
            worldSpace: false,

            maxParticle: 50,
            emissionOverTime: new ConstantValue(25),

            shape: new PointEmitter({
                radius: .000001,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            texture: texture,
            blending: AdditiveBlending,
            startTileIndex: 1,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        this.add(this.mainbean.emitter);


        this.glowbeam = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: true,
            startLife: new ConstantValue(0.1),
            startSpeed: new ConstantValue(0.1),
            startSize: new ConstantValue(1.5*1.5),
            startColor: new ConstantColor(new Vector4(0.3984,0.4921,0.765625,0.772549)),
            worldSpace: true,

            maxParticle: 50,
            emissionOverTime: new ConstantValue(50),

            shape: new SphereEmitter({
                radius: .0001,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            texture: texture,
            blending: AdditiveBlending,
            startTileIndex: 1,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 2,
        });
        this.glowbeam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1.0, 0.8, 0.5), 0]])));
        this.glowbeam.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1,1,1,1), new Vector4(0,0,0,0))));
        //this.glowbeam.addBehavior(new RotationOverLife(new IntervalValue(0.1,0.82)));
        this.glowbeam.emitter.name = 'glowbeam';
        this.add(this.glowbeam.emitter);


        this.electricity = new ParticleSystem(this.batchRenderer, {
            duration: 0.5,
            looping: true,

            startLife: new IntervalValue(0.1, 0.1),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(.3*3, .6*3),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new RandomColor(new Vector4(0.1397059, 0.3592291, 1, 1), new Vector4(1, 0.9275356, 0.1029412, 1)),
            worldSpace: true,

            maxParticle: 10,
            emissionOverTime: new IntervalValue(5, 10),
            emissionBursts: [],

            shape: new PointEmitter(),
            texture: texture2,
            blending: AdditiveBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 2,
        });
        //this.electricity.addBehavior(new ColorOverLife(([[new Bezier(61, 64, 67, 70), 0]])));
        this.electricity.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(53, 56, 59, 62), 0]])));
        this.electricity.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1.0, 1.0, 0.75, 0), 0]])));
        this.electricity.emitter.name = 'electricity';
        this.add(this.electricity.emitter);

        this.electricBall = new ParticleSystem(this.batchRenderer, {
            duration: 0.4,
            looping: true,

            startLife: new IntervalValue(0.1, 0.1),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(1*1.5, 1.5*1.5),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new RandomColor(new Vector4(0.1397059, 0.3592291, 1, 1), new Vector4(1, 0.9275356, 0.1029412, 1)),
            worldSpace: false,

            maxParticle: 10,
            emissionOverTime: new ConstantValue(3),
            emissionBursts: [],

            shape: new PointEmitter(),
            texture: texture2,
            blending: AdditiveBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 1,
        });
        this.electricBall.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(62, 65, 68, 71), 0]])));
        this.electricBall.emitter.name = 'electricBall';
        this.add(this.electricBall.emitter);



        this.particle = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: true,
            speedFactor:0.05,
            startLife: new IntervalValue(1, 1),
            startSpeed: new IntervalValue(2,5),
            startSize: new IntervalValue(.1,.15),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new RandomColor(new Vector4(0.0609, 0.128, 0.870, 1), new Vector4(1.0,1.0,1.0, 1)),
            worldSpace: true,

            maxParticle: 10,
            emissionOverTime: new ConstantValue(5),
            emissionBursts: [],

            shape: new ConeEmitter({
                radius: 0.05,
                thickness: 1,
                arc: Math.PI * 2,
                angle: Math.PI
            }      
            ),
            renderMode: RenderMode.StretchedBillBoard,
            texture: texture3,
            blending: AdditiveBlending,
            // startTileIndex: 0,
            // uTileCount: 10,
            // vTileCount: 10,
            renderOrder: 0,
        });
        //this.particle.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(62, 65, 68, 71), 0]])));
        this.particle.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1.0, 0.5, 0.25, 0), 0]])));
        this.particle.addBehavior(new RotationOverLife(new IntervalValue(0.1,0.82)));
        this.particle.emitter.name = 'particle';
        //this.particle.emitter.rotation.set(0, 0, 0);
        this.add(this.particle.emitter);

        // this.chargeParticle = new ParticleSystem(this.batchRenderer, {
        //     duration: 1,
        //     looping: true,
        //     speedFactor:0.2,
        //     startLife: new IntervalValue(0.3, 0.4),
        //     startSpeed: new IntervalValue(-5,-6.5),
        //     startSize: new IntervalValue(.075,.125),
        //     startRotation: new IntervalValue(-Math.PI, Math.PI),
        //     startColor: new RandomColor(new Vector4(0.0609, 0.128, 0.870, 1), new Vector4(0.944, 0.950, 0.917, 1)),
        //     worldSpace: false,

        //     maxParticle: 500,
        //     emissionOverTime: new ConstantValue(30),
        //     emissionBursts: [],

        //     shape: new SphereEmitter({
        //         radius: 3,
        //         thickness: 0.8,
        //         arc: Math.PI
        //     }      
        //     ),
        //     renderMode: RenderMode.StretchedBillBoard,
        //     texture: texture3,
        //     blending: AdditiveBlending,
        //     // startTileIndex: 50,
        //     // uTileCount: 10,
        //     // vTileCount: 10,
        //     // renderOrder: 2,
        // });
        // this.chargeParticle.addBehavior(new ColorOverLife(new ColorRange(new Vector4(0.2,0.2,0.2,1), new Vector4(1,1,1,1))));
        // //this.chargeParticle.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(62, 65, 68, 71), 0]])));
        // // this.chargeParticle.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1.0, 0.5, 0.25, 0), 0]])));
        // // this.chargeParticle.addBehavior(new RotationOverLife(new IntervalValue(0.1,0.82)));
        // this.chargeParticle.emitter.name = 'chargeParticle';
        // //this.particle.emitter.rotation.set(0, 0, 0);
        // this.add(this.chargeParticle.emitter);
        
    }

    update(delta,chargeSw) {
        //console.log(this.electricBall.startSize)
        this.mainbean.update(delta*1000);
        this.glowbeam.update(delta*1000);
        this.electricity.update(delta*1000);
        this.electricBall.update(delta*1000);
        this.particle.update(delta*1000);
        //this.chargeParticle.update(delta);
        //console.log(this.mainbean.startColor);
        if(chargeSw==-1){

            // this.chargeParticle.startSize.a=0.075;
            // this.chargeParticle.startSize.b=0.125;

            this.particle.startSize.a=0;
            this.particle.startSize.b=0;

            this.mainbean.startSpeed.value=0;

            this.mainbean.startSize.value=0;
            this.glowbeam.startSize.value=0;
            this.electricity.startSize.a=0;
            this.electricity.startSize.b=0;
            this.electricBall.startSize.a=0;
            this.electricBall.startSize.b=0;

            this.mainbean.startColor.color.w=0;
            this.glowbeam.startColor.color.w=0;

            // this.electricity.emissionOverTime.a=5;
            // this.electricity.emissionOverTime.b=10;
            // this.electricBall.emissionOverTime.value=3;
            
        }
        if(chargeSw==0){

            // this.chargeParticle.startSize.a=0;
            // this.chargeParticle.startSize.b=0;

            this.particle.startSize.a=0;
            this.particle.startSize.b=0;

            

            // this.mainbean.startSize.value/=1.018;
            // this.glowbeam.startSize.value/=1.018;
            this.electricity.startSize.a/=1.05;
            this.electricity.startSize.b/=1.05;
            this.electricBall.startSize.a/=1.05;
            this.electricBall.startSize.b/=1.05;

            this.mainbean.startSpeed.value+=this.mainbean.startSize.value/100.;

            this.mainbean.startColor.color.w/=1.05;
            this.glowbeam.startColor.color.w/=1.05;
            
            // this.electricity.emissionOverTime.a=1;
            // this.electricity.emissionOverTime.b=2;
            // this.electricBall.emissionOverTime.value=.1;
        }
        //############ initial ###################
        if(chargeSw==10){

            // this.chargeParticle.startSize.a=0.075;
            // this.chargeParticle.startSize.b=0.125;

            this.particle.startSize.a=0.1;
            this.particle.startSize.b=0.15;

            this.mainbean.startSpeed.value=0;

            this.mainbean.startSize.value=0.75*1.5;
            this.glowbeam.startSize.value=1.5*1.5;
            this.electricity.startSize.a=.3*3;
            this.electricity.startSize.b=.6*3;
            this.electricBall.startSize.a=1*1.5;
            this.electricBall.startSize.b=1.5*1.5;

            this.mainbean.startColor.color.w=0.772549;
            this.glowbeam.startColor.color.w=0.772549;

            // this.electricity.emissionOverTime.a=5;
            // this.electricity.emissionOverTime.b=10;
            // this.electricBall.emissionOverTime.value=3;
            
        }
        if(chargeSw==1){
            
            // this.chargeParticle.startSize.a=0.075;
            // this.chargeParticle.startSize.b=0.125;

            this.particle.startSize.a=0.;
            this.particle.startSize.b=0.;

            this.mainbean.startSize.value/=1.01;
            this.glowbeam.startSize.value/=1.01;
            this.electricity.startSize.a/=1.01;
            this.electricity.startSize.b/=1.01;
            this.electricBall.startSize.a/=1.01;
            this.electricBall.startSize.b/=1.01;
            
        }
        else if(chargeSw==2){
           
            // this.chargeParticle.startSize.a=0;
            // this.chargeParticle.startSize.b=0;


            this.mainbean.startSize.value=0.75*4.5;
            this.glowbeam.startSize.value=1.5*4.5;
            this.electricity.startSize.a=.3*9;
            this.electricity.startSize.b=.6*9;
            this.electricBall.startSize.a=1*4.5;
            this.electricBall.startSize.b=1.5*4.5;
        }
        else if(chargeSw==3){
           
            // this.chargeParticle.startSize.a=0;
            // this.chargeParticle.startSize.b=0;

            this.particle.startSize.a=0.1;
            this.particle.startSize.b=0.15;
            if(this.mainbean.startSize.value>0.75*1.5)
                this.mainbean.startSize.value/=1.05;
            else
                this.mainbean.startSize.value=0.75*1.5;

            if(this.glowbeam.startSize.value>1.5*1.5)
                this.glowbeam.startSize.value/=1.05;
            else
                this.glowbeam.startSize.value=1.5*1.5;

            if(this.electricity.startSize.a>.3*3)
                this.electricity.startSize.a/=1.05;
            else
                this.electricity.startSize.a=.3*3;
            if(this.electricity.startSize.b>.6*3)
                this.electricity.startSize.b/=1.05;
            else
                this.electricity.startSize.b=.6*3;

            if(this.electricBall.startSize.a>1*1.5)
                this.electricBall.startSize.a/=1.05;
            else
                this.electricBall.startSize.a=1*1.5;
            if(this.electricBall.startSize.b>1.5*1.5)
                this.electricBall.startSize.b/=1.05;
            else
                this.electricBall.startSize.b=1.5*1.5;
        }
            
        

        this.batchRenderer.update();
    }

}
