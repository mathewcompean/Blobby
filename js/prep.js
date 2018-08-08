
//----------------------------------------
// trace
//----------------------------------------

function trace(msg){
  if(oCONFIG.debug_trace){
    console.log(msg);
    if(oCONFIG.debug_panel){
      var panel = document.getElementById("debug");
      if(panel){
        panel.style.display = "block";
        panel.innerHTML = msg + "<br>" + panel.innerHTML;
      }
    }
  }
}

var myNav = navigator.userAgent.toLowerCase();

//determine platform info
var platform = {
    isAndroid: navigator.userAgent.match(/Android/i),
    isBlackBerry: navigator.userAgent.match(/BlackBerry/i),
    isiOS: navigator.userAgent.match(/iPhone|iPad|iPod/i),
    isMobileOpera: navigator.userAgent.match(/Opera Mini/i),
    isMobileWindows: navigator.userAgent.match(/IEMobile/i),
    isMobile: (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i)),
    isIE : ((myNav.indexOf("msie") != -1) || (navigator.appName == "Microsoft Internet Explorer") || ((navigator.appName == "Netscape") && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null))),
    isFirefox: navigator.userAgent.match(/Firefox/i),
    isWindows: (window.navigator.platform.indexOf("Win") != -1)
}

//determine support for necessary tech
var support = {
   gzip: false,
    canvas: !! window.CanvasRenderingContext2D,
    webgl: ( function () {
        try {
            var canvas = document.createElement( 'canvas' );
            return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
        } catch ( e ) {
            return false;
        }
    } )(),
    workers: !! window.Worker,
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,
    clamped_array: window.Uint8ClampedArray,
    zoom: document.createElement("detect").style.zoom === ""

};





function doPrep(){

  trace("doPrep()");

  //----------------------------------------
  // compatibility fixes
  //----------------------------------------

  //fix console
  if (!window.console || !window.console.log) console = {log: function() {}, error: function() {}};

  //fix parser
  var parseXml;
  if (window.DOMParser) {
      parseXml = function(xmlStr) {
          return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
      };
  } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
      parseXml = function(xmlStr) {
          var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.async = "false";
          xmlDoc.loadXML(xmlStr);
          return xmlDoc;
      };
  } else {
      parseXml = function() { return null; }
  }

  //fix includes (IE 11)
  if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
          if (typeof start !== 'number') {
            start = 0;
          }
          if (start + search.length > this.length) {
            return false;
          } else {
            return this.indexOf(search, start) !== -1;
          }
        };
      }

    //fix performance
    window.performance = my_performance = (window.performance || {
        offset: Date.now(),
        now: function now(){
            return Date.now() - this.offset;
        }
    });

    if(!my_performance.now){
      window.performance = my_performance = {
          offset: Date.now(),
          now: function now(){
              return Date.now() - this.offset;
          }
        }
    }

    //fix animation frame
    if (!window.requestAnimationFrame){
      window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
    }


  doLoadLanguage();
}



//----------------------------------------
// load language
//----------------------------------------

function doLoadLanguage(){

  trace("doLoadLanguage()");

  var http = new XMLHttpRequest();
  var url = oCONFIG.language_file;

  http.open("GET", url, true);
  http.onreadystatechange = function() {

    if(http.readyState == 4 && http.status == 200) {

      var myxml = http.responseXML || parseXml(http.responseText);
      var root = myxml.documentElement;

      oLANG = {};
      oLANG_IMAGES = {};

      var textnodes = root.getElementsByTagName("txt");
      if (textnodes) {
            for (var i = 0; i < textnodes.length; i++) {
              var my_node = textnodes[i];
              var o = {};
              o.id = my_node.getAttribute('id');
              for (var ii= 0; ii < my_node.attributes.length; ii++) {
                var attrib = my_node.attributes[ii];
                if (attrib.specified) {
                  o[attrib.name] = attrib.value;
                }
              }
              o.value = my_node.childNodes[0].nodeValue;
              oLANG[o.id] = o;
            }
      }

      var imagenodes = root.getElementsByTagName("img");
      if (imagenodes) {
            for (var i = 0; i < imagenodes.length; i++) {
              var my_node = imagenodes[i];
              var my_id = my_node.getAttribute('id');
              var my_value = my_node.childNodes[0].nodeValue;
              oLANG_IMAGES[my_id] = my_value;
            }
      }

        if (!support.canvas || !support.webgl || !support.clamped_array) {
            doBrowserAlert();
        }else{
            doInit();
      }
    }
  }
  
  http.send(null);
  

}


//----------------------------------------
// browser alert
//----------------------------------------

function doBrowserAlert(){

  var overlay = document.getElementById("div_errors");

  var my_html = "";
  my_html += '<table border="0" width="100%" height="100%" cellpadding="40"><tr><td align="center" valign="middle">' + oLANG.browser_alert.value + '<p>';
  my_html += '<a href="https://www.google.com/chrome/browser/"><img border="0" src="media/browser_icons/icon_chrome.png" width="64" height="64" alt=""/></a>';
  my_html += '<a href="http://www.mozilla.org/firefox/new/"><img border="0" src="media/browser_icons/icon_firefox.png" width="64" height="64" alt=""/></a>';
  my_html += '<a href="http://www.microsoft.com/InternetExplorer"><img border="0" src="media/browser_icons/icon_ie.png" width="64" height="64" alt=""/></a>';
  my_html += '<a href="https://www.microsoft.com/microsoft-edge"><img border="0" src="media/browser_icons/icon_edge.png" width="64" height="64" alt=""/></a>';
  my_html += '<a href="http://www.apple.com/safari/"><img border="0" src="media/browser_icons/icon_safari.png" width="64" height="64" alt=""/></a>';
  my_html += '<a href="http://www.opera.com/"><img border="0" src="media/browser_icons/icon_opera.png" width="64" height="64" alt=""/></a>';
  my_html += '</td></tr></table>';

  overlay.innerHTML = my_html;

  overlay.style.display = "inline-block";
}