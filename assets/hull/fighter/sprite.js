define(function(){

	var sprite = {
						"still":{"frames":[{"type":"single","x":0,"y":0,"w":20,"h":20, "asset": "dev_space_ships"}] },
						"moving":{"frames":[{"type":"single","x":0, "y":20, "w":20, "h":20, "asset": "dev_space_ships"}]},
						"shield":{"frames":[{"type":"sequence","x":112,"y":42,"w":21,"h":21, "count": 5, "fps": 28, "asset": "effects"}]}
				};

	return sprite;

});