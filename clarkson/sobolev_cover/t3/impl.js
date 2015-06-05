

function rand_uniform() {return 2*Math.random() - 1;}
function norm2(x, y) { return x*x + y*y;}
function norm(x,y) {return Math.sqrt(x*x + y*y);}
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







function distsqr(jx, jy, ix, iy)
{
	return (ix-jx)*(ix-jx) + (iy-jy)*(iy-jy);
}

var enet_biotope_rad;
var enet_simple, enet_biotope, enet_hyperbolic, cur_enet;


function dist_biotope(jx, jy, ix, iy)
{
	jx -= enet_biotope_rad; jy -= enet_biotope_rad;
	ix -= enet_biotope_rad; iy -= enet_biotope_rad;
	
	var d = Math.sqrt(distsqr(jx, jy, ix, iy));
	var distj = jx*jx + jy*jy;
	var disti = ix*ix + iy*iy;
	return 0.01*d + 2*d/(d+ Math.sqrt(distj) + Math.sqrt(disti)- 0.1);
}







var mp_poly1 = [
 254.14971,435.04324, 
 313.90498,385.86218,
 388.50000,518.86218,
 245.90498,557.37272,
 254.14971,435.04324
];

var mp_poly2 = [
 410.62280,483.85442,
 412.95671,427.28588, 
 439.95671,414.86218, 
 524.95671,418.86218, 
 577.50000,492.33971,
 538.95671,546.86218, 
 456.95671,544.86218, 
 410.62280,483.97131
];

var mp_poly3 = [
 292.94931,598.85355, 
 388.50000,569.86218,
 443.50000,683.70637, 
 326.50000,685.82769, 
 292.94931,598.85355
];

function inside(x, y, p)
{
	var c = 0;
	for (var i=0; i<p.length/2-1; i++) {
		var ii = 2*i;
		var pix = p[ii];
		var piy = p[ii+1];
		var piix = p[ii+2];
		var piiy = p[ii+3];
		
		if ((pix - x) < (piy - y)*(pix - piix)/(piy-piiy))
			continue;
		if (y >= piy && y<piiy)
			c--;
		else if (y >= piiy && y<piy)
			c++;
	}
	
	return c!=0;
}

function inside_polys(x, y)
{
	return inside(x,y,mp_poly1) || inside(x,y,mp_poly2) || inside(x,y,mp_poly3);
}


function min(a, b) {if (a<b) return a; return b;}
function max(a, b) {if (a<b) return b; return a;}

function dist2edge(x, y, x1, y1, x2, y2)
{
	var dx = x2-x1;
	var dy = y2-y1;
	
	var m = dy/dx; // assume dx !=0 for this poly!!
	var mul = 1 + m*m;
	var len = Math.sqrt(dx*dx + dy*dy);
	
	var nx = dy/len;
	var ny = -dx/len;
	
	var px = x - x1;
	var py = y - y1;
	
	var dot = px*nx + py*ny;
	px -= dot*nx;
	py -= dot*ny;
	
	var xl, xh;
	if (x1<x2) {xl = x1; xh = x2} else {xl = x2; xh = x1;}
	
	if (px > xl && px <xh)
		return dot;
		
	var pp = 0.0;
	if (px > xh)
		pp = px - xh;
	else
		pp = xl - px;
	return Math.sqrt(dot*dot + mul*pp*pp);
	
}


function dist2poly(x, y, p)
{
	var d = 1e10;
	
	for (var i=0; i<p.length/2-1; i++) {
		var ii = 2*i;
		var dd = dist2edge(x, y, p[ii], p[ii+1], p[ii+2], p[ii+3]);
		if (dd<d)
			d = dd;
	}
	return d;
	
}

function dist2polys(x, y)
{
	var d1 = dist2poly(x,y, mp_poly1);
	var d2 = dist2poly(x,y, mp_poly2);
	var d3 = dist2poly(x,y, mp_poly3);
	
	var d = d1;
	if (d>d2)
		d = d2;
	if (d>d3)
		d = d3;
		
	return d;
}













var enet_hyperbolic_rad;

var last_jx=-10, last_jy=-10, last_px=0, last_py=0, good_last = false;

function dist_hyperbolic(jx, jy, ix, iy)
{
	var px, py;
	var did_init = false;
	
	if (jx<=last_jx+1 && jy <= last_jy+1 && good_last) {
		px = last_px;
		py = last_py;
		did_init = true;
	}
	last_jx = jx;
	last_jy = jy;
	good_last = false;
	
	jx -= enet_hyperbolic_rad; jy -= enet_hyperbolic_rad;
	ix -= enet_hyperbolic_rad; iy -= enet_hyperbolic_rad;
	
	jx /= enet_hyperbolic_rad; jy /= enet_hyperbolic_rad;
	ix /= enet_hyperbolic_rad; iy /= enet_hyperbolic_rad;
	
//	alert("jx=" + jx + " jy=" + jy + " ix=" + ix + " iy=" + iy);
	
	var d = Math.sqrt(distsqr(jx, jy, ix, iy));
	var ddj = norm(jx, jy);
	var ddi = norm(ix, iy);
	
//	alert("dds= " + ddi + " " + ddj);
	
	if (ddj>0.999 || ddi>0.999)
		return 1.0;
		
	if (d/(1-ddj) < 0.01) {
		return d/(1-ddj);
	}
	
	if (!did_init) {
		px=jx/ddj;
		py=jy/ddj;
	}
	
	var err = 1.0, nj, ni;
	var num_its = 0;
	
	while (err > 0.01 && num_its < 20) {
		num_its += 1;
		nj = Math.sqrt(distsqr(jx, jy, px, py));
		ni = Math.sqrt(distsqr(ix, iy, px, py));
		
		if (nj==0.0 || ni==0.0)
			alert("oops1");
			
		var npx = jx/nj + ix/ni;
		var npy = jy/nj + iy/ni;
		var n = norm(npx, npy);
		
		if (n==0.0)
			alert("oops");
		npx /= n;
		npy /= n;
		err = distsqr(npx, npy, px, py);
//
		px = npx; py = npy;
	}
	
	if (num_its >= 20)
		alert(err + " " + nj + " " + ni + " " + px + " " + py + " " + npx + " " + npy);
	
	
	last_px = px; last_py = py; good_last = true;
	
//	alert("nj=" + nj + " ni=" + ni);
	return 3*d + 2*d/(d + nj + ni);
}




var dot_rad = 5;

function createCircleinCirc(i, C,x,y,fill_o)
{
	var cx = C.cx.baseVal.value;
	var cy = C.cy.baseVal.value;
	var r = C.r.baseVal.value;
		
	x = x*r + cx;
	y = y*r + cy;

	var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute( 'cx', x );
	circle.setAttribute( 'cy', y );
	circle.setAttribute( 'r', dot_rad);
	circle.setAttribute("style", "stroke: none; fill:red; fill-opacity:" + fill_o + ";");

	last_circle = i;
	return circle;
}





var cp_x, cp_y;
function update_center(T)
{
	cp_x = T.getAttribute("x1")*1.0;
	cp_y = T.getAttribute("y1")*1.0;
}


var max_enet_size = 150;

function inside_circ(x, y, m, cc, rad)
{
	return (distsqr(x, y, cc, cc) < rad*rad);
}

function ok_for_mp(x,y,m, cc, rad)
{
	return inside_circ(x,y,m,cc,rad) && !inside_polys(x,y);
}



//class definition
function enet_model(big_circ_name, my_dist_func, m, dot_radius, canvas_name, dist_label_name, control_point_name, fill_opacity, ok_func)
{
  // initialize the member variables for this instance
  this.big_circ = document.getElementById(big_circ_name);
  this.canvas = document.getElementById(canvas_name);
  this.control_point_name = control_point_name;
  this.dist_label_name = dist_label_name;
  this.dist_func = my_dist_func;
  this.fill_opacity = fill_opacity;

  this.dot_radius = dot_radius;
  this.rad = (m-1)/2;
  this.cc = this.rad;
  this.m = m;
  this.enet_size = 0;
  this.group = document.createElementNS("http://www.w3.org/2000/svg", "group");
  this.group.setAttribute("id", big_circ_name+"group");
  this.group.setAttribute("class", "circ_g");
  
  this.cx = this.big_circ.cx.baseVal.value;
  this.cy = this.big_circ.cy.baseVal.value;
  this.r = this.big_circ.r.baseVal.value;
 
  this.canvas.appendChild(this.group);

  this.dist_array = new Array(m);
  for (var i=0; i<m; i++)
     this.dist_array[i] = new Array(m);


	for (var i = 0; i < max_enet_size; i++) {
		var c = createCircleinCirc(i, this.big_circ, 0, 0, this.fill_opacity);
		c.r.baseVal.value = dot_radius;
		c.id = this.big_circ.id + "circle_" + i; //as in circ_id
		c.style.display = "none";
		this.group.appendChild(c);
	}

	for (var i=0; i<this.m; i++) {
		for (var j=0; j<this.m; j++)
			if (!ok_func(i, j, this.m, this.cc, this.rad))
				this.dist_array[i][j] = 0;
			else
				this.dist_array[i][j] = 1e6;
	}
  

	// initialize the member function references 
	// for the class prototype
	if (typeof(_enet_model_prototype_called) == 'undefined')
	{
		_enet_model_prototype_called = true;
		enet_model.prototype.dist_array_init = dist_array_init;
		enet_model.prototype.one_step = my_one_step;
		enet_model.prototype.circ_id = circ_id;
		enet_model.prototype.update_dist_label = update_dist_label;
		enet_model.prototype.re_initter = re_initter;     
		enet_model.prototype.set_circle = set_circle;
	}
 
	function update_dist_label(dist)
	{
		if (this.dist_label_name=="")
			return;
		dist_label = document.getElementById(this.dist_label_name);
		var foo = document.createTextNode(
			"max dist = " + Math.floor(dist*100+0.5)/100
		);
		dist_label.replaceChild(foo, dist_label.firstChild);
	}

	function circ_id(i) {return this.big_circ.id + "circle_" + i ;}

	function dist_array_init()
	{
		for (var i=0; i<this.m; i++) {
			for (var j=0; j<this.m; j++)
				if (distsqr(i, j, this.cc, this.cc) >= this.rad*this.rad)
					this.dist_array[i][j] = 0;
				else
					this.dist_array[i][j] = 1e6;
		}
	}
	
	function set_circle(x, y, make_blue)
	{
		with(this) {
			var c = document.getElementById(circ_id(enet_size));
			c.cx.baseVal.value = (x-cc)*r/rad + cx;
			c.cy.baseVal.value = (y-cc)*r/rad + cy;
			if (make_blue)
				c.setAttribute("style", "fill:blue; stroke: none; fill-opacity:" + fill_opacity + ";");
			else
				c.setAttribute("style", "fill:red; stroke: none; fill-opacity:" + fill_opacity + ";");
			c.style.display = "";
			if (enet_size>0 && make_blue) {
				c = document.getElementById(circ_id(enet_size-1));
				c.setAttribute("style", "fill:red; stroke: none; fill-opacity:" + fill_opacity + ";");
			}
		}
	}

	function my_one_step()
	{
		if (this.enet_size >= max_enet_size)
			return 1;
					
		if (this.enet_size==0) {
 			var x,y, r2 = this.rad*this.rad, s= 2*r2;
 			while (s>r2) {
 				x = rand_uniform()*this.rad + this.cc;
 				y = rand_uniform()*this.rad + this.cc;
 				s = norm2(x-cur_enet.cc, y-cur_enet.cc);
 			}

			this.set_circle(x, y, true);
						
			for (var i=0; i<this.m; i++) {
				for (var j=0; j<this.m; j++)
					if (this.dist_array[i][j]>0)
						this.dist_array[i][j] = this.dist_func(i,j, x, y);
			}
			this.enet_size = 1;
			return 0;
		}
		var max_i, max_j, max_dist = 0;
		for (var i=0; i<this.m; i++) {
			for (var j=0; j<this.m; j++) {
				if (max_dist < this.dist_array[i][j]) {
					max_dist = this.dist_array[i][j];
					max_i = i;
					max_j = j;
				}
			}
		}
		
		
//		this.update_dist_label(Math.sqrt(max_dist)/this.rad); 
		this.set_circle(max_i, max_j, true);
							
		for (var i=0; i<this.m; i++) {
			for (var j=0; j<this.m; j++) {
					var dist = this.dist_func(i, j, max_i, max_j);
					if (dist < this.dist_array[i][j]) {
						this.dist_array[i][j] = dist;
				}
			}
		}
		this.enet_size += 1;
		return 0;
	}
	
	function re_initter()
	{
		for (var i=0; i<this.enet_size; i++) {
			var c = document.getElementById(this.circ_id(i));
			c.style.display = "none";
		}
		this.dist_array_init();
		this.enet_size = 0;
	}

}


var graded_triang_bound_enet = 248;
var graded_triang_bound_all = graded_triang_coords.length/2.0;

function graded_t(x) {return x*0.74 + 5;} //{return x*0.584+5;}

function graded_draw_initial_enet()
{
	var gc = document.getElementById("graded_canvas");
	var gc_ctx = gc.getContext('2d');
	gc_ctx.fillStyle = "red";
	gc_ctx.strokeStyle = "red";
	for (var i=0; i<graded_triang_bound_enet; i++) {
		gc_ctx.beginPath();
		gc_ctx.arc(graded_t(graded_triang_coords[2*i]), graded_t(graded_triang_coords[2*i+1]), 5, 0, 2*Math.PI, true);
		gc_ctx.fill();
	}
}

function draw_graded_path(coords)
{
	var gc = document.getElementById("graded_canvas");
	var gc_ctx = gc.getContext('2d');
	gc_ctx.fillStyle = "black";
	gc_ctx.strokeStyle = "black";
	gc_ctx.lineWidth = 4;
	gc_ctx.beginPath();
	gc_ctx.moveTo(graded_t(coords[0]), graded_t(coords[1]));
	for (var i=0; i<coords.length/2; i++) {
		gc_ctx.lineTo(graded_t(coords[2*i]), graded_t(coords[2*i+1]));
	}
	gc_ctx.closePath();
	gc_ctx.stroke();
}

function graded_draw_initial()
{
	draw_graded_path(graded_initial_box);
	draw_graded_path(graded_initial_graph);
}




function draw_graded_edges()
{
	var gc = document.getElementById("graded_canvas");
	var gc_ctx = gc.getContext('2d');
	gc_ctx.fillStyle = "black";
	gc_ctx.strokeStyle = "black";
	gc_ctx.lineWidth = 4;
	for (var i=0; i<graded_triang_edges.length/2; i++) {
        var j = graded_triang_edges[2*i];
        var k = graded_triang_edges[2*i+1];
		gc_ctx.beginPath();
		gc_ctx.moveTo(graded_t(graded_triang_coords[2*j]), graded_t(graded_triang_coords[2*j+1]));
		gc_ctx.lineTo(graded_t(graded_triang_coords[2*k]), graded_t(graded_triang_coords[2*k+1]));
		gc_ctx.stroke();
	}
}


function pic_init()
{

//	draw_title_canvas();
//	draw_test_canvas();
	
//	graded_draw_initial();
	
	enet_simple = new enet_model("enet_big_circ", distsqr,
		51, 5, "canvas_enet", "max_dist_label", "first_enet_point", 1, inside_circ);
		
//	enet_biotope = new enet_model("enet_big_circ_biotope", dist_biotope,
//		71, 10, "canvas_enet_biotope", "", "first_enet_point_biotope", 0.2, inside_circ);
		
//	enet_hyperbolic = new enet_model("enet_big_circ_hyperbolic", dist_hyperbolic,
//		71, 10, "canvas_enet_hyperbolic", "", "first_enet_point_hyperbolic", 0.2, inside_circ);
		
//	enet_mp = new enet_model("enet_big_circ_mp", dist_mp,
//		71, 10, "canvas_enet_mp", "", "first_enet_point_mp", 0.2, ok_for_mp);
		

	cur_enet = enet_simple;
//	enet_biotope_rad = enet_biotope.rad;
//	enet_hyperbolic_rad = enet_hyperbolic.rad;
	
	var ets = new Array(""); //, "_biotope", "_hyperbolic", "_graded");
	
	for (var i=0; i<ets.length;i++) {
		var c=document.getElementById("circ_go"+ets[i]);
		c.addEventListener("mousedown", go_mousedown, false);
		c = document.getElementById("circ_step"+ets[i]);	
		c.addEventListener("mousedown", step_mousedown, false);
		c = document.getElementById("circ_stop"+ets[i]);	
		c.addEventListener("mousedown", stop_mousedown, false);
	}
}


		
		


function make_random()
{
	re_init();
	
	cur_enet.enet_size = 0;
	for (var i=0; i<max_enet_size; i++) {
 			var x,y, r2 = cur_enet.rad*cur_enet.rad, s= 2*r2;
 			while (s>r2) {
 				x = rand_uniform()*cur_enet.rad + cur_enet.cc;
 				y = rand_uniform()*cur_enet.rad + cur_enet.cc;
 				s = norm2(x-cur_enet.cc, y-cur_enet.cc);
 			}
 			cur_enet.set_circle(x, y, false);
 			cur_enet.enet_size = i+1;
 	}
}

function draw_title_canvas()
{
	var points_x = Array(200);
	var points_y = Array(points_x.length);
	var dists = Array(points_x.length);
	var i;
	var rc = 150;
	var m = 40;
	
	for (i=0; i<points_x.length; i++) {
 		var x,y, r2 = rc*rc, s= 2*r2;
 		while (s>r2) {
 			x = Math.floor(rand_uniform()*rc + rc);
 			y = Math.floor(rand_uniform()*rc + rc);
 			s = norm2(x-rc, y-rc);
 		}
 		points_x[i] = x;
 		points_y[i] = y;
 	}
 	
 	
 	for (i=1; i<m; i++) {
 	
 		for (var j=i; j<points_x.length; j++) {
 			var dist = distsqr(points_x[i-1], points_y[i-1], points_x[j], points_y[j]);
 			if (dist < dists[j])
 				dists[j] = dist;
 		}
 		
 		var max_dist = 0;
 		var max_j = i;
 		for (var j=i; j<points_x.length; j++) {
 			if (dists[j] > max_dist) {
 				max_j = j;
 				max_dist = dists[j];
 			}
 		}
 		
 		var tx = points_x[max_j], ty = points_y[max_j];
 		points_x[max_j] = points_x[i];
 		points_y[max_j] = points_y[i];
 		points_x[i] = tx;
 		points_y[i] = ty;
 	}
 	
 	
	var gc = document.getElementById("title_canvas");
	var gc_ctx = gc.getContext('2d');
	gc_ctx.fillStyle = "red";
	gc_ctx.strokeStyle = "red";
 	for (i=0; i<points_x.length; i++) {
 		if (i>=m) {
 			gc_ctx.strokeStyle = gc_ctx.fillStyle = "blue";
		}
		gc_ctx.beginPath();
		gc_ctx.arc(points_x[i], points_y[i], 5, 0, 2*Math.PI, true);
		gc_ctx.fill();
	}
}

function draw_test_canvas()
{
	var gc = document.getElementById("test_canvas");
	var gc_ctx = gc.getContext('2d');
	gc_ctx.fillStyle = "black";
	gc_ctx.strokeStyle = "black";
	gc_ctx.lineWidth = 4;

	gc_ctx.beginPath();
	gc_ctx.moveTo(0,0);
	gc_ctx.lineTo(0, 764);
	gc_ctx.lineTo(1020, 764);
	gc_ctx.lineTo(1020, 0);
	gc_ctx.closePath();
	gc_ctx.stroke();
}






var graded_top = graded_triang_bound_enet;

function graded_re_init()
{
	graded_top = graded_triang_bound_enet;
	
	var gc = document.getElementById("graded_canvas");
	var gc_ctx = gc.getContext('2d');
	gc_ctx.clearRect(0,0,750, 600);
	graded_draw_initial();
}


function one_step_graded()
{
	if (graded_top >= graded_triang_bound_all)
		return 1;

	var gc = document.getElementById("graded_canvas");
	var gc_ctx = gc.getContext('2d');
	gc_ctx.strokeStyle = gc_ctx.fillStyle = "blue";
	gc_ctx.beginPath();
	gc_ctx.arc(graded_t(graded_triang_coords[2*graded_top]), graded_t(graded_triang_coords[2*graded_top+1]), 5, 0, 2*Math.PI, true);
	gc_ctx.fill();
	
	graded_top += 1;
	return 0;
}


var doing_circ_enet = 1;

function set_anim(v)
{
	if (v=="circ_go" || v=="circ_step" || v=="circ_stop")
		cur_enet = enet_simple;
	else if (v=="circ_go_biotope" || v=="circ_step_biotope" || v=="circ_stop_biotope")
		cur_enet = enet_biotope;
	else if (v=="circ_go_hyperbolic" || v=="circ_step_hyperbolic" || v=="circ_stop_hyperbolic")
		cur_enet = enet_hyperbolic;
		
	doing_circ_enet = 1;
	
	if (v=="circ_go_graded" || v=="circ_step_graded" || v=="circ_stop_graded")
		doing_circ_enet = 0;
}


function go_mousedown(evt)  {set_anim(this.id); start_animation(); }
function step_mousedown(evt){set_anim(this.id); one_step();}	
function stop_mousedown(evt){set_anim(this.id); stop_animation(false);}

function re_init()
{
	need_reset = 0;
	if (doing_circ_enet)
		cur_enet.re_initter();
	else
		graded_re_init();
}

var anim_running = 0;
var adding_point = 1;
var need_reset = 0;
var got_to_done = 0;

function start_animation()
{
	if (need_reset)
		re_init();
		
	if (anim_running) {
		clearTimeout(anim_running);
		anim_running = 0;
		var stop=0;
		while (!one_step() && stop++ < 600) {}
		return;	
	}
	
	animate();
}

function stop_animation(paging)
{
	if (!anim_running && !paging) {
		re_init();
		return;
	}
	clearTimeout(anim_running);
	anim_running = 0;
	if (!paging)
		re_init();
}

function animate()
{
	if (!one_step())
		anim_running = setTimeout("animate()",20);
	else
		need_reset = 1;
}

var step = 0;
var inserting = 0;
var num_iters = 0;
var max_iters = 10;

function one_step()
{
	if (anim_running) {
		clearTimeout(anim_running);
		anim_running = 0;
	}

	if (need_reset)
		re_init();
		
	if (doing_circ_enet)
		return cur_enet.one_step();
	else
		return one_step_graded();
	
	return 0;
}







// http://www.brothercake.com/
//onload function (replaces the onload="translate()" in the <body> tag)
function generic()
{
  pic_init();
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
