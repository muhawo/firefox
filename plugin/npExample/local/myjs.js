/////////////////////////////////////////////////////////////////////////
// Generic Resize by Erik Arvidsson                                    //
//                                                                     //
// You may use this script as long as this disclaimer is remained.     //
// See www.dtek.chalmers.se/~d96erik/dhtml/ for mor info               //
//                                                                     //
// How to use this script!                                             //
// Link the script in the HEAD and create a container (DIV, preferable //
// absolute positioned) and add the class="resizeMe" to it.            //
/////////////////////////////////////////////////////////////////////////

var theobject = null; //This gets a value as soon as a resize start

function resizeObject() {
this.el        = null; //pointer to the object
this.dir    = "";      //type of current resize (n, s, e, w, ne, nw, se, sw)
this.grabx = null;     //Some useful values
this.graby = null;
this.width = null;
this.height = null;
this.left = null;
this.top = null;
}


//Find out what kind of resize! Return a string inlcluding the directions
function getDirection(el, e) {
var xPos, yPos, offset, dir, set;
dir = "";
set = getOffset(e);
xPos = set.offsetX;
yPos = set.offsetY;
offset = 8; //The distance from the edge in pixels
//if (yPos<offset) dir += "n";
//else if (yPos > el.offsetHeight-offset) dir += "s";
//if (xPos<offset) dir += "w";
//else
 if (xPos > el.offsetWidth-offset) dir += "e";

return dir;
}

function doDown() {
var el = getReal(arguments[0].target, "class", "resizeMe");

if (el == null) {
   theobject = null;
   return;
}  

dir = getDirection(el, arguments[0]);
if (dir == "") return;

theobject = new resizeObject();
  
theobject.el = el;
theobject.dir = dir;

theobject.grabx = arguments[0].clientX;
theobject.graby = arguments[0].clientY;
theobject.width = el.offsetWidth;
theobject.height = el.offsetHeight;
theobject.left = el.offsetLeft;
theobject.top = el.offsetTop;
arguments[0].returnValue = false;
arguments[0].cancelBubble = true;
}

function doUp() {
if (theobject != null) {
   theobject = null;
}
}

function doMove() {
var el, xPos, yPos, str, xMin, yMin;
xMin = 8; //The smallest width possible
yMin = 8; //             height
el = getReal(arguments[0].target, "class", "resizeMe");

if (el.getAttribute("class") == "resizeMe") {
   str = getDirection(el, arguments[0]);
//Fix the cursor 
   if (str == "") str = "default";
   else str += "-resize";
   el.style.cursor = str;
}
//Dragging starts here
if(theobject != null) {
   if (dir.indexOf("e") != -1){
    theobject.el.style.width = Math.max(xMin, theobject.width + arguments[0].clientX - theobject.grabx) + "px";
    document.getElementById("result").setAttribute("style.overflow","hidden");
    document.getElementById("result").setAttribute("style.overflow","auto");
	}

  /* if (dir.indexOf("s") != -1)
    theobject.el.style.height = Math.max(yMin, theobject.height + arguments[0].clientY - theobject.graby) + "px";

   if (dir.indexOf("w") != -1) {
    theobject.el.style.left = Math.min(theobject.left + arguments[0].clientX - theobject.grabx, theobject.left + theobject.width - xMin) + "px";
    theobject.el.style.width = Math.max(xMin, theobject.width - arguments[0].clientX + theobject.grabx) + "px";
   }
   if (dir.indexOf("n") != -1) {
    theobject.el.style.top = Math.min(theobject.top + arguments[0].clientY - theobject.graby, theobject.top + theobject.height - yMin) + "px";
    theobject.el.style.height = Math.max(yMin, theobject.height - arguments[0].clientY + theobject.graby) + "px";
   }*/
  
   arguments[0].returnValue = false;
   arguments[0].cancelBubble = true;
} 
}


function getReal(el, type, value) {
temp = el;
while ((temp != null) && (temp.tagName != "BODY")) {
   if (temp.getAttribute("class") == value) {
//   if (eval("temp." + type) == value) {
    el = temp;
    return el;
   }
   temp = temp.parentNode;
}
return el;
}

function getOffset(e)
{
  var target = e.target;
  if (target.offsetLeft == undefined)
  {
    target = target.parentNode;
  }
  var pageCoord = getPageCoord(target);
  var eventCoord =
  {     x: window.pageXOffset + e.clientX,
    y: window.pageYOffset + e.clientY
  };
  var offset =
  {
    offsetX: eventCoord.x - pageCoord.x,
    offsetY: eventCoord.y - pageCoord.y
  };
  return offset;
}
function getPageCoord(element)    
{
  var coord = {x: 0, y: 0};
  while (element)
  {
    coord.x += element.offsetLeft;
    coord.y += element.offsetTop;
    element = element.offsetParent;
  }
  return coord;
}

document.onmousedown = doDown;
document.onmouseup   = doUp;
document.onmousemove = doMove;


function display(ob){
	if(ob.style.display=="none"){
		ob.style.display="";
	}
	else{
		ob.style.display="none";	
	}
}
