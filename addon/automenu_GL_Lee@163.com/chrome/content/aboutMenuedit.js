
window.addEventListener("load", aboutInit, true);

function aboutInit() {
	
	window.removeEventListener("load", aboutInit, true);
	
	
	// On windows showing Uni to all non-US, Aftdwnld on US
	// Showing Aftdwnld on all linux and mac
	try {
		var xulRuntime = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime);
		if(xulRuntime.OS == "WINNT") {
		
			document.getElementById("centerMessage").setAttribute("src", "aboutMenueditCenter.xul");
			/*
			var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
			
			if(pref.getCharPref("general.useragent.locale") == "en-US") {
				document.getElementById("centerMessage").setAttribute("src", "http://enzysoft.com/downbarWelcomeCenter.html");
			}
			else {
				document.getElementById("centerMessage").setAttribute("src", "aboutMenueditCenter.xul");
			}
			*/
		}
		else {
			document.getElementById("centerMessage").setAttribute("src", "http://enzysoft.com/downbarWelcomeCenter.html");
		}
	} catch(e) {
		document.getElementById("centerMessage").setAttribute("src", "aboutMenueditCenter.xul");
	}
	
	
	try {  // Firefox <= 3.6
		var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
		document.getElementById("extVersion").value = gExtensionManager.getItemForID("{EDA7B1D7-F793-4e03-B074-E6F303317FB0}").version;
	}
	catch(e) { // Firefox >=4.0
		Components.utils.import("resource://gre/modules/AddonManager.jsm");
	
		AddonManager.getAddonByID("{EDA7B1D7-F793-4e03-B074-E6F303317FB0}", function(addon) {
			document.getElementById("extVersion").value = addon.version;
		});
	}

}

function openLink(aPage) {

	// Open page in new tab
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
    var wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
    
    var win = wmed.getMostRecentWindow("navigator:browser");
    if (!win)
    	win = window.openDialog("chrome://browser/content/browser.xul", "_blank", "chrome,all,dialog=no", aPage, null, null);
    else {
    	var content = win.document.getElementById("content");
    	content.selectedTab = content.addTab(aPage);	
    }
	
}