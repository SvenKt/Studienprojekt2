<?php
require 'db_conf.php';

$id=$_POST['userID'];

	//connect to DB
	establishDBConnection();

	$kickUser = "update users set team_id=NULL where id='".$id."';";
	$userKicked = mysql_query($kickUser) OR die(mysql_error());
	

	echo json_encode("User erfolgereich aus Team entfernt");

		
	
		
?>