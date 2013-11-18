
define(function()
{
	var GameState_object = {
			unit:[],
			warhead:[],
			effect:[],

			hold:false,

			set:function(data)
			{
				for(i in data.unit)
				{
					i = parseInt(i);
					var unit = data.unit[i];

					if(unit == null)
					{
						if(this.unit[i] != null)
							this.unit[i].destroy();
						continue;
					}

					if(typeof this.unit[i] != "undefined" && this.unit[i] != null)
					{
						this.unit[i].set(data.unit[i]);
						continue;
					}

					var new_unit = global.Spawn('GameUnit',data.unit[i].type,data.unit[i].faction,i);
					this.unit[i].set(data.unit[i]);
				}
			},

			get:function()
			{
				var output = {unit:[]};

				for(var i in this.unit)
				{
					var unit = this.unit[i];
					if( unit != null)
					{
						output['unit'][i] = unit.get();
					}
				}

				return output;
			}


	};

	if(global.GameState == undefined) global.GameState = GameState_object;
	return global.GameState;
});

