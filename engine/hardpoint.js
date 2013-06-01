function hardpoint(type,parent,pos)
{
	this.init = init;
	function init(type,parent,pos)
	{
		this.type = type;
		this.pos = pos;
		this.parent = parent;
		this.rot = 0.0;
		this.time = 0;
		this.stat = 0;
		this.warhead = "";

		switch(type)
		{
			default:
			case "forward gun":

			break;
		}
	}

	this.equip = equip;
	function equip(weapon)
	{
		var valid = [];

		switch(this.type)
		{
			case "forward gun":
				valid = ["minigun"];
			break;

			case "fixed salvo":
				valid = ["med rocket","fast rocket","lge rocket"];
			break;
		}
	
		if(valid.indexOf(weapon) != -1)
		{
			this.warhead = weapon;
			
			var projectile = new warhead(this.warhead);
			this.stat = projectile.stat;

			return true;
		}

		return false;
	}

	this.fire = fire;
	function fire()
	{
		if(this.warhead == "") return false;

		switch(type)
		{
			case "forward gun":				
				var offs = rotatePoints(this.pos.x/world.grid,this.pos.y/world.grid,this.parent.rot);

				var projectile = new warhead(this.warhead);
				projectile.pos.x = parent.pos.x+offs.x;
				projectile.pos.y = parent.pos.y+offs.y;
				projectile.ignore = parent.id;
				projectile.faction = parent.faction;
				projectile.rot = parent.rot;

				var timer = new Date();
				if(this.time < timer.getTime())
				{
					this.time = timer.getTime()+projectile.stat.delay*1000;
					projectile.launch();
					return true;
				}
				return false;

			break;

		
			case "fixed salvo":				
				var offs = rotatePoints(this.pos.x/world.grid,this.pos.y/world.grid,this.parent.rot);

				var projectile = new warhead(this.warhead);
				projectile.pos.x = parent.pos.x+offs.x;
				projectile.pos.y = parent.pos.y+offs.y;
				projectile.ignore = parent.id;
				projectile.faction = parent.faction;
				projectile.target = parent.target.attack.id;
				projectile.rot = parent.rot+this.pos.r;

				var timer = new Date();
				if(this.time < timer.getTime())
				{
					this.time = timer.getTime() + projectile.stat.delay*1000;
					projectile.launch();
					return true;
				}
				return false;

			break;		
		
		}
	}

	this.init(type,parent,pos);
	return this;
}
