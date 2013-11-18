<?php
require_once ("environment.inc.php");

	switch($_GET['item'])
	{
		case "asset":
			switch($_REQUEST['action'])
			{
				case "object":
					$output = array();

					$assets = DATABASE::records("sprite_asset");
					if(is_array($assets) && count($assets))
					foreach($assets as $asset)
					{
						$output[$asset['name']] = $asset;
					}

					echo json_encode($output);

				break;

				case "list":
					$assets = DATABASE::records("sprite_asset");
					if(is_array($assets) && count($assets))
					foreach($assets as $asset)
					{
						echo "<option item='asset' value='".$asset['sprite_asset_id']."'>".$asset['name']."</option>";
					}
				break;

				case "newform":
				?>
					<form id="mainform">
						<input type="hidden" name="action" value="newitem">
						<div class="label">Name:</div><div class="input"><input type="text" name="name"></div>
						<div class="label">Details:</div><div class="input"><textarea name="description"></textarea></div>
						<div class="label">File:</div><div class="input"><input type="text" name="path"><input type="file" name="path_file"></div>
					</form>

					<div class="formbuttons">
						<button type="button" onClick="actionform()">Create</button>
						<button type="button" onClick="clearform()">Cancel</button>
					</div>
				<?
				break;

				case "newitem":

					$data['name'] = $_POST['name'];
					$data['description'] = $_POST['description'];

					if(trim($_POST['path']) != "")
						$data['path'] = $_POST['path'];
					else
					{
						$savepath = "assets/media/".$_FILES['path_file']['name'];
						copy($_FILES['path_file']['tmp_name'],"../".$savepath);
						$data['path'] = $savepath;
					}

					if(DATABASE::insert("sprite_asset",$data)) echo "Asset created successfully.";
				break;

				case "edititem":

					$data['name'] = $_POST['name'];
					$data['description'] = $_POST['description'];

					if(trim($_POST['path']) != "")
						$data['path'] = $_POST['path'];
					else
					{
						$savepath = "assets/media/".$_FILES['path_file']['name'];
						copy($_FILES['path_file']['tmp_name'],"../".$savepath);
						$data['path'] = $savepath;
					}
					if(DATABASE::update("sprite_asset",array("sprite_asset_id"=>$_REQUEST['id']),$data)) echo "Asset updated successfully.";
				break;

				case "deleteitem":

					$asset = DATABASE::record("sprite_asset","sprite_asset_id",$_GET['id']);

					if(isset($_GET['confirm']) && $_GET['confirm'] == "true")
					{
						$data['sprite_asset_id'] = $_GET['id'];
						unlink("../".$asset['path']);
						if(DATABASE::delete("sprite_asset",$data)) echo "Asset deleted successfully.";
						die();
					}
					?>
						<div>
						Delete asset "<?=$asset['name']?>"?
						</div>
						<div class="formbuttons">
							<button type="button" onClick="deleteitem(true)">Delete</button>
							<button type="button" onClick="clearform()">Cancel</button>
						</div>
					<?


				break;

				case "editform":

					$asset = DATABASE::record("sprite_asset","sprite_asset_id",$_GET['id']);

				?>
					<form id="mainform">
						<input type="hidden" name="action" value="edititem">
						<input type="hidden" name="id" value="<?=$_GET['id']?>">
						<div class="label">Name:</div><div class="input"><input type="text" name="name" value="<?=$asset['name']?>"></div>
						<div class="label">Details:</div><div class="input"><textarea name="description"><?=$asset['description']?></textarea></div>
						<div class="label">File:</div><div class="input"><input type="text" name="path" value="<?=$asset['path']?>"></div>
						<div style="clear:both;"></div>
						<div style="background-color:#000;margin: 10px 0;">
							<img src="../<?=$asset['path']?>" width="100%">
						</div>
					</form>
					<div class="formbuttons">
						<button type="button" onClick="actionform()">Update</button>
						<button type="button" onClick="clearform()">Cancel</button>
					</div>
				<?
				break;
			}
		break;



		case "sprite":
			switch($_REQUEST['action'])
			{
				case "img":
					$sprite = DATABASE::record("sprite","sprite_id",$_GET['sprite']);
					$asset = DATABASE::record("sprite_asset", "sprite_asset_id", $sprite['asset']);
					echo $asset['path'];
				break;

				case "list":
					$sprites = DATABASE::records("sprite");
					if(is_array($sprites) && count($sprites))
					foreach($sprites as $sprite)
					{
						echo "<option item='sprite' value='".$sprite['sprite_id']."'>".$sprite['name']."</option>";
					}
				break;

				case "newform":
				?>
					<form id="mainform">
						<input type="hidden" name="action" value="newitem">
						<div class="label">Name:</div><div class="input"><input type="text" name="name"></div>
						<div class="label">fps:</div><div class="input"><input type="text" name="fps" style="width:35px;"></div>
						<div class="label">count:</div><div class="input"><input type="text" name="count" style="width:35px;"></div>
						<div class="label">asset:</div><div class="input">
							<select name="asset">
								<option>-Select Image-</option>
							<?
								$assets = DATABASE::records("sprite_asset");
								if(is_array($assets) && count($assets))
								foreach($assets as $asset)
								{
									echo "<option value='".$asset['sprite_asset_id']."'>".$asset['name']."</option>";
								}
							?>
							</select>
						</div>
					</form>
					<div class="formbuttons">
						<button type="button" onClick="actionform()">Create</button>
						<button type="button" onClick="clearform()">Cancel</button>
					</div>
				<?
				break;

				case "newitem":

					$data['name'] = $_POST['name'];
					$data['fps'] = $_POST['fps'];
					$data['count'] = $_POST['count'];
					$data['asset'] = $_POST['asset'];
					if(DATABASE::insert("sprite",$data)) echo "Sprite created successfully.";

				break;

				case "edititem":

					$data['name'] = $_POST['name'];
					$data['fps'] = $_POST['fps'];
					$data['count'] = $_POST['count'];
					$data['asset'] = $_POST['asset'];
					if(DATABASE::update("sprite",array("sprite_id"=>$_REQUEST['id']),$data)) echo "Sprite updated successfully.";

				break;

				case "deleteitem":

					$sprite = DATABASE::record("sprite","sprite_id",$_GET['id']);

					if(isset($_GET['confirm']) && $_GET['confirm'] == "true")
					{
						$data['sprite_id'] = $_GET['id'];
						if(DATABASE::delete("sprite",$data)) echo "Sprite deleted successfully.<br>";
						if(DATABASE::delete("sprite_frame",$data)) echo "Sprite frames deleted successfully.<br>";
						die();
					}
					?>
						<div>
						Delete asset "<?=$sprite['name']?>"?
						</div>
						<div class="formbuttons">
							<button type="button" onClick="deleteitem(true)">Delete</button>
							<button type="button" onClick="clearform()">Cancel</button>
						</div>
					<?


				break;

				case "editform":

					$sprite = DATABASE::record("sprite","sprite_id",$_GET['id']);
				?>
					<form id="mainform">
						<input type="hidden" name="action" value="edititem">
						<input type="hidden" name="id" value="<?=$_GET['id']?>">
						<div class="label">Name:</div><div class="input"><input type="text" name="name" value="<?=$sprite['name']?>"></div>
						<div class="label">fps:</div><div class="input"><input type="text" name="fps" value="<?=$sprite['fps']?>" style="width:35px;"></div>
						<div class="label">count:</div><div class="input"><input type="text" name="count" value="<?=$sprite['count']?>" style="width:35px;"></div>
						<div class="label">asset:</div><div class="input">
							<select name="asset">
								<option>-Select Image-</option>
							<?
								$assets = DATABASE::records("sprite_asset");
								if(is_array($assets) && count($assets))
								foreach($assets as $asset)
								{
									if($sprite['asset'] == $asset['sprite_asset_id'])
										echo "<option value='".$asset['sprite_asset_id']."' selected>".$asset['name']."</option>";
									else
										echo "<option value='".$asset['sprite_asset_id']."'>".$asset['name']."</option>";
								}
							?>
							</select>
						</div>
					</form>
					<div class="formbuttons">
						<button type="button" onClick="actionform()">Update</button>
						<button type="button" onClick="clearform()">Cancel</button>
					</div>
					<div class="spriteframes">
						<div style="float:left;width:25%">
							<select size="6" name="framelist" size>
							</select>
							<script>
								loadframes(<?=$sprite['sprite_id']?>);
							</script>
						</div>
						<div style="float:left;width:75%">
							<div class="formbuttons" style="padding:10px 0;">
								<button type="button" onClick="newframe()">New Frame</button>
								<button type="button" onClick="deleteframe()">Delete Frame</button>
							</div>
							<div class="frameform">
							</div>
						</div>
					</div>
				<?
				break;
			}
		break;



		case "frame":
			switch($_REQUEST['action'])
			{
				case "list":
					$frames = DATABASE::records("sprite_frame",array("sprite_id"=>$_GET['sprite']));
					if(is_array($frames) && count($frames))
					foreach($frames as $frame)
					{
						echo "<option item='frame' value='".$frame['sprite_frame_id']."'>".$frame['name']." : ".$frame['mip']."</option>";
					}
				break;

				case "newform":
				?>
					<form id="frameform">
						<input type="hidden" name="action" value="newitem">
						<input type="hidden" name="sprite_id" value="<?=$_GET['sprite']?>">
						<div style="clear:both;padding-top:10px;text-align:right;">	Name:<input type="text" name="name" style="width:175px;">
																					X:<input type="text" name="x" style="width:35px;" value="0">
																					Y:<input type="text" name="y" style="width:35px;" value="0">
																					W:<input type="text" name="w" style="width:35px;" value="1">
																					H:<input type="text" name="h" style="width:35px;" value="1">
																					MipMap:<input type="text" name="m" style="width:35px;" value="1">
						</div>
						<div style="text-align:center;padding: 10px;">
							<canvas id="plottingcanvas" style="background-color:#000; margin-top:10px;" width="300" height="300"></canvas>
							<canvas id="previewcanvas" style="background-color:#000; margin:10px;" width="150" height="150"></canvas>
							<button type="button" onclick="scale_frameguide(-0.1)"> - </button>
							<button type="button" onclick="scale_frameguide(0.1)"> + </button>
						</div>
					</form>
					<div class="formbuttons">
						<button type="button" onClick="frameactionform()">Create</button>
						<button type="button" onClick="clearframeform()">Cancel</button>
					</div>
				<?
				break;

				case "newitem":

					$data['name'] = $_POST['name'];
					$data['x'] = $_POST['x'];
					$data['y'] = $_POST['y'];
					$data['w'] = $_POST['w'];
					$data['h'] = $_POST['h'];
					$data['mip'] = $_POST['m'];
					$data['sprite_id'] = $_POST['sprite_id'];
					if(DATABASE::insert("sprite_frame",$data)) echo "Frame created successfully.";

				break;

				case "edititem":

					$data['name'] = $_POST['name'];
					$data['x'] = $_POST['x'];
					$data['y'] = $_POST['y'];
					$data['w'] = $_POST['w'];
					$data['h'] = $_POST['h'];
					$data['mip'] = $_POST['m'];
					if(DATABASE::update("sprite_frame",array("sprite_frame_id"=>$_REQUEST['sprite_frame_id']),$data)) echo "Frame updated successfully.";

				break;

				case "deleteitem":

					$frame = DATABASE::record("sprite_frame","sprite_frame_id",$_GET['id']);

					if(isset($_GET['confirm']) && $_GET['confirm'] == "true")
					{
						$data['sprite_frame_id'] = $_GET['id'];
						if(DATABASE::delete("sprite_frame",$data)) echo "Sprite frame deleted successfully.<br>";
						die();
					}
					?>
						<div>
						Delete frame "<?=$frame['name']?>"?
						</div>
						<div class="formbuttons">
							<button type="button" onClick="deleteframe(true)">Delete</button>
							<button type="button" onClick="clearform()">Cancel</button>
						</div>
					<?


				break;

				case "editform":
					$frame = DATABASE::record("sprite_frame","sprite_frame_id",$_GET['id']);
				?>
					<form id="frameform">
						<input type="hidden" name="action" value="edititem">
						<input type="hidden" name="sprite_id" value="<?=$frame['sprite_id']?>">
						<input type="hidden" name="sprite_frame_id" value="<?=$_GET['id']?>">
						<div style="clear:both;padding-top:10px;text-align:right;">	Name:<input type="text" name="name" style="width:175px;" value="<?=$frame['name']?>">
																					X:<input type="text" name="x" style="width:35px;" value="<?=$frame['x']?>">
																					Y:<input type="text" name="y" style="width:35px;" value="<?=$frame['y']?>">
																					W:<input type="text" name="w" style="width:35px;" value="<?=$frame['w']?>">
																					H:<input type="text" name="h" style="width:35px;" value="<?=$frame['h']?>">
																					MipMap:<input type="text" name="m" style="width:35px;" value="<?=$frame['mip']?>">
						</div>
						<div style="text-align:center;padding: 10px;">
							<canvas id="plottingcanvas" style="background-color:#000; margin-top:10px;" width="300" height="300"></canvas>
							<canvas id="previewcanvas" style="background-color:#000; margin:10px;" width="150" height="150"></canvas>
							<button type="button" onclick="scale_frameguide(-0.1)"> - </button>
							<button type="button" onclick="scale_frameguide(0.1)"> + </button>
						</div>
					</form>
					<div class="formbuttons">
						<button type="button" onClick="frameactionform()">Update</button>
						<button type="button" onClick="clearframeform()">Cancel</button>
					</div>
				<?
				break;
			}
		break;


	}




?>

