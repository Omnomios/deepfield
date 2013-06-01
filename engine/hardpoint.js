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
		}
	
		if(valid.indexOf(weapon) != -1)
		{
			this.warhead = weapon;
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
			default:

			case "gun":

				var projectile = new warhead(this.warhead);
				projectile.pos.x = parent.pos.x;
				projectile.pos.y = parent.pos.y;
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
		}
	}

	this.init(type,parent,pos);
	return this;
}
