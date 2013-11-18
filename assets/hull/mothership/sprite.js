define(function(){

	var sprite = {
						"still":{"frames":[{"type":"single","x":216,"y":3,"w":82,"h":54, "asset": "dev_space_ships"}]},
						"moving":{"frames":[{"type":"single","x":216,"y":3,"w":82,"h":54, "asset": "dev_space_ships"}]},
						"shield":{ "frames":[{"type":"sequence", "x":452,"y":37,"w":63,"h":63, "count": 5, "fps": 28, "asset": "effects"}] },
						"turret":{
								"still":{"frames":[{"type":"single","x":104,"y":8,"w":11,"h":4, "asset": "dev_space_ships"}]},
								"fire":{"frames":[{"type":"single","x":92,"y":28,"w":35,"h":4, "asset": "dev_space_ships"}]}
								}
				};

	return sprite;

});
