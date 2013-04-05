
const kRowMax = 4;


var menuPanelAbout = {
	rowSlot: 0,
	onLoad: function()
	{
	  /*
	  if ("arguments" in window && window.arguments[0]) {
	    InitWithToolbox(window.arguments[0]);
	    repositionDialog(window);
	  }
	  else 
	  */
	  //window.frameElement.toolbox = gNavToolbox;
	  gNavToolbox = gNavToolbox;
	  var currentset = document.getElementById("GL_panel").getAttribute("currentset");
	  if(!currentset || currentset == ""){
	  	return;
	  }
	  var itemIds = currentset.split(",");
	  this.addItems(itemIds);
	},
	registerSheet: function(style){
		var oSSS = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
		var oIOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
	    var oURI = oIOService.newURI("data:text/css," + style, null, null);
	    try
	    {
	       if(oSSS.sheetRegistered(oURI, oSSS.AGENT_SHEET)){
	       	 oSSS.unregisterSheet(oURI, oSSS.AGENT_SHEET);
	       }
	       else{
	       	 oSSS.loadAndRegisterSheet(oURI, oSSS.AGENT_SHEET);
	   	   }
	        
	    } catch (e) {alert("e");}
	},
	
	addItems: function(itemIds){
		var item = null;
		var toolbarItemIds = this.getToolbarItemIds();
		var paletteItems = this.getPaletteItems();
		var row = null;
		var vboxShowed = document.getElementById("palette-box-showed");
		var vboxHidden = document.getElementById("palette-box-hidden");
		this.rowSlot = 0;
		var row = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "hbox");
		vboxShowed.appendChild(row);
		for(var i = 0, length = itemIds.length; i < length; i++){
			item = this.getItemFromToolbar(itemIds[i], toolbarItemIds);
			if(!item){
				item = this.getItemFromPalette(itemIds[i], paletteItems);
			}
			if(item){
				this.addItem(vboxShowed, item);
			}
			else{
				this.removeIdFromCurrentset(itemIds[i]);
			}
		}
		
		this.rowSlot = 0;
		row = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "hbox");
		vboxHidden.appendChild(row);
		for(var id in toolbarItemIds){
			var srcItem = document.getElementById(id);
			//var item = srcItem.cloneNode(true);
			var item = document.importNode(srcItem, true);
			item.removeAttribute("hidden");
			this.setItem(item, srcItem);
			this.addItem(vboxHidden, item);
	        var wrapper = this.wrapToolbarItem(item);
	        this.cleanUpItemForPalette(item, wrapper);
	        wrapper.addEventListener("dblclick", menuPanelAbout.onDblclick);
		}
		for(var srcItemId in paletteItems){
			var srcItem = paletteItems[srcItemId];
			//var item = srcItem.cloneNode(true);
			var item = document.importNode(srcItem, true);
			item.removeAttribute("hidden");
			this.setItem(item, srcItem);
			this.addItem(vboxHidden, item);
	        var wrapper = this.wrapToolbarItem(item);
	        this.cleanUpItemForPalette(item, wrapper);
	        wrapper.addEventListener("dblclick", menuPanelAbout.onDblclick);
		}
	},
	
	addItem: function(parentNode, item){
		var lastRow = parentNode.lastChild;
		
		if(!lastRow || lastRow.children.length == kRowMax){
			lastRow = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "hbox");
			parentNode.appendChild(lastRow);
		}
  		item.removeAttribute("hidden");
  		lastRow.appendChild(item);
  		/*
		if(this.rowSlot == 0){
			var row = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "hbox");
			parentNode.appendChild(row);
		}
		parentNode.lastChild.appendChild(item);
		if(this.rowSlot < kRowMax){
			this.rowSlot++;
		}
		else{
			this.rowSlot = 0;
		}
		*/
	},
	
	setItem: function(item, srcItem){
		if(item.id){
			item.id = "GL_"+item.id;
			var imageStyle = "";
			var listImage = window.getComputedStyle(srcItem, null).getPropertyValue('list-style-image');
			if(listImage  && listImage!="none" && listImage!='url("chrome://browser/skin/Toolbar.png")'){
				item.className = item.className.replace("toolbarbutton-1", "");
		        imageStyle += "%23"+item.id+" {list-style-image:"+listImage+"};";
		        this.registerSheet(imageStyle);
			}

			var rect = window.getComputedStyle(srcItem, null).getPropertyValue('-moz-image-region');
			var rectStyle = "";
			if(rect){
		        rectStyle += "%23"+item.id+" {-moz-image-region:"+rect+"};";
		        this.registerSheet(rectStyle);
			}
			var itemChildren = item.children;
			var srcItemChildren = srcItem.children;
			for(var i = 0, length = itemChildren.length; i < length; i++){
				this.setItem(itemChildren[i], srcItemChildren[i]);
			}
		}
	},
	getItemFromToolbar :function(itemId, itemIds){
		var item = null;
		if(!itemId || itemId.replace(/(^\s*)/g,"") == "" || !itemIds){
			return null;
		}
		for(var id in itemIds){
			if(itemId == id){
				var srcItem = document.getElementById(id);
				//item = srcItem.cloneNode(true);
				item = document.importNode(srcItem, true);
				this.setItem(item, srcItem);
				delete(itemIds[itemId]);
				break;
			}
		}
		return item;
	},
	
	getItemFromPalette :function(itemId, items){
	  var item = null;
	  if(!itemId || itemId.replace(/(^\s*)/g,"") == ""){
		return null;
	  }
	  var paletteItem = gNavToolbox.palette.firstChild;
	  while (paletteItem) {
	    // Check if the item is already in a toolbar before adding it to the palette.
	    if(itemId == paletteItem.id){
	      //item = paletteItem.cloneNode(true);;
		  item = document.importNode(paletteItem, true);
		  this.setItem(item, paletteItem);
		  delete(items[itemId]);
	      break;
	    }
	    paletteItem = paletteItem.nextSibling;
	  }
	  return item;
	},
	getPaletteItems :function()
	{
	  var paletteItems = {};
	  var paletteItem = gNavToolbox.palette.firstChild;
	  while (paletteItem) {
	  	paletteItems[paletteItem.id] = paletteItem;
	    paletteItem = paletteItem.nextSibling;
	  }
	  return paletteItems;
	},
	
	getToolbarItemIds :function()
	{
	  var toolbarItemIds = {};
	  this.forEachToolbar(function (toolbar) {
	    var child = toolbar.firstChild;
	    while (child) {
	      if (menuPanelAbout.isToolbarItem(child))
	        toolbarItemIds[child.id] = 1;
	      child = child.nextSibling;
	    }
	  });
	  return toolbarItemIds;
	},
	
	forEachToolbar :function(callback) {
	  Array.filter(gNavToolbox.childNodes, this.isToolbar).forEach(callback);
	  Array.filter(gNavToolbox.externalToolbars, this.isToolbar).forEach(callback);
	},
	isToolbar: function(aElt)
	{
	  return aElt.localName == "toolbar" &&
	  		 aElt.id != "toolbar-menubar" &&
         	 aElt.getAttribute("customizable") == "true";
	},

	isToolbarItem :function(aElt)
	{
	  return (!aElt.hidden || aElt.hidden == "false") &&
	  		 (aElt.localName == "toolbarbutton" ||
	          aElt.localName == "toolbaritem");
	},
	
	
	
	removeIdFromCurrentset :function(itemId){
		
	},
	
	cleanupItemForToolbar: function(aItem, aWrapper){
	  this.setWrapperType(aItem, aWrapper);
	  aWrapper.setAttribute("place", "toolbar");
	
	  if (aItem.hasAttribute("command")) {
	    aWrapper.setAttribute("itemcommand", aItem.getAttribute("command"));
	    aItem.removeAttribute("command");
	  }
	
	  if (aItem.checked) {
	    aWrapper.setAttribute("itemchecked", "true");
	    aItem.checked = false;
	  }
	
	  if (aItem.disabled) {
	    aWrapper.setAttribute("itemdisabled", "true");
	    aItem.disabled = false;
	  }
	},
	
	setWrapperType: function(aItem, aWrapper)
	{
	  if (aItem.localName == "toolbarseparator") {
	    aWrapper.setAttribute("type", "separator");
	  } else if (aItem.localName == "toolbarspring") {
	    aWrapper.setAttribute("type", "spring");
	  } else if (aItem.localName == "toolbarspacer") {
	    aWrapper.setAttribute("type", "spacer");
	  } else if (aItem.localName == "toolbaritem" && aItem.firstChild) {
	    aWrapper.setAttribute("type", aItem.firstChild.localName);
	  }
	},
	wrapToolbarItem: function(aToolbarItem)
	{
	  var wrapper = this.createWrapper(aToolbarItem.id, document);
	
	  wrapper.flex = aToolbarItem.flex;
	
	  aToolbarItem.parentNode.replaceChild(wrapper, aToolbarItem);
	
	  wrapper.appendChild(aToolbarItem);
	
	  return wrapper;
	},
	
	createWrapper: function(aId, aDocument)
	{
	  var wrapper = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
	                                         "toolbarpaletteitem");
	
	  wrapper.id = "wrapper-"+aId;
	  return wrapper;
	},

	unwrapshowedItem: function(aItem, aWrapper)
	{
	    this.restoreItemForToolbar(aItem, aWrapper);
	    aWrapper.parentNode.replaceChild(aItem, aWrapper);
	},
	
	cleanUpItemForPalette: function(aItem, aWrapper)
	{
	  aWrapper.setAttribute("place", "palette");
	  this.setWrapperType(aItem, aWrapper);
	
	  if (aItem.hasAttribute("title"))
	    aWrapper.setAttribute("title", aItem.getAttribute("title"));
	  else if (aItem.hasAttribute("label"))
	    aWrapper.setAttribute("title", aItem.getAttribute("label"));
	    /*
	  else if (isSpecialItem(aItem)) {
	    var stringBundle = document.getElementById("stringBundle");
	    // Remove the common "toolbar" prefix to generate the string name.
	    var title = stringBundle.getString(aItem.localName.slice(7) + "Title");
	    aWrapper.setAttribute("title", title);
	  }
	  */
	
	  // Remove attributes that screw up our appearance.
	  aItem.removeAttribute("command");
	  aItem.removeAttribute("observes");
	  aItem.removeAttribute("type");
	  aItem.removeAttribute("width");
	
	  Array.forEach(aWrapper.querySelectorAll("[disabled]"), function(aNode) {
	    aNode.removeAttribute("disabled");
	  });
	},

	/**
	 * Restore all the properties that we stripped off above.
	 */
	restoreItemForToolbar: function(aItem, aWrapper)
	{
	  if (aWrapper.hasAttribute("itemdisabled"))
	    aItem.disabled = true;
	
	  if (aWrapper.hasAttribute("itemchecked"))
	    aItem.checked = true;
	
	  if (aWrapper.hasAttribute("itemcommand")) {
	    var commandID = aWrapper.getAttribute("itemcommand");
	    aItem.setAttribute("command", commandID);
	
	    //XXX Bug 309953 - toolbarbuttons aren't in sync with their commands after customizing
	    var command = document.getElementById(commandID);
	    if (command && command.hasAttribute("disabled"))
	      aItem.setAttribute("disabled", command.getAttribute("disabled"));
	  }
	},
	
	set: function(){
		var paletteBoxBelow = document.getElementById("palette-box-below");
		var showedHboxs = document.getElementById("palette-box-showed").children;
		var hiddendHboxs = document.getElementById("palette-box-hidden").children;
		if(paletteBoxBelow.hidden){
			for(var i = 0, length = showedHboxs.length; i < length; i++){
				var showedItems = showedHboxs[i].children;
				for(var j = 0, len = showedItems.length; j < len; j++){
			        var wrapper = this.wrapToolbarItem(showedItems[j]);
			        this.cleanUpItemForPalette(showedItems[j], wrapper);
			        wrapper.addEventListener("dblclick", menuPanelAbout.onDblclick);
		    	}
			}
		}
		else{
			for(var i = 0, length = showedHboxs.length; i < length; i++){
				var showedItems = showedHboxs[i].children;
				for(var j = 0, len = showedItems.length; j < len; j++){
		        	this.unwrapshowedItem(showedItems[j].firstChild, showedItems[j]);
		    	}
			}
		}
        //var cursorStyle = "toolbarpaletteitem {cursor:default};";
        //this.registerSheet(cursorStyle);
        /*
		for(var i = 0, length = hiddendItems.length; i < length; i++){
	        var wrapper = this.wrapToolbarItem(hiddendItems[i]);
	        this.cleanUpItemForPalette(hiddendItems[i], wrapper);
		}
		*/
		paletteBoxBelow.hidden = !paletteBoxBelow.hidden;
	},
	
	onDblclick: function(event){
		menuPanelAbout.removeItem(event.currentTarget);
	},
	
	removeItem: function(item){
		var fromBox = item.parentNode.parentNode;
		if(fromBox.id == "palette-box-showed"){
			toBox = document.getElementById("palette-box-hidden");
		}
		else{
			toBox = document.getElementById("palette-box-showed");
		}
		
	    var currentRow = item.parentNode;
 		menuPanelAbout.addItem(toBox, item);
	
	    while (currentRow) {
	      // Pull the first child of the next row up
	      // into this row.
	      var nextRow = currentRow.nextSibling;
	
	      if (!nextRow) {
	        var last = currentRow.lastChild;
	        if (!last) {
	          currentRow.parentNode.removeChild(currentRow);
	          break;
	        }
	        break;
	      }
	      
	
	      currentRow.appendChild(nextRow.firstChild);
	      currentRow = currentRow.nextSibling;
	    }
	 
	},
	
	updateToolbarMode: function(aModeValue) {
	  document.getElementById("palette-box-showed").setAttribute("mode", aModeValue);
	  document.getElementById("palette-box-hidden").setAttribute("mode", aModeValue);
	
	  //var iconSizeCheckbox = document.getElementById("smallicons");
	  //iconSizeCheckbox.disabled = aModeValue == "text";
	
	  //return mode;
	},
	
	updateIconSize: function(aSize) {
	  document.getElementById("palette-box-showed").setAttribute("iconsize", aSize);
	  document.getElementById("palette-box-hidden").setAttribute("iconsize", aSize);
    },
    
	restoreDefaultSet: function(){
	  var currentset = "history-button,bookmarks-menu-button-container,home-button,downloads-button";
	  var itemIds = currentset.split(",");
	  var boxShowed = document.getElementById("palette-box-showed");
	  var boxHidden = document.getElementById("palette-box-hidden");
	  
	  	while(boxShowed.lastChild && boxShowed.lastChild.lastChild){
	  		this.removeItem(boxShowed.lastChild.lastChild);
	  	}
	      	
	  for(var i = 0, len = itemIds.length; i < len; i++){
	  	this.addItem(boxShowed, document.getElementById("wrapper-"+"GL_"+itemIds[i]));
	  }
	  document.getElementById("GL_panel").setAttribute("currentset", currentset);
	  document.persist("GL_panel", "currentset");
	},

    saveCurrentset: function(){
    	var rows = document.getElementById("palette-box-showed").children;
    	var currentset = "";
    	for(var i = 0, len1 = rows.length; i < len1; i++){
    		var items = rows[i].children;
    		for(var j = 0, len2 = items.length; j < len2; j++){
    			currentset+= items[j].id.substr(11);
    			currentset+=",";
    		}
    	}
    	currentset = currentset.substr(0, currentset.length-1);
	    document.getElementById("GL_panel").setAttribute("currentset", currentset);
	    document.persist("GL_panel", "currentset");
    },
    
    onClose: function(){
    	this.saveCurrentset();
    },

}