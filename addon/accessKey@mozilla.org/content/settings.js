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
var accessKeySet = {
	previewSet:function(pref_leaf_name,setValue){
		if(!setValue)setValue = accessKeySet.branch.getCharPref(pref_leaf_name);
		switch (pref_leaf_name) {
			case "textFont":
				accessKeySet.previewBox.style.fontFamily=setValue;
				break;
			case "textSize":
				accessKeySet.previewBox.style.fontSize=setValue;
				break;
			case "textColor":
				accessKeySet.previewBox.style.color=setValue;
				break;
			case "borderStyle":
				accessKeySet.previewBox.style.borderStyle=setValue;
				break;
			case "borderWidth":
				accessKeySet.previewBox.style.borderWidth=setValue;
				break;
			case "borderColor":
				accessKeySet.previewBox.style.borderColor=setValue;
				break;
			case "backgroundColor":
				accessKeySet.previewBox.style.backgroundColor=setValue;
				break;
			case "backgroundOpacity":
				accessKeySet.previewBox.style.opacity=setValue;
				break;
		}
	},
};
accessKeySet.branch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.accessKey.display.");

window.addEventListener("load", function(){
	  accessKeySet.previewBox = document.getElementById("previewBox"); 
	  accessKeySet.branch.getChildList('', {}).forEach(function (pref_leaf_name){accessKeySet.previewSet(pref_leaf_name)})});


