
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//----- instructions screen -----
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function InstructionsScreen (){

	var me = this;

	//---------------------------
	// init
	//---------------------------

	var container = document.getElementById("div_screens");
	__utils.doDestroyAllChildren(container);

	container.style.backgroundColor = "rgba(0,38,65,.5)";


	var instructions_header = container.appendChild(document.createElement("div"));
	instructions_header.className = "instructions_header";
	__utils.doHTMLText(instructions_header, oLANG.instructions);


	var instructions_image = container.appendChild(document.createElement("div"));
	instructions_image.className = "instructions_image";

	if(platform.isMobile){
		instructions_image.style.backgroundImage = "url('media/instructions.gif')";
	}else{
		instructions_image.style.backgroundImage = "url('media/instructions_PC.gif')";
	}
	
	


	//play button
	var b_play = container.appendChild(document.createElement("div"));
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
	b_play.onmouseover = function(e){
		TweenLite.to(e.target, .1, {transform: "scale(1.1, 1.1)", overwrite:true});
	}
	b_play.onmouseout = function(e){
		TweenLite.to(e.target, .5, {transform: "scale(1.0, 1.0)", overwrite:true, ease: Elastic.easeOut.config(1, 0.5)});
	}


	//---------------------------
	// resize update
	//---------------------------

	this.doResizeUpdate = function(){

		var column_x = oSTAGE.wrapper_width * 0.5;
		
		b_play.style.left = (column_x - (b_play.clientWidth * 0.5)) + "px";
		if(oSTAGE.is_landscape){
			b_play.style.bottom = "58px";
		}else{
			b_play.style.bottom = "80px";
		}


		var y1 = instructions_header.offsetTop + instructions_header.clientHeight + 10;
		var y2 = b_play.offsetTop - 10;
		var s = (y2-y1) * 0.5;

		instructions_image.style.top = (y1) + "px";
		instructions_image.style.height = (y2-y1) + "px";
		instructions_image.style.width = Math.min(768, (oSTAGE.wrapper_width - 20)) + "px";



		instructions_image.style.left = ((container.clientWidth - instructions_image.clientWidth) * 0.5 ) + "px";

	}


	//---------------------------
	// transition
	//---------------------------

	this.doReveal = function(){

		b_play.style.transform = "translateY(" + (oSTAGE.wrapper_height - b_play.offsetTop) + "px)";

		var delay = 0.5;
		TweenLite.to(b_play, 0.75, {transform:"translateY(0px)", overwrite:true, ease: Elastic.easeOut.config(1.0, .8), delay: delay});
		
	}
	

	//---------------------------
	// destroy
	//---------------------------

	this.doDestroy = function(){
		container.style.backgroundColor = "";
		__utils.doDestroyAllChildren(container);
		resize_updater.forget = true;
	}


	me.doResizeUpdate();
	me.doReveal();

	//register the resizer
	var resize_updater = {doResizeUpdate : me.doResizeUpdate};
	update_queue.push(resize_updater);
}