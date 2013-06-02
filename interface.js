
var interface = {
					selected:[],
					mousestart:{x:0,y:0},
					mousedown:function(event)
					{
						interface.mousestart.x = screen.cursor.x;
						interface.mousestart.y = screen.cursor.y;
					},
					mouseup:function(event)
					{
						$(".unitmenu").remove();						

						//There was a drag
						if(distance(interface.mousestart,screen.cursor) > 16)
						{
							if(interface.selectbox()) return true;
						}
						else
						{
							if(interface.clickmenu()) return true;
							if(interface.moveorder()) return true;
						}

					},
					keydown:function(event)
					{

						//var smoke = new effect(anim.fire);
						//smoke.pos = cloneOf(world.cursor);
					
					},
					keyup:function(event)
					{
					},
					
					selectbox:function()
					{
						if(!screen.key[16])
							interface.selected = [];
						
						var mousestart = world.fromscreen(interface.mousestart);

						// swap rect if the drag is in the opposite direction
						var rect = [{x:Math.min(mousestart.x,world.cursor.x),y:Math.min(mousestart.y,world.cursor.y)},
									{x:Math.max(mousestart.x,world.cursor.x),y:Math.max(mousestart.y,world.cursor.y)}];

						var ailist = ai_quad.query(rect[0],rect[1]);
						if(ailist.length == 0) return;
						for(var i in ailist)
						{
							if(hitrect(rect,ai[ailist[i]].pos))
							{
								if(	interface.selected.indexOf(ailist[i]) == -1 )
									interface.selected.push( parseInt(ailist[i]) );
							}
						}
					},
					
					moveorder: function()
					{
						units = interface.selected.length;
						if(units > 0)
						{
							if(ai[interface.selected[0]] != null)
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
						}
					},

					clickmenu: function()
					{
						units = interface.selected.length;
						if(units > 0)
						{
							for(var i=0; i < units; i++)
							{
								if(ai[interface.selected[i]] != null && ai[interface.selected[i]].hit(world.cursor))
								{
									menuon(interface.selected[i]);
									return true;
								}
							}
						}
						else
						{
							var ailist = ai_quad.query(world.cursor,1);
							if(ailist.length == 0) return;
							for(var i in ailist)
							{
								if(ai[ailist[i]].hit(world.cursor))
								{
									menuon(ailist[i]);
									return true;
								}
							}
						}					
					}


				};


function menuon(id)
{

	if( ai[id].menu == undefined || ai[id].menu.length == 0 ) return false;
	
	var point = screen.fromworld(ai[id].pos);	
	
	var content = "<div class='unitmenu' style='top:"+point.y+"px;left:"+point.x+"px;'>"+
	"<div class='head'>Mothership<div>"+
	"<div class='controls'><ul>";
	
	for(var i in ai[id].menu)
	{
		var menuitem = ai[id].menu[i];
		content += "<li class='"+menuitem.c+"' onClick=\"ai["+id+"].order(\'"+menuitem.o+"\')\">&nbsp;</li>";
	}

	content += "</ul><div>"+
	"<div style='clear:both;'></div>"+	
	"</div>";

	overlay.append(content);
}


function interface_prerender()
{
	if(screen.mouse[0] && distance(interface.mousestart,screen.cursor) > 16)
	{
		buffer.lineWidth=1;
		buffer.strokeStyle="#75CEDE";
		buffer.strokeRect(interface.mousestart.x,interface.mousestart.y,
						  screen.cursor.x-interface.mousestart.x, screen.cursor.y-interface.mousestart.y);	
	}

	if(screen.key[38]) world.offset.delta.y += 1*rtimer.delta;
	if(screen.key[40]) world.offset.delta.y -= 1*rtimer.delta;
	if(screen.key[37]) world.offset.delta.x += 1*rtimer.delta;
	if(screen.key[39]) world.offset.delta.x -= 1*rtimer.delta;

	world.offset.delta.x = clip(world.offset.delta.x,-1,1);
	world.offset.delta.y = clip(world.offset.delta.y,-1,1);

	world.offset.x += world.offset.delta.x;
	world.offset.y += world.offset.delta.y;
	world.offset.delta.x *= 1-6*rtimer.delta;
	world.offset.delta.y *= 1-6*rtimer.delta;
}
