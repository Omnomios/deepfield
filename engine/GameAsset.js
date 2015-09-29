define(['../assets/assets.json'],function(AssetData)
{
	function GameAsset(id)
	{
		if(typeof id == "undefined")
			return null;

		if(typeof global.GameAssets[id] != "undefined")
			return global.GameAssets[id];

		if(this.init(id)) {
			global.GameAssets[id] = this;
			return this;
		}
	}

	GameAsset.prototype = {

		init : function init(id) {
			var data = AssetData[id];
			var parent = this;

			console.log("Asset:",data.path);

			if(typeof Image != "function") {
				this.image = global.PNG.load(data.path);
				global.PNG.decode(data.path, function(pixels) {
					parent.bitmap = pixels;
				});
			} else {
				this.image = new Image();
				this.image.src = data.path;

				this.image.onload = function() {

					if (parent.image.width === 0 || parent.image.height === 0)
						return false;

					parent.workcanvas = document.createElement("canvas");
					parent.workcanvas.width = parent.image.width;
					parent.workcanvas.height = parent.image.height;
					parent.workcontext = parent.workcanvas.getContext("2d");
					parent.workcontext.drawImage(parent.image, 0, 0);

					parent.bitmap = parent.workcontext.getImageData(0, 0, parent.image.width, parent.image.height).data;
				};

			}

			return true;
		},

		alpha :	function alpha(point)
		{
			if(typeof this.bitmap == "undefined") return 0;

			var seq = 4*(Math.round(point.y) * this.image.width + Math.round(point.x));
			return  this.bitmap[seq+3];
		}
	};
	
	return GameAsset;
});
