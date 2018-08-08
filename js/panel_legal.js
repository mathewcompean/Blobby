
function LegalPanel (container_id){
	
	var me = this;

	var container = document.getElementById(container_id || "div_legal");
	container.style.pointerEvents = "none";
	container.style.background = "transparent" ;//rgba(0,0,0,.5)";
	var my_bottom;
	var scale, scaled_height;


	var main_table = container.appendChild(document.createElement("table"));
	main_table.style.margin = "0px";
	main_table.setAttribute("width", "100%");
	main_table.border = 0;

	var tr = main_table.appendChild(document.createElement("tr"));

	var left_column = tr.appendChild(document.createElement("td"));
	left_column.style.textAlign = "left";
	left_column.style.whiteSpace = "nowrap";
	left_column.setAttribute("valign", "bottom");
	left_column.setAttribute("cellpadding", "0");
	
	var right_column = tr.appendChild(document.createElement("td"));
	right_column.style.textAlign = "right";
	right_column.setAttribute("valign", "bottom");
	right_column.setAttribute("cellpadding", "0");

	var legal_block = right_column.appendChild(document.createElement("div"));
	legal_block.className = "legal_block";
	legal_block.style.textAlign = "right";
	legal_block.style.background = "transparent";

	legal_block.style.textShadow = "0px 0px 8px black, 0px 0px 8px black";


	//add images
	for(var i=0; i<legal_images.length; i++){
		var o = legal_images[i];
	    var img = left_column.appendChild(document.createElement("img"));
	    img.className = "legal_image";
	    img.src = o.src;
	    img.alt = o.alt;
		img.prohibit_touch = true;
	    img.draggable = "false";
		img.ondragstart = function(){return false;};
	 }


	//links
	for(var i = 0; i<legal_links.length; i++){
		var legal_link;
		if(legal_links[i].link){
			legal_link = legal_block.appendChild(document.createElement("a"));
			if(platform.isMobile){
				legal_link.className = "legal_link_mobile";
			}else{
				legal_link.className = "legal_link";
			}
			legal_link.setAttribute("href", legal_links[i].link);
			legal_link.setAttribute("target", "_blank");

		}else{
			legal_link = legal_block.appendChild(document.createElement("div"));
			legal_link.style.whiteSpace = "nowrap";
			legal_link.style.pointerEvents = "none";
			legal_link.prohibit_touch = true;
		}

		legal_link.style.fontSize = "14px";
		__utils.doHTMLText(legal_link, oLANG[legal_links[i].msg]);
		
		if(legal_links[i].after && i < legal_links.length-1){
			var divider = legal_block.appendChild(document.createElement("div"));
			divider.style.position = "relative";
			divider.style.marginLeft = "4px";
			divider.style.marginRight = "4px";
			divider.style.display = "inline-block";
			divider.innerHTML = legal_links[i].after;
			divider.prohibit_touch = true;
		}
	}




	this.doHide = function(){

	}

	this.doShow = function(){


	}


	


  //---------------------------
  // resize update
  //---------------------------

	this.doResizeUpdate = function(){

		if(oSTAGE.is_landscape){
			scale = Math.min(1, (oSTAGE.screen_width/960));
		}else{
			scale = Math.min(1, (oSTAGE.screen_width/800));
		}

		container.style.transform = container.style.webkitTransform = "scale(" + scale + "," + scale + ")";
		container.style.width = (oSTAGE.screen_width * (1/scale)) + "px";
		scaled_height = container.clientHeight * scale;

		container.style.left = "0px";
		container.style.top = (oSTAGE.screen_height-scaled_height) + "px";

	}



	me.doResizeUpdate();

	var resize_updater = {doResizeUpdate : me.doResizeUpdate};
	update_queue.push(resize_updater);

}



