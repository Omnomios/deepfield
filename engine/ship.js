function ship(type,faction)
{
	this.init = init;
	function init(type,faction)
	{
		this.pos = {x:0.0,y:0.0};
		this.delta = {x:0.0,y:0.0,r:0.0};
		this.rot = 0.0;
		this.target = {	type:"",
						move:{x:0.0,y:0.0},
						attack:{id:0,d:0},
						collect:{x:0.0,y:0.0}
					  };
		this.thrust = 0;
		this.stabilizer = {x:0.0,y:0.0};

		this.lastimpact = 0;
		this.hardpoint = [];
		this.shield = [];

		this.faction = faction;

		switch(type)
		{
			default:
			case "light":
				this.hull = { max:100.0, charge: 0.0, delay: 1000, ammo:1000.0, acharge:1.0, power:2.5, speed:2, mass:1.0, vision:4};
				this.shield = { max:100.0, charge: 50 , delay: 5000 }
				this.hardpoints = [{pos:{x:0,y:7},type:"forward gun", warhead:"minigun"}];
				this.sprite = sprite.fighter
			break;
		}


		this.stat = {shield:this.shield.max, hull:this.hull.max, ammo:this.hull.ammo};
		for(var i in this.hardpoints)
		{
			var hp = this.hardpoints[i];
			var hpo = new hardpoint(hp.type,this,hp.pos);
			hpo.equip(hp.warhead);
			this.hardpoint.push(hpo);
		}		
	}

	this.hit = hit;
	function hit(location)
	{
		if(this.stat.shield > 2)
			return (distance(this.pos,location) < (this.sprite.still.w*1.2)/world.grid);
		else
			return (distance(this.pos,location) < (this.sprite.still.w*0.7)/world.grid);
	}

	this.impact = impact;
	function impact(projectile)
	{
		var massfactor = projectile.stat.mass / this.hull.mass;
		var momentum = rotatePoints(0,-((projectile.stat.speed * massfactor)/world.grid), projectile.rot);
		this.delta.x += momentum.x;
		this.delta.y += momentum.y;

		if(this.stat.shield > 2)
		{
			this.stat.shield -= projectile.stat.power.shield;

			var fx = new effect(anim.shield_20);
			fx.pos = this.pos;
			fx.rot = angle(this.pos,projectile.pos);
		}
		else
		{
			this.stat.hull -= projectile.stat.power.hull;
			projectile.explode(this);
		}

		if(this.target.type == "move") this.target.type = "";

		var timer = new Date();
		this.lastimpact = timer.getTime();
	}

	this.destroy = destroy;
	function destroy()
	{
		var fx = new effect(anim.pop);
		fx.pos = cloneOf(this.pos);
		fx.delta = cloneOf(this.delta);

		this.qt.remove(this.id,"ai",this.pos);
		ai[this.id] = null;
	}

	this.order = order;
	function order(type,data)
	{
		switch(type)
		{
			case "move":
				this.target.type = "move";
				this.target.move.x = data.x;
				this.target.move.y = data.y;
			break;

			case "attack":
				this.target.type = "attack";
				this.target.attack.id = data;
			break;
		}
	}


	this.set_qt = set_qt;
	function set_qt()
	{
		if(this.qt != undefined)
			if(!hitrect(this.qt.boundary,this.pos))
				this.qt.remove(this.id);

		if(this.qt != undefined && !this.qt.valid)
			delete this.qt;

		if(this.qt == undefined || this.qt == null)
			if(!ai_quad.insert(this.id,"ai",this.pos)) console.log("failed to insert at ",this.pos);			
	}

	this.think = think;
	function think()
	{

		switch(this.target.type)
		{

			case "move":		
			break;
			case "attack":

				if(!this.validtarget) this.target.type = "";

				if(this.qt != undefined)
				for(var i in this.qt.node)
				{
					var dist = distance(this.pos, ai[this.qt.node[i]].pos);
					if( dist != 0 && dist < 0.4 && this.id != i && ai[this.qt.node[i]].target.type == "")
					{
						var points = rotatePoints(0,0.05, angle(this.pos, ai[this.qt.node[i]].pos))
						this.delta.x += points.x;
						this.delta.y += points.y;
					}
				}

			break;
			default:
				
				/*
				if(Math.random() > 0.5)
					this.delta.r += (Math.random() - 0.5) * 2;
				*/

				//too close to others
				if(this.qt != undefined)
				for(var i in this.qt.node)
				{
					var dist = distance(this.pos, ai[this.qt.node[i]].pos);
					if( dist != 0 && dist < 0.2 && this.id != i && ai[this.qt.node[i]].target.type == "")
					{
						var points = rotatePoints(0,0.25, angle(this.pos, ai[this.qt.node[i]].pos))
						this.target.type = "move";
						this.target.move.x = this.pos.x+points.x;
						this.target.move.y = this.pos.y+points.y;
					}
				}

				//Kill something!
				var ailist = ai_quad.query(this.pos,this.hull.vision);
				if(ailist.length>0)
				{
					var targetai = {d:1000,id:0};

					for(var i in ailist)
					{
						if(ailist[i] != this.id && ai[ailist[i]].faction != this.faction)
						{
							var d = distance(this.pos,ai[ailist[i]].pos);
							if(targetai.d > d){targetai.d=d; targetai.id=ailist[i]};
						}
					}
					this.order("attack",targetai.id);
				}

			break;
		}

	};

	this.validtarget = validtarget;
	function validtarget()
	{
		if(this.target.attack.id == undefined)
			return false;

		if(this.target.attack.id < 0)
			return false;

		if(ai[this.target.attack.id] == undefined)
			return false;

		if(ai[this.target.attack.id] == null)
			return false;

		if(ai[this.target.attack.id].pos == undefined)
			return false;

		if(this.target.attack.id == this.id)
			return false;

		if(ai[this.target.attack.id].faction == this.faction)
			return false;

		return true;
	}

	this.navigate = navigate;
	function navigate()
	{
		targetdistance = distance(this.pos,this.target.move)
		targetangle = angle(this.pos,this.target.move);
		targetspan = short_angle(this.rot,targetangle);
		velocity = distance({x:0.0,y:0.0},{x:this.delta.x,y:this.delta.y});

		this.thrust = 0.0;
		this.stabilizer = {x:0.0,y:0.0};

		if(targetdistance > this.hull.speed/2)
		{
			var spanfactor = targetspan/22.5;
	
			if(Math.abs(targetspan) < 3)
				this.delta.r = 0;
			else
				this.delta.r -= spanfactor;

			if(Math.abs(targetspan) < 45 && velocity < this.hull.speed)
				this.thrust = clip(targetdistance/2.5,0.1,1);
		}
		else
		{
			if(this.target.type == "move") this.target.type = "";
			this.stabilizer = rotatePoints(0,clip(targetdistance/4,0,1),targetangle);
		}


		if(this.target.type=="attack")
		{
			if(this.validtarget())
			{

				if(parseInt(Math.random()*100) == 34)
					this.target.attack.d = parseInt(Math.random()*3-1.5);				
				
				var point = rotatePoints(0,-1,ai[this.target.attack.id].rot+45*this.target.attack.d)
				this.target.move.x = ai[this.target.attack.id].pos.x+point.x;
				this.target.move.y = ai[this.target.attack.id].pos.y+point.y;

				targetdistance = distance(this.pos,ai[this.target.attack.id].pos)

				//Correct for distance
				var target = {x:0,y:0};
				target.x = ai[this.target.attack.id].pos.x + (ai[this.target.attack.id].delta.x*rtimer.delta)*(targetdistance*3);
				target.y = ai[this.target.attack.id].pos.y + (ai[this.target.attack.id].delta.y*rtimer.delta)*(targetdistance*3);

				targetangle = angle(this.pos,target);
				targetspan = short_angle(this.rot,targetangle);

				if(Math.abs(targetspan) < 19)
				{
					if(targetdistance < 3)
					{
						for(var i in this.hardpoint)
							this.hardpoint[i].fire();
					}
				}

				spanfactor = targetspan / 5 * this.hull.mass;
				if(Math.abs(targetspan) > 4)
					this.rot -= spanfactor;

			}
			else
			{
				this.thrust = 0;
				this.target.type = "";
			}
		}
	};

	this.adjust = adjust;
	function adjust()
	{
		var timer = new Date();

		this.set_qt();
	
		if(this.thrust !=0)
		{
			thrust = rotatePoints(0,-((this.hull.power*this.thrust)/world.grid),this.rot);
			this.delta.x += thrust.x;
			this.delta.y += thrust.y;
		}

		if(this.stabilizer.x !=0 || this.stabilizer.y !=0)
		{
			this.delta.x += -(((this.hull.power)*this.stabilizer.x)/world.grid);
			this.delta.y += -(((this.hull.power)*this.stabilizer.y)/world.grid);
		}

		this.pos.x	+= this.delta.x*rtimer.delta;
		this.pos.y	+= this.delta.y*rtimer.delta;
		this.rot	+= this.delta.r*rtimer.delta;

		this.rot = wrap(this.rot,0,360);
		this.pos.x = wrap(this.pos.x, -world.size.x, world.size.x);
		this.pos.y = wrap(this.pos.y, -world.size.y, world.size.y);

		this.delta.x *= 0.99;
		this.delta.y *= 0.99;
		this.delta.r *= 0.99;

		//Recharge
		if(this.stat.shield < this.shield.max && this.lastimpact + this.shield.delay < timer.getTime())		this.stat.shield += this.shield.charge*rtimer.delta;
		if(this.stat.hull < this.hull.max && this.lastimpact + this.hull.delay < timer.getTime())			this.stat.hull += this.hull.charge*rtimer.delta;

		//Check limits
		this.stat.shield = 	clip(this.stat.shield,0,this.shield.max);
		this.stat.hull = 	clip(this.stat.hull,0,this.hull.max);

		//Critical damage
		if(this.stat.hull == 0)
			this.destroy();
	}

	this.render = render;
	function render()
	{
		var timer = new Date();

		screencoord = screen.fromworld(this.pos);

		if(this.thrust > 0.2)
			drawRotatedImage(this.sprite.moving, screencoord.x, screencoord.y, this.rot-90,1)
		else
			drawRotatedImage(this.sprite.still, screencoord.x, screencoord.y, this.rot-90,1)

		if(this.hit(world.cursor))
		{
			//Still the craft on focus
			this.thrust = 0;
			//Focus ring
			buffer.beginPath();
			buffer.lineWidth=1;
			buffer.strokeStyle="#75CEDE";
			buffer.arc(screencoord.x,screencoord.y,this.sprite.still.w/2,0,2*Math.PI);
			buffer.stroke();
		}

		if(interface.selected.indexOf(this.id) != -1)
		{
			statradius = (this.sprite.still.w/2)+2;

			var hullfactor = this.stat.hull / this.hull.max;
			var hullpoint = lerp(-10,-170,1-hullfactor);

			var shieldfactor = this.stat.shield / this.shield.max;
			var shieldpoint = lerp(170,10,1-shieldfactor);

			//Render Hull damage
			buffer.beginPath();
			buffer.lineWidth=2;
			buffer.strokeStyle="#00ff00";
			buffer.arc(screencoord.x,screencoord.y,statradius, -170*TO_RADIANS,hullpoint*TO_RADIANS);
			buffer.stroke();

			buffer.beginPath();
			buffer.strokeStyle="#002200";
			buffer.arc(screencoord.x,screencoord.y,statradius, hullpoint*TO_RADIANS,-10*TO_RADIANS);
			buffer.stroke();

			//Render Shield strength
			if(Math.floor(shieldpoint) != 170)
			{
				buffer.beginPath();
				buffer.strokeStyle="#001133";
				buffer.arc(screencoord.x,screencoord.y,statradius, 170*TO_RADIANS,shieldpoint*TO_RADIANS,true);
				buffer.stroke();
			}

			if(Math.floor(shieldpoint) != 10)
			{
				buffer.beginPath();
				buffer.strokeStyle="#00aaff";
				buffer.arc(screencoord.x,screencoord.y,statradius, shieldpoint*TO_RADIANS,10*TO_RADIANS,true);
				buffer.stroke();
			}
		}

	};

	this.init(type,faction);
	this.id = ai.length;
	ai.push(this);
}
