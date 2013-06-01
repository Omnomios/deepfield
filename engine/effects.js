function effect(type)
{
	this.init = init;
	function init(type)
	{
		var timer = new Date();

		this.pos = {x:0.0,y:0.0};
		this.delta = {x:0.0,y:0.0};
		this.rot = 0.0;
		this.scale = 1;
		this.type = type;

		this.lastframe = timer.getTime();
		this.frame = 0;
		this.count = type.count;
		this.fps = type.fps;

		this.sprite = [];
		
		for(var i=0; i<type.count;i++)
		{
			var keyframe = {x:type.key.x+type.key.w*i,
							y:type.key.y,
							w:type.key.w,
							h:type.key.h,
							asset: type.asset};
			this.sprite.push(keyframe);
		}
	}

	this.destroy = destroy;
	function destroy()
	{
		delete effects[this.id];
	}

	this.render = render;
	function render()
	{
		var timer = new Date();
		
		this.pos.x += this.delta.x*rtimer.delta;
		this.pos.y += this.delta.y*rtimer.delta;

		screencoord = screen.fromworld(this.pos);

		if(this.lastframe+1000/this.fps < timer.getTime())
		{
			this.lastframe = timer.getTime();
			this.frame++;
			if(this.frame >= this.count)
			{
				this.destroy();
				return;
			}
		}
		drawRotatedImage(this.sprite[this.frame], screencoord.x, screencoord.y, this.rot,this.scale);
	}

	this.init(type);
	this.id = effects.length;
	effects.push(this);
}
