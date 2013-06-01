var img_ship = new Image();
img_ship.src = "assets/space-ships.png";
var img_effect = new Image();
img_effect.src = "assets/effects.png";

var sprite = {rocket_ship:{
							still:{ x:146,
									y:0,
									w:37,
									h:20,
									asset: img_ship},
							moving:{x:146,
									y:20,
									w:37,
									h:20,
									asset: img_ship}
							},
			fighter:{
							still:{ x:0,
									y:0,
									w:20,
									h:20,
									asset: img_ship},
							moving:{x:0,
									y:20,
									w:20,
									h:20,
									asset: img_ship}
							},
			warhead:{
							bullet:{
								moving:{x:186,
										y:2,
										w:5,
										h:1,
										asset: img_ship}
								
									}
							},
			  };

var anim = {pop:{
					key:{   x:0,
							y:0,
							w:42,
							h:38},
					count: 22,
					fps: 24,
					asset: img_effect},
			  explode:{
					key:{   x:0,
							y:71,
							w:64,
							h:42},
					count: 7,
					fps: 24,
					asset: img_effect},
			  sm_smoke:{
					key:{   x:0,
							y:37,
							w:16,
							h:14},
					count: 6,
					fps: 2,
					asset: img_effect},
			  sm_smoke_hot:{
					key:{   x:0,
							y:52,
							w:16,
							h:16},
					count: 6,
					fps: 15,
					asset: img_effect},
			  shield_20:{
					key:{   x:112,
							y:42,
							w:21,
							h:21},
					count: 5,
					fps: 28,
					asset: img_effect}
			  };
