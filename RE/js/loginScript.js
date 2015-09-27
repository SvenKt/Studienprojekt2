////////////////
//USES user.js//
////////////////
$(document).ready(function(){
$("#read").hide();
$("#error").hide();
//leite auch weiter, wenn enter gedrückt wurde
$(document).keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			checkCredentials();
		}
		event.stopPropagation();
	});
});

function checkCredentials(){
var user=$("#userPHP").val();
var pass=$("#passPHP").val();
var cookie="";

$.ajax({
			url: "php/loginCheck.php",
			type: "POST",
			data: {"username": user, "password": pass},
			dataType: "json",
			success: function(exists){
				if(exists == 'true'){
				cookie = Math.round(Math.random()*999999);
				
				console.log(createUser(user));
				redirectToDashboard();		
				
				} else {
				$("#read").text(login.credentials).slideDown(500).delay(2000).slideUp(500);
				}
			},
			error: function(){alert("Error: Login failed.");}
		});


}

function registerUser(){
var username=$("#reg_user").val();
var password=$("#reg_pw").val();
var password_repeat=$("#reg_pw2").val();
var email=$("#reg_email").val();


$.ajax({
			url: "php/registerUser.php",
			type: "POST",
			data: {"username": username, "password": password, "password2": password_repeat, "email": email},
			dataType: "json",
			success: function(success){
			var mess;
				switch (success) {
					case 0: mess = login.mess0; break;
					case 1: mess = login.mess1; break;
					case 2: mess = login.mess2; break;
					case 3: mess = login.mess3; break;
					case 4: mess = login.mess4; break;
					case 5: mess = login.mess5; break;
				}
				$("#head_modal").text(mess).slideDown(500).delay(2000).slideUp(500);
				if ((mess.search("Fehler") == -1) && (mess.search("Error") == -1)){ window.setTimeout(function(){$('#register').modal('hide'); }, 2000);};
			},
			error: function(){alert("Error: Registration failed.");}
			});

}
