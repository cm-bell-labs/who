
var AMd = new Array();

function toggle_vis(target)
{
	toggle_vis_a("a_"+target);
	toggle_vis_a("n_"+target);
}

function toggle_vis_d(target)
{
	if (isIE)
		alert("Sorry, try a different browser");
	var c = document.getElementById("d_"+target);
	if (c==null)
		return;
	var f = c.style;
	c.style.display = (f.display != 'none') ? 'none' : 'block';
}

function toggle_vis_a(target)
{
	
	var c = document.getElementById(target);
	if (c==null)
		return;
		
	if (AMd[target]!=true) {
		AMd[target] = true;
		translateDOMObj(c);
	}

	var f = c.style;
	c.style.display = (f.display != 'block') ? 'block' : 'none';
}

var all_showing = false;
var all_showing_demo = true;

function replace_txt(id, new_el, str)
{    
	var h = document.getElementById(id);    
    
    var children = h.childNodes;
    for (var i=0; i < children.length; i++) {
        var child = children[i];
        if (child.nodeType == 3 /* Text node */) {
            child.data = str;
            break;
        }
    }
}

function toggle_one_abs(ci)
{
	if (all_showing && AMd[ci.id]!=true) {
		AMd[ci.id] = true;
		translateDOMObj(ci);
	}
	var f = ci.style;
	ci.style.display = all_showing ? 'block' : 'none';
}

var AV_c; 
function do_toggle()
{
	var c = AV_c;
	
	for (var i=0; i<c.length; i++) {
		if (c[i].className == 'abstract' || c[i].className=='annote') {
			toggle_one_abs(c[i]);
		}
	}
	document.body.style.cursor = "auto";
}




function do_toggle_demo()
{
	var c = AV_c;
	
	for (var i=0; i<c.length; i++) {
		if (c[i].className == 'demo' ) {
			var f = c[i].style;
			c[i].style.display = all_showing_demo ? 'block' : 'none';
		}
	}
	document.body.style.cursor = "auto";
}



function toggle_all()
{
	AV_c = document.getElementsByTagName('div');
	
	all_showing = !all_showing;
	
	document.body.style.cursor = "wait";
	setTimeout("do_toggle()", 5);
	
	replace_txt("toggle_link", "a", all_showing ? "Hide all abstracts" : "Show all abstracts");
}



function toggle_all_demo()
{
	AV_c = document.getElementsByTagName('div');
	
	all_showing_demo = !all_showing_demo;
	
	document.body.style.cursor = "wait";
	setTimeout("do_toggle_demo()", 5);
	
	replace_txt("toggle_link_demo", "a", all_showing_demo ? "Hide all demos" : "Show all demos");
}
