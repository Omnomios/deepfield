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

		switch(type)
		{
			default:
			case "minigun":
				this.stat = {ammo:2,power:{shield:1,hull:10},speed:4,life:1, delay:0.2, mass:0.05,mode:"projectile"};
				this.sprite = sprite.warhead.bullet;
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
		delete warheads[this.id];
	}


	this.adjust = adjust;
	function adjust()
	{
		var offs = rotatePoints(0, -(this.stat.speed*rtimer.delta), this.rot);
		this.pos.x += offs.x;
		this.pos.y += offs.y;
		this.set_qt();

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
		drawRotatedImage(this.sprite.moving, screencoord.x, screencoord.y, this.rot-90,1);
	}

	this.init(type);
	return this;
}
