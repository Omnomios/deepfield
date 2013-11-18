define(['ExtraMath','GameState','Network','Game'],function(ExtraMath, GameState, Network,Game){

	var Interface_object = {
					selected:[],
					group:[],
					mousestart:{x:0,y:0},
					mousedown:function(event)
					{
						this.mousestart.x = surface.cursor.x;
						this.mousestart.y = surface.cursor.y;
					},
					mouseup:function(event)
					{
						//There was a drag
						if(ExtraMath.distance(this.mousestart,surface.cursor) > 16)
						{
							if(this.selectbox()) return true;
						}
						else
						{
							if(this.selectpoint()) return true;
							if(this.moveorder()) return true;
						}
						this.updatemenu();

					},
					squad: function(id)
					{
						if(this.group[id] == undefined) this.group[id] = [];

						if(this.selected_group == id && this.selected.length == this.group[id].length && this.selected != [])
						{
							this.find();
							return;
						}

						if(surface.key[17])
							this.group[id] = cloneOf(this.selected);
						else
							this.selected = cloneOf(this.group[id]);

						this.selected_group = id;

						this.updatemenu();
					},
					keydown:function(event)
					{
						if(surface.key[27])
							this.selected = [];

						if(surface.key[48]) this.squad(0);
						if(surface.key[49]) this.squad(1);
						if(surface.key[50]) this.squad(2);
						if(surface.key[51]) this.squad(3);
						if(surface.key[52]) this.squad(4);
						if(surface.key[53]) this.squad(5);
						if(surface.key[54]) this.squad(6);
						if(surface.key[55]) this.squad(7);
						if(surface.key[56]) this.squad(8);
						if(surface.key[57]) this.squad(9);
					},
					keyup:function(event)
					{
					},

					selectbox:function()
					{
						if(!surface.key[16])
							this.selected = [];

						var mousestart = world.coord(this.mousestart);

						// swap rect if the drag is in the opposite direction
						var rect = [{x:Math.min(mousestart.x,world.cursor.x),y:Math.min(mousestart.y,world.cursor.y)},
									{x:Math.max(mousestart.x,world.cursor.x),y:Math.max(mousestart.y,world.cursor.y)}];

						var ailist = quadtree.query(rect[0],rect[1]);

						if(ailist.length == 0) return;
						for(var i in ailist)
						{
							if(ExtraMath.hitrect(rect,GameState.unit[ailist[i].id].pos))
							{
								if(	this.selected.indexOf(ailist[i].id) == -1 )
									this.selected.push( parseInt(ailist[i].id) );
							}
						}
						this.updatemenu();
					},

					selectpoint: function()
					{
						var ailist = quadtree.query(world.cursor,1);
						if(ailist.length == 0) return;
						for(var i in ailist)
						{
							if(GameState.unit[ailist[i].id].hit(world.cursor))
							{
								if(!surface.key[16])
									this.selected = [];
								this.selected.push(parseInt(ailist[i].id));
								this.updatemenu();
								return true;
							}
						}

						return false;
					},

					moveorder: function()
					{
						units = this.selected.length;
						if(units > 0)
						{
							if(GameState.unit[this.selected[0]] != null)
							{
								var packet = {action:'order',type:'move',id:0,data:{x:0,y:0}};

								packet.id = this.selected[0];
								packet.data = world.cursor;
								Network.send(JSON.stringify(packet));

								var step = 0;
								var ang = 370;
								var level = 0;
								for(var i=1; i < units; i++)
								{
									if(ang > 360)
									{
										level++;
										var C = Math.PI*(level*32);
										step = 360 / (C/20);
										ang -= 360;
									}
									ang += step;

									coords = ExtraMath.rotatePoints(0,(-0.5)*level, ang);
									coords.x += world.cursor.x;
									coords.y += world.cursor.y;

									packet.id = this.selected[i];
									packet.data = coords;
									Network.send(JSON.stringify(packet));
								}
							}
						}
					},

					unitorder: function(id,order,data)
					{
						var packet = {action:'order',type:order,data:data,id:id};
						Network.send(JSON.stringify(packet));
					},

					updatemenu: function()
					{
						if(GameState.unit[this.selected[0]] != undefined)
							var unit = GameState.unit[this.selected[0]];

						var unitmenu = surface.overlay.find("#unitmenu");
						var ordermenu = surface.overlay.find("#ordermenu");
						var cargomenu = surface.overlay.find("#cargomenu");

						/*
						if(unit != undefined)
							screenmenu.find("div.info").html(unit.name);
						else
							screenmenu.find("div.info").html("");
						*/

						unitmenu.empty();
						ordermenu.empty();
						cargomenu.empty();

						if(unit == undefined) return;

						var unitgroups = new Array();
						for(var i in this.selected)
						{
							if(GameState.unit[this.selected[i]] == null) continue;
							if(unitgroups[GameState.unit[this.selected[i]].name] == undefined) unitgroups[GameState.unit[this.selected[i]].name] = new Array();
							unitgroups[GameState.unit[this.selected[i]].name].push(GameState.unit[this.selected[i]]) ;
						}

						for(var i in unitgroups)
						{
							unitmenu.append("<li><div>"+unitgroups[i].length+"</div><div>"+i+"</div></li>");
						}

						if( unit.menu == undefined || unit.menu.length == 0 ) return false;
						for(var i in unit.menu)
						{
							var menuitem = unit.menu[i];
							ordermenu.append("<li class='"+menuitem.c+"' onClick=\"Interface.unitorder("+unit.id+",'"+menuitem.o+"\','"+menuitem.d+"\')\">"+menuitem.d+"</li>");
						}

						//overlay.append(content);
					},


					prerender: function()
					{
						if(surface.mouse[0] && ExtraMath.distance(this.mousestart,surface.cursor) > 16)
						{
							surface.buffer.lineWidth=1;
							surface.buffer.strokeStyle="#75CEDE";
							surface.buffer.strokeRect(this.mousestart.x,this.mousestart.y,
														surface.cursor.x-this.mousestart.x, surface.cursor.y-this.mousestart.y);
						}

						if(surface.key[38]) world.offset.delta.y += 10*maintimer.delta;
						if(surface.key[40]) world.offset.delta.y -= 10*maintimer.delta;
						if(surface.key[37]) world.offset.delta.x += 10*maintimer.delta;
						if(surface.key[39]) world.offset.delta.x -= 10*maintimer.delta;

						if(surface.key[36]) this.home();

					},

					home: function()
					{
						//Find mothership
						var ms_id = Game.mothership(GameState,1);
						if(ms_id !== false)
						{
							global.world.offset.x = -GameState.unit[ms_id].pos.x+world.view.x/2;
							global.world.offset.y = -GameState.unit[ms_id].pos.y+world.view.y/2;
						}
					},

					find: function()
					{
						var aabb = [{x:0,y:0},{x:0,y:0}];

						for( i in this.selected )
						{
							var unit = GameState.unit[this.selected[i]];

							if(i == 0)
							{
								aabb[0].x = unit.pos.x;
								aabb[0].y = unit.pos.y;
								aabb[1].x = unit.pos.x;
								aabb[1].y = unit.pos.y;

								continue;
							}

							aabb[0].x = Math.min(unit.pos.x,aabb[0].x);
							aabb[0].y = Math.min(unit.pos.y,aabb[0].y);
							aabb[1].x = Math.max(unit.pos.x,aabb[1].x);
							aabb[1].y = Math.max(unit.pos.y,aabb[1].y);
						}

						global.world.offset.x = -ExtraMath.lerp(aabb[0].x,aabb[1].x,0.5)+world.view.x/2;
						global.world.offset.y = -ExtraMath.lerp(aabb[0].y,aabb[1].y,0.5)+world.view.y/2;

					},

					init: function()
					{
						$("li.menutab").click(function(){

							$(".tabmenu").hide();
							$("li.menutab").removeClass("active");

							var menuclass = $(this).attr('data-item');

							$(this).addClass("active");
							$("div.tabmenu."+menuclass).show();
						});

						$("#backbuffer").mousemove(function(event)
						{
							var rect = surface.canvas.getBoundingClientRect();
							surface.cursor.x = event.clientX - rect.left;
							surface.cursor.y = event.clientY - rect.top;
							world.cursor.x = (surface.cursor.x/world.grid)-world.offset.x;
							world.cursor.y = (surface.cursor.y/world.grid)-world.offset.y;
						});

						$("#backbuffer").mousedown(function(event)
						{
							event.preventDefault();
							surface.mouse[0] = true;
							Interface.mousedown(event);
						});

						$("#backbuffer").mouseup(function(event)
						{
							event.preventDefault();
							surface.mouse[0] = false;
							Interface.mouseup(event);

							$(".tabmenu").hide();
							$("li.menutab").removeClass("active");
						});

						$(document).keydown(function(event){
							event.preventDefault();
							surface.key[event.keyCode]=true;
							Interface.keydown(event);
						});

						$(document).keyup(function(event){
							event.preventDefault();
							surface.key[event.keyCode]=false;
							Interface.keyup(event);
							return false;
						});
					}

				};



	if(global.Interface == undefined)
	{
		global.Interface = Interface_object;
		return global.Interface;
	}

	return global.Interface;

});
