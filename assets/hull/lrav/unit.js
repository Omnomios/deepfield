define(function(){
	var unit = {
		name:"LRAV",
		hull:{ max:800.0, charge: 0.0, delay: 1000, ammo:1000.0, acharge:1.0, power:1, speed:1.5, mass:5.0, vision:12,cargo:200},
		shield:{ max:300.0, charge: 50 , delay: 5000 },
		hardpoints:[	{pos:{x:-6,y:0,r:-90},type:"fixed salvo", warhead:"med rocket"},
						{pos:{x:6,y:0,r:90},type:"fixed salvo", warhead:"med rocket"}]
	};
	return unit;
});
