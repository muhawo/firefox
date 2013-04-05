var autoShowMenu = {
	oldTarget: null,
	nowTarget: null,
    tipBox: {},
    OpenedPopup: {},
    nowPoint: {x:0,y:0},
    oldPoint: {x:0,y:0},
    tipBoxPoint: {x:0,y:0},
    mousemoveFlg: false,
    inPopupFlg: false,
    popupOutFlg: false,
    s: 20*20,
    inTipBoxFlg: false,
    i: 0,
    timer: null,
    
    mouseover: function(event){
    	//if(event.target.getAttribute("check").lastIndexOf("http://home.netscape.com/NC-rdf") == -1){
    	/*
    	if(event.target.getAttribute("check") != "GL_Lee@163.com"){
    		autoShowMenu.inPopupFlg = false;
    		if(autoShowMenu.OpenedPopup.state == "open")
    		autoShowMenu.OpenedPopup.hidePopup();
    	}
    	else{
    		autoShowMenu.inPopupFlg = true;
    	}
    	*/
    	if(autoShowMenu.inPopupFlg){
			return;
    	}
    	if(event.target == autoShowMenu.tipBox){
    		autoShowMenu.inTipBoxFlg = true;
    		autoShowMenu.timerId = setTimeout(function(){
    			autoShowMenu.showPopup();
    		autoShowMenu.tipBox.style.visibility='hidden';}, 800);
    		return;
    	}
    	
    	autoShowMenu.nowTarget = event.target;
    	
    },
    
    popupMouseover: function(){
    	if(autoShowMenu.timer)
    		clearTimeout(autoShowMenu.timer);
		//autoShowMenu.inTipBoxFlg = false;
		autoShowMenu.inPopupFlg = true;
    },
    popupMouseout: function(){
    	if(autoShowMenu.timer)
    		clearTimeout(autoShowMenu.timer);
    	autoShowMenu.timer = setTimeout(function(){
    		autoShowMenu.inPopupFlg = false;
    		autoShowMenu.OpenedPopup.hidePopup();
    		document.getElementById("tipBox").style.visibility="visible"},300);
    },
    
    showPopup: function(){
		var targetTagname = autoShowMenu.nowTarget.tagName.toLowerCase();
		var popup;
		if(targetTagname == "a"){
			popup = document.getElementById("http://home.netscape.com/NC-rdf#popup_a");
		}
		else if(targetTagname == "img"){
			popup = document.getElementById("http://home.netscape.com/NC-rdf#popup_image");
		}
		else if(targetTagname == "input"){
			popup = document.getElementById("http://home.netscape.com/NC-rdf#popup_input");
		}
		else{
    		//MenuEditCommon.dumpException("targetTagname:"+targetTagname);
		}
		if(popup){
			autoShowMenu.OpenedPopup = popup;
			popup.openPopupAtScreen(autoShowMenu.nowPoint.x,autoShowMenu.nowPoint.y);
		}
    },
    hidePopup: function(element){
    	if(arguments[0].target.tagName == 'menupopup' && autoShowMenu.popupOutFlg){
    		arguments[0].target.hidePopup();
    		autoShowMenu.inPopupFlg=false;
    		autoShowMenu.popupOutFlg = false;
    	}
    },
    
    mousemove: function(event){
    	
    },
    
    fcCheck: function(){
    	var left = parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('left'));
    	var top = parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('top'));
    	var width =  parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('width'));
    	var height =  parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('height'));
    	var h = 0;
    	if(autoShowMenu.nowTarget instanceof Ci.nsIDOMHTMLElement){
    		h = parseInt(window.getComputedStyle(document.getElementById("main-window"), null).getPropertyValue('height')) - parseInt(window.content.document.documentElement.clientHeight);
    	}
    	x = left + width/2;;
    	y = top +height/2 - h;
    	//alert((autoShowMenu.nowPoint.x - x) +":"+ (autoShowMenu.nowPoint.y - y));
    	if(Math.abs((autoShowMenu.nowPoint.x - x) * (autoShowMenu.nowPoint.y - y)) >  autoShowMenu.s){
    		return true;
    	}
    	else{
    		return false;
    	}
    	
    },
    
    interval: function(){
    	if(autoShowMenu.inPopupFlg){
    		return;
    	}
    	if(autoShowMenu.nowPoint.x == autoShowMenu.oldPoint.x && 
    	   autoShowMenu.nowPoint.y == autoShowMenu.oldPoint.y &&
    	   autoShowMenu.mousemoveFlg){
			autoShowMenu.mousemoveFlg = false;
    		autoShowMenu.showtipBox(autoShowMenu.nowPoint.x+20,autoShowMenu.nowPoint.y - 20);
    	}
    		autoShowMenu.oldPoint = autoShowMenu.nowPoint;
    },
    popupCheck: function(){
	    	var x = parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('left'));
	    	var y = parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('top'));
	    	var width =  parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('width'));
	    	var height =  parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('height'));
	    	
	    	if(autoShowMenu.nowPoint.x < x || autoShowMenu.nowPoint.x > x+width ||
	    	   autoShowMenu.nowPoint.y < y || autoShowMenu.nowPoint.y > y+width){
		    	autoShowMenu.OpenedPopup.hidePopup();
	    		autoShowMenu.mousemoveFlg = false;
	    		autoShowMenu.popupOutFlg = false;
	    	}
    },
    showtipBox: function(x, y){
    	//autoShowMenu.tipBox.hidden = "false";
    	autoShowMenu.oldTarget = autoShowMenu.nowTarget;
    	
    	var h = 0;
    	if(autoShowMenu.nowTarget instanceof Ci.nsIDOMHTMLElement){
    		var mainWindowHeight = parseInt(window.getComputedStyle(document.getElementById("main-window"), null).getPropertyValue('height'));
    		var addonBarHeight = parseInt(window.getComputedStyle(document.getElementById("addon-bar"), null).getPropertyValue('height'));
    		var clientHeight = parseInt(window.content.document.documentElement.clientHeight);
    		h = mainWindowHeight - addonBarHeight - clientHeight;
    	}
    	//autoShowMenu.tipBox.hidden = false;
    	var top = parseInt(window.getComputedStyle(autoShowMenu.nowTarget, null).getPropertyValue('top'));
    	autoShowMenu.tipBox.style.left = x+"px";
    	autoShowMenu.tipBox.style.top = (y+h)<top?(top+1):(y+h)+"px";
    },
	doCommand: function(element) {
	    var event = content.document.createEvent('MouseEvents');	
	    event.initMouseEvent('click', false, false,
	         content.document.defaultView, 1, autoShowMenu.nowPoint.x+10, autoShowMenu.nowPoint.y - 10, 
	         autoShowMenu.nowPoint.x+10, autoShowMenu.nowPoint.y, false,
	         false, false, false, 0, null);
	    //alert(autoShowMenu.nowTarget);
	    var id = element.id.split("#")[1];
	    //var e = document.getElementById(id);
	    //e.dispatchEvent(event);
	    var fun = document.getElementById(id).getAttribute("oncommand");
	    if(!fun){
	    	var commandId = document.getElementById(id).getAttribute("command");
	    	fun = document.getElementById(commandId).getAttribute("oncommand");
	    }
	    document.popupNode = autoShowMenu.nowTarget;
		gContextMenu = new nsContextMenu(autoShowMenu.nowTarget, gBrowser);
		eval(fun);
	},
	addMouseoutListener: function(){
		var popups = document.getElementById("automenu_panel").children;
		for(var i = 0; i < popups.length; i++){
			popups[i].addEventListener("mouseout", autoShowMenu.mouseout);
			popups[i].addEventListener("popuphiding", function(){autoShowMenu.inPopupFlg = false});
		}
	},
	mouseout: function(event){
		if(autoShowMenu.i == 0){
    		event.target.hidePopup();
    		autoShowMenu.inPopupFlg=false;
    		autoShowMenu.popupOutFlg = false;
		}
	},
	isIn: function(x,y){
		if(y+autoShowMenu.k1*x+autoShowMenu.b1<=0 && y+autoShowMenu.k2*x+autoShowMenu.b2 >= 0 && x>=0 && y>=0 && (x+y)<100)
			return true;
	},
	set: function(left, right, top, bottom) {
		autoShowMenu.k1 = (top.y-left.y)/(left.x-top.x);
		autoShowMenu.b1 = (top.x*left.y-left.x*top.y)/(left.x-top.x);
		autoShowMenu.k2 = (bottom.y-right.y)/(right.x-bottom.x);
		autoShowMenu.b2 = (bottom.x*right.y-right.x*bottom.y)/(right.x-bottom.x);
	},
	check: function(){
		if(!autoShowMenu.inPopupFlg){
			var x = autoShowMenu.nowPoint.x - autoShowMenu.point.x;
			var y = autoShowMenu.nowPoint.y - autoShowMenu.point.y;
			if(!autoShowMenu.isIn(x,y)){
				autoShowMenu.inTipBoxFlg = false;
			}
		}
	},
}
window.addEventListener("load", function(){
	autoShowMenu.set({x:0,y:10},{x:25,y:5},{x:5,y:25},{x:10,y:0});
	autoShowMenu.point = {x:0,y:0};
	//autoShowMenu.addMouseoutListener();
	autoShowMenu.tipBox = document.getElementById("tipBox");
	autoShowMenu.popups = document.getElementById("popups");
	window.addEventListener("mouseover",autoShowMenu.mouseover);
	window.addEventListener("mousemove",
		function(){
			var x = arguments[0].clientX - autoShowMenu.point.x;
			var y = arguments[0].clientY - autoShowMenu.point.y;
			autoShowMenu.nowPoint.x = arguments[0].clientX;
			autoShowMenu.nowPoint.y = arguments[0].clientY;
			autoShowMenu.mousemoveFlg = true;
			
			
			
			if(!autoShowMenu.inPopupFlg && !autoShowMenu.inTipBoxFlg && !autoShowMenu.isIn(x,-y)){
				autoShowMenu.point.x = autoShowMenu.nowPoint.x;
				autoShowMenu.point.y = autoShowMenu.nowPoint.y;
				autoShowMenu.showtipBox(autoShowMenu.nowPoint.x+5, autoShowMenu.nowPoint.y - 5 -parseInt(window.getComputedStyle(autoShowMenu.tipBox, null).getPropertyValue('height')));
			}
			/*
			if(autoShowMenu.fcCheck()){
				autoShowMenu.showtipBox(autoShowMenu.nowPoint.x+20,autoShowMenu.nowPoint.y - 20);
			}
			*/
			//arguments[0].stopPropagation();
		},true
	);
	
    //setInterval(autoShowMenu.interval, 800);
    setInterval(autoShowMenu.check, 1000);
}, false);
