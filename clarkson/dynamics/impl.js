function foo() {var i; if (i > 10) return;}

var cSlide;


function keyHandler(e) {
     switch(e.charCode) {
	case 32:
	case 13:
	case 110:
    		e.preventDefault();
		forward(cSlide);
		break;
	case 8:
    		e.preventDefault();
		rewind(cSlide);
		break;
	case 0:
		switch(e.keyCode) {
			case 38: /* up */
			case 33: /* page up */
      				e.preventDefault();
				rewind(cSlide);
				break;
			case 40: /* down */
			case 34: /* page down */
     				e.preventDefault();
 				forward(cSlide);
				break;
		}
		break;
    }
}

function onload_init()
{
	cSlide = document.getElementById("slide one");
	SetPage(cSlide);
	document.documentElement.addEventListener("keypress", keyHandler, true);
}

var slide_num = 1;
var left_foot = "Soft Handoff under Shadow Fading"

function SetPage(nextSlide) {
	nextSlide.setAttribute("style", "display: block !important");
	var FooterRightText = document.createTextNode("Page " + slide_num);
	var FooterLeftText = document.createTextNode(left_foot);
	var kids = nextSlide.childNodes;
		for (i=0; i<kids.length; i++) {
		if (kids[i].className == "FooterLeft")
			kids[i].replaceChild(FooterLeftText, kids[i].firstChild);
		else if (kids[i].className == "FooterRight")
			kids[i].replaceChild(FooterRightText, kids[i].firstChild);
	}
        cSlide = nextSlide;
}


function forward(element) {
    var currentSlide = element;
    while (currentSlide.getAttribute("class") != "slide")
    	currentSlide = currentSlide.parentNode;
    
    nextSlide = currentSlide.nextSibling;
    while (nextSlide && 
        (nextSlide.nodeType != Node.ELEMENT_NODE || nextSlide.getAttribute("class") != "slide"))
    nextSlide = nextSlide.nextSibling;

    if (nextSlide) {
		slide_num = slide_num + 1;
		currentSlide.removeAttribute("style");
		SetPage(nextSlide);
    }
}

function rewind(element) {
    var currentSlide = element;
    while (currentSlide.getAttribute("class") != "slide")
    currentSlide = currentSlide.parentNode;

    previousSlide = currentSlide.previousSibling;
    while (previousSlide &&
            (previousSlide.nodeType != Node.ELEMENT_NODE || previousSlide.getAttribute("class") != "slide"))
    previousSlide = previousSlide.previousSibling;
    
    if (previousSlide) {
		slide_num = slide_num - 1;
		currentSlide.removeAttribute("style");
		SetPage(previousSlide);
    }
}
