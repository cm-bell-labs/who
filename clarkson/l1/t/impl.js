function foo() {var i; if (i > 10) return;}

var ca, cb, cc;
var NUM_POINTS = 50;
var NUM_LEADERS = 15;
var dot_radius = 5;
var num_points_lp = 10;

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

function create_vline(circ, i)
{
	var ret = document.createElementNS("http://www.w3.org/2000/svg", "line");
	ret.y1.baseVal.value = ret.y2.baseVal.value = circ.cy.baseVal.value;
	ret.x1.baseVal.value = ret.x2.baseVal.value = circ.cx.baseVal.value;
	ret.setAttribute("id", vl_id(i));
	ret.setAttribute("style", "fill:black; stroke:black; stroke-width:2");
	return ret;
}


function createCircleGauss(i, R)
{
	var x = Math.random()*(R.width.baseVal.value-4*dot_radius) + R.x.baseVal.value + 2*dot_radius;
	var h = R.height.baseVal.value;

	var y_inc = h;

	var offset = (x - R.x.baseVal.value)/R.width.baseVal.value*h/8;
	while (y_inc > h/2 || y_inc < -h/2)
		y_inc = rand_gauss(h/20) - offset;

	var y = R.y.baseVal.value + h/2 + y_inc;

	var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute( 'id', circ_id(i));
	circle.setAttribute( 'cx', x );
	circle.setAttribute( 'cy', y );
	circle.setAttribute( 'r', dot_radius );

	last_circle = i;
	return circle;
}




function distsqr(jx, jy, ix, iy)
{
	return (ix-jx)*(ix-jx) + (iy-jy)*(iy-jy);
}


var fit_line_slope = 0.0;
var fit_line_inter = 0.0;
var cp_x = 0.0;
var cp_y = 0.0;

function l1_dist_tot_4arg(slope, inter, xs, ys, n)
{
	var dist = 0.0;
	
	for	(var i=0; i	<n; i++) {
		dist += Math.abs(ys[i] - slope*xs[i] - inter);
	}
	return dist;
}

function l1_dist_tot(slope, inter) {return l1_dist_tot_4arg(slope, inter, xs, ys, num_points_lp+1);}

function si_pair(slope, inter)
{
	this.slope = slope;
	this.inter = inter;
}

function update_gradv(si, grad, x, y)
{
	if (y - si.slope*x - si.inter > 0) {
		grad.slope += x;
		grad.inter += 1;
	} else {
		grad.slope -= x;
		grad.inter -= 1;
	}
}


function l1_gradient(si, ret)
{
	ret.slope = ret.inter = 0;
	
	for (var i=0; i<num_points_lp; i++) {
		update_gradv(si, ret, xs3[i], ys3[i]);
	}
	
}


var si = new si_pair(0,0);  //(0.2, 200);
var sigma = 0.000001;

function one_step_subgradient()
{
	var grad = new si_pair(0,0);
	
	l1_gradient(si, grad);
	
	si.slope += grad.slope*sigma;
	si.inter += grad.inter;
	
	var ns = l1_dist_tot_4arg(si.slope, si.inter, xs3, ys3, num_points_lp);
	
	var l1 = document.getElementById("l1_fit_line2");
	l1.y1.baseVal.value = si.slope*l1.x1.baseVal.value + si.inter;
	l1.y2.baseVal.value = si.slope*l1.x2.baseVal.value + si.inter;
	
	adjust_arrows_both("l1_fit_line2");

	var td = document.getElementById("total_dist_label3");
	var foo = document.createTextNode(
		"sum=" + Math.floor(ns)
		);
	td.replaceChild(foo, td.firstChild);
	
	delete grad;
}

/*
function update_l1_fit_line()
{
	var si = new si_pair(l2_si.slope, l2_si.inter);
	var grad = new si_pair(0,0);
	var sit = new si_pair(si.slope, si.inter);
	var sum = l1_dist_tot(si.slope, si.inter);
	var alpha = 1.0;

	for (var i = 0; i<10; i++) {
		l1_gradient(si, grad);
		alert("grad.slope = " + grad.slope + " grad.inter = " + grad.inter);
		
		sit.slope += grad.slope/alpha;
		sit.inter += grad.inter/alpha;
		var ns = l1_dist_tot(si.slope, si.inter);
		alert("slope = " + si.slope + " inter = " + si.inter + " sum = " + sum + " ns = " + ns);
		if (ns < sum) {
			si.slope = sit.slope; si.inter = sit.inter;
			sum = ns;
		} else {
			alpha /= 2.0;
		}
	}
	
	delete grad;
	delete si;
}
*/

var xs = new Array();
var ys = new Array();
var best_l1_fit;

function update_l1_fit_line()
{
	var min_fit = 1e10;
	var min_slope, min_inter;

	for (var i=0; i<=num_points_lp; i++) {
		for (var j=0; j<=num_points_lp; j++) {
			var dx = xs[i]-xs[j];
			if (dx==0.0)
				continue;
			var slope = (ys[i] - ys[j])/dx;
			var inter = ys[i] - slope*xs[i];
			var dist = l1_dist_tot(slope, inter);
			if (dist>=min_fit)
				continue;
			min_fit = dist;
			min_slope = slope;
			min_inter = inter;
		}
	}


	var l1 = document.getElementById("l1_fit_line");
	l1.y1.baseVal.value = min_slope*l1.x1.baseVal.value + min_inter;
	l1.y2.baseVal.value = min_slope*l1.x2.baseVal.value + min_inter;
	best_l1_fit = min_fit;
	
	adjust_arrows_both("l1_fit_line");
}



function update_dists()
{
	var dist = 0.0;
	var d2 = 0.0;
	
	for	(var i=0; i	< num_points_lp; i++) {
		var vl = document.getElementById(vl_id(i));
		var d = Math.abs(vl.y1.baseVal.value - vl.y2.baseVal.value);
		dist += d;
		d2 += d*d;
	}
	
	var d = Math.abs(cp_y - fit_line_slope*cp_x - fit_line_inter);
	dist += d;
	d2 += d*d;

	var td = document.getElementById("total_dist_label");
	var foo = document.createTextNode(
		"sum= " + Math.floor(dist)
		+ " rms= " + Math.floor(Math.sqrt(d2))
	);
	td.replaceChild(foo, td.firstChild);
}

function update_dists2()
{
	var td = document.getElementById("total_dist_label2");
	var foo = document.createTextNode(
		"sum= " + Math.floor(best_l1_fit)
		+ " rms= " + Math.floor(Math.sqrt(best_l2_fit))
	);
	td.replaceChild(foo, td.firstChild);
}




var sx, sy, ssxx, ssxy;

function init_l2()
{
	sx = sy = ssxx = ssxy = 0.0;
	
	for (var i=0; i<num_points_lp; i++) {
		var x = xs[i];
		var y = ys[i];
		sx += x;
		sy += y;
		ssxx += x*x;
		ssxy += x*y;
	}
}
	


var l2_si = new si_pair(1,0);
var best_l2_fit = 0.0;

function update_l2_fit_line()
{	
	var x = xs[num_points_lp];
	var y = ys[num_points_lp];
	
	var tx = sx + x;
	var ty = sy + y;
	var ttxx = ssxx + x*x;
	var ttxy = ssxy + x*y;
	
	var n = num_points_lp + 1;
	
	tx /= n;
	ty /= n;
	
	ttxx -= n*tx*tx;
	ttxy -= n*tx*ty;
	
	var slope = ttxy/ttxx;
	var inter = ty - slope*tx;
	
	l2_si.slope = slope;
	l2_si.inter = inter;

	var l2 = document.getElementById("l2_fit_line");
	l2.y1.baseVal.value = slope*l2.x1.baseVal.value + inter;
	l2.y2.baseVal.value = slope*l2.x2.baseVal.value + inter;
	
	best_l2_fit = 0.0;
	for (var i=0; i<=num_points_lp; i++) {
		d = ys[i] - slope*xs[i] - inter;
		best_l2_fit += d*d;
	}
	
	adjust_arrows_both("l2_fit_line");
}



function update_center(T)
{
	var	Tname =	T.getAttribute("name");
	if (Tname.match("query_circle_shape")) {
		update_i(T,	"query_circle",	"1", "x1", "y1");
	} else if (Tname.match("fit_control_point")) {
		cp_x = T.getAttribute("x1")*1.0;
		cp_y = T.getAttribute("y1")*1.0;
//		var vl = document.getElementById("fit_control_point_line");
//		vl.y1.baseVal.value = fit_line_slope*cp_x + fit_line_inter;
//		vl.y2.baseVal.value = cp_y;
//		vl.x1.baseVal.value = vl.x2.baseVal.value = cp_x;
		xs[num_points_lp] = cp_x;
		ys[num_points_lp] = cp_y;
		update_dists2();
		adjust_arrows_both("fit_line");
		update_l2_fit_line();
		update_l1_fit_line();		
	} else if (Tname.match("fit_line_shape")) {
		var fl = document.getElementById("fit_line");
		
		var xx1 = T.getAttribute("x1")*1.0;
		var yy1 = T.getAttribute("y1")*1.0;
		var xx2 = T.getAttribute("x2")*1.0;
		var yy2 = T.getAttribute("y2")*1.0;
		
		var denom = (xx2 - xx1);
		if (denom == 0.0)
			fit_line_slope = 1e9;
		else
			fit_line_slope = (yy2 - yy1)/denom;
		fit_line_inter = yy1 - fit_line_slope*xx1;
	
		fl.y1.baseVal.value = fl.x1.baseVal.value*fit_line_slope + fit_line_inter;
		fl.y2.baseVal.value = fl.x2.baseVal.value*fit_line_slope + fit_line_inter;
		
		for	(var i=0; i	< num_points_lp; i++) {
			var vl = document.getElementById(vl_id(i));
			var x = vl.x1.baseVal.value*1.0;
			vl.y1.baseVal.value = fit_line_slope*x + fit_line_inter;
		}
		
//		var vl = document.getElementById("fit_control_point_line");
//		vl.y1.baseVal.value = fit_line_slope*cp_x + fit_line_inter;

		update_dists();
		
		adjust_arrows_both("fit_line");
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


function createCircleCirc(i, C)
{
	var cx = C.cx.baseVal.value;
	var cy = C.cy.baseVal.value;
	var r = C.r.baseVal.value;
		
	var x,y,s=1.5;
	while (s>1) {
		x = rand_uniform();
		y = rand_uniform();
		s = norm2(x, y);
	}
	
	x = x*r + cx;
	y = y*r + cy;

	var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute( 'cx', x );
	circle.setAttribute( 'cy', y );
	circle.setAttribute( 'r', dot_radius );

	last_circle = i;
	return circle;
}

var num_points_coreset = 25;

function vl_id(j) {return "vl_" + j; }

function pic_init()
{
	var canvas = document.getElementById("coreset");
	var group = document.createElementNS("http://www.w3.org/2000/svg", "group");
	canvas.appendChild(group);
		
	var coreset_circ = document.getElementById("coreset_big_circ");

	for (var i = 0; i < num_points_coreset; i++)
			group.appendChild(createCircleCirc(i, coreset_circ));
			
	make_arrows_both("fit_line", "canvas_regression");
	make_arrows_both("l2_fit_line", "canvas_regression2");
	make_arrows_both("l1_fit_line", "canvas_regression2");
	make_arrows_both("l1_fit_line2", "canvas_regression3");
	
	var c=document.getElementById("circ_go");
	c.addEventListener("mousedown", go_mousedown, false);
	c = document.getElementById("circ_step");	
	c.addEventListener("mousedown", step_mousedown, false);
	c = document.getElementById("circ_stop");	
	c.addEventListener("mousedown", stop_mousedown, false);	
}

var slidenum = 1;
var max_slides = 20;
var regression1_init_called = 0;


function regression1_init()
{
	if (regression1_init_called)
		return;
	regression1_init_called = 1;
		
	var canvas = document.getElementById("canvas_regression");
	var group = document.createElementNS("http://www.w3.org/2000/svg", "group");
	var vlines = document.createElementNS("http://www.w3.org/2000/svg", "group");
	vlines.setAttribute('id', "vlines");

	canvas.appendChild(group);
	canvas.appendChild(vlines);

	for (var i = 0; i < num_points_lp; i++) {
		var c = createCircleGauss(i, canvas);
		group.appendChild(c);
		var vl = create_vline(c, i);
		vlines.appendChild(vl);
	}
}

var regression2_init_called = 0;

function regression_n_init(canvas_id, xs, ys, do_l2)
{
	var canvas = document.getElementById(canvas_id);
	var group = document.createElementNS("http://www.w3.org/2000/svg", "group");

	canvas.appendChild(group);

	for (var i = 0; i < num_points_lp; i++) {
		var c = createCircleGauss(i, canvas);
		xs[i] = c.cx.baseVal.value;
		ys[i] = c.cy.baseVal.value;
		group.appendChild(c);
	}
	if (do_l2==1)			
		init_l2();
}

function regression2_init() {regression_n_init("canvas_regression2", xs, ys, 1);}

var xs3 = new Array();
var ys3 = new Array();

function regression3_init() {regression_n_init("canvas_regression3", xs3, ys3, 0);}


var lp_init_called = 0;

function lp_init()
{
	if (lp_init_called)
		return;
	lp_init_called = 1;
				
	var kdr=document.getElementById("kd-rect");
	var gid = kdr.ownerSVGElement.suspendRedraw(1000);
	
	var canvas = document.getElementById("canvaskd");
	var group = document.createElementNS("http://www.w3.org/2000/svg", "group");
	canvas.appendChild(group);

	for (var i = 0; i < NUM_POINTS; i++)
			group.appendChild(createCircleGauss(i, kdr));
			
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
	var gid = sbr.ownerSVGElement.suspendRedraw(1000);			

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
	
	sbr.ownerSVGElement.unsuspendRedraw(gid);
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

var last_circle;
var start_sb_circles;

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
var num_iters = 0;
var max_iters = 10;

function sb2_circ(i)
{
	return document.getElementById(circ_id(start_sb_circles2+i));
}

var Ownership2 = new Array();
var owner_dist = new Array();

function arrow_id(a,b) {return "arrow " + a + ":" + b;}

var tot_arrows;

function arrow_l_id(t, lab, line_id) {return "arrow_" + t + "_" + line_id + "_" + lab;}

function make_arrow_line(group, line_id, lab, xo, yo, xi, yi)
{	
	var did = Math.sqrt(distsqr(xo, yo, xi, yi));
	var xd = dot_radius*(xo - xi)/did;
	var yd = dot_radius*(yo - yi)/did;
		
	var ta = document.createElementNS("http://www.w3.org/2000/svg", "line");
	ta.x1.baseVal.value = xi;
	ta.y1.baseVal.value = yi;
	ta.x2.baseVal.value = xi + 2*xd - yd;
	ta.y2.baseVal.value = yi + 2*yd + xd;
	ta.setAttribute('style', 'stroke:black; fill:none; stroke-width:2');
	ta.setAttribute("id", arrow_l_id("a", lab, line_id));
	group.appendChild(ta);
	
	var tb = document.createElementNS("http://www.w3.org/2000/svg", "line");
	tb.x1.baseVal.value = xi;
	tb.y1.baseVal.value = yi;
	tb.x2.baseVal.value = xi + 2*xd + yd;
	tb.y2.baseVal.value = yi + 2*yd - xd;
	tb.setAttribute('style', 'stroke:black; fill:none; stroke-width:2');	
	tb.setAttribute("id", arrow_l_id("b", lab, line_id));
	group.appendChild(tb);
}

function make_arrows_both(line_id, canvas_id)
{
	var ll = document.getElementById(line_id);
	var xi = ll.x1.baseVal.value;
	var yi = ll.y1.baseVal.value;
	var xo = ll.x2.baseVal.value;
	var yo = ll.y2.baseVal.value;
	
	var group = document.createElementNS("http://www.w3.org/2000/svg", "group");
	group.setAttribute("id", "g__arrows_" + line_id);
	var canvas = document.getElementById(canvas_id);
	canvas.appendChild(group);
	
	make_arrow_line(group, line_id, "one", xo, yo, xi, yi);
	make_arrow_line(group, line_id, "other", xi, yi, xo, yo);
}




function adjust_arrow_line(line_id, lab, xo, yo, xi, yi)
{
	var did = Math.sqrt(distsqr(xo, yo, xi, yi));
	var xd = dot_radius*(xo - xi)/did;
	var yd = dot_radius*(yo - yi)/did;

	var ta = document.getElementById(arrow_l_id("a", lab, line_id));
	ta.x1.baseVal.value = xi;
	ta.y1.baseVal.value = yi;
	ta.x2.baseVal.value = xi + 2*xd - yd;
	ta.y2.baseVal.value = yi + 2*yd + xd;
	
	var tb = document.getElementById(arrow_l_id("b", lab, line_id));
	tb.x1.baseVal.value = xi;
	tb.y1.baseVal.value = yi;
	tb.x2.baseVal.value = xi + 2*xd + yd;
	tb.y2.baseVal.value = yi + 2*yd - xd;
}


function adjust_arrows_both(line_id)
{
	var ll = document.getElementById(line_id);
	var xi = ll.x1.baseVal.value;
	var yi = ll.y1.baseVal.value;
	var xo = ll.x2.baseVal.value;
	var yo = ll.y2.baseVal.value;
	
//	var	go =	document.getElementById("g__arrows_" + line_id);
//	var	gid	= go.ownerSVGElement.suspendRedraw(1000);
	
	adjust_arrow_line(line_id, "one", xo, yo, xi, yi);
	adjust_arrow_line(line_id, "other", xi, yi, xo, yo);
	
//	go.ownerSVGElement.unsuspendRedraw(gid);
//	go.ownerSVGElement.forceRedraw();
}










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
		
//	var group = document.getElementById("canvas_regression3");
//	var gid = group.ownerSVGElement.suspendRedraw(1000);
	
	if (num_iters >= max_iters) {
//		group.ownerSVGElement.unsuspendRedraw(gid);
		return 1;
	}
	
	one_step_subgradient();
	
//	group.ownerSVGElement.unsuspendRedraw(gid);
	return 0;
}

