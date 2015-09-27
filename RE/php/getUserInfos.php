<?php
require 'db_conf.php';

$userID=$_POST['userID'];
$data;
	//connect to DB
	establishDBConnection();

	$dataQuery = "select username, email from users where id=".$userID.";";
	$catchData = mysql_query($dataQuery) OR die(mysql_error());
	
	
	while($row = mysql_fetch_object($catchData))
		{
			$data[0] = $row->username;
			$data[1] = $row->email;
		}
	
	
	echo json_encode($data);
	
		
		

?>