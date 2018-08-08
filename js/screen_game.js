
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//----- game screen -----
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function GameScreen (){

	var me = this;

	var msg_timeout;

	//---------------------------
	// init
	//---------------------------

	var container = document.getElementById("div_screens");
	__utils.doDestroyAllChildren(container);
	container.style.backgroundColor = "";

	var hud_score = container.appendChild(document.createElement("div"));
	hud_score.className = "hud_score";
	__utils.doHTMLText(hud_score, oLANG.hud_score);

	var button_left = container.appendChild(document.createElement("div"));
	button_left.className = "game_button_left";
	button_left.allow_touch = true;
	button_left.ontouchstart = function(e){
		e.target.style.backgroundPosition = "-200px 0px";
		GAME.left_down = true;
		e.preventDefault();
	}
	button_left.ontouchend = function(e){
		e.target.style.backgroundPosition = "0px 0px";
		GAME.left_down = false;
	}

	var button_right = container.appendChild(document.createElement("div"));
	button_right.className = "game_button_right";
	button_right.allow_touch = true;
	button_right.ontouchstart = function(e){
		e.target.style.backgroundPosition = "-200px 0px";
		GAME.right_down = true;
		e.preventDefault();
	}
	button_right.ontouchend = function(e){
		e.target.style.backgroundPosition = "0px 0px";
		GAME.right_down = false;
	}


	var hud_messages = container.appendChild(document.createElement("div"));
	hud_messages.className = "hud_messages";
	hud_messages.style.display = "none";


	if(!platform.isMobile){
		button_left.style.display = "none";
		button_right.style.display = "none";
	}

	this.doUpdateScore = function(value){
		//hud_score_amt.innerHTML = value;
	}

	this.doShowMessage = function(lang_obj, timeout){

		__utils.doHTMLText(hud_messages, lang_obj);
		hud_messages.style.opacity = 1;
		hud_messages.style.display = "block";

		hud_messages.style.left = ((container.clientWidth - hud_messages.clientWidth) * 0.5) + "px";
		hud_messages.style.top = ((container.clientHeight - hud_messages.clientHeight) * 0.5) + "px";
		
		clearTimeout(msg_timeout);

		if(timeout){
			msg_timeout = setTimeout(me.doHideMessage, timeout * 1000);
		}
	}

	this.doHideMessage = function(){
		TweenLite.to(hud_messages, 0.5, {opacity: 0 , overwrite:true, onComplete:function(){
				hud_messages.style.display = "none";
			}
		});
	}

	//---------------------------
	// resize update
	//---------------------------

	this.doResizeUpdate = function(){

		hud_messages.style.left = ((container.clientWidth - hud_messages.clientWidth) * 0.5) + "px";
		hud_messages.style.top = ((container.clientHeight - hud_messages.clientHeight) * 0.5) + "px";

	}


	//---------------------------
	// transition
	//---------------------------

	this.doReveal = function(){

		var delay = 1.0;

		button_left.style.transform = "translateX(" + (-256) + "px)";
		button_right.style.transform = "translateX(" + (256) + "px)";

		TweenLite.to(button_left, 0.5, {transform : "translateX(0px)", overwrite:true, ease: Elastic.easeOut.config(1, 0.8), delay: delay});
		TweenLite.to(button_right, 0.5, {transform : "translateX(0px)", overwrite:true, ease: Elastic.easeOut.config(1, 0.8), delay: delay});
	}


	this.doHide = function(){
		TweenLite.to(button_left, 0.5, {transform : "translateX(" + (-256) + "px)", overwrite:true, ease: Elastic.easeIn.config(1, 0.8), lazy:true});
		TweenLite.to(button_right, 0.5, {transform : "translateX(" + (256) + "px)", overwrite:true, ease: Elastic.easeIn.config(1, 0.8), lazy:true});
	}
	

	//---------------------------
	// destroy
	//---------------------------

	this.doDestroy = function(){
		__utils.doDestroyAllChildren(container);
		resize_updater.forget = true;
	}


	me.doResizeUpdate();
	me.doReveal();

	//register the resizer
	var resize_updater = {doResizeUpdate : me.doResizeUpdate};
	update_queue.push(resize_updater);
}