<?php
require 'db_conf.php';

class Regist {

var $username;
var $password;
var $password2;
var $email;
var $inputOK=false;
var $passwordEq=false;
var $userExists=false;
var $passSafe=false;
var $emailValid=false;
var $md5pw;

function initInput(){
	if($_POST['username'] != "" && $_POST['password'] != "" && $_POST['password2'] != "" && $_POST['email'] != ""){
		$this->inputOK=true;
		$this->username=$_POST['username'];
		$this->password=$_POST['password'];
		$this->password2=$_POST['password2'];
		$this->email=$_POST['email'];
		if(preg_match("/([0-9a-zA-Z_.+-])@([0-9a-zA-Z_.+-]).(\w+)/",$this->email)){
			$this->emailValid=true;
		} 
	} 
}

function checkPassLength(){
	if(strlen($this->password) > 7 && strlen($this->password2) > 7){
		$this->passSafe=true;
	}
}

function checkPasswordsEqual(){
	if ($this->password==$this->password2){
		$this->passwordEq=true;
	}
}

function checkUserExists(){
	//connect to DB
	establishDBConnection();
	//create Query
	$abfrage = "SELECT username FROM users";
	$ergebnis = mysql_query($abfrage);
	//read DB and compare input.username with db.username
	while($row = mysql_fetch_object($ergebnis))
		{
			if ($this->username==$row->username){
				$this->userExists=true;
		}
	}
}

function registerUser(){
	$this->initInput();
	$this->checkPassLength();
	$this->checkPasswordsEqual();
	$this->checkUserExists();
	
	//call functions to validate inputs
	$password_hash=md5($this->password);

	if (!$this->userExists && $this->passwordEq && $this->passSafe && $this->inputOK){

		//create Query
		$injection = "INSERT INTO users (username, password, email) VALUES ('".$this->username."','".$password_hash."','".$this->email."')";
		$register = mysql_query($injection);
		
		//register success
		//echo json_encode("Registrierung erfolgreich");
		$code=0;
	} else if(!$this->inputOK){
				$code=1;
				//echo json_encode("Fehler: Bitte alle Felder ausfüllen!");
			}else  if(!$this->emailValid){
				$code=2;
				//echo json_encode("Fehler: Email ist nicht gültig!");
			}else  if (!$this->passwordEq){
				$code=3;
				//passwords are not equal
				//echo json_encode("Fehler: Passwörter stimmen nicht überein...");
			}	else if ($this->userExists){
						$code=4;
						//user already exist
						//echo json_encode("Fehler: Username schon vergeben...");
					 } else if (!$this->passSafe){
								//password not safe
								$code=5;
								//echo json_encode("Fehler: Passwort zu unsicher - mindestens 8 Zeichen eingeben!");
							}
		echo json_encode($code);
	}
}
?>