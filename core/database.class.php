<?php
function prependcolon_where($value){return ":where_".$value;}
function prependcolon($value){return ":".$value;}

class DATABASE
{
	public static $VERSION = "0.1";
	public static $PDO;
	public static $FETCHMODE = 0;

	public static function drop_table($table)
	{
		if(strpos($table,"cmx_") === false)
			self::$PDO->query("DROP TABLE `".$table."`");
	}

	public static function empty_table($table)
	{
		if(strpos($table,"cmx_") === false)
			self::$PDO->query("TRUNCATE TABLE `".$table."`");
	}

	public static function table($table,$data,$controls)
	{
		if(is_array($data) && count($data) > 0)
		{
			$SQL = "CREATE TABLE IF NOT EXISTS `".$table."` (";

			foreach($data as $key=>$value)
			{
				$elements[] = "`".$key."` ".$value['type']." ".$value['switch']." ".$value['option'];

				if(isset($value['key']))
				switch($value['key'])
				{
					case "PRIMARY":
						$prikey = $key;
					break;
					case "UNIQUE":
						$unikey[] = $key;
					break;
				}
			}

			if(isset($prikey))
				$elements[] = "PRIMARY KEY (`".$prikey."`)";

			if(isset($unikey) && is_array($unikey))
			{
				foreach($unikey as $value)
				{
					$elements[] = "UNIQUE KEY (`".$value."`)";
				}
			}

			$SQL .= implode(",",$elements);
			$SQL .= ") ";
			foreach($controls as $key=>$value)
			{
				$SQL .= $key."=".$value." ";
			}

			echo $SQL;

			self::$PDO->query($SQL);
		}
	}

	public static function insert($table, $data)
	{
		if(is_array($data) && count($data) > 0)
		{
			$field_array = array_keys($data);
			$fields = "`".implode("`, `", $field_array)."`";
			$values = implode(",", array_map("prependcolon",$field_array));

			$SQL = "INSERT INTO `".$table."` (".$fields.") VALUES (".$values.")";
			try
			{
				$statement = self::$PDO->prepare($SQL);
				$statement->execute($data);
			}
			catch(PDOException $e)
			{
				echo("Unable to insert into ".$table."\n");
				echo 'ERROR: ' . $e->getMessage();
			}

			return self::$PDO->lastInsertId();
		}

		return false;
	}


	private static function WHERE($ids)
	{
		if(is_array($ids) && count($ids) > 0)
		{
			foreach($ids as $field => $value)
			{
				if(strpos($field, "^") !== false)
				{
					$operator = substr($field, strpos($field, "^")+1);
					$field = substr($field, 0, strpos($field, "^"));
				}
				else
				{
					$operator = "=";
				}
				$where[] = "`".$field."` ".$operator." ".$value;
			}
			$where = implode(" AND ", $where);

			return " WHERE ".$where;
		}
		return "";
	}
	private static function FILTERS($filters)
	{
		$where_fields = array_keys($filters);
		$where_values = array_map("prependcolon_where",$where_fields);
		$where = array_combine($where_fields, $where_values);
		$data = array_combine($where_values, $filters);
		return array($where,$data);
	}


	public static function update($table, $filters, $data)
	{
		if(is_array($data) && count($data) > 0)
		{
			$fields = array_keys($data);
			$values = array_map("prependcolon",$fields);
			$data = array_combine($values,$data);

			$set = array();
			foreach($fields as $key => $field) $set[] = "`".$field."` = ".$values[$key];
			$set = implode(",",$set);

			$where = self::FILTERS($filters);
			$data = array_merge($data,array_pop($where));

			$SQL = trim("UPDATE `".$table."` SET ".$set." ".self::WHERE(array_pop($where)));
			try
			{
				$statement = self::$PDO->prepare($SQL);
				$statement->execute($data);
			}
			catch(PDOException $e)
			{
				echo("Unable to update rows in ".$table);
				echo 'ERROR: ' . $e->getMessage();
				return false;
			}
			return true;
		}
		return false;
	}

	public static function delete($table, $filters)
	{
		if(is_array($filters) && count($filters) > 0)
		{
			$where = self::FILTERS($filters);
			$data = array_pop($where);

			$SQL = "DELETE FROM `".$table."` ".self::WHERE(array_pop($where));
			try
			{
				$statement = self::$PDO->prepare($SQL);
				$statement->execute($data);
			}
			catch(PDOException $e)
			{
				echo("Unable to delete rows in ".$table);
				echo 'ERROR: ' . $e->getMessage();
				return false;
			}
			return true;
		}

		return false;
	}

	public static function record($table, $field_id="", $value_id="", $get_fields="*")
	{
		$filters[$field_id] = $value_id;
		$where = self::FILTERS($filters);
		$data = array_pop($where);

		$limit = "";
		if($value_id == "") $limit = " LIMIT 0, 1";

		$SQL = "SELECT ".$get_fields." FROM `".$table."` ".self::WHERE(array_pop($where)).$limit;

		try
		{
			$statement = self::$PDO->prepare($SQL);
			$statement->execute($data);
		}
		catch(PDOException $e)
		{
			echo("Unable to select row in ".$table);
			echo 'ERROR: ' . $e->getMessage();
			return false;
		}

		return $statement->fetch(self::$FETCHMODE);
	}

	public static function records($table, $filters="", $sort="", $limit="", $get_fields="*")
	{
		$where = self::FILTERS($filters);
		$data = array_pop($where);

		$limit = (strlen(trim($limit)) > 0) ? " LIMIT 0, ".$limit:"";
		$sort = (strlen(trim($sort)) > 0) ? " ORDER BY ".$sort."":"";

		$SQL = "SELECT ".$get_fields." FROM `".$table."` ".self::WHERE(array_pop($where)).$sort.$limit;

		try
		{
			$statement = self::$PDO->prepare($SQL);
			$statement->execute($data);
		}
		catch(PDOException $e)
		{
			echo("Unable to select rows in ".$table."\n");
			echo 'ERROR: ' . $e->getMessage();
			return false;
		}

		return $statement->fetchAll(self::$FETCHMODE);
	}

	public static function query($sql)
	{
		$rs = mysql_query($sql);
		if($rs)
		{
			$tmp = strtolower($sql);
			if(	strpos(trim($tmp), "select") === 0 ||
				strpos(trim($tmp), "show") === 0)
			{
				if(mysql_num_rows($rs))
				{
					$results = array();
					while($data = mysql_fetch_assoc($rs))
					{
						$results[] = $data;
					}
					mysql_free_result($rs);
					return $results;
				}
				else
				{
					return FALSE;
				}
			}
			else
			{
				return TRUE;
			}
		}
		else
		{
			echo("SQL - ".$sql."<br />MYSQL ERROR - ".mysql_error());
			exit();
		}
	}


	public static function DRIVERS()
	{
		return PDO::getAvailableDrivers();
	}


	public static function INIT($host,$driver,$user,$pass,$name)
	{
		if(class_exists('PDO') === false)
		{
			$error = "This server does not support PDO.";
			throw new Exception($error);
			return false;
		}

		if(!in_array($driver,self::DRIVERS()))
		{
			$error = "Database driver '".$driver."' not supported on this server.";
			throw new Exception($error);
			return false;
		}

		try
		{
			self::$PDO = new PDO( $driver.':host='.$host.';dbname='.$name, $user, $pass );
			self::$PDO->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			self::$FETCHMODE = PDO::FETCH_ASSOC;
		}
		catch(PDOException $e)
		{
			$error = "Unable to connect to ".$driver.":host=".$host.";dbname=".$name."\n";
			$error .= 'ERROR: ' . $e->getMessage();
			throw new Exception($e);

			return false;
		}

		return true;
	}
}
?>
