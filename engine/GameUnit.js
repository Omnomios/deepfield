define(['ExtraMath','UnitHardpoint','GameWarhead','ClientEffect','GameSprite','Resource'],function(ExtraMath, UnitHardpoint, GameWarhead, ClientEffect, GameSprite, Resource){

	function GameUnit(type, faction, state)
	{
		this.pos = {x:0.0,y:0.0};
		this.delta = {x:0.0,y:0.0,r:0.0};
		this.rot = 0.0;
		this.thrust = 0;
		this.target = {	type:"",
						stamp:0,
						move:{x:0.0,y:0.0},
						attack:{id:0,d:0},
						collect:{x:0.0,y:0.0}
					  };

		this.type = type;
		var type_object = Resource("../assets/hull/"+type+"/unit");

		this.lastimpact = Date.now();
		this.hardpoint = [];
		this.range = 0;
		this.shield = [];
		this.active = true;
		this.name = "Unknown";
		this.cargo = [];
		this.build = [];

		if(this.init(type_object,faction)) {
			if(typeof state.id === "undefined") {
				this.id = global.GameState.unit.length;
				global.GameState.unit.push(this);
				if(typeof state !== "undefined") this.set(state);
				return;
			}
			this.id = state.id;
			global.GameState.unit[this.id] = this;
			if(typeof state !== "undefined") this.set(state);

			return;
		}

	}

	GameUnit.prototype = {

		init : function init(type,faction) {
			if(typeof type == "undefined") return false;

			this.faction = faction;

			this.sprite = new GameSprite(Resource("../assets/hull/"+this.type+"/sprite"));

			if(typeof type.hull != "undefined")			this.hull = type.hull;
			if(typeof type.shield != "undefined")		this.shield = type.shield;
			if(typeof type.menu != "undefined")			this.menu = type.menu;
			if(typeof type.name != "undefined")			this.name = type.name;

			if(typeof this.hull == "undefined") return false;

			this.stat = {shield:this.shield.max, hull:this.hull.max, ammo:this.hull.ammo};

			if(typeof type.hardpoints != "undefined")
			for(var i in type.hardpoints)
			{
				var hp = type.hardpoints[i];
				var hpo = new UnitHardpoint(hp.type,this,hp.pos);

				if(hp.type=="auto turret")
					hpo.sprite=this.sprite.turret;

				hpo.equip(hp.warhead);
				this.hardpoint.push(hpo);
			}

			for(var ih in this.hardpoint)
				this.range += (this.hardpoint[ih].stat.life * this.hardpoint[ih].stat.speed);
			this.range /= this.hardpoint.length;

			return true;
		},

		set : function set(data) {
			if(typeof data.faction != "undefined") 		this.faction = data.faction;
			if(typeof data.cargo != "undefined") 		this.cargo = data.cargo;
			if(typeof data.build != "undefined") 		this.build = data.build;
			if(typeof data.pos != "undefined")			this.pos = data.pos;
			if(typeof data.rot != "undefined") 			this.rot = data.rot;
			if(typeof data.del != "undefined") 			this.delta = data.del;
			if(typeof data.stat != "undefined") 		this.stat = data.stat;
			if(typeof data.target != "undefined")		this.target = data.target;
			if(typeof data.name != "undefined") 		this.name = data.name;
			if(typeof data.type != "undefined") 		this.type = data.type;
			if(typeof data.thrust != "undefined")		this.thrust = data.thrust;
			if(typeof data.lastimpact != "undefined")	this.lastimpact = data.lastimpact;
			if(typeof data.active != "undefined") 		this.active = data.active;
			return true;
		},

		get : function get() {
			return {
				pos:		this.pos,
				del:		this.delta,
				rot:		this.rot,
				stat:		this.stat,
				target: 	this.target,
				thrust: 	this.thrust,
				type: 		this.type,
				lastimpact:	this.lastimpact,
				active:		this.active,
				name:		this.name,
				cargo: 		this.cargo,
				build: 		this.build,
				faction:	this.faction,
				id:			this.id
			};

		},

		hit : function hit(location, origin) {
			if(typeof this == "undefined") return;
			var tolerance = 200;
			var rayprecision = 0.1;
			var dis = ExtraMath.distance(this.pos,location);

			var frame = this.sprite.still.frame();
			var width = frame.w;
			var height = frame.h;

			if(dis < (frame.w/2)/global.world.grid) {
				//If there's a shield, just hit the circle;
				if(this.stat.shield > 2) return location;

				//If there's no shield, check the alpha achannel for a hit.

				//Find the hit zero offset. (make the ship the center of the universe)
				var zerolocation = {x:(this.pos.x-location.x)*global.world.grid,
									y:(this.pos.y-location.y)*global.world.grid};

				//Correct the offset for the rotation of the ship, -y is always up.
				zerolocation = ExtraMath.rotatePoints(-zerolocation.x,-zerolocation.y,-this.rot+90);

				//Find the sprite's center pixel on the spritesheet.
				var sprite_center = {x:frame.x+frame.w/2,
									 y:frame.y+frame.h/2};

				//Apply the offset to the sprite sheet's location to find the pixel to evaluate against.
				var sprite_location = { x:sprite_center.x+zerolocation.x,
										y:sprite_center.y+zerolocation.y};

				//Make sure it's within the sprites bounding box.
				if(!ExtraMath.hitrect([	{x:frame.x,y:frame.y},
								{x:frame.x+frame.w,y:frame.y+frame.h}
							],sprite_location)) return false;

				//If the alpha is mostly opaque, it's a hit.
				if(this.sprite.still.alpha(sprite_location) > tolerance)
				{
					//Can't establish a vector, just report the location.
					if(typeof origin == "undefined") return location;

					var zeroorigin = {x:(this.pos.x-origin.x)*global.world.grid,
									  y:(this.pos.y-origin.y)*global.world.grid};
					zeroorigin = ExtraMath.rotatePoints(-zeroorigin.x,-zeroorigin.y,-this.rot+90);
					var sprite_origin = { x:sprite_center.x + zeroorigin.x,
										  y:sprite_center.y + zeroorigin.y };

					//If the origin point hits; save time by returning that point.
					if(this.sprite.still.alpha(sprite_origin) > tolerance) return origin;

					//Clear space? Find the edge from moving from the hit to clear space.
					for(var i = 0.0; i < 1; i += rayprecision)
					{
						if(this.sprite.still.alpha(ExtraMath.vec_lerp(sprite_location,sprite_origin,i) ) > tolerance)
							//Lerp the two values, to save clock
							return ExtraMath.vec_lerp( location, origin, i );
					}
				}
			}

			return false;
		},

		impact : function impact(projectile) {
			var massfactor = projectile.stat.mass / this.hull.mass;
			var momentum = ExtraMath.rotatePoints(0,-((projectile.stat.speed * massfactor)/global.world.grid), projectile.rot);

			if(this.stat.shield > 2 && projectile.stat.target == "enemy") {
				this.stat.shield -= projectile.stat.power.shield;
				if(this.stat.shield < 0) this.stat.hull += this.stat.shield;

				var fx = new ClientEffect(this.sprite.shield,this.pos,1 * (this.sprite.still.box().w / this.sprite.shield.box().w),ExtraMath.angle(this.pos,projectile.pos));
			} else {
				this.stat.hull -= projectile.stat.power.hull;
				projectile.explode(this);

				if(this.stat.hull >= this.hull.max)
					this.active=true;
			}

			if(this.target.type == "move") this.target.type = "";

			this.lastimpact = global.maintimer.tick;
		},

		destroy : function destroy() {
			this.qt.remove(this.id,"ai",this.pos);
			global.GameState.unit[this.id] = null;
		},

		order : function order(type, data, stamp) {
			switch(type) {
				case "move":
					this.target.type = "move";
					this.target.move.x = data.x;
					this.target.move.y = data.y;

					if(typeof stamp != "undefined")
						this.target.stamp = stamp;

					this.update();
				break;

				case "attack":
					this.target.type = "attack";
					this.target.attack = {id:data,d:0};
				break;

				case "build":
					this.build.push({unit:data,stamp:stamp});
					this.update();
				break;
			}
		},

		set_qt : function set_qt() {
			//If no longer in the specified QT
			if(typeof this.qt != "undefined")
				if(!ExtraMath.hitrect(this.qt.boundary,this.pos))
					this.qt.remove({type:"ai",id:this.id});

			//Check for an invalid QT
			if(typeof this.qt != "undefined" && !this.qt.valid)
				delete this.qt;

			//Sometimes the unit holds onto the QT after being discarded.
			if(typeof this.qt != "undefined" && this.qt.node.length === 0)
				delete this.qt;

			//Insert into new QT.
			if(typeof this.qt == "undefined" || this.qt === null)
				if(!global.quadtree.insert({id:this.id,type:"ai",point:this.pos})) console.log("failed to insert at ",this.pos);
		},


		think : function think() {
			if(!this.active) return false;

			switch(this.target.type) {
				case "move":
				break;
				case "attack":

					if(!this.validtarget) this.target.type = "";
					var target = global.GameState.unit[this.target.attack.id];

					if(target !== null && typeof target != "undefined" && typeof target.pos != "undefined" && ExtraMath.distance(this.pos,target.pos)> this.range || ExtraMath.distance(this.pos,this.target.move) > this.range/2) {
						this.target.attack.d = 10;
						var targetangle = ExtraMath.angle(this.pos,target.pos);

						var point = ExtraMath.rotatePoints(0,-this.range*0.7,targetangle+180);

						this.target.move.x = global.GameState.unit[this.target.attack.id].pos.x+point.x;
						this.target.move.y = global.GameState.unit[this.target.attack.id].pos.y+point.y;
					}

				break;

				default:
					//too close to others
					/*
					if(this.qt != undefined)
					for(var i in this.qt.node)
					{
						var dist = ExtraMath.distance(this.pos, global.GameState.unit[this.qt.node[i]].pos);
						if( dist != 0 && dist < 0.2 && this.id != i && global.GameState.unit[this.qt.node[i]].target.type == "")
						{
							var points = ExtraMath.rotatePoints(0,0.25, ExtraMath.angle(this.pos, global.GameState.unit[this.qt.node[i]].pos))
							this.order("move",{x:this.pos.x+points.x,y:this.pos.y+points.y});
						}
					}
					*/
					//Kill something!
					var ailist = global.quadtree.query(this.pos,this.hull.vision);
					if(ailist.length>0) {
						var targetai = {d:this.hull.vision,id:-1};

						for(var i in ailist) {
							if(ailist[i].id != this.id && global.GameState.unit[ailist[i].id].faction != this.faction) {
								var d = ExtraMath.distance(this.pos,global.GameState.unit[ailist[i].id].pos);
								if(targetai.d > d && d) {
									targetai.d=d; targetai.id=ailist[i].id;
								}
							}
						}

						this.order("attack", targetai.id);
					}
				break;

			}

			for(var ih in this.hardpoint)
				this.hardpoint[ih].think();

		},

		update: function update() {
			if(typeof global.Network.broadcast != "function") return false;
			global.Network.broadcast(JSON.stringify({action:'update',delta:global.maintimer.delta,unit:this.get()}));
		},

		validtarget : function validtarget() {
			if(typeof this.target.attack.id == "undefined")
				return false;

			if(this.target.attack.id < 0)
				return false;

			if(typeof global.GameState.unit[this.target.attack.id] == "undefined")
				return false;

			if(global.GameState.unit[this.target.attack.id] === null)
				return false;

			if(typeof global.GameState.unit[this.target.attack.id].pos == "undefined")
				return false;

			if(this.target.attack.id == this.id)
				return false;

			if(global.GameState.unit[this.target.attack.id].faction == this.faction)
				return false;

			return true;
		},

		navigate : function navigate() {
			if(!this.active || this.target.stamp > global.maintimer.tick) return false;

			targetdistance 	= ExtraMath.distance(this.pos,this.target.move);
			targetangle 	= ExtraMath.angle(this.pos,this.target.move);
			targetspan 		= ExtraMath.short_angle(this.rot,targetangle);
			velocity 		= ExtraMath.distance({x:0.0,y:0.0},{x:this.delta.x,y:this.delta.y});

			var MoveDirection = 0;
			var TurnDirection = 0;

			if(targetdistance > 0.3)	MoveDirection = 0.1;
			if(targetdistance > 1)		MoveDirection = 0.5;
			if(targetdistance > 2)		MoveDirection = 1;

			if(targetspan > 1)	TurnDirection = -1;
			if(targetspan < -1)	TurnDirection = 1;

			if(targetspan < -45 || targetspan > 45 ) MoveDirection *= 0.5;

			if(this.target.type=="attack") {
				if(this.validtarget()) {
					targetdistance = ExtraMath.distance(this.pos,global.GameState.unit[this.target.attack.id].pos);
					//Correct for distance
					var target = {x:0,y:0};
					target.x = global.GameState.unit[this.target.attack.id].pos.x + (global.GameState.unit[this.target.attack.id].delta.x*global.maintimer.delta)*(targetdistance*3);
					target.y = global.GameState.unit[this.target.attack.id].pos.y + (global.GameState.unit[this.target.attack.id].delta.y*global.maintimer.delta)*(targetdistance*3);

					if(targetdistance < 1) {
						MoveDirection = 0;
					}

					targetdistance 	= ExtraMath.distance(	this.pos,global.GameState.unit[this.target.attack.id].pos);
					targetangle 	= ExtraMath.angle(		this.pos,global.GameState.unit[this.target.attack.id].pos);
					targetspan		= ExtraMath.short_angle(this.rot,targetangle);

					if(targetspan > 1)	TurnDirection = -1;
					if(targetspan < -1)	TurnDirection = 1;

					if(Math.abs(targetspan) < 19) {
						if(targetdistance < this.range) {
							for(var i in this.hardpoint)
								this.hardpoint[i].fire();
						}
					}
				} else {
					this.target.type = "";
				}
			}

			var acc = (this.hull.power/this.hull.mass)/(this.hull.speed*0.25);
			this.delta.r += ((TurnDirection * (45*this.hull.speed)) - this.delta.r) * acc;
			this.thrust  += ((MoveDirection * this.hull.speed) - this.thrust) * acc;

			//Time to build!
			if(this.build.length > 0 && global.server) {
				if(this.build[0].stamp < global.maintimer.tick) {
					order = this.build.shift();
					if(typeof global.Network.broadcast == "function") {
						var apos = ExtraMath.rotatePoints(0,-1,Math.random()*360);

						var state = {
							pos: {
								x: this.pos.x + apos.x,
								y: this.pos.y + apos.y
							},
							target: {
								move: {
									x: this.pos.x + apos.x,
									y: this.pos.y + apos.y
								}
							},
							rot: this.rot
						};

						var new_unit = new GameUnit( order.unit, this.faction, state );
						new_unit.update();
					}
				}
			}
		},

		adjust : function adjust() {
			this.set_qt();

			if(this.thrust !== 0) {
				thrust = ExtraMath.rotatePoints(0,-this.thrust, this.rot);
				this.pos.x	+= thrust.x* global.maintimer.delta;
				this.pos.y	+= thrust.y* global.maintimer.delta;
			}

			this.rot	+= this.delta.r * global.maintimer.delta;

			this.rot 	= ExtraMath.wrap(this.rot,0,360);
			this.pos.x 	= ExtraMath.wrap(this.pos.x, -global.world.size.x, global.world.size.x);
			this.pos.y 	= ExtraMath.wrap(this.pos.y, -global.world.size.y, global.world.size.y);

			/*
			this.delta.x = ExtraMath.damp(this.delta.x,0.8,global.maintimer.delta);
			this.delta.y = ExtraMath.damp(this.delta.y,0.8,global.maintimer.delta);
			this.delta.r = ExtraMath.damp(this.delta.r,0.8,global.maintimer.delta);
			*/

			//Recharge
			if(this.active)
			{
				if(this.stat.shield < this.shield.max && this.lastimpact + this.shield.delay < global.maintimer.tick)		this.stat.shield += this.shield.charge*global.maintimer.delta;
				if(this.stat.hull < this.hull.max && this.lastimpact + this.hull.delay < global.maintimer.tick)			this.stat.hull += this.hull.charge*global.maintimer.delta;
			}

			//Check limits
			this.stat.shield = 	ExtraMath.clip(this.stat.shield,0,this.shield.max);
			this.stat.hull = 	ExtraMath.clip(this.stat.hull,0,this.hull.max);

			for(var i in this.hardpoint)
				this.hardpoint[i].adjust();

			//Critical damage
			if(this.stat.hull === 0) {
				var fx = new ClientEffect("detonate2", this.pos, 1, 0);
				this.destroy();
			}
		},

		render : function render() {
			var screencoord = surface.coord(this.pos);

			if(this.thrust > 0.2)
				surface.drawSprite(this.sprite.moving, screencoord.x, screencoord.y, this.rot-90,1);
			else
				surface.drawSprite(this.sprite.still, screencoord.x, screencoord.y, this.rot-90,1);


			if(Interface.selected.indexOf(this.id) != -1) {
				var frame = this.sprite.still.frame();

				statradius = (frame.w/2)+2;

				var hullfactor = this.stat.hull / this.hull.max;
				var hullpoint = ExtraMath.lerp(-10,-170,1-hullfactor);

				var shieldfactor = this.stat.shield / this.shield.max;
				var shieldpoint = ExtraMath.lerp(170,10,1-shieldfactor);

				//Render Hull damage
				surface.buffer.beginPath();
				surface.buffer.lineWidth=2;
				surface.buffer.strokeStyle="#00ff00";
				surface.buffer.arc(screencoord.x,screencoord.y,statradius, -170 * ExtraMath.TO_RADIANS,hullpoint * ExtraMath.TO_RADIANS);
				surface.buffer.stroke();

				surface.buffer.beginPath();
				surface.buffer.strokeStyle="#002200";
				surface.buffer.arc(screencoord.x,screencoord.y,statradius, hullpoint * ExtraMath.TO_RADIANS,-10 * ExtraMath.TO_RADIANS);
				surface.buffer.stroke();

				//Render Shield strength
				if(Math.floor(shieldpoint) != 170) {
					surface.buffer.beginPath();
					surface.buffer.strokeStyle="#001133";
					surface.buffer.arc(screencoord.x, screencoord.y, statradius, 170 * ExtraMath.TO_RADIANS, shieldpoint * ExtraMath.TO_RADIANS, true);
					surface.buffer.stroke();
				}

				if(Math.floor(shieldpoint) != 10) {
					surface.buffer.beginPath();
					surface.buffer.strokeStyle="#00aaff";
					surface.buffer.arc(screencoord.x,screencoord.y,statradius, shieldpoint*ExtraMath.TO_RADIANS,10*ExtraMath.TO_RADIANS,true);
					surface.buffer.stroke();
				}

				if(ExtraMath.distance(this.pos,this.target.move) > 1 && this.target.type != "attack") {
					surface.buffer.lineWidth=1;
					surface.buffer.strokeStyle="#003333";
					var waypoint = surface.coord(this.target.move);

					surface.buffer.beginPath();
					surface.buffer.moveTo(screencoord.x, screencoord.y);
					surface.buffer.lineTo(waypoint.x, waypoint.y);
					surface.buffer.stroke();
				}
			}

			/*
			surface.buffer.fillStyle="#E00";
			surface.buffer.font="12px Arial";
			surface.buffer.fillText(this.qt.id,screencoord.x,screencoord.y);
			*/

			for(var i in this.hardpoint)
				this.hardpoint[i].render();
		}
	};

	return GameUnit;
});
