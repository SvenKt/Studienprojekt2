<?php
require 'db_conf.php';

if(isset($_POST['username']) && isset($_POST['password'])){
	$username=$_POST['username'];
	$password=$_POST['password'];
	$userExists="false";
	$password_hash=md5($password);

establishDBConnection();

$abfrage = "SELECT * FROM users";
$ergebnis = mysql_query($abfrage);
while($row = mysql_fetch_object($ergebnis))
   {
	if ($username==$row->username && $password_hash==$row->password){
		$userExists="true";
	}
   }
   
		echo json_encode($userExists);

} else {
echo json_encode("Bitte Daten eingeben!");
}
?>

