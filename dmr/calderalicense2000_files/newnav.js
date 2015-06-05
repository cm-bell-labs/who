<!-- hide from non-JavaScript browsers    
// Netscape 3.0 compatibility test (for javascript image swapping)
compat = false;
if( parseInt( navigator.appVersion ) >= 3 ) { compat = true; }
// cache images for quick swapping
if( compat )
{

arrowon = new Image;
arrowon.src = "http://www.sco.com/images/arrow_white.gif";
arrowoff = new Image;
arrowoff.src = "http://www.sco.com/images/dot.gif";

aroon = new Image;
aroon.src = "http://www.sco.com/images/aro_red.gif";
arooff = new Image;
arooff.src = "http://www.sco.com/images/dot.gif";

bluon = new Image;
bluon.src = "http://www.sco.com/images/aro_blu.gif";
bluoff = new Image;
bluoff.src = "http://www.sco.com/images/dot.gif";

shop1 = new Image;
shop1.src = "/images/icon_shoppingcart_off.gif";
shop2 = new Image;
shop2.src = "/images/icon_shoppingcart_on.gif";

download1 = new Image;
download1.src = "/images/icon_downarrow_off.gif";
download2 = new Image;
download2.src = "/images/icon_downarrow_on.gif";

search1 = new Image;
search1.src = "/images/icon_rightarrow_off.gif";
search2 = new Image;
search2.src = "/images/icon_rightarrow_on.gif";

solutions1 = new Image;
solutions1.src = "/images/icon_eye_off.gif";
solutions2 = new Image;
solutions2.src = "/images/icon_eye_on.gif";
}

// generic image swap function
function doSwapGen(x, y)
{
   if( compat ) { 
    document.images[x].src=eval(y+'.src'); 
   }
}

function key(){
	//alert ("hey! focus");
	document.f.k.focus()
}

function getThereFast(formID,dropdownID) { 
	var selectedLink = document[formID][dropdownID].options[document[formID][dropdownID].selectedIndex].value;
 	if (selectedLink != '#') {
    	window.location=document[formID][dropdownID].options[document[formID][dropdownID].selectedIndex].value;
	} else if (selectedLink == '#') {
		document[formID][dropdownID].selectedIndex = 0;
	}
}

function clear_keyword()
{
	// Get access to the field
	var kid = document.f.kid;

	// If the default value is still in there, clear it
	if (kid.value == kid.defaultValue)
		kid.value = "";
}

function blur_keyword()
{
	// Get access to the field
	var kid = document.f.kid;
	
	// If there hasn't been a value entered, return to default
	if (kid.value == "")
		kid.value = kid.defaultValue;
}

// -->
