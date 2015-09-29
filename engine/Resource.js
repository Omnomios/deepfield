define(function(){


	function load_resource(input)
	{
		if(global.server)
			global.Resources[input] = require(input);
		else
		{
			var output = {};
			$.ajax({
				url:"engine/"+input+".js",
				async: false,
				success: function(data){
					data = data.replace('define(function(){','');
					data = data.replace('});','');
					global.Resources[input] = eval("(function() {"+data+"}())");
				}
			});
		}

		console.log("Resource:",input);

		return global.Resources[input];
	}

	return function Resources(input)
	{
		if(typeof global.Resources[input] === "undefined")
			load_resource(input);

		return global.Resources[input];
	};
});
