
define(['GameUnit'],function(GameUnit)
{
	var Console_object = {

			init:function()
			{
				process.stdin.resume();
				process.stdin.setEncoding('utf8');

				var Console = this;

				process.stdin.on('data', function (chunk)
				{
					var line = chunk.trim().split(' ');
					var command = line.shift();
					line = line.join(' ');

					if(command == "")
						return;

					if(typeof Console[command] == "undefined")
					{
						process.stdout.write('"'+command+'" does not exist.\n');
						return;
					}

					Console[command](line);

				});
			},

			echo: function(input)
			{
				process.stdout.write(input+"\n");
			},

			save:function(parms)
			{
				this.echo("Saving sector "+global.world.sector.x+","+global.world.sector.y);
				global.world.save();
				return;
			},

			duration:function(parms)
			{
				this.echo("Uptime: "+Math.round(process.uptime())+" seconds.");
				return;
			},

			scrub:function(parms)
			{
				global.GameState.unit = [];
				Network.sync();
			},

			spawn:function(parms)
			{
				var parm = parms.split(" ");

				if(parm.length < 3)
				{
					this.echo("Usage: spawn [name] [faction] [x] [y]");
					return;
				}

				var new_unit = new GameUnit(parm[0],parseInt(parm[1]),{pos:{x:parseInt(parm[2]),y:parseInt(parm[3])}});
				Network.broadcast(JSON.stringify({action:'update',unit:new_unit.get()}));

				return;
			},

			stop:function(parms)
			{
				this.echo("Stopping server...");
				process.exit();
				return;
			}

	};

	if(typeof global.Console == "undefined") global.Console = Console_object;
	return global.Console;
});
