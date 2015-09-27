<?php
require 'db_conf.php';

$memberToAdd = $_POST['member'];
$team = $_POST['teamName'];
$userIsInOtherTeam = false;
$userExists = false;
$code;

	//connect to DB
	establishDBConnection();
			
			//check user exists
			$checkUserExists = "select count(username) as total from users where username='".$memberToAdd."';";
			$checkedUserExists = mysql_query($checkUserExists) or die('mysql_error');
			
			$row = mysql_fetch_object($checkedUserExists);
			
			//if number of rows > 0, then users exists
			if ($row->total > 0){
					$userExists = true;
			}
			
			
			
			
			if ($userExists){
			
				$checkUserIsNotInOtherTeam = "select team_id from users where username='".$memberToAdd."';";
				$userChecked = mysql_query($checkUserIsNotInOtherTeam) OR die(mysql_error());
			
				while ($row = mysql_fetch_object($userChecked)){
					if ($row->team_id != null){
						$userIsInOtherTeam = true;
					}
				}
		
				if(!$userIsInOtherTeam){
					$addUserToTeam = "update users, team set users.team_id=team.id where team.name='".$team."' AND users.username='".$memberToAdd."';";
					$userAdded = mysql_query($addUserToTeam) OR die(mysql_error());
				
					if ($userAdded){
					$code=0;
					
					//		echo json_encode($memberToAdd." wurde dem Team ".$team." hinzugefügt");
					} else {
					$code=1;
					//		echo json_encode($memberToAdd." konnte nicht dem Team ".$team." hinzugefügt werden oder existiert nicht");
					}
				} else {
					$code=2;
				//	echo json_encode("Fehler: User ist bereits in einem anderen Team.\n Dieses muss er erst verlassen, um in Ihr Team einzutreten");
				}	
			} else {
					$code=3;
			//	echo json_encode("Fehler: ".$memberToAdd." existiert nicht!");
			}
			
			echo json_encode($code);
			

			
		
?>