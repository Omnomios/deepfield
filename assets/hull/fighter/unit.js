define(function(){
	var unit = {
		name: "Fighter",
		hull: {
				max:	100.1,
				charge:	0.1,
				delay: 	1000,
				ammo:	1000.1,
				acharge:1.1,
				power:	0.1,
				speed:	3.1,
				mass:	1.1,
				vision:	8,
				cargo:	20	},

		shield:{
				max:	50.0,
				charge:	25.0,
				delay:	2500	},

		hardpoints: [
				{pos:{x:0,y:-4},type:"forward gun", warhead:"minigun"}	],
	};
	return unit;
});
