<?php
	require_once("database.class.php");

	try
	{
		DATABASE::INIT("localhost","mysql","game","CavVLaFZmZdEe7tF","game");
	}
	catch(Exception $e)
	{
		die("There was a problem connecting to the database. \nERROR: " . $e->getMessage());
	}
?>
