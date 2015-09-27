<?php
require 'db_conf.php';

$user=$_POST['user'];

	//connect to DB
	establishDBConnection();
	

			$leaveMyTeam = "update users set team_id=NULL where username='".$user."';";
			$teamLeft = mysql_query($leaveMyTeam) OR die(mysql_error());
			
		
			if($teamLeft){
				//echo json_encode("Sie haben das Team verlassen");
				$code=0;
			} else {
				$code=1;
				//echo json_encode("Fehler: Sie konnten das Team nicht verlassen");
			}	
		echo json_encode($code);
?>