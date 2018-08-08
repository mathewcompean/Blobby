
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//----- title screen -----
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function TitleScreen (){

	var me = this;

	var res = "low";


	var doStartMusic = function(){
		__snds.playSound("music_title_loop", "music", -1, .25);
		window.removeEventListener('touchstart', doStartMusic);
	}

	if(__snds.getNowPlaying("music") != "music_title_loop"){
		if(platform.isMobile && !__snds.initialized){
			window.addEventListener('touchstart', doStartMusic, {passive:false, capture: false});
		}else{
			__snds.playSound("music_title_loop", "music", -1, .25);
		}
	}


	
	//---------------------------
	// init
	//---------------------------

	var container = document.getElementById("div_screens");
	__utils.doDestroyAllChildren(container);

	//character
	var character = container.appendChild(document.createElement("div"));
	character.className = "character_title";

	//film logo
	var film_logo_block = container.appendChild(document.createElement("div"));
	film_logo_block.className = "film_logo_block";

	var logo = film_logo_block.appendChild(document.createElement("img"));
	logo.className = "film_logo_img";
	logo.src = oLANG_IMAGES.logo;

	var logo_date = film_logo_block.appendChild(document.createElement("div"));
	logo_date.className = "film_logo_date";
	__utils.doHTMLText(logo_date, date_msg);


	//game logo
	var game_logo = container.appendChild(document.createElement("div"));
	game_logo.className = "game_logo";
	__utils.doHTMLText(game_logo, oLANG.title);


	//main site button
	var b_main= container.appendChild(document.createElement("div"));
	b_main.className = "b_main";
	__utils.doHTMLText(b_main, oLANG.main_site);
	b_main.onmouseup  = function(e){
		window.open(main_site_url, "_blank");
	}

	


	//play button
	var b_play= container.appendChild(document.createElement("div"));
	b_play.className = "b_play";
	__utils.doHTMLText(b_play, oLANG.play);
	b_play.onmouseup = function(e){
		me.doDestroy();
		doFinishLoading(function(){
			SCREEN = new GameScreen();
			GAME = new Game();
		});
		__snds.playSound("snd_click", "interface");
	}
	b_play.onmouseover= function(e){
		TweenLite.to(e.target, .1, {transform: "scale(1.1, 1.1)", overwrite:true});
	}
	b_play.onmouseout = function(e){
		TweenLite.to(e.target, .5, {transform: "scale(1.0, 1.0)", overwrite:true, ease: Elastic.easeOut.config(1, 0.5)});
	}


	//instructions button
	var b_instructions = container.appendChild(document.createElement("div"));
	b_instructions.className = "b_instructions";
	__utils.doHTMLText(b_instructions, oLANG.instructions);
	b_instructions.onmouseup = function(e){
		__snds.playSound("snd_click", "interface");
		me.doDestroy();
		SCREEN = new InstructionsScreen();
	}
	b_instructions.onmouseover = function(e){
		TweenLite.to(e.target, .1, {transform: "scale(1.1, 1.1)", overwrite:true});
	}
	b_instructions.onmouseout = function(e){
		TweenLite.to(e.target, .5, {transform: "scale(1.0, 1.0)", overwrite:true, ease: Elastic.easeOut.config(1, 0.5)});
	}


	//---------------------------
	// resize update
	//---------------------------

	this.doResizeUpdate = function(){

		var column_x;

		if(oSTAGE.is_landscape){
			column_x = Math.max(b_main.clientWidth + 20 + (film_logo_block.clientWidth * 0.5), oSTAGE.wrapper_width * 0.33) | 0;
			b_play.style.left = ((column_x - (b_play.clientWidth * 0.5)) | 0) + "px";
			var space = oSTAGE.wrapper_width - (b_play.offsetLeft + b_play.clientWidth);
			b_instructions.style.right = ((space * 0.5 - (b_instructions.clientWidth * 0.5)) | 0) + "px";
			b_play.style.bottom = "58px";
			b_instructions.style.bottom = "58px";

		}else{
			column_x = oSTAGE.wrapper_width * 0.5;
			b_play.style.left = "24px";
			b_instructions.style.right = "24px";
			b_play.style.bottom = "80px";
			b_instructions.style.bottom = "80px";
		}
	
		film_logo_block.style.left = ((column_x - (film_logo_block.clientWidth * 0.5)) | 0) + "px";
		game_logo.style.left = ((column_x - (game_logo.clientWidth * 0.5)) | 0) + "px";
		
	}
	

	//---------------------------
	// show
	//---------------------------

	this.doReveal = function(){

		character.style.transform = "translateX(" + (oSTAGE.wrapper_width - character.offsetLeft) + "px)";
		b_play.style.transform = "translateY(" + (oSTAGE.wrapper_height - b_play.offsetTop) + "px)";
		b_instructions.style.transform = "translateY(" + (oSTAGE.wrapper_height - b_instructions.offsetTop) + "px)";

		var delay = 1.1;
		TweenLite.to(character, 1.0, {transform:"translateX(0px)", overwrite:true, ease: Elastic.easeOut.config(1.0, .8), delay: delay});
		delay += 1.0;
		TweenLite.to(b_play, .75, {transform:"translateY(0px)", overwrite:true, ease: Elastic.easeOut.config(1.0, .8), delay: delay});
		delay += .25;
		TweenLite.to(b_instructions, .75, {transform:"translateY(0px)", overwrite:true, ease: Elastic.easeOut.config(1.0, .8), delay: delay});

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