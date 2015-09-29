window.onerror = function(message, url, lineNumber) {
  console.error(url+"\nline:"+lineNumber+" - "+message);
  return true;
};

var global = window;

global.GameAssets 	=	[];
global.Resources 	=	[];

global.cloneOf = (function() {
	  function F(){}
	  return function(o) {
		F.prototype = o;
		return new F();
    };
}());

require.config({
    baseUrl: "engine"
});

console.log("Loading...");
$("div.dialog p.detail").html("Loading game.");

global.server = false;

require(['ExtraMath','GameUnit','QuadTree','Timer','Tileset','GameState','Screen','Interface','Network','Game'], function(ExtraMath, GameUnit, QuadTree, Timer, Tileset, GameState, Screen, Interface, Network, Game){

	console.log("Ready.");

	global.world = new Tileset();
	global.surface = Screen;

	//Main function
	global.world.size.x = 128;
	global.world.size.y = 128;

	//Setup canvas for render.
	surface.init();
	Interface.init();

	global.quadtree = new QuadTree({x:-world.size.x,y:-world.size.y},{x:world.size.x,y:world.size.y});

	global.maintimer = new Timer();

	global.frames = 0;
	global.running = false;
	global.limiter = {stamp: Date.now(),accumulator:0,dt:20};

	global.end_simulation = function()
	{
		if(global.running === false)
			return false;

        global.running = false;

		clearInterval(global.mainloop);
		clearInterval(global.mainthink);
	};

	global.begin_simulation = function()
	{
		if(global.running === true)
			return false;
		global.running = true;

		Interface.home();

		console.log("Simulation started.");

		$("div.dialog p.detail").html("Ready.");
		$("div.dialog").fadeOut("slow");
		$("div.menu.main").fadeIn("slow");

		global.mainloop = setInterval(function()
		{
			if(global.maintimer.running) return;
			global.maintimer.running = true;

			events = 1;

			global.maintimer.update();
			global.frames++;

			Game.update(GameState);

			surface.clear();
			Interface.prerender();
			global.world.render();
			Game.render(GameState);

			//global.quadtree.render();
			global.maintimer.running = false;
		},20);

		global.mainthink = setInterval(function(){
			for(var i in GameState.unit)
			{
				if(GameState.unit[i] !== null) {
					GameState.unit[i].think();
				}
			}
		},500);
	};

	setInterval(function(){
		global.FPS = global.frames*2;
		global.frames = 0;
	},500);

	global.Spawn = function(item,type,faction,id)
	{
		return new GameUnit(type,faction,{id:id});
	};

	$("div.dialog p.detail").html("Connecting to server.");
	Network.connect("localhost",8080);
});
