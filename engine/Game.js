define(function(){

	return {

		render: function render(State)
		{
			for(var i in State.unit) {
				if(State.unit[i] !== null) {
					if(State.unit[i] !== null) State.unit[i].render();
				}
			}

			for(var iw in State.warhead) {
				if(State.warhead[iw] !== null) {
					if(State.warhead[iw] !== null) State.warhead[iw].render();
				}
			}

			for(var ie in State.effect) {
				if(State.effect[ie] !== null) {
					State.effect[ie].render();
				}
			}
		},

		mothership : function(State, faction){
			for(var i in State.unit) {
				if(State.unit[i] !== null) {
					if(State.unit[i] !== null && State.unit[i].faction == faction) {
						if(State.unit[i].type == "mothership")
							return i;
					}
				}
			}
			return false;
		},


		update: function update(State)
		{
			for(var iu in State.unit) {
				if(State.unit[iu] !== null) {
					State.unit[iu].navigate();
					State.unit[iu].adjust();
				}
			}

			var warheadratio = {n:0,r:0};
			for(var iw in State.warhead) {
				warheadratio.n++;
				if(State.warhead[iw] !== null) {
					warheadratio.r++;
					State.warhead[iw].adjust();
				}
			}

			if(warheadratio.r === 0 && State.warhead.length>0) State.warhead = [];
		}
	};



});
