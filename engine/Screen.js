define(function(){

	var TO_RADIANS = Math.PI/180;
	var TO_DEGREES = 180/Math.PI;

return {
		width:0,
		height:0,

		key:[],
		mouse:[],
		cursor:{x:0.0,y:0.0},

		/*canvas:false,
		buffer:false,
		minimap:false,
		*/

		active:false,

		coord: function(vec2)
		{
			return output = {
						x: (vec2.x+world.offset.x) * world.grid,
						y: (vec2.y+world.offset.y) * world.grid
					 };
		},

		drawSprite: function(spriteref, x, y, angle, scale)
		{
			if(typeof spriteref == "undefined" || typeof spriteref.frame != "function" ) return;
			if(!this.active) return;
			if(scale <= 0) return;

			/*
			surface.buffer.lineWidth=3;
			surface.buffer.strokeStyle="#44F";
			surface.buffer.beginPath();
			surface.buffer.moveTo(x, y-10);
			surface.buffer.lineTo(x, y+10);
			surface.buffer.moveTo(x-10, y);
			surface.buffer.lineTo(x+10, y);
			surface.buffer.stroke();
			*/

			surface.buffer.save();
			surface.buffer.translate(x, y);

			if(scale != 1)
				surface.buffer.scale(scale, scale);

			surface.buffer.rotate(angle * TO_RADIANS);

			if(typeof (frame = spriteref.frame()) != "undefined")
				surface.buffer.drawImage(spriteref.image(), frame.x, frame.y, frame.w, frame.h, -(frame.w/2), -(frame.h/2), frame.w, frame.h);

			surface.buffer.restore();
		},

		resize: function()
		{
			surface.canvas.width = window.innerWidth;
			surface.canvas.height = window.innerHeight;

			surface.width = surface.canvas.width;
			surface.height = surface.canvas.height;

			world.view.x = surface.width/world.grid;
			world.view.y = surface.height/world.grid;
		},

		clear: function()
		{
			this.buffer.clearRect(0,0,this.width,this.height);
		},

		init: function()
		{
			this.active = false;

			this.canvas = document.getElementById('backbuffer');
			this.buffer = this.canvas.getContext('2d');

			this.minimap = document.getElementById('minimap');
			this.minimap.width = world.size.x;
			this.minimap.height = world.size.y;

			this.overlay = $('#overlay');

			this.active = true;
			this.resize();

			window.addEventListener('resize', this.resize, false);

			return;
		}
	}
});