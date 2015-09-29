<?php
require 'db_conf.php';

//POST VARS
$id=$_POST['userID'];


//FUNCS
function userHasTeam($userID){
	$userHasTeam = false;
	$checkTeam = "select team_id from users where id='".$userID."';";
	$teamChecked = mysql_query($checkTeam) OR die(mysql_error());
	
	$row = mysql_fetch_object($teamChecked);
	
	if($row->team_id != null){
		$userHasTeam = true;
	}
	
	return $userHasTeam;
}

function kickUserFromTeam($userID){

$leaveTeam = "update users set team_id=NULL where id='".$userID."';";

$teamLeft = mysql_query($leaveTeam);

}

function deleteUsersReqs($userID){
	$deleteRequirements = "delete from requirements where owner_id=".$userID.";";
	$reqsDeleted = mysql_query($deleteRequirements) OR die(mysql_error());
}

function deleteUser($userID){
	$deleteUser = "delete from users where id='".$userID."';";
	$userDeleted = mysql_query($deleteUser) OR die(mysql_error());
	
	echo json_encode("User erfolgreich entfernt");
}


//MAIN

	//connect to DB
	establishDBConnection();

	
	if(userHasTeam($id)){
		kickUserFromTeam($id);
	} 
	
	deleteUsersReqs($id);
	deleteUser($id);
	
		
	
		
?>