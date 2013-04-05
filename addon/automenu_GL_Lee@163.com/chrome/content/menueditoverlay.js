/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Menu Editor.
 *
 * The Initial Developer of the Original Code is
 * Devon Jensen.
 *
 * Portions created by the Initial Developer are Copyright (C) 2003
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *    Devon Jensen <velcrospud@hotmail.com>
 *    Nickolay Ponomarev <asqueella@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


/*
There are two menupopup elements for each menu: X and EM_X where X is the
menu[popup]'s ID.
 - X is the original menu, and it will contain modified (per automenu_GL.rdf) version.
 - EM_X contains all menu items that user have chosen to be hidden. Each
   menuitem exists either in X or in EM_X.
Also for each edited menu, there is an array, MenuEdit.backups[menuId], that
consists of ids of menuitems that were in the menu originally, in their initial
order. It is used to implement the Reset feature and to show the original menu
when requested.

Four functions that do the real job are:
 - moveToTemp() moves all items from the original menu X to EM_X menu for
   further processing.
        xxx Looks like this loses event handlers registered 
            on the items and their subelements.
 - populateMenu() moves the items that user selected to be visible back from
   EM_X to X, removing "bad" (i.e. non-existent in document) items from the
   datasource.
 - discoverNew() adds items that are not yet in the datasource to it.
   It is invoked after moveToTemp() and populateMenu(), to minimize the number
   of items to check.
 - onAfterPopupShown() is invoked each time a popup is shown to hide consecutive
   separators.

The rest are quite short:
 - getBackup() returns the backup array as described above, creating one if
   it doesn't already exist. (Note that getBackup is guaranteed to be called
   before any modifications to the menu are made)
 - editMenu(menuid) processes a single menu through calls to getBackup,
   moveToTemp, populateMenu and discoverNew.
 - init() loads automenu_GL.rdf and calls editMenu for each menu listed there.
 - openOptions() is just a helper which opens Menu Editor Options dialog
*/

// xxx rewrite mailContextMenus.js#ShowSeparator (and others?) -- to avoid
// breakage because of our separators machinations

var MenuEdit = {
  customizeMenu: {},
  // Holds the original contents of menus. backups[menuID] is array of
  // ids that were in that menu before any modifications were made.
  backups: {},

  // editedMenus[menuID] is array of ids in the edited menu right after
  // populateMenu. Used in afterpopupshown listener to check for dynamic
  // modifications from other extensions.
  editedMenus: {},
  
  tipPanel: {},


  editedAttrName: "automenu_GL-edited", // this is put on menupopups that were edited by ME
  XUL_NS: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",

  loaded: false,
  tipInit: function(){
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		                    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.automenu_GL.tip.");
		
		// prefs is an nsIPrefBranch.
		// Look in the above section for examples of getting one.
		var path = prefs.getCharPref("image", path); // set a pref (accessibility.typeaheadfind)
		document.getElementById("tipImage").src=path;
  },
  initPanel_Gl: function(){
       /* var oSSS = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
        var oIOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var sStyle = "";
        */


  	var ProfD = MenuEditCommon.getService("file/directory_service;1",
      "nsIProperties").get("ProfD", Components.interfaces.nsILocalFile);
    ProfD.append("localstore.rdf");
    var ios = MenuEditCommon.getService("network/io-service;1", "nsIIOService");
    var uri = ios.newFileURI(ProfD).spec;
    var datasource = MenuEditCommon.getService("rdf/rdf-service;1", "nsIRDFService").GetDataSourceBlocking(uri);
    var panel_GLResource = MenuEditCommon.getService("rdf/rdf-service;1", "nsIRDFService").GetResource("chrome://browser/content/browser.xul#panel_GL");
    var arc = MenuEditCommon.getService("rdf/rdf-service;1", "nsIRDFService").GetResource("currentset");
    var currentSet = datasource.GetTarget(panel_GLResource, arc, true);
    if(!currentSet){
    	toolIds = ["home-button","share-all-cn-button-box-new","moz_cn_feedback","share-all-cn-bar"];
    }
    else{
        var toolIds = currentSet.QueryInterface(Components.interfaces["nsIRDFResource"]).split(",");
    }
    var panel_Gl = document.getElementById("toolPanel_GL");
    var vbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "vbox");
    var currentRow = null;
    var currentItem = null;
    for(var i = 0, length = toolIds.length; i < length;){
    	if(i%3 == 0){
        	currentRow = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "hbox");
    		vbox.appendChild(currentRow);
    	}
    	var tool = document.getElementById(toolIds[i]);
    	if(tool){
	    	currentItem = document.importNode(tool);
	    	currentItem.id = "GL_"+currentItem.id;
	    	/*
	    	var image_region = window.getComputedStyle(tool, null).getPropertyValue('-moz-image-region');
	    	if(image_region){
		        sStyle += "%23"+currentItem.id+" {-moz-image-region:"+image_region+"};"
	    	}
	    	*/
	    	currentRow.appendChild(currentItem);
    	}
    	i++;
    }
    panel_Gl.appendChild(vbox);
    
    /*var oURI = oIOService.newURI("data:text/css," + sStyle, null, null);
    try
    {
        if(oSSS.sheetRegistered(oURI, oSSS.USER_SHEET)) oSSS.unregisterSheet(oURI, oSSS.AGENT_SHEET);
       // if(!oSSS.sheetRegistered(oURI, oSSS.USER_SHEET)) oSSS.loadAndRegisterSheet(oURI, oSSS.USER_SHEET);
        
    } catch (e) {alert("e");}
    */
  },
  initPalette: function(){
	  var palette = document.getElementById("palette-box_GL-Lee");
  	  var currentset = document.getElementById("palette-box_GL-Lee").getAttribute("currentset");
  	  if(!currentset || currentset == ""){
  	  	return;
  	  }
  	  var itemIds = currentset.split(",");
  	  for(var i = 0 , length = itemIds.length; i < length; i++){
  	  	MenuEdit.customizeMenu[itemIds[i]]=1;
  	  }
  	  
	  var templateNode = gNavToolbox.palette.firstChild;
	  var tmp = null;
	  while (templateNode) {
	    // Check if the item is already in a toolbar before adding it to the palette.
	    if (templateNode.id in MenuEdit.customizeMenu) {
	      var paletteItem = document.importNode(templateNode, true);
	
	        // Append the old row.
	        palette.appendChild(paletteItem);
	        tmp = templateNode.nextSibling;
	        gNavToolbox.palette.removeChild(templateNode);
	        //gNavToolbox.palette.
	    }
	    if(tmp){
	    	templateNode = tmp;
	    	tmp = null;
	    }else{
	    	templateNode = templateNode.nextSibling;
		}
	  }
  },
  init: function() {
    if(this.loaded) return;
    //MenuEdit.initPanel_Gl();
    MenuEditRDF.init();
    this.popupInit();
    
    this.tipInit();
    this.initPalette();
    
    /*var image = content.document.createElement("image");
    image.src = "chrome://automenu_GL/content/enabled.png";
    MenuEdit.tipBox = document.createElement("box");
    MenuEdit.tipBox.style.display = "none";
    MenuEdit.tipBox.appendChild(image);
    content.document.getElementsByTagName("body")[0].appendChild(MenuEdit.tipBox);*/
    this.tipPanel = document.getElementById("tipPanel");
    
    this.loaded = true;
    this.backups={a:document.getElementById("contentAreaContextMenu").children};


    //toJavaScriptConsole();
    //MenuEdit.openOptions();
    
	// Show "About Menuedit" on first time this version is used
	var showAbout = false;
	var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	try {
		var oldVersion = pref.getCharPref("extensions.automenu_GL.currVersion");
	} catch (e) {
		var oldVersion = "none";
	}
	
	var currVersion = "notFound";
	try {  // Firefox <= 3.6
		var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
		currVersion = gExtensionManager.getItemForID("{EDA7B1D7-F793-4e03-B074-E6F303317FB0}").version;
	
		if(oldVersion != currVersion && currVersion != "notFound") {
			window.setTimeout(function() {
		    	// Open page in new tab
				var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
		    	var wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
		    
		    	var win = wmed.getMostRecentWindow("navigator:browser");
		    	
		    	var content = win.document.getElementById("content");
		    	content.selectedTab = content.addTab("chrome://automenu_GL/content/aboutMenuedit.xul");	
		    }, 1250);
			
			pref.setCharPref("extensions.automenu_GL.currVersion", currVersion);
		
		}
		
	}
	catch(e) { // Firefox >=4.0

		Components.utils.import("resource://gre/modules/AddonManager.jsm");
	
		AddonManager.getAddonByID("{EDA7B1D7-F793-4e03-B074-E6F303317FB0}", function(addon) {
			currVersion = addon.version;
			
			if(oldVersion != currVersion && currVersion != "notFound") {
				window.setTimeout(function() {
			    	// Open page in new tab
					var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
			    	var wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
			    
			    	var win = wmed.getMostRecentWindow("navigator:browser");
			    	
			    	var content = win.document.getElementById("content");
			    	content.selectedTab = content.addTab("chrome://automenu_GL/content/aboutMenuedit.xul");	
			    }, 1250);
				
				pref.setCharPref("extensions.automenu_GL.currVersion", currVersion);
			
			}
			
		});
	}
	
	
    this.addIDsToMenuPopups();

    var rootCont = MenuEditRDF.getContainer("NC:MenuEditRoot");
    var elements = rootCont.GetElements();
    var popups = {};
    while(elements.hasMoreElements()) {
      try {
        var resource = elements.getNext();
        var id = MenuEditRDF.getResourceId(resource);
        popups[id] = this.el(id);
        if(popups[id]) {
          this.getBackup(popups[id]); // create backups for menus we're going to edit. This also calls addIDs.
        }
        else {
			try {
		        // If there is a menu in our list that no longer exists, i.e. the old renamed automenu_GL-tabContextMenu, remove it from the rdf
		        var root = MenuEditRDF.makeContainer(MenuEditRDF.root);
		        var node = MenuEditRDF.getResourceFromId(id);
		        root.RemoveElement(node, true);
		        MenuEditRDF.flushDatasource(); // Save back to automenu_GL.rdf
	        } catch(e) {}
		}
      } catch(e) {
      	MenuEditCommon.dumpException(e);
      }
    }

    for(id in popups) {
      try { // possible problems with one of menus shouldn't break everything
        var res = MenuEditRDF.menuToRDFResource(id);
        rootCont = MenuEditRDF.getContainer(res);
        var savedNum = rootCont.GetCount();
        if(savedNum > 0 && popups[id]) {
          this.editMenu(popups[id]);
        } else {
          // First run
          // Do nothing, wait for user to customize menus
        }
      } catch(e) {
        MenuEditCommon.dumpException(e);
      }
    }
    
    // Workaround for problems with the Block Image from... and Search Google for... in Fx3
    // See mozdev bug 18931
    
    // If first context menu instance is on an image or with a text selection, the menuitems
    //  for these are blank and/or messed up
    // Triggering the context menu once seems to fix this
    // Seems full context menu isn't initialized on startup - only after first instance
    // Our editing somehow is preventing the normal dynamic labeling of this menuitem
    // Although there are no errors
    
    // This shouldn't show because it hides right away, (or should I hide the menu before
    // doing this and unhide it after?)
    // Fails on Fx2 b/c openPopup is new for Fx3, but don't need this workaround on Fx2
    try {
      this.el("contentAreaContextMenu").openPopup(null, null, 0, 0, true, false);
		  this.el("contentAreaContextMenu").hidePopup(null, null, 0, 0, true, false);
    } catch(e){}
    
  },
  openSettings: function() {
  	window.openDialog("chrome://automenu_GL/content/menueditprefs.xul",null ,null ,document.getElementById("tipImage"));
  },
  popupIds: ['popup_a', 'popup_input', 'popup_image', 'popup_document'],
  
  popupInit: function() {
  	var newPopups = {};
    //var oldPopups = getOldPopups();
    //MenuEditRDF.clearDatasource();

    //MenuEditRDF.flushDatasource();
  	document.getElementById("automenuBox").contextMenu = "contentAreaContextMenu";
  	MenuEdit.i = 0;
    this.intervalId = setInterval(function(){
      if(MenuEdit.i == MenuEdit.popupIds.length){
    		clearInterval(MenuEdit.intervalId);
      }else{
        MenuEditRDF.addMenu(MenuEdit.popupIds[MenuEdit.i], MenuEdit.popupIds[MenuEdit.i]);
  	    var popupElement = document.getElementById("automenuBox_"+MenuEdit.popupIds[MenuEdit.i]);
        var nowPopup = MenuEdit.getNowPopups(popupElement);//array
        MenuEdit.updatePopup(nowPopup, MenuEdit.popupIds[MenuEdit.i]);
      }
      if(MenuEdit.i == MenuEdit.popupIds.length - 1){
	    MenuEditRDF.flushDatasource();
	    var popupsBox = document.getElementById("popupsBox");
	    popupsBox.database.AddDataSource(MenuEditRDF.datasource);
	    popupsBox.builder.rebuild();
      }
      MenuEdit.i++;
    },200);
  },
  
  updatePopup: function(popup, popupId){

    var container = MenuEditRDF.getContainer("http://home.netscape.com/NC-rdf#"+popupId);
    for(var i = 0; i < popup.length; i++){
    	
    	var resource = MenuEditRDF.getResourceFromTypeAndId(popupId, popup[i].id);
    	var visibility = MenuEditRDF.getVisibility(resource);
	    var currCont = MenuEditRDF.getContainerForResource(resource);
	    if(currCont)
	      currCont.RemoveElement(resource, true);
	    container.AppendElement(resource);
	    MenuEditRDF.setItemProps(resource, popup[i].localName, popup[i].label);
	    MenuEditRDF.setVisibility(resource, visibility);
    }
  },
  /*overlay中意老数据生成个popupmenu，为了的到新的menu，数据更新完毕后rebuild一下*/
  getNowPopups: function(popupElement) {
  	var popup = [];
	document.popupNode = popupElement;
    gContextMenu = new nsContextMenu(popupElement, gBrowser);
    
    var evt = popupElement.ownerDocument.createEvent('MouseEvents');
    var RIGHT_CLICK_BUTTON_CODE = 2;

    evt.initMouseEvent('contextmenu', true, true,
         popupElement.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
         false, false, false, RIGHT_CLICK_BUTTON_CODE, null);

    popupElement.dispatchEvent(evt);
    //var wm = MenuEditCommon.getService("appshell/window-mediator;1", "nsIWindowMediator");
    //var wwindow = wm.getMostRecentWindow("");
    var contextMenu = document.getElementById("contentAreaContextMenu");
    var allItems = contextMenu.children;
    for(var i = 0; i < allItems.length; i++){
      if(allItems[i].hidden==true){
      	continue;
      }
      var item = {};
      item.id = allItems[i].id;
      item.label = allItems[i].label;
      item.localName = allItems[i].localName;
      var oldItem = document.getElementById("automenu_"+allItems[i].id);
      //item.hidden = oldItem?oldItem.hidden:null;
      popup.push(item);
    }
    contextMenu.hidePopup();
    return popup;
  },
  getOldPopups: function() {
  	var automenuDiv = document.getElementById("automenuDiv");
  	var popups = automenuDiv.children;
  	
  },
  /*
  getOldPopups: function() {
    var popups = {};
    var rootContainer = MenuEditRDF.getContainer("NC:MenuEditRoot");
    var popupResouces = rootContainer.GetElements();
	while(popupResouces.hasMoreElements()) {
		var popupResource = popupResouces.getNext();
		var popupId = MenuEditRDF.getResourceId(popupResource);
		
	    var popup = [];
	    var container = MenuEditRDF.getContainer("NC:"+popupId);
	    var elements = container.GetElements();
	    while(elements.hasMoreElements()) {
	      var item = {};
	      try {
	        var resource = elements.getNext();
	        item.id = MenuEditRDF.getResourceId(resource);
	        item.visibility = MenuEditRDF.getVisibility(resource);
	        popup.push(item);
	      } catch(e) {
	      	MenuEditCommon.dumpException(e);
	      }
	    }
	    popups[popupId] = popup;
    }
    return popups;
  },
  */
  addNewItems: function(popuName, nowPopup, oldPopup) {
  	
  },

  // add ids for id-less popups we want to edit
  addIDsToMenuPopups: function() {
    // helper: do sanity checks and set id for a given popup.
    function setMenupopupId(aNode, aID) {
      if(aNode && aNode.localName == "menupopup" && !aNode.id && !MenuEdit.el(aID))
        aNode.id = aID;
    }

    if(MenuEditCommon.hostApp == MenuEditCommon.apps.Firefox) {
      // Prior to Firefox 4, the tabContextMenu didn't have an ID
      if(!this.el("tabContextMenu")) {
	    try {  // We are using firefox 3.x, give the tab context menu an ID
	      var tabContext = gBrowser.mStrip.firstChild.nextSibling;
	      tabContext.id = "automenu_GL-tabContextMenu";
	    } catch(e) {
	      MenuEditCommon.dumpException(e);
	    }
	  }
    } else if(MenuEditCommon.hostApp == MenuEditCommon.apps.Thunderbird) {
      // add missing id to Thunderbird's Edit and Go menu popups
      var edit = this.el("menu_Edit");
      if(edit)
        setMenupopupId(edit.firstChild, "menu_EditPopup");

      var go = this.el("goNextMenu");
      if(go)
        setMenupopupId(go.parentNode, "menu_GoPopup");
    }
  },

  // returns backups[aPopup.id], filling it if necessary. Also calls addIDs.
  getBackup: function(aPopupId) {
    var backup = this.backups[aPopupId];
    return backup;
  },
  /*
  getBackup: function(aPopup) {
    var id = aPopup.id;
    var backup = this.backups[id];
    if(!backup) {
      //MenuEdit_addIDs(document, id);
      backup = this.backups[id] = [];
      var items = aPopup.childNodes;
      for(var i=0; i<items.length; i++) {
        var item = items[i];
        if(item.id == "") {
          if(item.getAttribute("class") != "spell-suggestion") {
            MenuEditCommon.dump("Whoops! in getBackup(" + id + 
              ") got an " + "item without id.");
          }
          continue;
        }
        this.backups[id].push(item.id);
      }
    }
    return backup;
  },
  */
  tempInit: function() {
  },

  // a helper function that inserts given popup to the DOM tree
  addPopup: function(aPopup) {
    var popupsParent;
    var host = MenuEditCommon.hostApp;
    switch(host) {
      case MenuEditCommon.apps.Firefox:
        popupsParent = this.el("mainPopupSet");
        break;
      case MenuEditCommon.apps.Thunderbird:
        popupsParent = this.el("messengerWindow");
        break;
      default:
        popupsParent = document.documentElement;
    }
    if(popupsParent)
      popupsParent.appendChild(aPopup);
    else
      MenuEditCommon.dump("addPopup failure");
  },

  // changes the menu according to data in the datasource
  editMenu: function(aPopup) {/*

    // Set visibility of entire menu
    var node = MenuEditRDF.getResourceFromId(aPopup.id);
    aPopup.parentNode.hidden = !MenuEditRDF.getVisibility(node);

    // xxx gohack
    if(aPopup.id == "goPopup") return;
    // xxx bookmarkshack
    if(aPopup.id == "bookmarksMenuPopup") return;
    
    if("__MenuEdit_appendChild_orig" in aPopup) {
      aPopup.appendChild = aPopup.__MenuEdit_appendChild_orig;
      aPopup.insertBefore = aPopup.__MenuEdit_insertBefore_orig;
      aPopup.removeChild = aPopup.__MenuEdit_removeChild_orig;
      delete aPopup.__MenuEdit_appendChild_orig;
      delete aPopup.__MenuEdit_insertBefore_orig;
      delete aPopup.__MenuEdit_removeChild_orig;
    }

    // create the EM_<aPopup.id> menu (for hidden elements)
    if(!this.el("EM_" + aPopup.id)) {
      var EM_menu = document.createElementNS(this.XUL_NS, aPopup.localName);
      EM_menu.id = "EM_" + aPopup.id;
      this.addPopup(EM_menu);
    }

    aPopup.setAttribute(this.editedAttrName, "true");
    this.getBackup(aPopup);    // remember default set of items in the menu
    this.moveToTemp(aPopup);   // temporarily move the items to EM_ popup
    this.populateMenu(aPopup); // move the visible items back
    this.discoverNew(aPopup);  // check if there are any new items that are not yet in the datasource

    aPopup.addEventListener("popupshowing",
      function(e) {
        var p = e.target;
        if(p && p.getAttribute(MenuEdit.editedAttrName) == "true") {
          var node = MenuEditRDF.getResourceFromId(p.id);
          if(!MenuEditRDF.getVisibility(node))
            e.preventDefault();                 // prevent showing "hidden" context menus
          else
          // we register a "popupshown" listener in order to make sure we run
          // *after* "polite" extensions (that is, those that don't do the same
          // thing as we do). We assume "impolite" extensions don't exist ;P
          p.addEventListener("popupshown", MenuEdit.onAfterPopupShown, false);
        } /* xxx This should not be needed anymore now that all visible separators are created by ME.
        else if(this != p) {
          // This is a workaround to deal with extensions (like Autohide) that
          // incorrectly handle popupshowing event for submenus.
          // See http://forums.mozillazine.org/viewtopic.php?p=1316147#1316147
          // for explanation why this was needed.
          this.addEventListener("popupshown", MenuEdit.onAfterPopupShown, false);
        }
        
      }, false);

    if(!("__MenuEdit_appendChild_orig" in aPopup)) {
      // replace DOM-manipulation functions so that no-one messes with our menu
      aPopup.__MenuEdit_appendChild_orig = aPopup.appendChild;
      aPopup.__MenuEdit_insertBefore_orig = aPopup.insertBefore;
      aPopup.__MenuEdit_removeChild_orig = aPopup.removeChild;
      aPopup.appendChild = __MenuEdit_appendChild;
      aPopup.insertBefore = __MenuEdit_appendChild;
      aPopup.removeChild = __MenuEdit_removeChild;
    }*/
  },

  // Move all menu items from menu X over to the temporary menu EM_X
  // (a helper for editMenu)
  moveToTemp: function(aPopup) {
    var EM_menuPopup = this.el("EM_" + aPopup.id);
    for(var item = aPopup.firstChild; item; item = nextItem) {
      try {
        var nextItem = item.nextSibling;
        if(item.id && !MenuEditRDF.checkRDFPrefix(item.id))
          EM_menuPopup.appendChild(item);
      } catch(e) {
        MenuEditCommon.dumpException(e);
      }
    }
  },

  // move the visible items back from the temp menu EM_X to X
  populateMenu: function(aPopup) {
    const CI = Components.interfaces;

    MenuEditRDF.initDatasource(); // for some reason Refresh(true) refuses to work (xxx optimize?)

    var rdfPopupURI = MenuEditRDF.menuToRDFResource(aPopup.id);//xxx
    var rdfPopupCont = MenuEditRDF.getContainer(rdfPopupURI);

    var rdfItems = rdfPopupCont.GetElements();
    var badEntries = [];
    this.editedMenus[aPopup.id] = [];

    // this is needed so that the edited menu items appear before user's bookmarks
    var lastItem = aPopup.id == "menu_BookmarksPopup" ? aPopup.firstChild : null;

    var lastWasSeparator = false; // this is used to avoid creating consecutive separators
    while (rdfItems.hasMoreElements()) { // go through items in RDF
      var rdfItem = rdfItems.getNext().QueryInterface(CI.nsIRDFResource);
      if(!MenuEditRDF.getVisibility(rdfItem)) continue;

      // fullRef is the URI of current item, for example
      // http://home.netscape.com/NC-rdf#ELEMENT_ID
      var fullRef = rdfItem.ValueUTF8;
      var type = MenuEditRDF.getType(rdfItem);
      var domItem;
      try {
        var itemID = fullRef.split("#")[1];
        if(type == MenuEditRDF.type_menuseparator) {
          if(!MenuEditRDF.getCreate(rdfItem)) {
            if(MenuEditRDF.getIgnore(rdfItem)) // remove the ignored item from the container, so 
              throw [itemID + " is ignored"];    // that we don't spend cycles on it next time.

            // migration from pre-200504 versions of Menu Editor: replace all
            // separators with separators, created and managed by ME [custom=create].
            // 1. create a ME-managed menuseparator
            var sep = MenuEditRDF.RDFService.GetAnonymousResource();
            MenuEditRDF.setItemProps(sep, "menuseparator", sep.Value);
            MenuEditRDF.setTarget(sep, MenuEditRDF.arcCustom, MenuEditRDF.createLit);

            // 2. replace current item in the container with created separator
            var index = rdfPopupCont.IndexOf(rdfItem);
            index = MenuEditRDF.contUtils.IndexToOrdinalResource(index);
            MenuEditRDF.setTarget(rdfPopupCont.Resource, index, sep);
            MenuEditRDF.setTarget(rdfItem, MenuEditRDF.arcCustom, MenuEditRDF.ignoreLit);
            continue;
          }
          if(lastWasSeparator) continue; // do not create consecutive separators
          lastWasSeparator = true;

          domItem = this.el(itemID);
          if(!domItem) {
            domItem = document.createElementNS(this.XUL_NS, "menuseparator");
            domItem.id = itemID;
            domItem.setAttribute("automenu_GL-custom-element", "true");
          }
        } else { // not a separator
          lastWasSeparator = false;
          domItem = this.el(itemID);
        }

        if(!domItem) {
          if(!MenuEditRDF.getIgnore(rdfItem))
          { // "ignore" (bad name, I know) is set for dynamically appended 
            // elements - they may be not created at this moment yet.
            // If it's not set, we have a dead entry: remove it.
            throw [itemID + ": dead entry"];
          }
        } else {
          if(domItem.id.indexOf("menueditor-options") == 0) // if we show the Customize Menus item, set hidden=false
            domItem.hidden = false;
          //aPopup.appendChild(domItem);
          aPopup.insertBefore(domItem, lastItem); // for Bookmarks menu to work correctly
          this.editedMenus[aPopup.id].push(domItem.id);
        }
      } catch(e) { // schedule the offending entry for removal from the rdf.
        if(!(e instanceof Array))
          MenuEditCommon.dumpException(e);
        badEntries.push(fullRef);
      }
    } // end of loop through RDF container's elements

    try { // remove bad entries from the datasource now.
      for(var i in badEntries) {
        var node = MenuEditRDF.getResource(badEntries[i]);
        rdfPopupCont.RemoveElement(node, true);
        // xxx also remove the target entry from RDF? maybe if it's not ignored only?
      }
    } catch(e) {
      MenuEditCommon.dumpException(e);
    }
    if(badEntries.length > 0)
      MenuEditRDF.flushDatasource();
  },

  // Look for items that are in the menu, but not in the datasource.
  // *Must* be called after moveToTemp/populateMenu in order to work properly.
  // Note: we don't look in the menu itself, only in EM_ menu
  discoverNew: function(aPopup) {
    var res = MenuEditRDF.menuToRDFResource(aPopup.id);
    var rootCont = MenuEditRDF.getContainer(res);

    // anything new (see Note) will be left on here after moveToTemp+populateMenu
    var EM_menuPopup = this.el("EM_" + aPopup.id);

    // xxx this is not needed unless we don't have Find New button in Options (?)
    // This usually(always?) happens when called from Options and the menu
    // in question wasn't edited yet. This early return shouldn't cause any
    // problems except in rare and weird cases.
    if(!EM_menuPopup) return false;

    var childNodes = EM_menuPopup.childNodes;
    var newItemsCount = 0;
    for(var i=childNodes.length-1; i>=0; i--) {
      var item = childNodes[i];
      if(item.localName == "menuseparator") continue; // ignore new menu separators
      res = MenuEditRDF.getResourceFromId(item.id);
      if(!MenuEditRDF.getContainerForResource(res)) { // not yet in DS
        if(!MenuEditRDF.getIgnore(res) && !item.getAttribute("automenu_GL-custom-element")) {
          MenuEditRDF.addItem(rootCont, item);
          aPopup.appendChild(item);
          newItemsCount++;
        }
      }
    }
    MenuEditRDF.flushDatasource();
    return newItemsCount > 0;
  },


  // -------- Hide consecutive separators code --------
  // Since we allow user to create custom separators and to hide some of menu
  // items, we can no longer rely on existing code managing separators'
  // visibility correctly. We register a listener that runs each time a
  // menupopup is shown, and in the listener we hide all consecutive separators
  // based on current visibility of other items of the menu. To make sure our
  // code runs after any other listeners messing with menu items visibility,
  // we add onAfterPopupShown to the listener queue when handling popupshown
  // for the first time.

  // Note: do not assume this == MenuEdit
  onAfterPopupShown: function(e, aRestarted) {
    var popup = e.target;

    if(popup.getAttribute(MenuEdit.editedAttrName) != "true")
      popup = this; // see popupshowing event listener comments ("else" clause)

    var lastVisibleItemIsSeparator = true;
    var lastVisibleItem = null;
    var empty = true;

    for(var item = popup.firstChild; item; item = item.nextSibling) {
      if(item.localName == "menuseparator") {
        if(lastVisibleItemIsSeparator)
          item.hidden = true; // do not show consecutive separators
        else {
          lastVisibleItem = item;
          item.hidden = false;
          lastVisibleItemIsSeparator = true;
        }
      } else {
        if(!item.hidden && !item.collapsed) {
          lastVisibleItem = item;
          lastVisibleItemIsSeparator = false;
          empty = false;
        }
      }
    }

    if(lastVisibleItem && lastVisibleItem.localName == "menuseparator")
      lastVisibleItem.hidden = true;

    if(empty)
      popup.hidePopup();

    setTimeout(function(x) { x.removeEventListener("popupshown",
      MenuEdit.onAfterPopupShown, false); }, 0, popup);
  },

  // Which menus to show in the Options window and to add to the datasource
  getEditableMenus: function() {
    // "menus" is an object, whose properties are the IDs of popups, and their
    // values are used to provide display labels for them.
    var menus;
        
    if(MenuEditCommon.hostApp == MenuEditCommon.apps.Firefox) {
    	
    	var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
    	var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
    	if(versionChecker.compare(appInfo.version, "4.0b1") >= 0) {  // Firefox verision 4
      	/*
        menus = {
        "contentAreaContextMenu": MenuEditCommon.getString("contentAreaContextMenu"),
        "menu_FilePopup": null,
        "menu_EditPopup": null,
        "menu_viewPopup": null,
        // xxx see bug #10024
        "goPopup": null,
        "bookmarksMenuPopup": null,
        "menu_ToolsPopup": null,
        "menu_HelpPopup": null,
        "tabContextMenu":  MenuEditCommon.getString("tabContextMenu")
      	};*/
        menus = {
        "a": "a",
        "img": "img",
        "input": "input",
        "selectedText": "selectedText",
        // xxx see bug #10024
        "document": "document",
      	
      	};
    	}
    	else {  // Firefox version 3.x
    		menus = {
        "contentAreaContextMenu": MenuEditCommon.getString("contentAreaContextMenu"),
        "menu_FilePopup": null,
        "menu_EditPopup": null,
        "menu_viewPopup": null,
        // xxx see bug #10024
        "goPopup": null,
        "bookmarksMenuPopup": null,
        "menu_ToolsPopup": null,
        "menu_HelpPopup": null,
        "automenu_GL-tabContextMenu":  MenuEditCommon.getString("tabContextMenu")
      	};
    		
    	}
      
    } else if(MenuEditCommon.hostApp == MenuEditCommon.apps.Thunderbird) {
      menus = {
        "messagePaneContext": MenuEditCommon.getString("messagePaneContext"),
        "threadPaneContext": MenuEditCommon.getString("threadPaneContext"),
        "menu_FilePopup": null,
        "menu_EditPopup": null,
        "menu_View_Popup": null,
        "menu_GoPopup": null,
        "messageMenuPopup": null,
        "taskPopup": null,
        "menu_HelpPopup": null
      };
    } else {
      MenuEditCommon.dump("Unknown host app!");
      return null;
    }

    return menus;
    // get labels for the menus
    for(var i in menus) {
      if(menus[i]) continue; // some items have predefined label
      var popup = this.el(i);
      if(popup) {
        var parent = popup.parentNode;
        if(parent && parent.getAttribute("label"))
          menus[i] = parent.getAttribute("label");
        else
          menus[i] = i;
      } else {
        delete menus[i];
        MenuEditCommon.dump("Menu not found: " + i);
      }
    }
    return menus;
  },

  // helpers
  el: function(aID) {
    return document.getElementById(aID);
  },
  // open Menu Editor Options dialog
  openOptions: function() {
    toOpenWindowByType("automenu_GL:options", "chrome://automenu_GL/content/menueditprefs.xul");
  }
};

// These functions replace appendChild and removeChild for menupopups edited by ME
// Used to get dynamic menu modifications under our control.
// Not declared as methods of MenuEdit to avoid confusion about what "this" refers to.
function __MenuEdit_appendChild(el) {
  var popupId;

  if(el.getAttribute("class") == "spell-suggestion") {
    // Spell suggestions go right above the "spell-no-suggestions" item
    const noSuggID = "spell-no-suggestions";
    for(var item = this.firstChild; item; item = item.nextSibling) {
      if(item.id == noSuggID || item.getAttribute("anonid") == noSuggID)
        break;
    }
    return this.__MenuEdit_insertBefore_orig(el, 
      item ? item : this.firstChild);
  }

  if(el.localName == "menuseparator") {
    popupId = this.id;
    return MenuEdit.el("EM_" + popupId).appendChild(el); // perhaps just put all separators in a separate menupopup?
  }

  var res = MenuEditRDF.getResourceFromId(el.id);
  var cont = MenuEditRDF.getContainerForResource(res);
  if(cont) {
    popupId = cont.Resource.Value.substr(3); // extracts the id from NC:... string (xxx)
    
    if(MenuEditRDF.getVisibility(res)) {
      var idx = cont.IndexOf(res);
      while(true) { // loop through the following elements searching for one with visibility=true
        var next = MenuEditRDF.getChild(cont.Resource, ++idx);
        if(!next) // end of list
          break;
        if(MenuEditRDF.getVisibility(next)) { // we found it
          next = MenuEditRDF.getResourceId(next);
          break;
        }
      }
      if(next)  next = MenuEdit.el(next);
      try {
        MenuEdit.el(popupId).__MenuEdit_insertBefore_orig(el, next);
      } catch(e) {
        MenuEdit.el(popupId).__MenuEdit_insertBefore_orig(el, null);
        //d("error calling insertBefore(" + el.id + ", " + next + ")");
      }
    } else
      MenuEdit.el("EM_" + popupId).appendChild(el);
  } else { // the item doesn't exist in the database
    var menures = MenuEditRDF.menuToRDFResource(this.id);
    var rootCont = MenuEditRDF.getContainer(menures);
    var rdfItem = MenuEditRDF.addItem(rootCont, el);
    if(rdfItem)
      MenuEditRDF.setTarget(rdfItem, MenuEditRDF.arcCustom, 
        MenuEditRDF.ignoreLit); // see common.js for description of ignoreLit

    // new items are appended at the beginning of the menu for now
    // xxx append right before bookmark items
    // xxx but note Add Bookmark Here extension which needs to be changed
    if(this.id == "menu_BookmarksPopup")
      this.__MenuEdit_insertBefore_orig(el, this.firstChild);
    else
      this.__MenuEdit_appendChild_orig(el);
    //MenuEditRDF.flushDatasource();
  }
  return el;
};

function __MenuEdit_removeChild(el) {
  var parent = el.parentNode;
  if(!parent) return el;

  if("__MenuEdit_removeChild_orig" in parent)
    return parent.__MenuEdit_removeChild_orig(el);
  else
    return parent.removeChild(el);
};

window.addEventListener("load",
  function() {
    // run after delayedLoad, after dynamic menu items for tab strip's
    // context menu are created. This does mean the user might see the
    // old menus if he opens a menu right after the window is opened.
    setTimeout(function() { MenuEdit.init(); }, 0);
    menuPanelAbout.onLoad();
  }, false);
