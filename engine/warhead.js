function warhead(type)
{
	this.launched = false;

	this.init = init;
	function init(type)
	{
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
				this.stat = {ammo:2,power:{shield:1,hull:10},speed:10,life:0.5, delay:0.2, mass:0.05,mode:"projectile",explosive:false};
				this.sprite = sprite.warhead.bullet;
			break;

			case "med rocket":
				this.stat = {ammo:40,power:{shield:30,hull:100},speed:2,life:6, delay:3, mass:10, mode:"guided",explosive:true};
				this.sprite = sprite.warhead.rocket;
			break;

			case "lge rocket":
				this.stat = {ammo:80,power:{shield:100,hull:150},speed:1,life:12, delay:6, mass:30, mode:"guided",explosive:true};
				this.sprite = sprite.warhead.rocket;
				this.scale = 1.5;
			break;

			case "fast rocket":
				this.stat = {ammo:20,power:{shield:10,hull:50},speed:4,life:6, delay:1.5, mass:10, mode:"guided", explosive:true};
				this.sprite = sprite.warhead.rocket;
				this.scale = 0.7;
			break;

		}
	}


	this.set_qt = set_qt;
	function set_qt()
	{
		if(this.pos == undefined) return;

		if(this.qt != undefined && this.qt.node != undefined)
		{
			if(this.qt.point.x != Math.floor(this.pos.x) ||
			   this.qt.point.y != Math.floor(this.pos.y) ||
			   this.qt.node.indexOf(this.id) == -1)
				{
					this.qt.list = ai_quad.query(this.pos,1.5);
					this.qt.point = cloneOf(this.pos);
					return;
				}
		}
		this.qt.list = ai_quad.query(this.pos,0.5);
		this.qt.point = cloneOf(this.pos);
	}


	this.launch = launch;
	function launch()
	{
		this.launchpos = {x:this.pos.x,y:this.pos.y};
		this.birth = rtimer.tick;
		this.id = warheads.length;
		warheads.push(this);
	}


	this.explode = explode;
	function explode(object)
	{
		var fx = new effect(anim.sm_smoke_hot);
		fx.pos = this.pos;
		var offs = rotatePoints(0, -(this.stat.speed*0.1), this.rot);
		fx.delta.x = offs.x;
		fx.delta.y = offs.y;
		fx.scale = 0.4;
	}
	
	
	this.destroy = destroy;
	function destroy()
	{
		if(this.stat.explosive)
		{
			var fx = new effect(anim.shockwave);
			fx.pos = this.pos;
			fx.scale = 1*this.scale;

			var ffx = new effect(anim.explode);
			ffx.pos = this.pos;
			ffx.scale = 0.5*this.scale;
		}
		
		delete warheads[this.id];
	}


	this.adjust = adjust;
	function adjust()
	{

		switch(this.stat.mode)
		{
			case "projectile":
				var offs = rotatePoints(0, -(this.stat.speed*rtimer.delta), this.rot);
				this.pos.x += offs.x;
				this.pos.y += offs.y;
				this.set_qt();
			break;

			case "guided":

				var target = ai[this.target];

				if(target == null)
				{
					var ailist = ai_quad.query(this.pos,4);
					if(ailist.length>0)
					{
						var targetai = {d:1000,id:-1};
						for(var i in ailist)
						{
							if(ai[ailist[i]].faction != this.faction)
							{
								var d = distance(this.pos,ai[ailist[i]].pos);
								if(targetai.d > d){targetai.d=d; targetai.id=ailist[i]};
							}
						}
						this.target=targetai.id;
						target=ai[this.target];
					}
				}

				if(target == null)
				{
					this.explode();
					this.destroy();
					return false;
				}
				
				targetdistance = distance(this.pos,target.pos)
				targetangle = angle(this.pos, target.pos);
				targetspan = short_angle(this.rot,targetangle)*this.stat.speed;
			
				this.rot -= targetspan * rtimer.delta;

				var offs = rotatePoints(0, -(this.stat.speed*rtimer.delta), this.rot);
				this.pos.x += offs.x;
				this.pos.y += offs.y;
				this.set_qt();
			break;
		}

		if(rtimer.tick - this.birth >= this.stat.life * 1000) this.destroy();

		//Check for impact
		if(distance(this.launchpos,this.pos) > 0.2)
		{
			if(this.qt.list.length > 0)
			{
				for(var i in this.qt.list)
				{
					if(this.faction != ai[this.qt.list[i]].faction && this.ignore != this.qt.list[i] && ai[this.qt.list[i]].hit(this.pos))
					{
						ai[this.qt.list[i]].impact(this);
						this.destroy();
						return;
					}
				}
			}
		}
	}
	
	
	this.render = render;
	function render()
	{
		this.set_qt();
		screencoord = screen.fromworld(this.pos);
		drawRotatedImage(this.sprite.moving, screencoord.x, screencoord.y, this.rot-90,this.scale);
	}

	this.init(type);
	return this;
}
