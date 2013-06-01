	var ai = [];
	var selected = [];
	var warheads = [];
	var effects = [];
	var timer = new Date();

	var canvas;
	var buffer;
	var overlay;

	var screen = {width:0,height:0,key:[]};
	var world = {width:0,height:0,grid:64,
					cursor:{x:0,y:0},
					size:{x:0,y:0},
					view:{x:0,y:0},
					offset:{x:0,y:0,
							delta:{x:0,y:0}}
				};

	function drawRotatedImage(spriteref, x, y, angle, scale) {
		buffer.save();
		buffer.translate(x, y);

		if(scale != 1)
			buffer.scale(scale,scale);

		buffer.rotate(angle * TO_RADIANS);
		buffer.drawImage(spriteref.asset,spriteref.x,spriteref.y,spriteref.w,spriteref.h,-(spriteref.w/2), -(spriteref.h/2),spriteref.w,spriteref.h);
		buffer.restore();
	}


	screen.fromworld = function(vec2)
	{
		return output = {
					x: (vec2.x+world.offset.x) * world.grid,
					y: (vec2.y+world.offset.y) * world.grid
				 };
	}

	var cloneOf = (function() {
	  function F(){}
	  return function(o) {
		F.prototype = o;
		return new F();
	  }
	}());

	var ai_quad;

	window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() 
	{
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		screen.width = canvas.width;
		screen.height = canvas.height;
		world.view.x = screen.width/world.grid;
		world.view.y = screen.height/world.grid;
    }


	function Timer()
	{ 
		this.delta = 0.0;
		this.tick = 0;
		this.running = false;
		this.update = update;
		function update()
		{					
			var d = new Date();
			var tick = d.getTime();

			this.delta = (tick - this.tick)/1000;
			this.tick = tick;
		}
		return this;
	}
	var rtimer = new Timer();