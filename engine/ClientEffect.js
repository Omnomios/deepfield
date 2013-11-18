define(['GameSprite','GameState'],function(GameSprite, GameState)
{
	function ClientEffect(type,pos,scale,rot)
	{
		this.pos = pos;
		this.delta = {x:0.0,y:0.0};
		this.rot = rot;
		this.scale = scale;
		this.frame = 0;

		if(this.init(type))
		{
			this.id = global.GameState.effect.length;
			GameState.effect.push(this);
		}
	}

	ClientEffect.prototype = {

		init : function init(type)
		{
			var timer = new Date();
			this.sprite = type;

			this.fps = this.sprite.fps;
			this.count = this.sprite.frames.length;
			this.lastframe = timer.getTime();

			return true;
		},

		destroy : function destroy()
		{
			delete GameState.effect[this.id];
		},

		render : function render()
		{
			var timer = new Date();

			this.pos.x += this.delta.x*global.maintimer.delta;
			this.pos.y += this.delta.y*global.maintimer.delta;

			screencoord = surface.coord(this.pos);

			if(this.lastframe+1000/this.fps < timer.getTime())
			{
				this.lastframe = timer.getTime();
				this.frame++;
				this.sprite.frameindex = this.frame;
				if(this.frame >= this.sprite.frames.length)
				{
					this.destroy();
					return;
				}
			}
			surface.drawSprite(this.sprite, screencoord.x, screencoord.y, this.rot,this.scale);
		}
	}

	return ClientEffect;

});