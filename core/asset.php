<?php
	require_once("environment.inc.php");
?>
<html>
	<head>
		<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
		<script src="jquery.upload.js"></script>


		<style>

			.container
			{
				width: 800px;
				margin: 20px auto;
			}

			.container select
			{
				width: 100%;
			}

			.container div.form div.label
			{
				clear:both;
				float:left;
				width: 100px;
				text-align: right;
			}
			.container div.frameform div.label
			{
				width: 60px;
			}

			.container div.form div.input
			{
				float:left;
				width: 500px;
				text-align: left;
			}
			.container div.frameform div.input
			{
				width: 300px;
			}

			div.itemcontrol, div.itemselect, div.form
			{
				padding:5px;
			}

			div.form textarea[name=description]
			{
				height: 91px;
				width: 483px;
			}

			div.form input[name=name]
			{
				width: 483px;
			}


			div.frameform
			{
				padding: 0 5px;
			}

			div.frameform input
			{
				width: 283px;
			}


			div.spriteframes
			{
				border-top: 2px solid #eee;
				margin: 10px 0 0 0;
				padding-top : 10px;
			}

			div.formbuttons
			{
				clear:both;
				text-align:right;
			}


		</style>

	</head>

	<body>

		<div class="container">
			<div class="itemselect">
				<button type="button" onClick="loaditems('asset')">Assets</button>
				<button type="button" onClick="loaditems('sprite')">Sprite</button>
			</div>
			<div class="items">
				<select size="10" name="list">
				</select>
			</div>
			<div class="itemcontrol" item="">
				<button type="button" onClick="newitem()">New</button>
				<button type="button" onClick="deleteitem()">Delete</button>
			</div>

			<div class="form"></div>
		</div>

		<script type="text/javascript">

			function loaditems(item)
			{
				if($("div.itemcontrol").attr("item") == item)
				{
					var selected_id = $("select[name=list]").find(":selected").val();
				}

				$("div.itemcontrol").attr("item",item);

				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data: {item:item,action:'list'}
					}).done(function(response) {
						$("select[name=list]").html(response);

						if(selected_id != undefined)
						{
							$("select[name=list]").val(selected_id);
						}

					});
			}

			function loadframes(sprite)
			{
				var selected_id = $("select[name=framelist]").val();

				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data: {item:"frame",action:'list',sprite:sprite}
					}).done(function(response) {
						$("select[name=framelist]").html(response);
						$("select[name=framelist]").val(selected_id);
					});
			}


			function newitem()
			{
				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data: {item:$("div.itemcontrol").attr("item"),action:'newform'}
					}).done(function(response) {
						loaditems($("div.itemcontrol").attr("item"));
						$("div.form").html(response);
					});
			}

			var spriteimg = new Image();
			function newframe()
			{
				var sprite = $("select[name=list]").val();

				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data: {item:"frame",action:'newform',sprite:sprite}
					}).done(function(response) {
						$("div.frameform").html(response);
						init_frameguide(sprite);						
						redraw_frameguide();
						loadframes(sprite);
					});
			}

			var plot = {scale:1,
						offs:{x:0,y:0},
						mouse:false};

			var plotting_canvas;
			var plotting;
			var preview_canvas;
			var preview;

			function init_frameguide(sprite)
			{
				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data:{ item:"sprite", action:'img', sprite:sprite}
					}).done(function(response) {
						spriteimg.src = "../"+response;
				});

				plotting_canvas = document.getElementById('plottingcanvas');
				plotting = plotting_canvas.getContext('2d');
				preview_canvas = document.getElementById('previewcanvas');
				preview = preview_canvas.getContext('2d');

				plot = {scale:1,
						offs:{x:0,y:0},
						mouse:false,
						drag:[{x:0,y:0},{x:0,y:0}]
					};

				$("#plottingcanvas").mousedown(function(event){
					plot.mouse = true;

					var pos = $(this).position();

					plot.drag[0].x = plot.offs.x;
					plot.drag[0].y = plot.offs.y;

					plot.drag[1].x = event.pageX-pos.left;
					plot.drag[1].y = event.pageY-pos.top;
				});

				$("#plottingcanvas").mousemove(function(event){
					if(plot.mouse)
					{
						var pos = $(this).position();
						
						var mx = event.pageX - pos.left;
						var my = event.pageY - pos.top;
						
						var ox = plot.drag[1].x-mx;
						var oy = plot.drag[1].y-my;

						plot.offs.x = plot.drag[0].x+(-ox/plot.scale);
						plot.offs.y = plot.drag[0].y+(-oy/plot.scale);

						if(mx>plotting_canvas.width  || mx < 0 ||
						   my>plotting_canvas.height || my < 0 )
						$(this).trigger("mouseup");

						redraw_frameguide();
					}
				});

				$("#plottingcanvas").mouseup(function(){
					plot.mouse = false;
				});

				$("input[name=x]").change(redraw_frameguide);
				$("input[name=y]").change(redraw_frameguide);
				$("input[name=w]").change(redraw_frameguide);
				$("input[name=h]").change(redraw_frameguide);
			}

			function scale_frameguide(scale)
			{
				plot.scale += scale;
				if(plot.scale < 0.1) plot.scale = 0.1;
				redraw_frameguide();
			}


			function redraw_frameguide()
			{
				var x = parseInt($("input[name=x]").val());
				var y = parseInt($("input[name=y]").val());
				var w = parseInt($("input[name=w]").val());
				var h = parseInt($("input[name=h]").val());

				if(x == "" || x < 0) x = 0;
				if(y == "" || y < 0) y = 0;
				if(w == "" || w < 1) w = 1;
				if(h == "" || h < 1) h = 1;

				plotting.clearRect(0,0,plotting_canvas.width,plotting_canvas.height);
				preview.clearRect(0,0,preview_canvas.width,preview_canvas.height);

				//Draw checker
				for(var gy = 0; gy < plotting_canvas.height; gy+=10)
					for(var gx = 0; gx < plotting_canvas.width; gx+=10)
				{
					plotting.fillStyle="#222";					
					if((gx/10+gy/10)%2 == 0) plotting.fillStyle="#000";
					plotting.fillRect(gx, gy, 10, 10);
				}

				var factor = h /w ;
				
				var oversize = false;
				if(w > spriteimg.width || h > spriteimg.height || 
				   x+w > spriteimg.width || y+h > spriteimg.height)
					oversize = true;

				if(!oversize)
					preview.drawImage(spriteimg, x, y, w, h, 0, 0, preview_canvas.width, preview_canvas.height*factor);

				plotting.save();
				if(plot.scale != 1)
					plotting.scale(plot.scale,plot.scale);

				plotting.strokeStyle="#FF0";
				if(oversize) plotting.strokeStyle="#F00";
				plotting.strokeRect(x + plot.offs.x, y + plot.offs.y, w, h);

				plotting.drawImage(spriteimg, plot.offs.x, plot.offs.y, spriteimg.width, spriteimg.height);
				
				plotting.restore();
			}

			function deleteitem(confirm)
			{
				if(confirm == undefined) confirm = false;
				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data: {item:$("div.itemcontrol").attr("item"),confirm:confirm,action:'deleteitem',id:$("select[name=list]").val()}
					}).done(function(response) {
						loaditems($("div.itemcontrol").attr("item"));
						$("div.form").html(response);
					});
			}

			function deleteframe(confirm)
			{
				if(confirm == undefined) confirm = false;
				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data: {item:"frame",confirm:confirm,action:'deleteitem',id:$("select[name=framelist]").val()}
					}).done(function(response) {
						loadframes($("select[name=list]").val());
						$("div.frameform").html(response);
					});
			}

			loaditems("asset");

			$("select[name=list]").on("change",function(){

				var selected = $(this).find(":selected");

				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data: {item:selected.attr('item'),action:'editform',id:selected.val()}
					}).done(function(response) {
						$("div.form").html(response);
					});
			});

			$("div.container").on("change","select[name=framelist]",function(){
				var selected = $(this).val();
				var sprite = $("select[name=list]").val();

				$.ajax({
					url: 'asset.ajax.php',
					type: 'GET',
					data: {item:'frame',action:'editform',id:selected}
					}).done(function(response) {
						$("div.frameform").html(response);

						init_frameguide(sprite);
						redraw_frameguide();
					});
			});

			function clearform()
			{
				$("div.form").html("");
			}

			function clearframeform()
			{
				$("div.frameform").html("");
			}

			function actionform()
			{
				$.upload( 'asset.ajax.php?item='+$("div.itemcontrol").attr("item"), new FormData(document.getElementById("mainform")))
				.progress( function( progressEvent, upload) {
					if( progressEvent.lengthComputable) {
						var percent = Math.round( progressEvent.loaded * 100 / progressEvent.total) + '%';

						$("div.form").html( 'Saving... ('+percent+' complete)');
					}
				})
				.done( function(response) {
					loaditems($("div.itemcontrol").attr("item"));
					$("div.form").html( response );
				});
			}

			function frameactionform()
			{
				$.upload( 'asset.ajax.php?item=frame', new FormData(document.getElementById("frameform")))
				.progress( function( progressEvent, upload) {
					if( progressEvent.lengthComputable) {
						var percent = Math.round( progressEvent.loaded * 100 / progressEvent.total) + '%';

						$("div.frameform").html( 'Saving... ('+percent+' complete)');
					}
				})
				.done( function(response) {
					var sprite = $("select[name=list]").val();
					loadframes(sprite);
					$("div.frameform").html( response );
				});
			}



		</script>

	</body>

</html>


