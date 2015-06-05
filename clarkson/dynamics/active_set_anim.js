
var anim_running = 0;
var need_reset = 0;
var NUM_POINTS = 5;
var spacing = 650/NUM_POINTS;
var step = 0;
var num_lines = 0;
var status = 0; //not in active set
var since_td = 0;

function display_val(y)
{
	y += 505/2;
	if (y>505) y = 505;
	if (y<0) y = 0;
	return y;
}

function re_init()
{
}

function makeLine(x0, y0, x1, y1)
{
	var lin = document.createElementNS("http://www.w3.org/2000/svg", "line");
	lin.x1.baseVal.value = x0;
	lin.y1.baseVal.value = y0;
	lin.x2.baseVal.value = x1;
	lin.y2.baseVal.value= y1;
	lin.setAttribute('style', 'stroke:black; fill:none; stroke-width:2');
        var canvas = document.getElementById("canvas");
	canvas.appendChild(lin);
	return lin;
}


function anim_init()
{			
				
	var canvas = document.getElementById("canvas");
	var group = document.getElementById("all_lines"); //("http://www.w3.org/2000/svg", "group");
	canvas.appendChild(group);
	
	var c=document.getElementById("circ_go");
	c.addEventListener("mousedown", go_mousedown, false);
	c = document.getElementById("circ_step");	
	c.addEventListener("mousedown", step_mousedown, false);
	c = document.getElementById("circ_stop");	
	c.addEventListener("mousedown", stop_mousedown, false);
}

function go_mousedown(evt)
{
	start_animation();
}

function step_mousedown(evt)
{
	one_step();
}

function stop_mousedown(evt)
{
	stop_animation();
}


function start_animation()
{
	if (need_reset) {
		re_init();
	}
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

function one_step()
{

	var lina = document.getElementById('lines_1');
	
	step -= spacing;
	
	var group = document.getElementById("all_lines");

	var x0, y0;
	if (num_lines==0) {
		x0 = 650.0;
		y0 = 0.0;
	} else {
		var linl = document.getElementById('lines_'+num_lines);
		x0 = linl.x2.baseVal.value;
		y0 = linl.y2.baseVal.value - 505/2;
	}
	var x1 = x0 + spacing;
	var y1 = .866025403784*y0 + 0.5*rand_gauss(150);
	y0_disp = display_val(y0);
	y1_disp = display_val(y1);
	
	var lin = makeLine(x0, y0_disp, x1, y1_disp);
	num_lines++;
	lin.setAttribute('id', 'lines_'+num_lines);
	
	
	group.appendChild(lin);
	
	var gid = group.ownerSVGElement.suspendRedraw(1000);
	
	group.setAttribute('transform', 'translate (' + step + ')');
	
	group.ownerSVGElement.unsuspendRedraw(gid);

	var ind = num_lines - Math.floor(650/spacing/2);
	if (ind <= 0)
		return;
				
	var linc = document.getElementById('lines_'+ind);
			
	var cur_stat_circ = document.getElementById("circ_cur_status_c");			
	
	var since_td_0 = since_td;
	
	if (linc.y1.baseVal.value < 200 ) {
		cur_stat_circ.setAttribute('style', 'fill:lightgreen');
		status = 1;
		since_td = 0;
	} else if (linc.y1.baseVal.value < 300) {
		cur_stat_circ.setAttribute('style', 'fill:yellow');
		since_td = 0;
	} else {
		cur_stat_circ.setAttribute('style', 'fill:red');
		since_td++;
		if (since_td > 7)
			status = 0;
	}
	
	if (since_td_0!=since_td) {
		var since_td_lab = document.getElementById("since_td_label");
		var foo = document.createTextNode("Since >T_DROP: " + since_td);
		since_td_lab.replaceChild(foo, since_td_lab.firstChild);
	}
	
	var stat_circ = document.getElementById("circ_status_c");
	if (status==0)
		stat_circ.setAttribute('style', 'fill:red;');
	else
		stat_circ.setAttribute('style', 'fill:lightgreen');	
      

}


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
