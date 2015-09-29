define(['ExtraMath','GameState','GameSprite','Resource','QuadTree'],function(ExtraMath, GameState, GameSprite, Resource,QuadTree)
{
	function World()
	{
		this.data 		= [];
		this.width 		= 0;
		this.height 	= 0;
		this.grid 		= 64;
		this.sector 	= {x:0,y:0};
		this.cursor 	= {x:0,y:0};
		this.size 		= {x:0,y:0};
		this.view 		= {x:0,y:0};
		this.offset 	= {x:0,y:0, delta:{x:0,y:0}};

		this.testsprite = new GameSprite(Resource("../assets/asteroid.json"));
	}

	World.prototype = {

		set_size : function set_size(size) {
			this.size = size;

			for(var tx=0;tx<=this.size.x;tx++) {
				this.data[tx] = Array(this.size.y);
			}
		},

		generate : function generate() {
			var world = this;

			function cluster(x,y) {
				minor(x,y,9);

				for(var a=0;a<9;a++) {
					var offs = ExtraMath.rotatePoints(0,1+(Math.random()*2),Math.random()*360);
					minor( x+offs.x, y+offs.y, a );
				}
			}

			function minor(x,y,asize) {
				if(typeof asize === "undefined") return;

				if(typeof world.data[Math.floor(x)][Math.floor(y)] === "undefined")
					world.data[Math.floor(x)][Math.floor(y)] = {item:[]};

				world.data[Math.floor(x)][Math.floor(y)].item.push({
						pos:{
							x:x%1,
							y:y%1,
							r:Math.random()*260
							},
						type: asize
						});
			}

			for(var i=0;i<5;i++) {
				cluster(5+(Math.random()*(this.size.x-10)),5+(Math.random()*(this.size.y-10)));
			}

		},


		coord : function coord(vec2) {
			return {
				x: (vec2.x/this.grid)-this.offset.x,
				y: (vec2.y/this.grid)-this.offset.y
			};
		},

		load: function load(sector) {
			this.sector = sector;
			this.size.x = 128;
			this.size.y = 128;

			//var world = this;
			var zlib = require('zlib');
			var fs = require('fs');
			fs.readFile("assets/sectors/world."+this.sector.x+"."+this.sector.y+".json",
			function(err, data) {
				if(err) {
					console.log(err);
				} else {
					zlib.unzip(data, function(err, buffer) {
						if (!err) {
							var worldpack = JSON.parse(buffer);
							world.size = worldpack.sector.size;

							GameState.set(worldpack.gamestate);
							world.set(worldpack.tileset);

							console.log("Sector ", world.sector, "loaded.");
						} else {
							console.log(err);
						}
					});
				}
			});
		},

		save: function save() {
			var world = this;

			var worldpack =
			{
				sector: {
						location: this.sector,
						size: this.size
						},
				tileset:	this.get(),
				gamestate:	GameState.get()
			};

			var zlib = require('zlib');
			var fs = require('fs');

			zlib.deflate(JSON.stringify(worldpack), function(err, buffer) {
			  if (!err) {
				fs.writeFile("assets/sectors/world."+world.sector.x+"."+world.sector.y+".json", buffer, function(err) {
					if(err) console.log(err);
				});
			  }
			});
		},

		get: function get() {
			var output = {size: this.size, cells:[]};
			for(var tx=0;tx<=this.size.x;tx++) {
				for(var ty=0;ty<=this.size.y;ty++) {
					if(typeof this.data[tx][ty] !== "undefined") {
						output.cells.push({loc:{x:tx,y:ty},data:this.data[tx][ty]});
					}
				}
			}
			return output;
		},

		set: function set(data) {
			//world Gen
			if(typeof data.size === "undefined") {
				this.set_size({x:128,y:128});
				this.generate();

				this.rebuild_quadtree();
				return;
			}

			this.set_size(data.size);

			for(var i in data.cells) {
				var loc = data.cells[i].loc;
				this.data[loc.x][loc.y] = data.cells[i].data;
			}
			this.rebuild_quadtree();

		},

		rebuild_quadtree: function rebuild_quadtree() {
			this.quadtree = new QuadTree({x:-this.size.x,y:-this.size.y},{x:this.size.x,y:this.size.y});

			for(var tx=0;tx<=this.size.x;tx++) {
				for(var ty=0;ty<=this.size.y;ty++) {
					if(typeof this.data[tx][ty] !== "undefined") {
						for(var t in this.data[tx][ty].item) {
							var item = this.data[tx][ty].item[t];
							var xc = (this.size.x * ty) + tx;
							if(!this.quadtree.insert({id:xc,type:"res",point:{x:tx+item.pos.x,y:ty+item.pos.y}})) console.log("Did not insert",item);
						}
					}
				}
			}
		},

		render: function render() {
			this.offset.delta.x = ExtraMath.clip(this.offset.delta.x,-10,10);
			this.offset.delta.y = ExtraMath.clip(this.offset.delta.y,-10,10);
			this.offset.x += this.offset.delta.x*maintimer.delta;
			this.offset.y += this.offset.delta.y*maintimer.delta;
			this.offset.delta.x *= 1-(maintimer.delta*2);
			this.offset.delta.y *= 1-(maintimer.delta*2);

			this.offset.x = ExtraMath.clip(this.offset.x,-((this.size.x/2)-world.view.x),this.size.x/2);
			this.offset.y = ExtraMath.clip(this.offset.y,-((this.size.y/2)-world.view.y),this.size.y/2);

			surface.buffer.fillStyle = "white";
			surface.buffer.font = "bold 16px Arial";

			for(var ty=this.view.y+1; ty>=-1;ty--)
				for(var tx=this.view.x+1;tx>=-1;tx--)
				{
					var tmx = tx-Math.floor(this.offset.x);
					var tmy = ty-Math.floor(this.offset.y);

					var tox = this.offset.x > 0 ? this.offset.x%1 : 1-Math.abs(this.offset.x%1);
					var toy = this.offset.y > 0 ? this.offset.y%1 : 1-Math.abs(this.offset.y%1);

					var tbx = (tx+tox) * this.grid;
					var tby = (ty+toy) * this.grid;

					var tile = null;

					if(typeof world.data[Math.floor(tmx*1)+this.size.x/2] !== "undefined")
						tile = world.data[Math.floor(tmx*1)+this.size.x/2][Math.floor(tmy*1)+this.size.y/2];

					surface.buffer.lineWidth=1;

					/*
					surface.buffer.fillText(tmx, tbx+64, tby+16);
					surface.buffer.fillText(tmy, tbx+64, tby+32);
					surface.buffer.fillText(tx+"x"+ty, tbx+64, tby+48);
					*/

					if(typeof tile !== "undefined" && typeof tile.item !== "undefined" && tile.item.length > 0)
					{
						for( var i in tile.item)
						{
							this.testsprite.metal.frameindex = tile.item[i].type;
							surface.drawSprite(this.testsprite.metal, tbx+tile.item[i].pos.x, tby+tile.item[i].pos.y, tile.item[i].pos.r);
						}
					}

					if(tmx+64 === 0 && tmy+64 === 0)
						surface.buffer.strokeStyle="#F44";
					else
						surface.buffer.strokeStyle="#444";

					surface.buffer.beginPath();
					surface.buffer.moveTo(tbx, tby-4);
					surface.buffer.lineTo(tbx, tby+4);
					surface.buffer.moveTo(tbx-4, tby);
					surface.buffer.lineTo(tbx+4, tby);
					surface.buffer.stroke();
				}

		}
	};

	return World;
});
