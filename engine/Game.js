define(function(){

	return {

		render: function render(State)
		{

			for(var i in State.unit)
			{
				if(State.unit[i] != null)
				{
					if(State.unit[i] != null) State.unit[i].render();
				}
			}

			for(var i in State.warhead)
			{
				if(State.warhead[i] != null)
				{
					if(State.warhead[i] != null) State.warhead[i].render();
				}
			}

			for(var i in State.effect)
			{
				if(State.effect[i] != null)
				{
					State.effect[i].render();
				}
			}
		},

		mothership : function(State,faction){

			for(var i in State.unit)
			{
				if(State.unit[i] != null)
				{
					if(State.unit[i] != null && State.unit[i].faction == faction)
					{
						if(State.unit[i].type == "mothership")
							return i;
					}
				}
			}

			return false;
		},


		update: function update(State)
		{
			for(var i in State.unit)
			{
				if(State.unit[i] != null)
				{
					State.unit[i].navigate();
					State.unit[i].adjust();
				}
			}

			var warheadratio = {n:0,r:0};
			for(var i in State.warhead)
			{
				warheadratio.n++;
				if(State.warhead[i] != null)
				{
					warheadratio.r++;
					State.warhead[i].adjust();
				}
			}
			if(warheadratio.r == 0 && State.warhead.length>0) State.warhead = [];
		}
	};



});