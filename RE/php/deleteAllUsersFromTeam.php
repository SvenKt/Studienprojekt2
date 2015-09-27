<?php
require 'db_conf.php';

$team_id=$_POST['team_id'];


	//connect to DB
	establishDBConnection();

	$kickUser = "update users set team_id=NULL where team_id='".$team_id."';";
	$userKicked = mysql_query($kickUser) OR die(mysql_error());
	

	echo json_encode("Alle User erfolgereich aus Team entfernt");

		
	
		
?>