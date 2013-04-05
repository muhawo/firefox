/* ***** BEGIN LICENSE BLOCK *****
Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this file are subject to the Mozilla Public License Version
1.1 (the "License"); you may not use this file except in compliance with
the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the
License.

The Original Code is accessKey addon code.

The Initial Developer of the Original Code is GL-Lee.

Alternatively, the contents of this file may be used under the terms of
either the GNU General Public License Version 2 or later (the "GPL"), or
the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
in which case the provisions of the GPL or the LGPL are applicable instead
of those above. If you wish to allow use of your version of this file only
under the terms of either the GPL or the LGPL, and not to allow others to
use your version of this file under the terms of the MPL, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the GPL or the LGPL. If you do not delete
the provisions above, a recipient may use your version of this file under
the terms of any one of the MPL, the GPL or the LGPL.

***** END LICENSE BLOCK ***** */
var accessKeyMain={
	init: function(){
		accessKeyMain.num = 0;
		accessKeyMain.key = "";
		accessKeyMain.eleMap = {};
		accessKeyMain.container = {};
		accessKeyMain.ctrlFlg = 0;
		accessKeyMain.ctrlOnly = 0;
		accessKeyMain.focusedElement = null;
		accessKeyMain.xxIndex1 = 0;
		accessKeyMain.xxIndex2 = 0;
		//myListener = null;
	},
	
	linkNodeInit : function() {
		accessKeyMain.linkNode = document.createElement("div");
		var txt = document.createTextNode("");
		accessKeyMain.linkNode.appendChild(txt);
		accessKeyMain.linkNode.setAttribute('style', 'position: absolute !important;');
	},
	
	xx : ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
	
	show : function(element,offsetLeft,offsetTop,zIndex){
		var vleft = offsetLeft;
		var vtop = offsetTop;
		if(element.tagName.toLowerCase() != "script"){
			if(element.tagName.toLowerCase() != "html" && element.tagName.toLowerCase() != "body"){
				var position = element.getBoundingClientRect();
				var vdisplay = window.getComputedStyle(element, null).getPropertyValue('display');
				var vvisibility = window.getComputedStyle(element, null).getPropertyValue('visibility');
				//alert(element+":"+position.top+":"+position.bottom+":"+position.left+":"+position.right);
				if(((position.top+vtop >  window.content.document.documentElement.clientHeight || position.bottom < 0 ||
					position.left+vleft > window.content.document.documentElement.clientWidth ||	position.right < 0) && 
					(window.getComputedStyle(element, null).getPropertyValue('height') != "0px")) ||
					element.style.display == "none" || vdisplay=="none" || vvisibility == "hidden" ||
					(position.top == position.bottom && window.getComputedStyle(element, null).getPropertyValue('overflow') == "hidden")){
					return 101;
				}
				
				if(element.tagName.toLowerCase() == "iframe"){
					element = element.contentDocument.body;
					vleft+=position.left;
					vtop+=position.top;
				}
				
				if((element.tagName.toLowerCase() == "a" &&	(element.lastChild||window.getComputedStyle(element, null).getPropertyValue('background-image')!="none")) ||
				 (element.tagName.toLowerCase() == "input"&&element.type!="hidden") ||
				  element.tagName.toLowerCase() == "button"){
				 	if(!window.getComputedStyle(element, null).getPropertyValue('height')||!window.getComputedStyle(element, null).getPropertyValue('width')){
				 		return;
				 	}
					var parentNode = element.parentNode;
					while(parentNode.getBoundingClientRect){
						var parentPosition = parentNode.getBoundingClientRect();
						if((parentPosition.top != parentPosition.bottom) &&
						   (position.right <= parentPosition.left || position.left >= parentPosition.right || position.top >= parentPosition.bottom || position.bottom <= parentPosition.top) &&
						   window.getComputedStyle(parentNode, null).getPropertyValue('overflow') == "hidden"){
							return;
						}
						parentNode = parentNode.parentNode;
					}
					var endElement = accessKeyMain.getEndElement(element);
					if(!endElement){
						endElement = element;
					}
					var endPosition = endElement.getBoundingClientRect();
					var p = accessKeyMain.linkNode.cloneNode(true);
					var value = accessKeyMain.xx[accessKeyMain.xxIndex2]+accessKeyMain.xx[accessKeyMain.xxIndex1];
					p.childNodes[0].nodeValue=value;
					p.style.zIndex = zIndex;
					var paddingleft = parseInt(window.getComputedStyle(endElement, null).getPropertyValue('padding-left'));
					var paddingtop = parseInt(window.getComputedStyle(endElement, null).getPropertyValue('padding-top'));
					if(isNaN(paddingleft)) paddingleft = 0;
					if(isNaN(paddingtop)) paddingtop = 0;
					
					var valign = window.getComputedStyle(endElement, null).getPropertyValue('text-align');
					var alignPx = 0;//the px number from the left of the element to the text
					var vwidth = parseInt(window.getComputedStyle(endElement, null).getPropertyValue('width'));
					if(!isNaN(vwidth) && valign !="start" && valign !="left"){
						var vfondSize = parseInt(window.getComputedStyle(endElement, null).getPropertyValue('font-size'));
						var x = endElement.lastChild;
						if(x&&x.nodeType == 3){
							var vlen = accessKeyMain.len(x.nodeValue);
							if(valign =="center"){
								alignPx = (vwidth-vlen*vfondSize/2)/2;
							}else{
								alignPx = vwidth-vlen*vfondSize/2;
							}
						}
						alignPx = Math.floor(alignPx);
					}
					var vleft = endPosition.left + accessKeyMain.scrollLeft  +offsetLeft+ paddingleft+alignPx;
					if(vleft<25){
						vleft = 25;
					}
					p.style.right = Math.floor(window.content.document.documentElement.clientWidth - vleft) +'px';
					p.style.top = Math.floor(endPosition.top + offsetTop + paddingtop + accessKeyMain.scrollTop) + 'px';
					accessKeyMain.container.appendChild(p);
					accessKeyMain.eleMap[value]=element;
					
					if(accessKeyMain.xxIndex1 < 25){
						accessKeyMain.xxIndex1++;
					}else{
						accessKeyMain.xxIndex1 = 1;
						accessKeyMain.xxIndex2++;
					}
					accessKeyMain.num++;
					return;
				}
			}
			var children = element.children;
			var vzIndex = window.getComputedStyle(element, null).getPropertyValue('z-index');
			if(vzIndex == "auto" || parseInt(vzIndex) < parseInt(zIndex)){
				vzIndex = zIndex;
			}
			var len = children.length;
			for(var i = 0;i < len;i++){
				accessKeyMain.show(children[i],vleft,vtop,vzIndex);
			}
		}
	},
	
	getEndElement:function(element){
		var children = element.children;
		var vlen1 = children.length;
		var childNodes = element.childNodes;
		var vlen2 = childNodes.length;
		for(var i = 0; i < vlen2; i++){
			if(childNodes[i].nodeType == 3){
				return element;
			}
			if(childNodes[i].nodeType == 1){
				var temp = accessKeyMain.getEndElement(childNodes[i]);
				if(temp){
					return temp;
				}
			}
			
		}		
	},

	keydown : function () {
		var key = arguments[0].keyCode || arguments[0].which;
		if(key == 17){
				accessKeyMain.ctrlHold = 1;
				accessKeyMain.ctrlOnly = 1;
		}else{
			accessKeyMain.ctrlOnly = 0;
		}
		if(accessKeyMain.ctrlFlg && key >= 65 && key <= 90 ){
            arguments[0].stopPropagation();
            arguments[0].preventDefault();
        }
	},
	
	keypress : function () {
		if(accessKeyMain.ctrlFlg == 1){
			var key = arguments[0].keyCode || arguments[0].which;
			if(key >= 97 && key <= 122){
				key-=32;
			}
			if(key >= 65 && key <= 90){
				accessKeyMain.key+=String.fromCharCode(key);
				if(accessKeyMain.key.length == 2){
					var target = accessKeyMain.eleMap[accessKeyMain.key];
					if(target){
						if(target.tagName.toLowerCase() == "a" ){
							if(accessKeyMain.ctrlHold){
								var href = accessKeyMain.getLinkURL(target);
							    var doc = target.ownerDocument;
							    urlSecurityCheck(href, doc.nodePrincipal);
							    openLinkIn(href, "tab",
							               { charset: doc.characterSet,
							                 referrerURI: doc.documentURIObject });
							}else{
								target.click();
							}
						}else if(target.tagName.toLowerCase() == "input" ){
							if(target.type == "text"|| target.type == "password" || target.type == "tel"){
								target.focus();
							}else{
								target.click();
							}
						}else{
							target.click();
						}
						accessKeyMain.container&&accessKeyMain.container.parentNode.removeChild(accessKeyMain.container);
						accessKeyMain.init();
					}else{
						accessKeyMain.key='';
					}
				}
			}else if(key == 27){
				accessKeyMain.key='';
			}
		}
		if(accessKeyMain.ctrlFlg && key >= 65 && key <= 90){
            arguments[0].stopPropagation();
            arguments[0].preventDefault();
        }
	},
	
	keyup : function () {
		var key = arguments[0].keyCode || arguments[0].which;
		if(accessKeyMain.ctrlOnly == 1 && key == 17){
			if (accessKeyMain.ctrlFlg == 0){
				accessKeyMain.container = document.createElement("div");
				accessKeyMain.container.setAttribute('style', 'position: absolute !important;left:0px;top:0px !important;height:100%;width:100%;');

				accessKeyMain.scrollTop = window.content.document.documentElement.scrollTop;
				accessKeyMain.scrollLeft = window.content.document.documentElement.scrollLeft;
				
				accessKeyMain.show(window.content.document.documentElement,0,0,"auto");
				window.content.document.documentElement.appendChild(accessKeyMain.container);
				if(document.commandDispatcher.focusedElement){
					accessKeyMain.focusedElement = document.commandDispatcher.focusedElement;
					accessKeyMain.focusedElement.blur();
				}
				accessKeyMain.ctrlFlg = 1;
			} else{
				accessKeyMain.container&&accessKeyMain.container.parentNode.removeChild(accessKeyMain.container);
				accessKeyMain.focusedElement && accessKeyMain.focusedElement.focus();
				accessKeyMain.init();
			}
		}
		if(key == 17){
			accessKeyMain.ctrlHold = 0;
		}
		if(accessKeyMain.ctrlFlg && key >= 65 && key <= 90){
            arguments[0].stopPropagation();
            arguments[0].preventDefault();
        }
	},
		
	len : function(s) { 
		var l = 0; 
		var a = s.split(""); 
		for (var i=0;i<a.length;i++) { 
			if (a[i].charCodeAt(0)<299) { 
				l++; 
			} else { 
				l+=2; 
			} 
		} 
		return l; 
	},
	
	disable : function(){
		if(accessKeyMain.state){
			accessKeyMain.container&&accessKeyMain.container.parentNode&&accessKeyMain.container.parentNode.removeChild(accessKeyMain.container);
			accessKeyMain.init();
			document.getElementById("accessKeyToggleDenD").setAttribute("AKstate","false");
			accessKeyMain.state = false;
			accessKeyMain.removeListener();
		}
		else{
			accessKeyMain.init();
			if(!accessKeyMain.linkNode){
				accessKeyMain.linkNodeInit();
			}
			document.getElementById("accessKeyToggleDenD").setAttribute("AKstate","true");
			accessKeyMain.state = true;
			accessKeyMain.addListener();
		}
	},
	
	openSettings: function()
	{
		window.open("chrome://accessKey/content/settings.xul", "", "chrome,titlebar,toolbar,centerscreen", this);
	},
	
	PrefListener:function(branch_name, callback){
		// Keeping a reference to the observed preference branch or it will get
		// garbage collected.
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
		this._branch = prefService.getBranch(branch_name);
		this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this._callback = callback;
	},
	
	perfObsever:function(branch, name) {
	 	var setValue = branch.getCharPref(name);
		switch (name) {
			case "textFont":
				accessKeyMain.linkNode.style.fontFamily=setValue;
				break;
			case "textSize":
				accessKeyMain.linkNode.style.fontSize=setValue;
				break;
			case "textColor":
				accessKeyMain.linkNode.style.color=setValue;
				break;
			case "borderStyle":
				accessKeyMain.linkNode.style.borderStyle=setValue;
				break;
			case "borderWidth":
				accessKeyMain.linkNode.style.borderWidth=setValue;
				break;
			case "borderColor":
				accessKeyMain.linkNode.style.borderColor=setValue;
				break;
			case "backgroundColor":
				accessKeyMain.linkNode.style.backgroundColor=setValue;
				break;
			case "backgroundOpacity":
				accessKeyMain.linkNode.style.opacity=setValue;
				break;
		}
	},
	
	PrivateQuitObserver : function (){
		this._os  = null;
		
		this.init = function() {
			this._os = Components.classes["@mozilla.org/observer-service;1"]
			                 .getService(Components.interfaces.nsIObserverService);
			this._os.addObserver(this, "quit-application", false);
		}
		
		 this.observe = function(aSubject, aTopic, aData) {
			if(aTopic == "quit-application") {
				//var state = document.getElementById("accessKeyToggleDenD").getAttribute("AKstate");
				if(accessKeyMain.state){
					Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.accessKey.").setBoolPref("AKstate", true)
					accessKeyMain.init();
					accessKeyMain.removeListener();
				}
				Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.accessKey.").setBoolPref("AKstate", accessKeyMain.state)
				this._os.removeObserver(this, "quit-application");
				if(accessKeyMain.myListener){
					accessKeyMain.myListener.unregister();
				}
			}
		}
	},
 
	addListener : function(){
		window.addEventListener("keydown", accessKeyMain.keydown, true);
		window.addEventListener("keypress", accessKeyMain.keypress, true);
		window.addEventListener("keyup", accessKeyMain.keyup, true);
		gBrowser.addEventListener("load", function(){accessKeyMain.container&&accessKeyMain.container.parentNode&&accessKeyMain.container.parentNode.removeChild(accessKeyMain.container);accessKeyMain.init();}, true);
		gBrowser.tabContainer.addEventListener("TabSelect", accessKeyMain.annoHander = function(){accessKeyMain.container.parentNode.removeChild(accessKeyMain.container); accessKeyMain.init();}, false);
		accessKeyMain.myListener = new accessKeyMain.PrefListener("extensions.accessKey.display.",accessKeyMain.perfObsever);
		accessKeyMain.myListener.register(true);
	},
	
	removeListener : function(){
		window.removeEventListener("keydown", accessKeyMain.keydown, true);
		window.removeEventListener("keypress", accessKeyMain.keypress, true);
		window.removeEventListener("keyup", accessKeyMain.keyup, true);
		gBrowser.removeEventListener("load", accessKeyMain.init, true);
		gBrowser.tabContainer.removeEventListener("TabSelect", accessKeyMain.annoHander, false);
		accessKeyMain.myListener = new accessKeyMain.PrefListener("extensions.accessKey.display.",accessKeyMain.perfObsever);
	},
	getLinkURL: function(target) {
		var href = target.href;  
		if (href)
			return href;
		
		href = target.getAttributeNS("http://www.w3.org/1999/xlink",
		                                "href");
		
		if (!href || !href.match(/\S/)) {
		  // Without this we try to save as the current doc,
		  // for example, HTML case also throws if empty
		  throw "Empty href";
		}
		
		return makeURLAbsolute(target.baseURI, href);
	},

};

 
accessKeyMain.PrefListener.prototype = {
	observe : function(subject, topic, data) {
		if (topic == 'nsPref:changed')
			this._callback(this._branch, data);
	},
 
	/**
	 * @param {boolean=} trigger if true triggers the registered function
	 *	 on registration, that is, when this method is called.
	 */
	register : function(trigger) {
		this._branch.addObserver('', this, false);
		if (trigger) {
			let that = this;
			this._branch.getChildList('', {}).
				forEach(function (pref_leaf_name)
					{that._callback(that._branch, pref_leaf_name); });
		}
	},
 
	unregister : function() {
		if (this._branch)
			this._branch.removeObserver('', this);
	},
};
accessKeyMain.state = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.accessKey.").getBoolPref("AKstate");
var PrivateQuitObserver = new accessKeyMain.PrivateQuitObserver();
PrivateQuitObserver.init();
if(accessKeyMain.state){
	window.addEventListener("load", function () {
		accessKeyMain.linkNodeInit();
		accessKeyMain.init();
		document.getElementById("accessKeyToggleDenD") && document.getElementById("accessKeyToggleDenD").setAttribute("AKstate","true");
		accessKeyMain.addListener();
	}, false);
}else{
	window.addEventListener("load", function () {
		document.getElementById("accessKeyToggleDenD") && document.getElementById("accessKeyToggleDenD").setAttribute("AKstate","false");
	}, false);
}

