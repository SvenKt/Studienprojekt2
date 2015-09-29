<?php
require 'db_conf.php';

$teamID=$_POST['teamID'];
$members= null;
	establishDBConnection();

	
	$getMembersFromTeam = "SELECT users.id, users.username  FROM users where team_id=".$teamID.";";
	$gotMembers = mysql_query($getMembersFromTeam) OR die(mysql_error());
	
			while($row = mysql_fetch_object($gotMembers)){
			 $members[] = array($row->id, $row->username);
			}
		
		
			echo json_encode($members);
		

?>