
var __snds, __utils, __localscaver, __input;
var oSTAGE, oLANG, oLANG_IMAGES, oVARS, oCONFIG, oUSER, oMODELS;
var LOADER, THREELOADER, SCREEN, CONTROLS, LEGAL;

var images;

var GAME;

var update_queue = [];
var actives = [];

var window_in_background = false;
var game_is_active = false;

var date_msg;
var stats;

 var loader;

var clock  = new THREE.Clock(true);

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//----- init -----
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function doFrameLoop(){

  if(stats){
      stats.begin();
    }

  //update all actives
  for(var i = 0; i < actives.length; i++){
    if(actives[i].purge || actives[i].forget){
      actives.splice(i,1);
    }else if(actives[i].doUpdate){
      actives[i].doUpdate();
    }else{
      actives.splice(i,1);
    }
  }

  if(stats){
    stats.end();
  }

  requestAnimationFrame(doFrameLoop);
}



function doInit() {

  sCode.trackGame("blobbyondeck","start");
 
  if(oCONFIG.debug_stats){
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild( stats.dom );
  }

  __utils = new BlitTools();
  __snds = new myNameSpace.BlitSounds();
  __localsaver = new BlitSaver();
  __input = new BlitInputs();

   loader = new createjs.LoadQueue(false);
   loader.installPlugin(createjs.Sound);


  //begin frame loop
  doFrameLoop();

  //parse query string
  oVARS = __utils.getQueryString();

  //holder for stage size and scale data
  oSTAGE = {};

  //set up threejs renderer
  var canvas_game = document.getElementById("canvas_game");
  canvas_game.renderer = new THREE.WebGLRenderer({canvas: canvas_game, antialias: true, alpha: false, shadows:false});
  canvas_game.renderer.autoClear = false;
  canvas_game.renderer.shadowMap.enabled = true;

  //user
  oUSER = __localsaver.doGetData("user");
  if(!oUSER){
    oUSER = {};
    oUSER.is_mute = false;
    oUSER.best_score = 0;
    __localsaver.doSaveData("user", oUSER);
  }
 

	//begin
	__utils.doInitResizer(doWindowResize);
  doWindowResize();


  //generalet release date
  var date_release = new Date(date_playing);
  var date_tomorrow = new Date(date_day_before);
  var date_friday = new Date(date_week_before);
  var today_date = new Date();

  if(today_date >= date_release){
      //now playing
      date_msg = oLANG.date_msg_4;
  }else if(today_date >= date_tomorrow){
    //tomorrow
      date_msg = oLANG.date_msg_3;
  }else if(today_date >= date_friday){
    //this friday
      date_msg = oLANG.date_msg_2;
  }else{
    //date
      date_msg = oLANG.date_msg_1;
  }



  
  __utils.doInitFocusManager(doLoseFocus, doGetFocus);

  //start loading
  doPreloadAssets();

}


  function doLoseFocus(){
    __snds.forceMute();
    window_in_background = true;
    if(GAME){
      GAME.doPause();
    }
  }

  function doGetFocus(){
    window_in_background = false;
    if(!GAME){
      __snds.unforceMute();
    }else if(!GAME.is_paused){
      __snds.unforceMute();
    }
  }


function doPreloadAssets(){

  //add legal images
  for(var i=0; i<legal_images.length; i++){
      var src = legal_images[i].src;
      photo_name = src.substr(src.lastIndexOf("/")+1);
      assets_preload.manifest.push({src: src, id: photo_name});
  }

  //add instructions gif
  if(platform.isMobile){
    assets_preload.manifest.push({src:"media/instructions.gif", id:"instructions"});
  }else{
    assets_preload.manifest.push({src:"media/instructions_PC.gif", id:"instructions_desktop"});
  }


  var start_load_time = my_performance.now();

  __utils.doLoadAssets(assets_preload);

  LOADER = new Loader(true);
  LOADER.doUpdate = function(){
    var prog = assets_preload.progress;
      this.doUpdateBar(prog);
      if(assets_preload.loaded){
        this.forget = true;

        var elapsed_load_time = my_performance.now() - start_load_time;
        var delay = Math.max(0, (oCONFIG.splash_hold * 1000) - elapsed_load_time);
        window.setTimeout(function(){
          doStart();
          LOADER.doFadeAndDestroy();
        }, delay);


      }
  }
  actives.push(LOADER);

}


function doStart(){


  document.body.style.backgroundImage = "url('media/bg_title.jpg')";

  LEGAL = new LegalPanel();
  CONTROLS = new ControlsPanel();
  SCREEN = new TitleScreen();

  //holder remaining assets
  __utils.doLoadAssets(assets_additional);

  //load 3d assets
  oMODELS = {};
  __utils.doLoad3dAssets(assets_threejs, oMODELS);

}


function doFinishLoading(callback){
  LOADER = new Loader();
  LOADER.doUpdate = function(){
    var prog = (assets_additional.progress + assets_threejs.progress) * 0.5;
     this.doUpdateBar(prog);
     if(assets_additional.loaded && assets_threejs.loaded){
      this.purge = true;
      if(callback){
        callback();
      }
      LOADER.doFadeAndDestroy();
    }
  }
  actives.push(LOADER);
}










//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//----- window tools  -----
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function doWindowResize(){

 //measure window
  if(window.innerWidth > window.innerHeight){
    oSTAGE.is_landscape = true;
    oSTAGE.scale = Math.min(Infinity, (Math.min(window.innerHeight/550, window.innerWidth/900)));
  }else{
    oSTAGE.is_landscape = false;
    oSTAGE.scale = Math.min(Infinity, (Math.min(window.innerHeight/800, window.innerWidth/600)));
  }


  oSTAGE.scale_inv = (1/oSTAGE.scale);
  oSTAGE.screen_width = Math.ceil(window.innerWidth);
  oSTAGE.screen_height = Math.ceil(window.innerHeight);
  oSTAGE.window_width = Math.ceil(window.innerWidth * oSTAGE.scale_inv);
  oSTAGE.window_height = Math.ceil(window.innerHeight * oSTAGE.scale_inv);
  oSTAGE.wrapper_height = Math.ceil(window.innerHeight * oSTAGE.scale_inv);
  oSTAGE.wrapper_width =  Math.ceil(window.innerWidth * oSTAGE.scale_inv);
  oSTAGE.wrapper_ratio = oSTAGE.wrapper_height / oSTAGE.wrapper_width;
  
  oSTAGE.physical_ppi = __utils.getPPI();
  oSTAGE.ppi_scale = oSTAGE.physical_ppi / 96;

  //scale the screen div
  var div_screens = document.getElementById("div_screens");

  div_screens.style.transform = div_screens.style.webkitTransform = "scale(" + oSTAGE.scale + "," + oSTAGE.scale  + ")";
  div_screens.style.width = Math.ceil(oSTAGE.wrapper_width) + "px";
  div_screens.style.height = Math.ceil(oSTAGE.wrapper_height) + "px";



  //update queue
  for(var i=update_queue.length-1; i>=0; i--){
    if(update_queue[i].forget){
      update_queue.splice(i,1);
    }else if(update_queue[i].doResizeUpdate){
      update_queue[i].doResizeUpdate();
    }else{
      update_queue.splice(i,1);
    }
  }

}

