var tileset =
{
	data:[],
	render: function()
	{

		world.offset.x = clip(world.offset.x,-(world.size.x-world.view.x),world.size.x);
		world.offset.y = clip(world.offset.y,-(world.size.y-world.view.y),world.size.y);

		for(var ty=0; ty<=world.view.y;ty++)
			for(var tx=0;tx<=world.view.x;tx++)
			{
				tbx = (tx+(world.offset.x%1)) * world.grid;
				tby = (ty+(world.offset.y%1)) * world.grid;

				buffer.lineWidth=1;


				if(tx-Math.floor(world.offset.x)==0 && ty-Math.floor(world.offset.y)==0)
					buffer.strokeStyle="#F44";
				else
					buffer.strokeStyle="#444";

				buffer.beginPath();
				buffer.moveTo(tbx, tby-8);
				buffer.lineTo(tbx, tby+8);
				buffer.moveTo(tbx-8, tby);
				buffer.lineTo(tbx+8, tby);
				buffer.stroke();
			}
	}
}
