<?php
require 'db_conf.php';

	if (isset($_POST['query'])){
		$query=$_POST['query'];
	}
	
	$users = "";
	//connect to DB
	establishDBConnection();
		
	if(isset($_POST['query'])){
		$getUsers = "SELECT username, id, team_id, email FROM users WHERE username like '%".$query."%' OR email like '%".$query."%' ;";
	} else {
		$getUsers = "SELECT username, id, team_id, email FROM users;";
	}
	$allUsers = mysql_query($getUsers) or die (mysql_error());
	
	if($allUsers){
		while ($row = mysql_fetch_object($allUsers)){
			$users[] = array($row->id, $row->username,$row->email,$row->team_id);
		}
	}
	
	echo json_encode($users);		
?>