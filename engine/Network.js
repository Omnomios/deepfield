
define(function()
{

	var Network_Client =
	{
		host: "",
		port: 8080,
		connector: 0,

		send: function send(message)
		{
			this.socket.send(message);
		},

		connect: function connect(host,port)
		{
			var Network = this;

			if(typeof host != "undefined")
				this.host = host;
			if(typeof port != "undefined")
				this.port = port;

			this.socket = new WebSocket("ws://"+this.host+":"+this.port);

			this.socket.onopen = function() {
				console.log("Connection established.");
				$("div.dialog p.detail").html("Requesting data.");

				$("#hostname").html(Network.host);

				var packet = { action:"sync", id: 1 };

				console.log("Requesting sync...");
				Network.send(JSON.stringify(packet));

				clearTimeout(Network.connector);

				Network.pinger = setInterval(function(){
						var date = new Date();
						var packet = { action:"ping", time: Date.now()};
						Network.send(JSON.stringify(packet));
					},2000);
			};

			this.socket.onclose = function(msg) {
				console.log("Connection lost.");
				clearInterval(Network.pinger);

				$("div.dialog p.detail").html("Connection lost.");
				$("div.dialog").fadeIn("slow");

				Network.connector = setTimeout(function(){Network.connect();},5000);
				global.end_simulation();
			};

			this.socket.onmessage = function(msg) {
				if(msg.data === "") {
					console.log("Empty message recieved.");
					return;
				}
				var data = JSON.parse(msg.data);

				var time;

				switch(data.action) {
					case "update":

						var unit = global.GameState.unit[parseInt(data.unit.id)];
						if(typeof unit != "undefined" && unit !== null) {
							unit.set(data.unit);
							return;
						}
						var new_unit = global.Spawn('GameUnit',data.unit.type,data.unit.faction,data.unit.id);
						new_unit.set(data.unit);

					break;

					case "pong":
						time = parseInt(data.time);
						Network.latency = (Date.now()-time)/2;
						Network.send(JSON.stringify({action:'latency',ms:Network.latency}));

						$("#latency").html(Network.latency+"ms");
					break;

					case "time":
						time = parseInt(data.stamp);
						global.maintimer.server(time-Network.latency);
					break;

					case "order":
						global.GameState.unit[parseInt(data.id)].order(data.type, data.coord, global.maintimer.tick);
					break;

					case "presync":
						$("div.dialog").fadeIn("slow");
						$("div.dialog p.detail").html("Waiting for sync");
						console.log("Waiting for sync");
						global.end_simulation();
						Network.send(JSON.stringify({action:'held'}));
					break;

					case "sync":
						console.log("Recieved sync.");
						global.GameState.set(data.sync.state);
						global.world.set(data.sync.world);
						global.begin_simulation();
						Network.send(JSON.stringify({action:'released'}));
					break;
				}
			};
		}
	};

	var Network_Server = {
		connection:{socket:[],index:0},
		port: 8080,
		callback:{},

		broadcast : function broadcast(message) {
			for(var i in this.connection.socket) {
				this.send(message,i);
			}
		},

		send: function send(message, id) {
			var Network = this;

			if(typeof this.connection.socket[id] == "undefined") {
				return;
			}

			this.connection.socket[id].send(message, function(error) {
				if(typeof error == "undefined") return;

				console.log("Closing connection:", error);
				Network.disconnect(id);
			});
		},

		disconnect: function disconnect(id) {
			console.log("Disconnect.",id);
			delete this.connection.socket[id];
		},

		accept: function accept(ws) {
			var pointer = 0;

			while(typeof this.connection.socket[pointer] != "undefined" && this.connection.socket[pointer] !== null) {
				pointer++;

				if(pointer > 100) {
					console.log("Too many connections!");
					ws.close();
					return false;
				}
			}

			if(typeof this.connection.socket[pointer] != "undefined") {
				this.connection.socket.push(null);
				pointer = connection.length;
			}

			ws.index = pointer;
			this.connection.socket[pointer] = ws;

			return true;
		},

		sync: function sync() {
			this.broadcast(JSON.stringify({action:'presync'}));
			Network.callback.held = function(){

				for(var i in Network.connection.socket)
					if(typeof Network.connection.socket[i] != "undefined" && !Network.connection.socket[i].hold) return;

				delete Network.callback.held;
				console.log("Syncing players.");
				var packet = {action:"sync",sync:{state:GameState.get(), world:world.get()},stamp:Date.now()+2000};
				var timepack = {action:'time',stamp:Date.now()};

				Network.broadcast(JSON.stringify(timepack));
				Network.broadcast(JSON.stringify(packet));
				console.log("Done.");
			};
		},

		init: function init() {
			this.WebSocketServer = require('ws').Server;
			this.wss = new this.WebSocketServer({port: this.port});

			console.log("Listening on: ",this.wss.options.host+":"+this.wss.options.port);

			var Network = this;

			this.wss.on('connection', function(ws) {
				ws.on('message', function(message) {
					var data = JSON.parse(message);

					switch(data.action) {
						case "ping":
							data.action = "pong";
							Network.send(JSON.stringify(data),this.index);
						break;

						case "latency":
							this.latency = data.ms;
						break;

						case "sync":
							console.log("Syncing player",this.index);
							var packet = {action:"sync",sync:{state:GameState.get(), world:world.get()}};
							Network.send(JSON.stringify({action:'time',stamp:Date.now()}),this.index);
							Network.send(JSON.stringify(packet),this.index);
						break;

						case "held":
							this.hold = true;
							if(typeof Network.callback.held === "function")
								Network.callback.held(this);
						break;

						case "released":
							this.hold = false;
						break;

						case "order":
							if(global.GameState.unit[parseInt(data.id)] !== null)
								global.GameState.unit[parseInt(data.id)].order(data.type,data.data, Date.now()+1000);
						break;
					}

				});

				ws.on('close', function(message) {
					console.log("Close on request", message);
					Network.disconnect(this.index);
				});

				ws.hold = false;
				if(Network.accept(ws)) console.log('Client connected.');

				//Broadcast timestap to clients
				setInterval(function(){ Network.broadcast(JSON.stringify({action:'time',stamp:Date.now()})); },5000);
			});
		}
	};

	if(typeof global.Network == "undefined") {
		if(global.server)
			global.Network = Network_Server;
		else
			global.Network = Network_Client;
	}

	return global.Network;
});
