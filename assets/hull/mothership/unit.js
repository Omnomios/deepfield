define(function(){
	var unit = {
		name:"Mothership",
		hull:{ 
				max:8000.0,
				charge: 10.0,
				delay: 10000,
				ammo:10000.0,
				acharge:1.0,
				power:10,
				speed:0.5,
				mass:500.0,
				vision:5,
				cargo:10000},
		shield:{
				max:8000.0,
				charge: 200.0,
				delay: 5000 },
		hardpoints:[ 
						{pos:{x:0,y:15,r:0},type:"auto turret", warhead:"pulse laser"},
						{pos:{x:0,y:-15,r:0},type:"auto turret", warhead:"pulse laser"},
						{pos:{x:-20,y:20,r:0},type:"auto turret", warhead:"repair"},
						{pos:{x:20,y:20,r:0},type:"auto turret", warhead:"repair"},
						{pos:{x:-20,y:-20,r:0},type:"auto turret", warhead:"pulse laser"},
						{pos:{x:20,y:-20,r:0},type:"auto turret", warhead:"pulse laser"} ],
		menu:[
				{c:"fighterbutton",o:"build",d:"fighter"},
				{c:"rocketbutton",o:"build",d:"lrav"}]
	};
	return unit;
});
