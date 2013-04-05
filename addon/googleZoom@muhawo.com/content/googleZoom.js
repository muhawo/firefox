var googleZoom={
	enableZoom:function(){
		var zDocument = window.content.document;
		
		var googleZoomToggleDenD = document.getElementById("googleZoomToggleDenD");
		var googleZoomMenu = document.getElementById("googleZoomMenu");
		var zoomt = googleZoomToggleDenD.getAttribute("zoom");;
		var zoomm = googleZoomMenu.getAttribute("zoom");;
		if(zoomt == "true"){
			var zoomDiv = zDocument.getElementById("rg_h");
			zoomDiv.setAttribute("id", "rg_h_muhawo");
			googleZoomToggleDenD.setAttribute("zoom", "false");
			googleZoomMenu.setAttribute("zoom", "false");
		}
		else{
			var zoomDiv = zDocument.getElementById("rg_h_muhawo");
			zoomDiv.setAttribute("id", "rg_h");
			googleZoomToggleDenD.setAttribute("zoom", "true");
			googleZoomMenu.setAttribute("zoom", "true");
		}
	},
};
