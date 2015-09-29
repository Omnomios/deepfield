define(['GameAsset','../assets/sprites.json'],function(GameAsset,SpriteData)
{

	function GameSprite(id)
	{
		if(typeof id == "undefined")
			return null;

		if(this.init(id))
			return this;
	}

	GameSprite.prototype = {
		init : function init(id)
		{
			var spritedata;

			if(typeof id === 'object')
				spritedata = id;
			if(typeof id === 'string')
				spritedata = SpriteData[id];

			if(typeof spritedata == "undefined") return false;

			this.frameindex = 0;

			this.frames = Array();
			for(var i in spritedata) {
				if(i == "frames") {
					for(var ii in spritedata[i]) {
						var spriteframe = spritedata[i][ii];

						var spriteasset = new GameAsset(spriteframe.asset);

						if(spriteframe.type == "sequence") {
							this.fps = spriteframe.fps;

							for(var fi=0; fi < spriteframe.count; fi++) {
								var y = Math.floor(spriteframe.w * fi / spriteasset.image.width);
								var x = fi - (spriteasset.image.width/spriteframe.w) * y;

								//It's wrappin gback to -700 for somereason.

								if(spriteframe.asset == "detonation") {
									console.log(fi, y, spriteframe.w,spriteasset.image.width,spriteasset.image.width/spriteframe.w,x);
								}

								this.frames.push(
												{x:spriteframe.x + spriteframe.w * x,
												y:spriteframe.y + spriteframe.h * y,
												w:spriteframe.w,
												h:spriteframe.h,
												asset: spriteframe.asset}
												);
							}
						}

						if(spriteframe.type == "single")
							this.frames.push(spriteframe);
					}
				}

				if(i != "frames")
					this[i] = new GameSprite(spritedata[i]);
			}

			return true;
		},

		box : function box(id) {
			var w=0,h=0,c=0;

			if("frames" in this) {
				for(var ir in this.frames)
				{
					w+=this.frames[ir].w;
					h+=this.frames[ir].h;
					c++;
				}
				w/=c;
				h/=c;

				return {x:w,y:h};
			}

			for(var ic in this) {
				var childbox = this[ic].box();

				if(childbox.x > 0 && childbox.y > 0)
					return childbox;
			}

			return {x:0,y:0};
		},

		frame : function frame(index) {
			if(typeof index != "undefined")
				this.frameindex = index;

			if("frames" in this)
				return this.frames[this.frameindex];

			if(typeof frames[this.frameindex] == "undefined")
				return {x:0,y:0,w:0,h:0};

			for(var i in this) {
				var childframe = this.frames[i].frame(this.frameindex);
				if(childframe.w > 0 && childframe.h > 0)
					return childframe;
			}

			return {x:0,y:0,w:0,h:0};
		},

		alpha : function alpha(point) {
			if("frames" in this) {
				if(typeof global.GameAssets[this.frames[0].asset] == "undefined")
					var asset = new GameAsset(this.frames[0].asset);

				return global.GameAssets[this.frames[0].asset].alpha(point);
			}

			for(var i in this) {
				var childalpha = this[i].alpha();

				if(childalpha > 0)
					return childalpha;
			}
			return 0;
		},

		image : function image() {
			if("frames" in this) {
				if(typeof global.GameAssets[this.frames[0].asset] == "undefined")
					var asset = new GameAsset(this.frames[0].asset);
				return global.GameAssets[this.frames[0].asset].image;
			}

			for(var i in this) {
				if(typeof this[i].image != "undefined")
					return this[i].image;
			}
			return undefined;
		}

	};

	return GameSprite;
});
