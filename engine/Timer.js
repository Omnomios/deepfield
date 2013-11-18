define(function(){

	function Timer()
	{
		this.delta = 0.0;
		this.tick = 0;
		this.offset = 0;
		this.running = false;
		this.delta = 1/50;

		this.update = function update()
		{
			this.tick = Date.now();
			this.tick += this.offset;
		}

		this.server = function server(time)
		{
			this.offset = time - Date.now();
		}

		this.init = function init()
		{
			this.tick = Date.now();
		}
		this.init();

		return this;
	}

	return Timer;

});
