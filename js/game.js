//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//----- game -----
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

var Game = function(){

	trace("new game");

	window.focus();

	var me = this;

	var score_holder;

	me.score = 0;
	me.level = 1;
	me.difficulty = 0;
	me.is_paused = false;
	var is_playing = false;

	var frame_delta = 0;
	var delta;
	var game_actives = [];

	var device_tilt = 0;

	var resize_updater, frame_updater;

	game_actives = [];

	LEGAL.doHide();

	__snds.stopSound("music");
	music_playing = null;

	//create canvas
	var canvas_game = document.getElementById("canvas_game");

	var oGAME = {};

	var splash_emitter;

	me.left_down = false;
	me.right_down = false;


	//----------------------------
	// init
	//---------------------------

	this.doInit = function(){

		

		oGAME.renderer = canvas_game.renderer || new THREE.WebGLRenderer({canvas: canvas_game, antialias: true, alpha: false, shadows:false});

		//3d scene
		oGAME.scene = new THREE.Scene();

		//camera
		oGAME.camera = new THREE.PerspectiveCamera(45, oSTAGE.screen_width / oSTAGE.screen_height, 0.1, 500);
		oGAME.scene.add(oGAME.camera);

		//score holder
		score_holder = new THREE.Group();
		score_holder.position.set(0,0,-1);
		oGAME.camera.add(score_holder);
		me.doCreateScoreDigits();


		//lights
		var light = new THREE.AmbientLight(new THREE.Color(.6, .6, .6));
		oGAME.scene.add( light );

		var spotLight = new THREE.SpotLight(new THREE.Color(1,1,1));
		spotLight.position.set(2, 20, 10 );
		spotLight.angle = .4;
		spotLight.penumbra = .6;
		spotLight.intensity = 1;
		spotLight.distance = 0;

		spotLight.castShadow = true;
		spotLight.shadow.mapSize.width = 512;
		spotLight.shadow.mapSize.height = 512;
		spotLight.shadow.camera.near = 0.5;
		spotLight.shadow.camera.far = 50; 

		oGAME.scene.add( spotLight );

		//sky
		oGAME.scene.background =  oMODELS.sky;
		oMODELS.sky.repeat = new THREE.Vector2((oSTAGE.screen_width / oSTAGE.screen_height) * .25, 1);
		oMODELS.sky.wrapS = THREE.RepeatWrapping;

		//create ship
		oGAME.ship =  new THREE.Group();
		oGAME.scene.add(oGAME.ship);

		//add deck
		var deck = oMODELS.deck.clone();
		deck.material.map.minFilter = THREE.LinearMipMapLinearFilter;
		deck.castShadow = false;
		deck.receiveShadow = true;
		oGAME.ship.add(deck);

		//add blobby
		oGAME.player = me.doCreatePlayer();
		oGAME.ship.add(oGAME.player);

		//add splash particle system
	   oGAME.particle_group = new SPE.Group({
	    	texture: { value: oMODELS.particle_water},
	        blending: THREE.AdditiveBlending,
	        transparent: true,
	        maxParticleCount: 20
	   	});

	   	splash_emitter = new SPE.Emitter({
           	particleCount: 20,
           	duration: .5,
            maxAge: {
                value: 1.0
            },
            activeMultiplier: 2.0,
    		position: {
                value: new THREE.Vector3(0, 0, 0 ),
                spread: new THREE.Vector3( 1, 1, 1 )
            },
    		velocity: {
                value: new THREE.Vector3(-20, 32, 0),
                spread: new THREE.Vector3(8, 4, 1)
            },
    		acceleration: {
                value: new THREE.Vector3(0, -42, 0)
            },
            size: {
                value: [4.0 * oSTAGE.scale, 3.0 * oSTAGE.scale],
                spread: [3.0 * oSTAGE.scale]
            },
            angle:{
            	value: [__utils.radFromDeg(360), __utils.radFromDeg(180)]
            }

    	});

		
		oGAME.particle_group.addEmitter(splash_emitter);
		oGAME.scene.add(oGAME.particle_group.mesh);


    	splash_emitter.disable();
	   	


		//camera stuff
		oGAME.camera.position.set(0, 3.5, 24);
		oGAME.camera.lookAt(new THREE.Vector3(0,3.5,0));
		oGAME.renderer.render(oGAME.scene, oGAME.camera);


		me.doResizeUpdate();
		resize_updater = {doResizeUpdate : me.doResizeUpdate};
		update_queue.push(resize_updater);

		frame_updater = {doUpdate : me.doFrameUpdate};
		actives.push(frame_updater);

		canvas_game.style.opacity = 1;
		canvas_game.style.display = "block";


		SCREEN.doShowMessage(oLANG.msg_ready, null);

		setTimeout(me.doGo, 2000);

		//me.doGo();

	}

	this.doCreateScoreDigits = function(){


		oGAME.score_digits = [];
		var sprite_map, sprite;

		for(var i=0; i<=6; i++){

			sprite_map = new THREE.SpriteMaterial({map: oMODELS.score_digits.clone(), fog:false, flatShading:true,  transparent:true});
			sprite = new THREE.Sprite(sprite_map);

			sprite.material.map.repeat = new THREE.Vector2(.1, 1);
			sprite.material.map.offset = new THREE.Vector2(i * .1, 0);	
			sprite.material.map.needsUpdate = true;

			sprite.center = new THREE.Vector2(0,1);

			sprite.position.set(i * .0575,0, i * .0001);
			sprite.scale.set(.07968 * 0.96, 0.1 * 0.96, 1);
			sprite.renderDepth = 1;


			score_holder.add(sprite);
			oGAME.score_digits.push(sprite);

		}

		me.doUpdateGameScore();
	}

	this.doUpdateGameScore = function(){
		
		var i;
		var a = String(me.score).split("");
		var digit = 0;
		for(i=0;i<a.length; i++){
			var score_digit = oGAME.score_digits[digit];
			score_digit.material.map.offset.x = parseInt(a[i]) * 0.1;
			score_digit.visible=true;
			digit++;        
		}
		for(i = Math.max(2,digit+1); i <= 7; i++){
			var score_digit = oGAME.score_digits[i-1];
			score_digit.visible=false;
		}
	};

	//----------------------------
	// destroy
	//---------------------------


	this.doDestroy = function(){

		game_actives = [];
		oGAME.particle_group.dispose();

	    resize_updater.forget = true;
	    frame_updater.forget = true;
	    
		//clear scene
		if(oGAME.scene){
			while(oGAME.scene.children.length > 0){ 
	    		oGAME.scene.remove(oGAME.scene.children[0]); 
			}
		}
		oGAME.scene = null;

		//fade out
		TweenLite.to(canvas_game, 0.5, {opacity: 0, overwrite:true, onComplete:function(){
			canvas_game.style.display = "none";
		}
		});

		GAME = null;

		is_active = false;
	}


	//---------------------------
	// resize update
	//---------------------------

	this.doResizeUpdate = function(){

		oGAME.camera.aspect = oSTAGE.screen_width / oSTAGE.screen_height;
		oGAME.camera.updateProjectionMatrix();

		var wrapper_ratio = (oSTAGE.screen_width / oSTAGE.screen_height);
		oMODELS.sky.repeat = new THREE.Vector2(wrapper_ratio * .5, 1);

		oGAME.renderer.setSize(oSTAGE.screen_width, oSTAGE.screen_height);
		//oGAME.renderer.setPixelRatio(__utils.getPixelRatio());

		//set camera to fit 20 units witch at 20 units distance (world center)
		var target_width;
		if(oSTAGE.is_landscape){
			target_width = 25;
		}else{
			target_width = 20;
		}

		var cam_dist = 24;
		var renderer_size = oGAME.renderer.getSize();
		var renderer_ratio = renderer_size.width / renderer_size.height;
		var fov = 2 * Math.atan( ( target_width / renderer_ratio ) / ( 2 * cam_dist ) ) * ( 180 / Math.PI ); // in degrees
		oGAME.camera.fov = fov;
		oGAME.camera.updateProjectionMatrix();


		var scale_y = Math.tan(oGAME.camera.fov * Math.PI / 180 * 0.5) * cam_dist * 2 ;
 		var scale_x = scale_y * oGAME.camera.aspect;

 		

 		var vFOV = oGAME.camera.fov * Math.PI / 180;        // convert vertical fov to radians
		var visible_height = 2 * Math.tan( vFOV / 2 ) * 1; // visible height
		var visible_width = visible_height * renderer_ratio;

		var width_pixel_ratio = visible_width / renderer_size.width;
		var height_pixel_ratio = visible_height / renderer_size.height;

 		score_holder.position.set((-visible_width * 0.5) + (10 * width_pixel_ratio * oSTAGE.scale), (visible_height * 0.5) - (40 * width_pixel_ratio * oSTAGE.scale), -1);

 		


 		oGAME.camera.position.y = Math.max(0, -(15 - (scale_y * .5))) + 3.5;
		oGAME.camera.lookAt.y = oGAME.camera.position.y - 3.5;

		oGAME.renderer.render(oGAME.scene, oGAME.camera);

	}


	//----------------------------
	// pause
	//---------------------------

	this.doPause = function(){
		me.is_paused = true;
		var pause_buttons = [
			{snd:"snd_click", msg:oLANG.quit, callback:me.doQuit},
			{snd:"snd_click", msg:oLANG.resume, callback:me.doUnPause}
		];
		new PopupPause(pause_buttons);
	}

	this.doUnPause = function(){
		me.is_paused = false;
	}

	this.doQuit = function(){
		__snds.stopSound("music");
		CONTROLS.doHidePause();
		SCREEN = new TitleScreen();
		LEGAL.doShow();
		me.doDestroy();
	}

	
	//----------------------------
	// pause
	//---------------------------


	this.doGo = function(){

		SCREEN.doShowMessage(oLANG.msg_go, 1);
		clock.start();
		timer_seconds = 0;
		is_playing = true;
		game_mode = 0;
		__snds.playSound("music_game_loop", "music", -1, .25);
		CONTROLS.doShowPause();
		me.doNextTilt();
	}

	this.doGameOver = function(){

		clock.stop();
		SCREEN.doShowMessage(oLANG.msg_gameover, null);

		is_playing = false;
		
	    oUSER.best_score = Math.max(oUSER.best_score, me.score);
	    __localsaver.doSaveData("user", oUSER);

		__snds.playSound("music_game_end", "music", 1, 0.25);
		CONTROLS.doHidePause();
		setTimeout(me.doGotoRecap, 3000);
	}

	this.doGotoRecap = function(){
		SCREEN = new RecapScreen();
		LEGAL.doShow();
		me.doDestroy();
	}


	//----------------------------
	// player
	//---------------------------

	this.doCreateJr = function(){

		var player = new THREE.Group();

		//create actor
		var character = oMODELS.blobby_jr.clone();
		character.matrixAutoUpdate = false;
		character.updateMatrix();
		character.updateMatrixWorld();
		character.material.blending = THREE.NormalBlending;
		character.material.transparent = true;
		character.castShadow = true;
		character.receiveShadow = false;
		character.getObjectByName("Base").rotation.x = __utils.radFromDeg(0);


		//register bones for animations
		var jr_spine_1 = character.getObjectByName("Spine_01");
		var jr_spine_2 = character.getObjectByName("Spine_02");
		var jr_base = character.getObjectByName("Base");

		var shoulder_l = character.getObjectByName("arm_01_L");
		var shoulder_r = character.getObjectByName("arm_01_R");

		shoulder_r.rotation.z -= .5;
		shoulder_l.rotation.z -= .5;

		var elbow_l = character.getObjectByName("arm_02_L");
		var elbow_r = character.getObjectByName("arm_02_R");

		elbow_r.rotation.y -= .5;
		elbow_l.rotation.y -= .5;

		eye_l_jr = character.getObjectByName("Eye_L");
		eye_r_jr = character.getObjectByName("Eye_R");


		var all_bones = [jr_spine_1,jr_spine_2, eye_l_jr, eye_r_jr,shoulder_l, shoulder_r, elbow_l, elbow_r];
		for(i=0; i<all_bones.length; i++){
			all_bones[i].my_rot = all_bones[i].rotation.clone();
			all_bones[i].my_pos = all_bones[i].position.clone();
		}

		player.stretch = 2;

		jr_spine_2.scale.set(.2,.2,.2);

		var scale_1 = new THREE.Vector3(1,1,1);
		var pulse_jr = new __utils.NewPulse(10, {seed:0});
		var pulse_jr2 = new __utils.NewPulse(6, {seed:180});


		player.doUpdate = function(){
		
			pulse_jr.update();
			pulse_jr2.update();
			//general pulse
			var r2 = pulse_jr.value * 0.1;
			jr_spine_1.rotation.z = jr_spine_1.my_rot.z + r2;
			jr_spine_2.rotation.z = jr_spine_2.my_rot.z + r2;

			shoulder_l.rotation.z = shoulder_l.my_rot.z + r2;
			shoulder_r.rotation.z = shoulder_r.my_rot.z + r2;

			elbow_l.rotation.y = elbow_l.my_rot.y + r2;
			elbow_r.rotation.y = elbow_r.my_rot.y + r2;

			var r3 = pulse_jr2.value_normal * (.2 + this.stretch);
			this.stretch *= .9;

			jr_spine_1.position.x = jr_spine_1.my_pos.x + r3;
			jr_spine_2.position.x = jr_spine_2.my_pos.x + r3;

			jr_spine_2.scale.lerp (scale_1, .1);

		}
		game_actives.push(player);

		//add to scene
		player.actor = character;
		player.position.y = .1;
		player.add(character);

		return player;
	}

	this.doCreatePlayer = function(){

		var player = new THREE.Group();

		//create actor
		var character = oMODELS.blobby.clone();
		character.matrixAutoUpdate = false;
		character.updateMatrix();
		character.updateMatrixWorld();
		
		character.castShadow = true;
		character.receiveShadow = false;
		character.getObjectByName("Base").rotation.x = __utils.radFromDeg(180);
	
		//process motions
		character.motions = {};
		character.mixer = new THREE.AnimationMixer(character);
		for(var i = 0; i<character.geometry.animations.length; i++){
			var anim = character.geometry.animations[i];
			character.motions[anim.name] = character.mixer.clipAction(character.geometry.animations[i]);
		}
		character.mixer.update(0);
		character.frustumCulled = false;

		//custom webgl shader to handle fading between textures
		var fragShader = [
		    "#ifdef GL_ES",
		    	"precision highp float;",
		    "#endif",
		    "uniform sampler2D t_green;",
		    "uniform sampler2D t_orange;",
		    "uniform sampler2D t_purple;",
		    "uniform float sick;",
		    "varying vec2 vUv;",
		    "void main(void){",
		        "vec4 c_green = texture2D(t_green, vUv);",
		        "vec4 c_orange = texture2D(t_orange, vUv);",
		        "vec4 c_purple = texture2D(t_purple, vUv);",
		        "if(sick < 0.5){",
		        	"gl_FragColor = mix(c_green, c_orange, sick * 2.0) * c_orange.a;",
		      	"}else{",
		        	"gl_FragColor = mix(c_orange, c_purple, (sick - 0.5) * 2.0) * c_purple.a;",
		      	"}",
		    "}"           
		].join( "\n" );

		var vertShader = [
	        "varying vec2 vUv;",
	        "varying vec3 vViewPosition;",
	        THREE.ShaderChunk[ "common" ],
	        THREE.ShaderChunk[ "skinning_pars_vertex" ],
	        "void main() {",
	            "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
	            THREE.ShaderChunk[ "skinbase_vertex" ],
	            THREE.ShaderChunk[ "begin_vertex" ],
	            THREE.ShaderChunk[ "skinning_vertex" ],
	            THREE.ShaderChunk[ "project_vertex" ],
	            "vViewPosition = -mvPosition.xyz;",
	            "vUv = uv;",
	            "gl_Position = projectionMatrix * mvPosition;",
	        "}"
	    ].join( "\n" );


		var uniforms = {
		  t_green: { type: "t", value: oMODELS.blobby_green},
		  t_orange: { type: "t", value: oMODELS.blobby_orange },
		  t_purple: { type: "t", value: oMODELS.blobby_purple },
		  sick: {type:"f", value: 0.0}
		};

		var material_shh = new THREE.ShaderMaterial({
		  uniforms: uniforms,
		  skinning: true,
		  transparent: true,
		  flatShading: true,
		  blending: THREE.NormalBlending,
		  vertexShader: vertShader,
		  fragmentShader: fragShader
		});
		character.material = material_shh;

		//character.material.blending = THREE.NormalBlending;
		//character.material.transparent = true;
		character.material.needUpdate = true;

		//add to scene
		player.actor = character;
		player.position.y = .1;
		player.add(character);

		//register bones for animations
		spine_1 = character.getObjectByName("spine01");
		spine_2 = character.getObjectByName("spine04");
		spine_3 = character.getObjectByName("spine05");
		spine_4 = character.getObjectByName("spine06");

		shoulder_l = character.getObjectByName("shoulder_L");
		elbow_l = character.getObjectByName("Elbow_L");
		wrist_l = character.getObjectByName("Wrist_L");

		shoulder_r = character.getObjectByName("shoulder_R");
		elbow_r = character.getObjectByName("Elbow_R");
		wrist_r = character.getObjectByName("Wrist_R");

		eye_l = character.getObjectByName("Eye_L");
		eye_r = character.getObjectByName("Eye_R");

		var all_bones = [eye_l, eye_r, spine_1,spine_2,spine_3, spine_4, elbow_l, elbow_r, wrist_l, wrist_r, shoulder_l, shoulder_r];
		for(i=0; i<all_bones.length; i++){
			all_bones[i].my_rot = all_bones[i].rotation.clone();
			all_bones[i].my_pos = all_bones[i].position.clone();
		}

		player.sick = 0;
		player.doUpdate = function(){


			character.material.uniforms.sick.value = this.sick;
			//this.sick = Math.min(1, this.sick + .01);

			

			this.actor.mixer.update(frame_delta);
		}
		game_actives.push(player);

		return player;
	}


	var spine_1, spine_2, spine_3, spine_4;
	var elbow_l, elbow_r;
	var shoulder_l, shoulder_r;
	var wrist_l, wrist_r;
	var eye_l, eye_r, eye_l_jr, eye_r_jr;

	var spine_bones = [];


	//---------------------------------------------
	//---------------------------------------------
	//---------------------------------------------
	//---------------------------------------------

	var frame_counter = 0;
	var current_tilt = 0;
	var next_tilt = 0;
	var tilt_speed = 0;
	var current_speed = 0;

	var blobby_lean = 0;
	var blobby_move = 0;

	var move_speed = 0;
	var move_factor = 0;

	var game_mode = 0;
	var jr_created = false;

	var sick = 0;
	var sick_display = 0;


	var pulse_12 = new __utils.NewPulse(5, {seed:180});
	var pulse_6 = new __utils.NewPulse(8);
	var pulse_ship = new __utils.NewPulse(2);

	var pulse_eye_1 = new __utils.NewPulse(11, {seed:90});
	var pulse_eye_2 = new __utils.NewPulse(11);

	var pulse_ease = 1;
	var game_sequence_id = -1;
	var last_sign = 1;
var eye_roll_amt = 0;
	var timer_seconds = 0;

	this.doNextTilt = function(){

		if(is_playing){
			game_sequence_id++;
			if(game_sequence_id > game_sequence.length-1){
				game_sequence_id = 0;
			}
			next_tilt = game_sequence[game_sequence_id].amt;
			var sign = next_tilt ? next_tilt<0 ? -1 : 1 : 0;
			tilt_speed = game_sequence[game_sequence_id].speed * sign;
			last_sign = sign;
		}else{
			last_sign *= -1;
			next_tilt = 0.05 * last_sign;
			tilt_speed = 0.002 * last_sign;
		}

	
	}


	//-------------------------
	// frame loop
	//-------------------------

	this.doFrameUpdate = function(){

		frame_delta = clock.getDelta();

		var using_keyboard = false;
		var using_buttons = false;
		var using_tilt = false;

		if(!oGAME.scene){return;}
		if(me.is_paused){return;}

		pulse_ship.update();
		pulse_6.update();
		pulse_12.update();

		


		//get next tilt
		if((tilt_speed >= 0 && current_speed >= 0 && oGAME.ship.rotation.z >= next_tilt - .01) || (tilt_speed < 0 && current_speed < 0 && oGAME.ship.rotation.z <= next_tilt + .01)){
			me.doNextTilt();
		}

		//tilt the ship
		if(next_tilt > oGAME.ship.rotation.z){
			current_speed = Math.min(current_speed + .001, tilt_speed, (next_tilt - oGAME.ship.rotation.z) * 0.1);
			oGAME.ship.rotation.z += current_speed;

		}else if(next_tilt < oGAME.ship.rotation.z){
			current_speed = Math.max(current_speed - .001, tilt_speed, (next_tilt - oGAME.ship.rotation.z) * 0.1);
			oGAME.ship.rotation.z += current_speed;
		}
		
		//move up and down
		oGAME.ship.position.y = pulse_ship.value * 1;


		
		switch(game_mode){

			case 99:
				//nothing
				break;

			case 0: //normal play

				//player input
				if(is_playing){
					if(__input.right){
						blobby_lean = Math.min(1, blobby_lean + 0.1);
						blobby_move = Math.min(1, blobby_move + 0.015);
						using_keyboard = true;
					}else if(__input.left){
						blobby_lean = Math.max(-1, blobby_lean - 0.1);
						blobby_move = Math.max(-1, blobby_move - 0.015);
						using_keyboard = true;
					}

					if(me.right_down){
						blobby_lean = Math.min(1, blobby_lean + 0.1);
						blobby_move = Math.min(1, blobby_move + 0.015);
						using_buttons = true;
					}else if(me.left_down){
						blobby_lean = Math.max(-1, blobby_lean - 0.1);
						blobby_move = Math.max(-1, blobby_move - 0.015);
						using_buttons = true;
					}

					if(!using_buttons && !using_keyboard){
						blobby_lean *= .90;
						blobby_move *= .98;
					}
				}else{
					blobby_lean = 0;
					blobby_move = 0;
				}

				//general pulse
				var r1 = (pulse_6.value * 0.05) + (blobby_lean * .3);
				spine_1.rotation.z = spine_1.my_rot.z + r1;
				spine_2.rotation.z = spine_2.my_rot.z + r1;
				spine_3.rotation.z = spine_3.my_rot.z + (r1 * .5);
				//spine_4.rotation.z = spine_4.my_rot.z + r1;

				var p1 = (pulse_12.value_normal) * .4;
				spine_1.position.x = spine_1.my_pos.x + p1;
				spine_2.position.x = spine_2.my_pos.x + p1;
				spine_3.position.x = spine_3.my_pos.x + p1;
				//spine_4.position.x = spine_4.my_pos.x + p1;

				//extra adjustments for lean
				var p2 = (blobby_lean * .2);
				spine_1.position.y = spine_1.my_pos.y + p2;
				spine_2.position.y = spine_2.my_pos.y + p2;
				spine_3.position.y = spine_3.my_pos.y + p2;
				//spine_4.position.y = spine_4.my_pos.y + p2;

				//extend bones
				spine_1.position.x += Math.abs(p2);
				spine_2.position.x += Math.abs(p2);

				//get arm out of way
				var p4 = (pulse_12.value_normal) * .4;
				shoulder_l.rotation.x = shoulder_l.my_rot.x + p4;
				shoulder_r.rotation.x = shoulder_r.my_rot.x + p4;
				elbow_l.rotation.y = elbow_l.my_rot.y + p1;
				elbow_r.rotation.y = elbow_r.my_rot.y - p1;

				elbow_l.rotation.y -= (Math.max(0, blobby_lean) * .8);

				var tilt_slide = (-oGAME.ship.rotation.z / 0.6);
				
				if(is_playing){
					move_speed = (tilt_slide * .4) + (blobby_move * .7);
				}else{
					move_speed = 0;
				}



				pulse_eye_1.update();
				pulse_eye_2.update();

				eye_roll_amt = Math.min(1, Math.max(eye_roll_amt-.01, Math.abs(move_speed / .5)));
				var r2 = (pulse_eye_1.value) * .5 * eye_roll_amt;
				var r3 = (pulse_eye_2.value) * .5 * eye_roll_amt;
				eye_l.rotation.y = eye_l.my_rot.y + r2;
				eye_l.rotation.x = eye_l.my_rot.x + r3;
				eye_r.rotation.y = eye_r.my_rot.y + r3;
				eye_r.rotation.x = eye_r.my_rot.x + r2;


				oGAME.player.position.x += move_speed;
				if(is_playing){

					var abs_speed = Math.abs(move_speed);
	  				var repair_rate = oCONFIG.repair_rate * Math.max(0,  Math.min(1, 1 - ((abs_speed - oCONFIG.health_range[0]))  / (oCONFIG.health_range[1] - oCONFIG.health_range[0])));
					var sick_rate = oCONFIG.sick_rate * Math.max(0,  Math.min(1, (abs_speed - oCONFIG.health_range[1]))  / (oCONFIG.health_range[2] - oCONFIG.health_range[1]));
					var health_change = sick_rate - repair_rate;

					sick = Math.max(0, Math.min(1, sick + health_change));


					if(oGAME.player.sick < sick){
						oGAME.player.sick = Math.min(sick, oGAME.player.sick + .05);
					}else{
						oGAME.player.sick = Math.max(sick, oGAME.player.sick - .05);
					}
					


					var tenths_elapsed = Math.floor(clock.getElapsedTime() * 100);
					if(tenths_elapsed != timer_seconds){
						me.score += 1;
						me.doUpdateGameScore();
						timer_seconds = tenths_elapsed;
					}


					if(sick >= 1){
						is_playing = false;
						game_mode = 1;
					}
				
					if(Math.abs(oGAME.player.position.x) > 20){


					oGAME.player.visible = false;

						is_playing = false;
						game_mode = 99;

						var splash_pos = new THREE.Vector3();

						oGAME.player.getWorldPosition(splash_pos);
					   	var splash_pos_sign = splash_pos.x ? splash_pos.x < 0 ? -1 : 1 : 0;

				    	splash_emitter.position.value = new THREE.Vector3(splash_pos.x, splash_pos.y, 0);
				    	splash_emitter.velocity.value = new THREE.Vector3(15 * -splash_pos_sign, 40, 0);
				    	if(splash_pos_sign < 0 ){
				    		splash_emitter.angle.value = [__utils.radFromDeg(0), __utils.radFromDeg(180)];
				    	}else{
				    		splash_emitter.angle.value = [__utils.radFromDeg(360), __utils.radFromDeg(180)];
				    	}
						splash_emitter.enable();

						__snds.playSound("sfx_splash", "blobby");
						me.doGameOver();
					}
				}
				break;

		case 1: //prepare to barf

			//re center
			if(oGAME.player.position.x < 0){
				move_speed = move_speed + .02;
				oGAME.player.position.x += Math.min(move_speed, (0 - oGAME.player.position.x) * .1);
			}else if(oGAME.player.position.x > 0){
				move_speed = move_speed - .02;
				oGAME.player.position.x += Math.max(move_speed, (0 - oGAME.player.position.x) * .1);
			}

			//reset bones
			spine_1.rotation.z += (spine_1.my_rot.z -spine_1.rotation.z) * .1;
			spine_2.rotation.z += (spine_2.my_rot.z -spine_2.rotation.z) * .1;
			spine_3.rotation.z += (spine_3.my_rot.z -spine_3.rotation.z) * .1;
			//spine_4.rotation.z += (spine_4.my_rot.z -spine_4.rotation.z) * .1;

			spine_1.position.x += (spine_1.my_pos.x - spine_1.position.x) * .1;
			spine_2.position.x += (spine_2.my_pos.x - spine_2.position.x) * .1;
			spine_3.position.x += (spine_3.my_pos.x - spine_3.position.x) * .1;
			//spine_4.position.x += (spine_4.my_pos.x - spine_4.position.x) * .1;

			spine_1.position.y += (spine_1.my_pos.y - spine_1.position.y) * .1;
			spine_2.position.y += (spine_2.my_pos.y - spine_2.position.y) * .1;
			spine_3.position.y += (spine_3.my_pos.y - spine_3.position.y) * .1;
			//spine_4.position.y += (spine_4.my_pos.y - spine_4.position.y) * .1;

			shoulder_l.position.y += (shoulder_l.my_pos.y - shoulder_l.position.y) * .1;
			shoulder_r.position.y += (shoulder_r.my_pos.y - shoulder_r.position.y) * .1;
			elbow_l.position.y += (elbow_l.my_pos.y - elbow_l.position.y) * .1;
			elbow_r.position.y += (elbow_r.my_pos.y - elbow_r.position.y) * .1;


			//start barfing
			if(Math.abs(oGAME.player.position.x) < .1){
				oGAME.player.actor.motions.barf.play();
				oGAME.player.actor.motions.barf.setLoop(THREE.LoopOnce,0);
				oGAME.player.actor.motions.barf.clampWhenFinished = true;
				oGAME.player.actor.motions.barf.fadeIn(.25);
				__snds.playSound("sfx_barf", "blobby");
				game_mode = 2;	
			}

			break;

		case 2: //barf

			if(!jr_created && oGAME.player.actor.motions.barf.time >= .6){
				jr_created = true;
				oGAME.jr = me.doCreateJr();
				oGAME.ship.add(oGAME.jr);
				oGAME.jr.position.set(0,0,6);
			}

			if(jr_created){
				oGAME.player.sick = Math.max(0, oGAME.player.sick - .01);

			}

			if(!oGAME.player.actor.motions.barf.isRunning()){
				var all_bones = [spine_1,spine_2,spine_3, spine_4, elbow_l, elbow_r, wrist_l, wrist_r, shoulder_l, shoulder_r];
				for(i=0; i<all_bones.length; i++){
					all_bones[i].my_rot = all_bones[i].rotation.clone();
					all_bones[i].my_pos = all_bones[i].position.clone();
				}
				pulse_ease = 0;
				game_mode = 3;
			}
			break;

		case 3:

				oGAME.player.sick = Math.max(0, oGAME.player.sick - .01);

				//general pulse
				var r1 = pulse_6.value * 0.05 * pulse_ease;
				spine_1.rotation.z = spine_1.my_rot.z + r1;
				spine_2.rotation.z = spine_2.my_rot.z + r1;
				spine_3.rotation.z = spine_3.my_rot.z + (r1 * .5);

				var p1 = pulse_12.value_normal * 0.4 * pulse_ease;;
				spine_1.position.x = spine_1.my_pos.x + p1;
				spine_2.position.x = spine_2.my_pos.x + p1;
				spine_3.position.x = spine_3.my_pos.x + p1;

				pulse_ease = Math.min(1, pulse_ease + .03);

				if(oGAME.player.sick <= 0){
					game_mode = 4;
					eye_l.rotation.x = eye_l.my_rot.x + .4;
					eye_r.rotation.x= eye_r.my_rot.x + .4;
					eye_l_jr.rotation.x = eye_l_jr.my_rot.x - .5;
					eye_r_jr.rotation.x= eye_r_jr.my_rot.x - .5;
					__snds.playSound("sfx_papa", "blobby");
					setTimeout(me.doGameOver, 1000);
			
				}


			break;

			case 4:
				//general pulse
				var r1 = pulse_6.value * 0.05 * pulse_ease;
				spine_1.rotation.z = spine_1.my_rot.z + r1;
				spine_2.rotation.z = spine_2.my_rot.z + r1;
				spine_3.rotation.z = spine_3.my_rot.z + (r1 * .5);
				//spine_4.rotation.z = spine_4.my_rot.z + r1;

				var p1 = pulse_12.value_normal * 0.4 * pulse_ease;;
				spine_1.position.x = spine_1.my_pos.x + p1;
				spine_2.position.x = spine_2.my_pos.x + p1;
				spine_3.position.x = spine_3.my_pos.x + p1;
				//spine_4.position.x = spine_4.my_pos.x + p1;

				pulse_ease = Math.min(1, pulse_ease + .03);

			break;

		}


		//update game actives
		for(var i=0; i<game_actives.length; i++){
			game_actives[i].doUpdate();
		}

		//move sky
		oMODELS.sky.offset.x += .003;
		

		//render
		oGAME.particle_group.tick(delta);
		oGAME.renderer.render(oGAME.scene, oGAME.camera);
	
	}


	me.doInit();

}