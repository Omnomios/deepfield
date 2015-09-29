define(['ExtraMath','ClientEffect','GameSprite','GameState'],function(ExtraMath, ClientEffect, GameSprite, GameState)
{
	function GameWarhead(type) {
		this.launched = false;

		this.init = init;
		function init(type) {
			this.pos = {x:0.0,y:0.0};
			this.rot = 0.0;
			this.type = type;
			this.qt = {point:{x:0.0,y:0.0},list:[]};
			this.faction = 0;
			this.target = -1;
			this.scale = 1;

			switch(type)
			{
				case "minigun":
					this.stat = {ammo:2,power:{shield:5,hull:3},speed:10,life:0.5, delay:0.2, mass:0.05,mode:"projectile",explosive:false,target:"enemy"};
					this.sprite = "warhead_bullet";
				break;

				case "pulse laser":
					this.stat = {ammo:20,power:{shield:25,hull:50},speed:9,life:1, delay:0.8, mass:0.1,mode:"projectile",explosive:false,target:"enemy"};
					this.sprite = "warhead_blaster";
				break;

				case "repair":
					this.stat = {ammo:10,power:{shield:0,hull:-10},speed:2,life:3, delay:0.3, mass:0,mode:"beam",explosive:false,target:"ally"};
					this.sprite = "warhead_repair";
				break;

				case "med rocket":
					this.stat = {ammo:40,power:{shield:30,hull:100},speed:2,life:6, delay:3, mass:10, mode:"guided",explosive:true,target:"enemy"};
					this.sprite = "warhead_rocket";
				break;

				case "lge rocket":
					this.stat = {ammo:80,power:{shield:100,hull:150},speed:1,life:12, delay:6, mass:30, mode:"guided",explosive:true,target:"enemy"};
					this.sprite = "warhead_rocket";
					this.scale = 1.5;
				break;

				case "fast rocket":
					this.stat = {ammo:20,power:{shield:10,hull:50},speed:4,life:6, delay:1.5, mass:10, mode:"guided", explosive:true,target:"enemy"};
					this.sprite = "warhead_rocket";
					this.scale = 0.7;
				break;

			}

			this.sprite = new GameSprite(this.sprite);
		}


		this.set_qt = set_qt;
		function set_qt() {
			if(typeof this.pos == "undefined") return;

			if(typeof this.qt != "undefined" && typeof this.qt.node != "undefined") {
				if(this.qt.point.x != Math.floor(this.pos.x) ||
				   this.qt.point.y != Math.floor(this.pos.y) ||
				   this.qt.node.indexOf(this.id) == -1) {
						this.qt.list = global.quadtree.query(this.pos,1.5);
						this.qt.point = cloneOf(this.pos);
						return;
					}
			}
			this.qt.list = global.quadtree.query(this.pos,0.5);
			this.qt.point = cloneOf(this.pos);
		}


		this.launch = launch;
		function launch() {
			if(typeof this.stat == "undefined") return false;

			this.launchpos = {x:this.pos.x,y:this.pos.y};
			this.birth = global.maintimer.tick;
			this.id = GameState.warhead.length;
			GameState.warhead.push(this);
		}


		this.explode = explode;
		function explode(object) {
			/*
			var fx = new effect(anim.sm_smoke_hot);
			fx.pos = this.pos;
			var offs = ExtraMath.rotatePoints(0, -(this.stat.speed*0.01), this.rot);
			fx.delta.x = offs.x;
			fx.delta.y = offs.y;
			fx.scale = 0.4;
			*/
		}

		this.destroy = destroy;
		function destroy() {
			if(this.stat.explosive) {
				/*
				var fx = new effect(anim.shockwave);
				fx.pos = this.pos;
				fx.scale = 1.5*this.scale;

				var ffx = new effect(anim.fire);
				ffx.pos = this.pos;
				ffx.scale = 0.8*this.scale;
				*/
			}

			switch(this.stat.mode) {
				case "beam":
					for(var i = 0.0; i < ExtraMath.distance(this.pos,this.launchpos); i += 0.1)
					{
						var offs = ExtraMath.rotatePoints(0, -(i), this.rot);
						var fx = new ClientEffect(this.sprite.beam,{x:this.launchpos.x+offs.x,y:this.launchpos.y+offs.y},1, this.rot);
					}
				break;
			}

			delete GameState.warhead[this.id];
		}


		this.valid_faction = valid_faction;
		function valid_faction(target) {
			if(this.faction == target && this.stat.target == "ally") return true;
			if(this.faction != target && this.stat.target == "enemy") return true;

			return false;
		}


		this.adjust = adjust;
		function adjust() {
			var offs;

			switch(this.stat.mode) {
				case "projectile":
					offs = ExtraMath.rotatePoints(0, -(this.stat.speed*global.maintimer.delta), this.rot);
					this.pos.x += offs.x;
					this.pos.y += offs.y;
					this.set_qt();
				break;

				case "beam":

					for(var i = 0.0; i < this.stat.speed*this.stat.life; i += 0.1) {
						offs = ExtraMath.rotatePoints(0, -(i), this.rot);

						this.pos.x = this.launchpos.x + offs.x;
						this.pos.y = this.launchpos.y + offs.y;
						this.set_qt();
						if(this.testhit())
						{
							this.destroy();
							break;
						}
					}


				break;

				case "guided":

					var target = GameState.unit[this.target];

					if(target === null) {
						var ailist = global.quadtree.query(this.pos,4);
						if(ailist.length > 0) {
							var targetai = {d:this.stat.life * this.stat.speed,id:-1};
							for(var ia in ailist) {
								if(this.valid_faction(GameState.unit[ailist[ia].id].faction)) {
									var d = ExtraMath.distance(this.pos,GameState.unit[ailist[ia].id].pos);
									if(targetai.d > d){targetai.d=d; targetai.id=ailist[ia].id;}
								}
							}
							this.target=targetai.id;
							target=GameState.unit[this.target];
						}
					}

					if(target === null) {
						//this.explode();
						this.destroy();
						return false;
					}

					targetdistance = ExtraMath.distance(this.pos,target.pos);
					targetangle = ExtraMath.angle(this.pos, target.pos);
					targetspan = ExtraMath.short_angle(this.rot,targetangle)*this.stat.speed;

					this.rot -= targetspan * global.maintimer.delta;

					offs = ExtraMath.rotatePoints(0, -(this.stat.speed*global.maintimer.delta), this.rot);
					this.pos.x += offs.x;
					this.pos.y += offs.y;
					this.set_qt();
				break;
			}

			if(global.maintimer.tick - this.birth >= this.stat.life * 1000) this.destroy();

			//Check for impact
			if(ExtraMath.distance(this.launchpos,this.pos) > 0.2) {
				if(this.qt.list.length > 0) {
					for(var iq in this.qt.list) {
						if(this.valid_faction(GameState.unit[this.qt.list[iq].id].faction) && this.ignore != this.qt.list[iq].id) {
							offs = ExtraMath.rotatePoints(0, -(this.stat.speed*global.maintimer.delta), this.rot);

							for(var l=0.0;l<1;l+=0.25) {
								var originpoint = { x:this.pos.x-offs.x,
													y:this.pos.y-offs.y};

								var hitpoint = {x:ExtraMath.lerp(this.pos.x-offs.x,this.pos.x,l),
												y:ExtraMath.lerp(this.pos.y-offs.y,this.pos.y,l)};

								var hitresult = GameState.unit[this.qt.list[i].id].hit(hitpoint,originpoint);

								if(hitresult !== false) {
									this.pos = hitresult;
									GameState.unit[this.qt.list[i].id].impact(this);
									this.destroy();
									return;
								}
							}
						}
					}
				}
			}
		}


		this.testhit = testhit;
		function testhit() {
			//Check for impact
			if(ExtraMath.distance(this.launchpos,this.pos) < 0.2) return false;
			if(this.qt.list.length === 0) return false;

			for(var i in this.qt.list) {
				if(typeof GameState.unit[this.qt.list[i].id] == "undefined")
					continue;

				if(!(this.valid_faction(GameState.unit[this.qt.list[i].id].faction) && this.ignore != this.qt.list[i].id)) continue;

				if(GameState.unit[this.qt.list[i].id].hit(this.pos)) {
					GameState.unit[this.qt.list[i].id].impact(this);
					return true;
				}
			}
			return false;
		}

		this.render = render;
		function render() {
			switch(this.stat.mode) {
				/*case "beam":
				break;*/

				default:
					this.set_qt();
					screencoord = surface.coord(this.pos);

					surface.drawSprite(this.sprite.moving, screencoord.x, screencoord.y, this.rot-90,1);
				break;
			}
		}

		this.init(type);
		return this;
	}

	return GameWarhead;

});
