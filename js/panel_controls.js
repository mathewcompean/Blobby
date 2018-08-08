
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//----- controls (mute, fullscreen, pause) -----
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function ControlsPanel (){

	var me = this;

	//---------------------------
	// init
	//---------------------------

	var container = document.getElementById("div_controls");
	
	//fullscreen button
	var elem = document.documentElement;
	var fullScreen_capable = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen ? true : false;

	if(fullScreen_capable){
		//fullscreen
		var b_fullscreen = container.appendChild(document.createElement("div"));
		b_fullscreen.className = "b_fullscreen";
		b_fullscreen.onclick = function(e){
			if(oSTAGE.is_fullscreen){
				__utils.doFullScreenOff();
				b_fullscreen.className = "b_fullscreen";
			}else{
				__utils.doFullScreenOn();
				b_fullscreen.className = "b_fullscreen_on";
			}
		};
		
		if(oSTAGE.is_fullscreen){
			b_fullscreen.className = "b_fullscreen_on";
		}else{
			b_fullscreen.className = "b_fullscreen";
		}
	}


	//mute
	var b_mute =  container.appendChild(document.createElement("div"));
	b_mute.className = "b_mute";
	b_mute.onclick = function(){
	    if(__snds.toggleMute() == 0){
	      b_mute.className = "b_mute_on";
	      oUSER.is_mute = false;
	    }else{
	      b_mute.className = "b_mute";
	      oUSER.is_mute = true;
	    }
	    __localsaver.doSaveData("user", oUSER);
	}
	if(oUSER.is_mute){
		b_mute.className = "b_mute";
	}else{
		b_mute.className = "b_mute_on";
	}


	//pause
	var b_pause =  container.appendChild(document.createElement("div"));
	b_pause.className = "b_pause";
	b_pause.style.pointerEvents = "none";
	b_pause.style.transform = "translateX(100px)";
	b_pause.onclick = function(){
	    if(GAME.is_paused){
	    	GAME.doUnPause();
	    }else{
	    	GAME.doPause();
	    }
	}

	//---------------------------
	// resize update
	//---------------------------

	this.doResizeUpdate = function(){
		var scale;
		if(oSTAGE.is_landscape){
			scale = Math.min(1, (oSTAGE.screen_width/960));
		}else{
			scale = Math.min(1, (oSTAGE.screen_width/640));
		}
		container.style.transform = container.style.webkitTransform = "scale(" + scale + "," + scale + ")";
	}


	//---------------------------
	// manage pause
	//---------------------------

	this.doShowPause = function(){
		b_pause.style.pointerEvents = "auto";
		TweenLite.set(b_pause, {transform: "translateX(100px)", overwrite:true});
		TweenLite.to(b_pause, 1.2, {transform: "translateX(0px)", overwrite:true, ease: Elastic.easeOut.config(1, 0.5)});
	}

	this.doHidePause = function(){
		b_pause.style.pointerEvents = "none";
		TweenLite.to(b_pause, .4, {transform: "translateX(100px)", overwrite:true, ease: Back.easeIn.config(1.5)});
	}

	me.doResizeUpdate();
	
	var resize_updater = {doResizeUpdate : me.doResizeUpdate};
	update_queue.push(resize_updater);


}