<?php
require 'registerClass.php';


$admin = new Regist;
$admin->initInput();
$admin->checkPassLength();
$admin->checkPasswordsEqual();

$code;

if ($admin->inputOK && $admin->passwordEq && $admin->passSafe && $admin->emailValid){
	
	$md5hash = md5($admin->password);

	//connect to DB
	establishDBConnection();

	//create Query
	$injection = "UPDATE users SET password='".$md5hash."', email='".$admin->email."' WHERE username='".$admin->username."';";
	$passwordChanged = mysql_query($injection);

	if ($passwordChanged){
		//echo json_encode("Daten erfolgreich geändert!");
		$code=0;
	} else {
		$code=1;
		//echo json_encode("Fehler: Daten konnten nicht geändert werden...");
	}
} else if (!$admin->inputOK){
			$code=2;
			//echo json_encode("Fehler: Bitte alle Fehler ausfüllen!");
		} else 
		if (!$admin->emailValid){
			$code=3;
				//echo json_encode("Fehler: Email nicht gültig!");
			} else	if (!$admin->passwordEq){
						$code=4;
				//echo json_encode("Fehler: Passwörter sind nicht identisch!");
			} else if (!$admin->passSafe){
						$code=5;
					//echo json_encode("Fehler: Passwort zu unsicher - mindestens 8 Zeichen eingeben!!");
		}
	echo json_encode($code);


?>