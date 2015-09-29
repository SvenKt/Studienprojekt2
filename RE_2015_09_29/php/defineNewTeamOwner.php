<?php
require 'db_conf.php';

$teamID=$_POST['teamID'];
$newOwner=$_POST['newOwner'];
$userExists=false;


	//connect to DB
	establishDBConnection();

	//prüfe, ob nutzer existiert
	$checkUserExists = "select count(username) as total from users where username='".$newOwner."';";
	$checkedUserExists = mysql_query($checkUserExists) or die('mysql_error');
	
	$row = mysql_fetch_object($checkedUserExists);
	
	//if number of rows > 0, then users exists
	if ($row->total > 0){
			$userExists = true;
	}
	
	if($userExists){
	//überschreibe besitzer / owner
	$defineNewOwner="update users, team set team.creator_id=users.id where team.id='".$teamID."' AND users.username='".$newOwner."';";
	$newOwnerDefined=mysql_query($defineNewOwner) OR die(mysql_error());
	
		if($newOwnerDefined){
			$code=0;
			//echo json_encode("Team erfolgreich überschrieben");
		} else {
			$code=1;
			//echo json_encode("Fehler: Team konnte nicht überschrieben werden");
		}

	} else {
			$code=2;
			//echo json_encode("Fehler: Nutzer existiert nicht!");
	}
	
	echo json_encode($code);
		
		

?>