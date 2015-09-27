////////////////
//USES user.js//
////////////////

$(document).ready(function(){
	//hide for adminpage
	$("#admin_error").hide();
	$("#admin_dialog").hide();
	$("#dialog_team_modal").hide();
	getUsers();

	//Enter zum Suchen
	$("#search_field").keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			searchUsers();
		}
		event.stopPropagation();
	});
	
	//Navlist anpassung nach Modal
	$("#profil").on('hidden.bs.modal', function(){
		$('#main-nav').find('.active').removeClass('active');
		oldActive.addClass('active');
	});
});


function changeData(){
var password=$("#ch_pw").val();
var password_repeat=$("#ch_pw2").val();
var email=$("#ch_email").val();
var username=getUserName;

$.ajax({
			url: "php/changeData.php",
			type: "POST",
			data: {"username": username, "password": password, "password2": password_repeat, "email": email},
			dataType: "json",
			success: function(code){
			var mess;
			switch (code) {
					case 0: mess= changeData.mess0; break;
					case 1: mess= changeData.mess1; break;
					case 2: mess= changeData.mess2; break;
					case 3: mess= changeData.mess3; break;
					case 4: mess= changeData.mess4; break;
					case 5: mess= changeData.mess5; break;
				}
				$("#head_modal_dash").text(mess).slideDown(500).delay(2000).slideUp(500);
				if ((mess.search("Fehler") == -1) && (mess.search("Error") == -1)){ window.setTimeout(function(){$('#profil').modal('hide'); }, 2000);};
			},
			error: function(){alert("Error: Changing userdata failed.");}
			});

}

function logOut(){
	location.replace("index.php");
}


function confirmUserRemoval(username,userID){
	$( "#admin_dialog" ).dialog({
		resizable: false,
		height: 140,
		width: 600,
		title: userdel_admin.title,
		modal: true,
		buttons: {
			"OK": function() {
			//wenn user gelöscht werden soll, finde heraus, ihm irgendwelche teams gehören
			$.ajax({
				url: "php/getMyGroups.php",
				type: "POST",
				data: {"user":username},
				dataType: "json",
				success: function(success){
					//zeige dann die von nutzer erstellten teams an
					displayKickContent(username,userID);
				},
				error: function(){alert("Error: Removing user failed.");}
			});
			
			$( this ).dialog( "close" );
				
			},
			"Cancel": function() {
				$( this ).dialog( "close" );
			}
		}
	});
}


function deleteTeam(user,team_id,userID){
//erst müssen alle user das team verlassen, damit keine foreign key exceptions in mysql auftreten
	$.ajax({
			url: "php/deleteAllUsersFromTeam.php",
			type: "POST",
			data: {"team_id": team_id},
			dataType: "json",
			success: function(success){
				//$("#message").text(success).slideDown(500).delay(2000).slideUp(500);

				//wenn nutzer erfolgreich aus team entfernt wurden, lösche das Team! 
				$.ajax({
					url: "php/deleteTeam.php",
					type: "POST",
					data: {"user":user, "team_id": team_id},
					dataType: "json",
					success: function(success){
						displayKickContent(user,userID);
					},
					error: function(error){alert("Error: Deleting team failed.");}
				});
				
			},
			error: function(error){alert("Error: Deleting users from team failed.");}
	});
	
	
}
   

function confirmTeamRemoval(user,team_id,userID){
$( "#admin_dialog" ).dialog({
		resizable: false,
		height: 140,
		width: 700,
		title: userdel_admin.teamTitle,
		modal: true,
		bgiframe: true,
		buttons: {
			"OK": function() {
				deleteTeam(user,team_id,userID);
				$( this ).dialog( "close" );
			},
			"Cancel": function() {
				$( this ).dialog( "close" );
			}
		}
	});


}





function displayKickContent(username,userID){
var body=$("#admin_content");
var memberOf;
var curTeam;
var usersTeams;
var string="";
$.ajax({
			//hole alle teams des users
			url: "php/getMyGroups.php",
			type: "POST",
			data: {"user":username},
			dataType: "json",
			success: function(success){

				//memberOf ist das team, in welchem der nutzer sich befindet
				memberOf=success[1];
				//usersteams sind die teams, die dem nutzer gehören (owner/creator)
				usersTeams=success[2];
			
				
				//gehe alle nutzererstellten teams durch, wenn er welche erstellt hat / besitzt
					if(usersTeams != null){
					
						for (var i = 0; i < usersTeams.length; i++){
						curTeamID=usersTeams[i][1];
						curTeam=usersTeams[i][0];
							string+="	<tr id='row"+curTeamID+"'>\
											<th>"+curTeam+"</th>\
											<th><input id='newOwner"+curTeamID+"' type='text' class='form-control'></th>\
											<th>\
												<button class='btn btn-default' onClick=\"confirmNewOwner("+curTeamID+",'"+username+"',"+userID+")\" aria-label='Right Align'>\
													<span class='glyphicon glyphicon-ok' aria-hidden='true'></span>\
												</button>\
											</th>\
											<th>\
												<button class='btn btn-default' onClick=\"confirmTeamRemoval('"+username+"',"+curTeamID+","+userID+")\" aria-label='Right Align'>\
													<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>\
												</button>\
											</th>\
										</tr>";
					
						}
					} 
					
					//wenn die vorige iteration mindestens einmal durchgeführt wurde -> user besitzt mindestens 1 team,
					//dann erstelle eine tabelle
					if(string != ""){
						body.html(
								"<b id='message' class='panel panel-warning'></b></br></br>\
								<table class='table'><thead style='background-color:#E6E6E6'>\
								<tr>\
									<th class='col-md-3'>"+userdel_admin.teamname+"</th>\
									<th class='col-md-4'>"+userdel_admin.owner+"</th>\
									<th class='col-md-2'>"+userdel_admin.ok+"</th>\
									<th class='col-md-2'>"+userdel_admin.deleteTeam+"</th>\
								</tr></thead>\
								<tbody>\
									"+string+"\
								</tbody></table>");	
					$("#message").text(userdel_admin.message).slideDown(500);
					} else {
					//andernfalls lösche den nutzer
						forceDeleteUser(userID);
					}
			}
	
});
}

function forceDeleteUser(userID){

$.ajax({
			url: "php/forceDeleteUser.php",
			type: "POST",
			data: {"userID":userID},
			dataType: "json",
			success: function(success){
				//$("#admin_error").text(success).slideDown(500).delay(2000).slideUp(500);	
				getUsers();
			},
			error: function(error){alert("Error: Forced delete of user failed.");}
	});
	
}

function getUsers(query){
var body = $('#admin_content');
var curUser;
var string="";
$.ajax({
			url: "php/getAllUsers.php",
			type: "POST",
			data: {"query": query},
			dataType: "json",
			success: function(success){
				for (var i = 0; i < success.length; i++){
				curUser = success[i];
				
						id = curUser[0];
						name = curUser[1];
						email = curUser[2];
						teamid = curUser[3];
						
					if(name == "admin"){

						string+="<tr>\
									<td>"+id+"</td>\
									<td>"+name+"</td>\
									<td>"+email+"</td>\
									<td>"+teamid+"</td>\
									<td>\
									</td>\
								</tr>";
					
					} else {
				
						string+="<tr>\
									<td>"+id+"</td>\
									<td>"+name+"</td>\
									<td>"+email+"</td>\
									<td>"+teamid+"</td>\
									<td>\
										<button type='button' class='btn btn-default' onClick=\"confirmUserRemoval('"+name+"',"+id+")\" aria-label='Right Align'>\
											<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>\
										</button>\
									</td>\
								</tr>";
					}
				}
				
				body.html(	"<div id='field' class='panel panel-default'>\
								<table class='table'><thead style='background-color:#E6E6E6'>\
								<tr>\
									<th class='col-md-2'>ID</th>\
									<th class='col-md-2'>"+userdel_admin.user+"</th>\
									<th class='col-md-2'>"+userdel_admin.mail+"</th>\
									<th class='col-md-2'>"+userdel_admin.teamid+"</th>\
									<th class='col-md-2'>"+userdel_admin.option+"</th>\
								</tr></thead>\
								<tbody>\
									"+string+"\
								</tbody></table></div>\
							</div>");
			},
			error: function(){alert("Error: Getting content failed.");}
			});


}

function confirmNewOwner(teamID,oldOwner,oldOwnerID){
var newOwner = $('#newOwner'+teamID).val();
	if (newOwner != ""){
		$.ajax({
			url: "php/defineNewTeamOwner.php",
			type: "POST",
			data: {"newOwner":newOwner, "teamID":teamID},
			dataType: "json",
			success: function(code){
			var mess;
			switch (code) {
					case 0: mess= defineNewTeamOwner.mess0; break;
					case 1: mess= defineNewTeamOwner.mess1; break;
					case 2: mess= defineNewTeamOwner.mess2; break;
				}
				$("#admin_error").text(mess).slideDown(500).delay(2000).slideUp(500);
				//if (success.search("Fehler") == -1){ $('#row'+teamID).hide();};
				displayKickContent(oldOwner,oldOwnerID);
			},
			error: function(error){alert("Error: Setting new owner failed.");}
		});
	}	
}
	
function searchUsers(){
	$('#main-nav').find('.active').removeClass('active');
	$('#main-nav li:first-child').addClass('active');
	var searchQuery=$("#search_field").val();
	getUsers(searchQuery);	
}

