var asset = {};
$.ajax({
	url: 'core/asset.ajax.php',
	type: 'GET',
	data: {item:'asset',action:'object'},
	dataType: 'json',
	async: false,
	}).done(function(response) {
		for(item in response)
		{
			response[item].image = new Image();
			response[item].image.src = response[item].path;

			console.log(response[item].path);

			//Syncro image loading.
			var timer = new Date();
			var timeout = timer.getTime();
			while(!response[item].image.complete)
			{
				//console.log(response[item].path,response[item].image.complete);
				timer = new Date();
				if(timeout < timer.getTime()-1000) break;
			}
			response[item].alphamap = new alphamap(response[item].image);
		}
		asset = response;
	});


var sprite = {rocket_ship:{
							still:{ x:146,
									y:0,
									w:37,
									h:20,
									asset: asset.dev_space_ships},
							moving:{x:146,
									y:20,
									w:37,
									h:20,
									asset: asset.dev_space_ships}
					},
			fighter:{
							still:{ x:0,
									y:0,
									w:20,
									h:20,
									asset: asset.dev_space_ships},
							moving:{x:0,
									y:20,
									w:20,
									h:20,
									asset: asset.dev_space_ships}
					},
			mothership:{
							still:{ x:216,
									y:3,
									w:82,
									h:54,
									asset: asset.dev_space_ships},
							moving:{x:216,
									y:3,
									w:82,
									h:54,
									asset: asset.dev_space_ships},
							turret:{
									still:{ x:104,
											y:8,
											w:11,
											h:4,
											asset: asset.dev_space_ships},
									fire:{  x:92,
											y:28,
											w:35,
											h:4,
											asset: asset.dev_space_ships}
									}
					},
			warhead:{
							bullet:{
								moving:{x:186,
										y:2,
										w:5,
										h:1,
										asset: asset.dev_space_ships}

									},
							blaster:{
								moving:{x:185,
										y:14,
										w:17,
										h:5,
										asset: asset.dev_space_ships}

									},
							repair:{
								moving:{x:185,
										y:20,
										w:13,
										h:12,
										asset: asset.dev_space_ships}

									},
							rocket:{
								moving:{x:184,
										y:8,
										w:11,
										h:4,
										asset: asset.dev_space_ships}
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
					asset: asset.effects},
			  explode:{
					key:{   x:0,
							y:71,
							w:64,
							h:42},
					count: 7,
					fps: 24,
					asset: asset.effects},
			  sm_smoke:{
					key:{   x:0,
							y:37,
							w:16,
							h:14},
					count: 6,
					fps: 10,
					asset: asset.effects},
			  sm_smoke_hot:{
					key:{   x:0,
							y:52,
							w:16,
							h:16},
					count: 6,
					fps: 15,
					asset: asset.effects},
			  shield_20:{
					key:{   x:112,
							y:42,
							w:21,
							h:21},
					count: 5,
					fps: 28,
					asset: asset.effects},
			  shield_64:{
					key:{   x:452,
							y:37,
							w:63,
							h:63},
					count: 5,
					fps: 28,
					asset: asset.effects},
			  repair:{
					key:{   x:479,
							y:123,
							w:10,
							h:8},
					count: 5,
					fps: 28,
					asset: asset.effects},
			  shockwave:{
					key:{   x:10,
							y:119,
							w:33,
							h:33},
					count: 5,
					fps: 28,
					asset: asset.effects},
			  smoke:{
					key:{   x:0,
							y:0,
							w:128,
							h:128},
					count: 40,
					fps: 20,
					asset: asset.smoke_1_40_128},
			  fire:{
					key:{   x:0,
							y:0,
							w:128,
							h:128},
					count: 39,
					fps: 30,
					asset: asset.fire_3_39_128},
			  explosion:{
					key:{   x:0,
							y:0,
							w:128,
							h:128},
					count: 38,
					fps: 30,
					asset: asset.explosion_5_38_128}
			  };
