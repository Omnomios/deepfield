define(function(){

	return {
		"lrav":{
						"still":{"frames":[{"type":"single", "x":146,"y":0,"w":37,"h":20,"asset": "dev_space_ships"}]},
						"moving":{"frames":[{"type":"single", "x":146,"y":20,"w":37,"h":20,"asset": "dev_space_ships"}]},
						"shield":{"frames":[{"type":"sequence","x":112,"y":42,"w":21,"h":21, "count": 5, "fps": 28, "asset": "effects"}]}
				},
		"fighter":{
						"still":{"frames":[{"type":"single","x":0,"y":0,"w":20,"h":20, "asset": "dev_space_ships"}] },
						"moving":{"frames":[{"type":"single","x":0, "y":20, "w":20, "h":20, "asset": "dev_space_ships"}]},
						"shield":{"frames":[{"type":"sequence","x":112,"y":42,"w":21,"h":21, "count": 5, "fps": 28, "asset": "effects"}]}
				},
		"mothership":{
						"still":{"frames":[{"type":"single","x":216,"y":3,"w":82,"h":54, "asset": "dev_space_ships"}]},
						"moving":{"frames":[{"type":"single","x":216,"y":3,"w":82,"h":54, "asset": "dev_space_ships"}]},
						"shield":{ "frames":[{"type":"sequence", "x":452,"y":37,"w":63,"h":63, "count": 5, "fps": 28, "asset": "effects"}] },
						"turret":{
								"still":{"frames":[{"type":"single","x":104,"y":8,"w":11,"h":4, "asset": "dev_space_ships"}]},
								"fire":{"frames":[{"type":"single","x":92,"y":28,"w":35,"h":4, "asset": "dev_space_ships"}]}
								}
				},
		"warhead_bullet":{
			"moving":{"frames":[{"type":"single","x":186,"y":2,"w":5,"h":1, "asset": "dev_space_ships"}]}},
		"warhead_blaster":{
			"moving":{"frames":[{"type":"single","x":185,"y":14,"w":17,"h":5, "asset": "dev_space_ships"}]}},
		"warhead_repair":{
			"hit":{"frames":[{"type":"single","x":185,"y":20,"w":13,"h":12, "asset": "dev_space_ships"}]},
			"beam"  :{"frames":[{"type":"sequence","x":479,"y":123,"w":10, "h":8, "count":5, "fps":28, "asset":"effects"}]}
			},
		"warhead_rocket":{
			"moving":{"frames":[{"type":"single","x":184,"y":8,"w":11,"h":4, "asset": "dev_space_ships"}]}},

		"pop":{ "frames":[{"type":"sequence", "x":0, "y":0, "w":42, "h":38, "count": 22, "fps": 24,	"asset": "effects"}] },

		"explode":{ "frames":[{"type":"sequence", "x":0,"y":71,"w":64,"h":42, "count": 7, "fps": 24, "asset": "effects"}] },

		"sm_smoke":{ "frames":[{"x":0,"y":37,"w":16,"h":14, "count": 6, "fps": 10, "asset": "effects"}]},

		"sm_smoke_hot":{ "frames":[{"type":"sequence","x":0,"y":52,"w":16,"h":16, "count": 6, "fps": 15, "asset": "effects"}] },

		"shield_64":{ "frames":[{"type":"sequence", "x":452,"y":37,"w":63,"h":63, "count": 5, "fps": 28, "asset": "effects"}] },

		"repair":{ "frames":[{"type":"sequence","x":479,"y":123,"w":10, "h":8, "count":5, "fps":28, "asset":"effects"}] },

		"shockwave":{ "frames":[{"type":"sequence","x":10,"y":119,"w":33,"h":33, "count": 5, "fps": 28, "asset": "effects"}] },

		"smoke":{ "frames":[{"type":"sequence","x":0,"y":0, "w":128, "h":128,"count": 40, "fps": 20, "asset": "smoke_1_40_128"}]},

		"detonate1":{ "frames":[{"type":"sequence","x":0,"y":0, "w":32, "h":32,"count": 29, "fps": 30, "asset": "detonation1"}]},

		"detonate2":{ "frames":[{"type":"sequence","x":0,"y":0, "w":32, "h":32,"count": 48, "fps": 30, "asset": "detonation2"}]},

		"fire":{ "frames":[{"type":"sequence","x":0,"y":0,"w":128,"h":128,"count": 39,"fps": 30,"asset": "fire_3_39_128"}] },

		"explosion":{ "frames":[{"type":"sequence", "x":0, "y":0, "w":128, "h":128, "count": 38, "fps": 30, "asset": "explosion_5_38_128"}] }
	};

});
