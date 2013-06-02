var img_ship = new Image();
img_ship.src = "assets/space-ships.png";

function alphamap(img)
{
	this.workcanvas = document.createElement("canvas");
	this.workcanvas.width = img.width;
	this.workcanvas.height = img.height;
	this.workcontext = this.workcanvas.getContext("2d");
	this.workcontext.drawImage(img, 0, 0);
	this.imgData = this.workcontext.getImageData(0, 0, img.width, img.height);

	this.getpoint = getpoint
	function getpoint(point)
	{
		var seq = 4*(Math.round(point.y) * this.imgData.width + Math.round(point.x));
		return  this.imgData.data[seq+3];
	}

	return this;
}
var img_ship_alpha = new alphamap(img_ship);


var img_effect = new Image();
img_effect.src = "assets/effects.png";

var sheet_smoke = new Image();
sheet_smoke.src = "assets/smoke_1_40_128.png";

var sheet_fire = new Image();
sheet_fire.src = "assets/fire_3_39_128.png";

var sheet_explo = new Image();
sheet_explo.src = "assets/explosion_5_38_128.png";

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
			mothership:{
							still:{ x:216,
									y:3,
									w:82,
									h:54,
									asset: img_ship},
							moving:{x:216,
									y:3,
									w:82,
									h:54,
									asset: img_ship},
							turret:{
									still:{ x:104,
											y:8,
											w:11,
											h:4,
											asset: img_ship},
									fire:{  x:92,
											y:28,
											w:35,
											h:4,
											asset: img_ship}
									}
					},
			warhead:{
							bullet:{
								moving:{x:186,
										y:2,
										w:5,
										h:1,
										asset: img_ship}
								
									},
							blaster:{
								moving:{x:185,
										y:14,
										w:17,
										h:5,
										asset: img_ship}
								
									},
							rocket:{
								moving:{x:184,
										y:8,
										w:11,
										h:4,
										asset: img_ship}								
									}
					}
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
					fps: 10,
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
					asset: img_effect},
			  shockwave:{
					key:{   x:10,
							y:119,
							w:33,
							h:33},
					count: 5,
					fps: 28,
					asset: img_effect},
			  smoke:{
					key:{   x:0,
							y:0,
							w:128,
							h:128},
					count: 40,
					fps: 20,
					asset: sheet_smoke},
			  fire:{
					key:{   x:0,
							y:0,
							w:128,
							h:128},
					count: 39,
					fps: 30,
					asset: sheet_fire},
			  explosion:{
					key:{   x:0,
							y:0,
							w:128,
							h:128},
					count: 38,
					fps: 30,
					asset: sheet_explo}
			  };
