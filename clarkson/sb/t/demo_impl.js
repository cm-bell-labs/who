


function foo() {var i; if (i > 10) return;}

var ca, cb, cc;
var NUM_POINTS = 50;
var NUM_LEADERS = 15;
var dot_radius = 5;
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
	document.documentElement.addEventListener("keypress", keyHandler, true);
}


function distsqr(jx, jy, ix, iy)
{
	return (ix-jx)*(ix-jx) + (iy-jy)*(iy-jy);
}

function update_center(T)
{
	var	Tname =	T.getAttribute("name");
	if (Tname.match("query_circle_shape")) {
		update_i(T,	"query_circle",	"1", "x1", "y1");
	} else {
		// update_i(T,	"query_sb_circle", NUM_POINTS, "x2", "x2");
		var	circq =	document.getElementById("query_sb_circle");
		
  		circq.cx.baseVal.value = T.getAttribute("x2")*1.0;
  		circq.cy.baseVal.value = T.getAttribute("y2")*1.0;
		circq.r.baseVal.value = Math.sqrt(nearest_leader(start_sb_circles, NUM_LEADERS, circq, 0));
		
		var	group =	document.getElementById("group_sb");
		var	gid	= group.ownerSVGElement.suspendRedraw(1000);
		for	(var i=0; i	< NUM_LEADERS; i++)	{
			var	j= start_sb_circles+i;
			var	circi =	document.getElementById(circ_id(j)+"_out");
			var	rr = Math.sqrt(distsqrC(circi, circq));
//				alert(rr + "  "	+ circi.r.baseVal.value	+ "	" +	circq.r.baseVal.value);

			var	gid2 = circi.ownerSVGElement.suspendRedraw(1000);
			if (circi.r.baseVal.value +	circq.r.baseVal.value >	rr)
				circi.setAttribute("style",	"fill:none;	stroke:lightgreen; stroke-width:3pt;");
			else
				circi.setAttribute("style",	"fill:none;	stroke:none;");
			circi.ownerSVGElement.unsuspendRedraw(gid2);
			circi.ownerSVGElement.forceRedraw();
		
		}
		group.ownerSVGElement.unsuspendRedraw(gid);
		group.ownerSVGElement.forceRedraw();
	}
}


function update_i(T, q_name, circ_num, x, y)
{
	
	var circ = document.getElementById(q_name);
	var xx = T.getAttribute(x)*1.0;
  	var yy = T.getAttribute(y)*1.0;
  	
  	var query_t = document.getElementById(circ_id(circ_num));
  	
  	circ.cx.baseVal.value = xx;
  	circ.cy.baseVal.value = yy;
  	circ.r.baseVal.value = Math.sqrt(distsqrC(circ, query_t));
}


function distsqrC(ca, cb)
{
	return distsqr(ca.cx.baseVal.value, ca.cy.baseVal.value, cb.cx.baseVal.value, cb.cy.baseVal.value);
}

function sb_setHighlight(leader_num, col)
{
	for (var i=NUM_LEADERS; i < NUM_POINTS; i++) {
		var j = start_sb_circles + i;
		var circ = document.getElementById(circ_id(j));
		if (circ.className.baseVal.value!=leader_num)
			continue;
		circ.setAttribute("style", "fill:magenta");
	}
}

var Ownership = new Array();

function sb_mouseover()
{
	var tid = this.getAttribute("id");
	for (var i=NUM_LEADERS; i < NUM_POINTS; i++) {
		var j = start_sb_circles+i;
		if (Ownership[i].match(tid)) {
			var circi = document.getElementById(circ_id(j));
			circi.setAttribute("style", "fill:magenta");
		}
	}
//	var circi=document.getElementById(tid+"_out");
//	var gid = circi.ownerSVGElement.suspendRedraw(1000);
//	circi.setAttribute("style", "stroke:lightgreen; fill:none; fill-opacity:0.1");
//	circi.ownerSVGElement.unsuspendRedraw(gid);
}
	
function sb_mouseout()
{
	var tid = this.getAttribute("id");
	for (var i=NUM_LEADERS; i < NUM_POINTS; i++) {
		var j = start_sb_circles+i;
		if (Ownership[i].match(tid)) {
			var circi = document.getElementById(circ_id(j));
			circi.setAttribute("style", "fill:black");
		}
	}
//		var circi=document.getElementById(tid+"_out");
//		var gid = circi.ownerSVGElement.suspendRedraw(1000);
//		circi.setAttribute("style", "stroke:none; fill:none;");
//		var foo = circi.r.baseVal.value;
//		circi.r.baseVal.value = 0;
//		circi.r.baseVal.value = foo;
//		circi.ownerSVGElement.unsuspendRedraw(gid);
}



function nearest_leader(start_circ, num_leaders, circ, return_leader)
{
	var min_dist = 1000000;
	var min_i = -1;
	for (var i=0; i < num_leaders; i++) {
		var j = start_circ + i;
		var ci = document.getElementById(circ_id(j));
		var dist = distsqrC(ci, circ);
		if (dist < min_dist) {
			min_dist = dist;
			min_i = i;
		}
	}
	if (return_leader)
		return min_i;
	else return min_dist;
}

function circ_id(i) {return "circle_"+i ;}

var slidenum = 1;
var max_slides = 20;
var kd_init_called = 0;

function kd_init()
{
	if (kd_init_called)
		return;
	kd_init_called = 1;
				
	var kdr=document.getElementById("kd-rect");
	var gid = kdr.ownerSVGElement.suspendRedraw(1000);
	
	var canvas = document.getElementById("canvaskd");
	var group = document.createElementNS("http://www.w3.org/2000/svg", "group");
	canvas.appendChild(group);

	for (var i = 0; i < NUM_POINTS; i++)
			group.appendChild(createCircle(i, kdr));
			
	kdr.ownerSVGElement.unsuspendRedraw(gid);
	kdr.ownerSVGElement.forceRedraw();

}

var sb_init_called = 0;

function sb_init()
{
	if (sb_init_called)
		return;
	sb_init_called = 1;
	
	var canvas = document.getElementById("canvas_sb");
	var group = document.getElementById("group_sb");
	canvas.appendChild(group);
	var sbr = document.getElementById("sb-rect");
	var gid = sbr.ownerSVGElement.suspendRedraw(1000);			

	start_sb_circles = last_circle+1;
	for (var i = 0; i < NUM_POINTS; i++)
		group.appendChild(createCircle(start_sb_circles+i, sbr));
		
	for (var i=0; i < NUM_LEADERS; i++) {
		var j = start_sb_circles + i;
		var circ = document.getElementById(circ_id(j));
		circ.setAttribute("style", "stroke: red; fill:red;");
		var circi = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circi.cx.baseVal.value = circ.cx.baseVal.value;
		circi.cy.baseVal.value = circ.cy.baseVal.value;
		circi.r.baseVal.value = 0;
		circi.setAttribute('id', circ_id(j)+"_out");
		circi.setAttribute('style', "fill:none; stroke:none;");
		group.appendChild(circi);
		circ.addEventListener("mouseover", sb_mouseover, false);
		circ.addEventListener("mouseout", sb_mouseout, false);
	}
			
	for (var i=NUM_LEADERS; i < NUM_POINTS; i++) {
		var j = start_sb_circles + i;
		var circ = document.getElementById(circ_id(j));
		var g = nearest_leader(start_sb_circles, NUM_LEADERS, circ, 1);
		var gp = start_sb_circles+g;
		Ownership[i] = circ_id(gp);
		var circi = document.getElementById(circ_id(gp)+"_out");
		var rr = circi.r.baseVal.value;
		var r2 = Math.sqrt(distsqrC(circi, circ));
		if (rr < r2)
			circi.r.baseVal.value = r2;
	}
	
	sbr.ownerSVGElement.unsuspendRedraw(gid);
	sbr.ownerSVGElement.forceRedraw();
}

var sb2_init_called = 0;

function sb2_init()
{	
	if (sb2_init_called)
		return;
	sb2_init_called = 1;
	
	
	var canvas = document.getElementById("canvas_sb2");
	var group = document.getElementById("group_sb2");
	canvas.appendChild(group);
	var sbr = document.getElementById("sb-rect2");
//	var gid = sbr.ownerSVGElement.suspendRedraw(1000);			

	start_sb_circles2 = last_circle+1;
	for (var i=0; i < NUM_POINTS; i++) {
		var circi = createCircle(start_sb_circles2+i, sbr);
		circi.setAttribute("class", "sb_uninserted");
		group.appendChild(circi);
	}
	
	var arrows = document.getElementById("sb_arrows");
	canvas.appendChild(arrows);
	
	tot_arrows = 0;
	current_set = 0;

	var c=document.getElementById("circ_go");
	c.addEventListener("mousedown", go_mousedown, false);
	c = document.getElementById("circ_step");	
	c.addEventListener("mousedown", step_mousedown, false);
	c = document.getElementById("circ_stop");	
	c.addEventListener("mousedown", stop_mousedown, false);
	
//	sbr.ownerSVGElement.unsuspendRedraw(gid);
	sbr.ownerSVGElement.forceRedraw();

}

function go_mousedown(evt)  {start_animation(); }
function step_mousedown(evt){one_step();}	
function stop_mousedown(evt){stop_animation();}
function re_init()
{
	need_reset = 0;
	current_set = 0;
	tot_arrows = 0;
	var sbr = document.getElementById("sb-rect2");
	
	var arrows = document.getElementById("sb_arrows");
	var kids = arrows.childNodes;
	var numkids = kids.length;
	var gid = sbr.ownerSVGElement.suspendRedraw(1000);			
	for (var i = 0; i < numkids; i++) {
		arrows.removeChild(kids[0]);
	}
	sbr.setAttribute("style", "fill:white;");
	
				
	for (var i=0; i < NUM_POINTS; i++) {
		var circ = document.getElementById(circ_id(start_sb_circles2+i));
		circ.setAttribute("class", "sb_uninserted");
		circ.cx.baseVal.value = Math.random()*sbr.width.baseVal.value + sbr.x.baseVal.value;
		circ.cy.baseVal.value = Math.random()*sbr.height.baseVal.value + sbr.y.baseVal.value;
	}
	
	sbr.ownerSVGElement.unsuspendRedraw(gid);
	sbr.setAttribute("style", "fill:none;");
}

var last_circle = 0;
var start_sb_circles = 0;

function createCircle(i, R)
{
	var x = Math.random()*R.width.baseVal.value + R.x.baseVal.value;
	var y = Math.random()*R.height.baseVal.value + R.y.baseVal.value;

	var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute( 'id', circ_id(i));
	circle.setAttribute( 'cx', x );
	circle.setAttribute( 'cy', y );
	circle.setAttribute( 'r', dot_radius );

	last_circle = i;
	return circle;
}


var anim_running = 0;
var adding_point = 1;
var need_reset = 0;
var got_to_done = 0;

function rand_uniform() {return 2*Math.random() - 1;}
function norm2(x, y) { return x*x + y*y;}
function rand_gauss(std_dev) {
	var x,y,s=1.5;
	while (s>1) {
		x = rand_uniform();
		y = rand_uniform();
		s = norm2(x, y);
	}
	var ret = std_dev*x*Math.sqrt(-2*Math.log(s)/s);
	return ret;
}


function start_animation()
{
	if (need_reset)
		re_init();
	animate();
}

function stop_animation()
{
	if (!anim_running)
		return;
	clearTimeout(anim_running);
	anim_running = 0;
	need_reset = 1;
}

function animate()
{
	if (!one_step())
		anim_running = setTimeout("animate()",30);
	else
		need_reset = 1;
}

var step = 0;
var inserting = 0;
var current_set = 0;

function sb2_circ(i)
{
	return document.getElementById(circ_id(start_sb_circles2+i));
}

var Ownership2 = new Array();
var owner_dist = new Array();

function arrow_id(a,b) {return "arrow " + a + ":" + b;}

var tot_arrows;

function make_arrow(circ_out, circ_in)
{
	tot_arrows++;
	
	
	var co = sb2_circ(circ_out);
	var ci = sb2_circ(circ_in);
	var go = document.createElementNS(
		"http://www.w3.org/2000/svg", "group");
	go.setAttribute("id", arrow_id(circ_in, circ_out));
	var arrows = document.getElementById("sb_arrows");
	arrows.appendChild(go);

	var xo = co.cx.baseVal.value;
	var yo = co.cy.baseVal.value;
	var xi = ci.cx.baseVal.value;
	var yi = ci.cy.baseVal.value;
	
	var did = Math.sqrt(distsqrC(co, ci));
	var xd = dot_radius*(xo - xi)/did;
	var yd = dot_radius*(yo - yi)/did;
	
	xo -= xd;
	xi += xd;
	yo -= yd;
	yi += yd;
	
	var lin = document.createElementNS("http://www.w3.org/2000/svg", "line");
	lin.x1.baseVal.value = xo;
	lin.y1.baseVal.value = yo;
	lin.x2.baseVal.value = xi;
	lin.y2.baseVal.value= yi;
	lin.setAttribute('style', 'stroke:black; fill:none; stroke-width:2');
	go.appendChild(lin);
	
	var xit = xi + xd;
	var yit = yi + yd;
	var xit2 = xit + xd*0.2 - yd*0.2;
	var yit2 = yit + xd*0.2 + xd*0.2;
	
	var ta = document.createElementNS("http://www.w3.org/2000/svg", "line");
	ta.x1.baseVal.value = xi;
	ta.y1.baseVal.value = yi;
	ta.x2.baseVal.value = xi + 2*xd - yd;
	ta.y2.baseVal.value = yi + 2*yd + xd;
	ta.setAttribute('style', 'stroke:black; fill:none; stroke-width:2');	
	go.appendChild(ta);
	
	var tb = document.createElementNS("http://www.w3.org/2000/svg", "line");
	tb.x1.baseVal.value = xi;
	tb.y1.baseVal.value = yi;
	tb.x2.baseVal.value = xi + 2*xd + yd;
	tb.y2.baseVal.value = yi + 2*yd - xd;
	tb.setAttribute('style', 'stroke:black; fill:none; stroke-width:2');	
	go.appendChild(tb);
}

function clear_highlights()
{
	for (var i=0; i < NUM_POINTS; i++) {
		var c = sb2_circ(i);
		var cc = c.getAttribute("class");
		if (cc.match("sb_taken"))
			c.setAttribute("class", "sb_uninserted");
		if (cc.match("sb_touched"))
			c.setAttribute("class", "sb_inserted");		
	}
}

function setLabel(lab)
{
	var alr = document.getElementById("anim_label_rect");
	alr.setAttribute("style", "fill:white;");
	var anim_lab = document.getElementById("anim_label");
	var foo = document.createTextNode(lab);
	anim_lab.replaceChild(foo, anim_lab.firstChild);
}

var seens = new Array();

var old_ave = 0;

function one_step()
{
	if (need_reset)
		re_init();
		
	var group = document.getElementById("group_sb2");
	var gid = group.ownerSVGElement.suspendRedraw(1000);
	clear_highlights();
	
	if (current_set >= NUM_POINTS) {
		group.ownerSVGElement.unsuspendRedraw(gid);
		return 1;
	}
	
	var circc = sb2_circ(current_set++);
	circc.setAttribute("class", "sb_inserted");
	
	
	if (current_set==1) {
		for (var i=0; i < NUM_POINTS; i++) {
			Ownership2[i] = 0;
			owner_dist[i] = distsqrC(circc, sb2_circ(i));
			if (i!=0)
				sb2_circ(i).setAttribute("class", "sb_taken");
		}
		setLabel("Starting: one leader");
		group.ownerSVGElement.unsuspendRedraw(gid);
		return 0;
	}
			
	for (var i=0; i < current_set; i++)
		seens[i] = 0;
		
	for (var i=current_set-1; i < NUM_POINTS; i++) {


		var circi =  sb2_circ(i);
		var dist2i = distsqrC(circc, circi);
		if (dist2i >= owner_dist[i])
			continue;

		var oldc = Ownership2[i];
		Ownership2[i] = current_set-1;
		owner_dist[i] = dist2i;
		if (i!=current_set-1)
			circi.setAttribute("class", "sb_taken");
		sb2_circ(oldc).setAttribute("class", "sb_touched");
		if (seens[oldc]==1)
			continue;
		seens[oldc] = 1;
		make_arrow(current_set-1, oldc);
	}
	var ave = Math.floor(100*tot_arrows/current_set+0.5)/100;
	if (old_ave!=ave)
		setLabel("Ave arrows/leader: " + ave);
	old_ave = ave;
	group.ownerSVGElement.unsuspendRedraw(gid);
	return 0;
}
















var slide_num = 1;
var left_foot = "Nearest Neighbor Searching"

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
	var tid = nextSlide.getAttribute("id");
	if (tid.match("slide_kd"))
		setTimeout("kd_init()", 100);
	if (tid.match("slide_sb"))
 		setTimeout("sb_init()", 100);
	if (tid.match("slide_sb2"))
 		setTimeout("sb2_init()", 100);
        cSlide = nextSlide;
}

function sibling(currentSlide, forward)
{
	if (forward)
		return currentSlide.nextSibling;
	else
		return currentSlide.previousSibling;
}

function get_neighbor_slide(element, forward)
{
    var currentSlide = element;

    while (currentSlide.getAttribute("class") != "slide")
    currentSlide = currentSlide.parentNode;
            
    var nextSlide = sibling(currentSlide, forward);
    while (nextSlide && 
        (nextSlide.nodeType != Node.ELEMENT_NODE || nextSlide.getAttribute("class") != "slide"))
    nextSlide = sibling(nextSlide, forward);
    
    
    while (nextSlide && nextSlide.getAttribute("class") != "slide")
    nextSlide = nextSlide.parentNode;
    
    return nextSlide;
}


function forward(element) {
//    document.onkeypress = keyhandler;
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



// http://www.brothercake.com/
//onload function (replaces the onload="translate()" in the <body> tag)
function generic()
{
  sb2_init();
};
//setup onload function
if(typeof window.addEventListener != 'undefined')
{
  //.. gecko, safari, konqueror and standard
  window.addEventListener('load', generic, false);
}
else if(typeof document.addEventListener != 'undefined')
{
  //.. opera 7
  document.addEventListener('load', generic, false);
}
else if(typeof window.attachEvent != 'undefined')
{
  //.. win/ie
  window.attachEvent('onload', generic);
}


