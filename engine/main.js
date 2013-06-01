//Main function 
$(document).ready(function()
{
	canvas = document.getElementById('backbuffer');
	buffer = canvas.getContext('2d');
	resizeCanvas();
	
	overlay = $("#overlay");

	screen.cursor = {x:0.0,y:0.0};

	world.size.x = 32;
	world.size.y = 32;

	world.offset.x = world.view.x/2;
	world.offset.y = world.view.y/2;

	qtcount = 0;
	ai_quad = new QuadTree({x:-world.size.x,y:-world.size.y},{x:world.size.x,y:world.size.y});

	setInterval(function(){
		if(rtimer.running) return;
		rtimer.running = true;

		rtimer.update();
		buffer.clearRect(0,0,screen.width,screen.height);
		interface_prerender();
		tileset.render();

		for(var i in ai)
		{
			if(ai[i] != null)
			{
				ai[i].navigate();
				ai[i].adjust();

				if(ai[i] != null)
					ai[i].render();
			}
		}

		var warheadratio = {n:0,r:0};
		for(var i in warheads)
		{
			warheadratio.n++;
			if(warheads[i] != null)
			{
				warheadratio.r++;
				warheads[i].adjust();
				if(warheads[i] != null)
					warheads[i].render();
			}
		}
		if(warheadratio.r == 0 && warheads.length>0) warheads = [];

		var effectratio = {n:0,r:0};
		for(var i in effects)
		{
			effectratio.n++;
			if(effects[i] != null)
			{
				effects[i].render();
				effectratio.r++;
			}
		}
		if(effectratio.r == 0 && effects.length>0) effects = [];

		rtimer.running = false;;

		//ai_quad.render();
	
	},1);

	setInterval(function(){
		for(var i in ai)
		{
			if(ai[i] != null)
				ai[i].think();
		}
	},500);

});