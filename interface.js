
var interface = {selected:[]
				};


function interface_prerender()
{

	if(screen.key[38]) world.offset.delta.y += 0.5*rtimer.delta;
	if(screen.key[40]) world.offset.delta.y -= 0.5*rtimer.delta;
	if(screen.key[37]) world.offset.delta.x += 0.5*rtimer.delta;
	if(screen.key[39]) world.offset.delta.x -= 0.5*rtimer.delta;

	world.offset.delta.x = clip(world.offset.delta.x,-1,1);
	world.offset.delta.y = clip(world.offset.delta.y,-1,1);

	world.offset.x += world.offset.delta.x;
	world.offset.y += world.offset.delta.y;
	world.offset.delta.x *= 0.9;
	world.offset.delta.y *= 0.9;
}


$(document).ready(function()
{
	$("#backbuffer").click(function(event){

		if(event.button == 0)
		{
			if(!screen.key[16])
				interface.selected = [];

			var ailist = ai_quad.query(world.cursor,1);
			if(ailist.length == 0) return;
			for(var i in ailist)
			{
				if(ai[ailist[i]].hit(world.cursor))
				{
					interface.selected.push(parseInt(ailist[i]));
				}
			}
		}

		overlay.html(JSON.stringify(ailist)+" "+JSON.stringify(interface.selected))

		return false;
	});

	$("#backbuffer").mousemove(function(event)
	{
		var rect = canvas.getBoundingClientRect();
		screen.cursor.x = event.clientX - rect.left;
		screen.cursor.y = event.clientY - rect.top;
		world.cursor.x = (screen.cursor.x/world.grid)-world.offset.x;
		world.cursor.y = (screen.cursor.y/world.grid)-world.offset.y;
	});

	$('#backbuffer').bind('contextmenu', function(event) {

		units = interface.selected.length;
		if(units > 0)
		{
			ai[interface.selected[0]].order("move",world.cursor);
			for(var i=1; i < units; i++)
			{
				coords = rotatePoints(0,-0.4,(360/(units-1)) * (i-1));
				coords.x += world.cursor.x;
				coords.y += world.cursor.y;
				ai[interface.selected[i]].order("move",coords);
			}
		}

	   return false;
	});

	$(document).keydown(function(event){
		screen.key[event.keyCode]=true;
		return false;
	});

	$(document).keyup(function(event){
		screen.key[event.keyCode]=false;

		if(event.keyCode == 82)
		{
			light = new ship("rocket",20);
			light.pos.x = world.cursor.x;
			light.pos.y = world.cursor.y;
			light.rot = Math.random()*360;
			light.order("move",world.cursor);
		}

		if(event.keyCode == 83)
		{
			light = new ship("light",21);
			light.pos.x = world.cursor.x;
			light.pos.y = world.cursor.y;
			light.rot = Math.random()*360;
			light.order("move",world.cursor);
		}

		return false;
	});


});