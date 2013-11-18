var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    baseUrl: "engine"
});

if(typeof define == 'undefined') {
	global.define = requirejsVars.define;
}

global.PNG = require('png-js');

global.GameAssets 	=	[];
global.Resources 	=	[];

global.cloneOf = (function() {
	  function F(){}
	  return function(o) {
		F.prototype = o;
		return new F();
	  }
}());

global.server = true;

console.log("Loading...");
requirejs(['ExtraMath','GameUnit','QuadTree','Timer','Tileset','GameState','Network','Game','Console'], function(ExtraMath, GameUnit, QuadTree, Timer,Tileset, GameState, Network, Game, Console){

	console.log("--World");
	global.world = new Tileset();


	global.Spawn = function(item,type,faction,id)
	{
		return new GameUnit(type,faction,{id:id});
	}

	world.load({x:0,y:0});

	global.quadtree = new QuadTree({x:-world.size.x,y:-world.size.y},{x:world.size.x,y:world.size.y});

	//var ship = new GameUnit("mothership",1,{pos:{x:10,y:0}});

	console.log("--Network.");
	global.unitpointer = 0;
	global.maintimer = new Timer();
	Network.init();

	console.log("--Simulation.");
	global.limiter = {stamp:Date.now(),accumulator:0,dt:20,running:false};

	Console.init();

	setInterval(function(){
		if(limiter.running) return;

		global.frames++;
		limiter.running = true;

		global.maintimer.update();

		Game.update(GameState);
		GameState.effect = [];

		limiter.running = false;;
	},20);

	setInterval(function(){
		for(var i in GameState.unit)
			if(GameState.unit[i] != null)
				GameState.unit[i].think();
	},500);

	//Periodic save
	setInterval(function(){
		world.save();
	},60000);

	/*
	setInterval(function(){
		if(global.unitpointer > GameState.unit.length-1) global.unitpointer = 0;
		if(GameState.unit[global.unitpointer] != null)		Network.broadcast(JSON.stringify({action:'update',unit:GameState.unit[global.unitpointer].get()}));
		global.unitpointer++;
	},1000);
	*/

	setInterval(function(){
		global.FPS = global.frames*2;
		global.frames = 0;
	},500);

	console.log("Ready.");
});
