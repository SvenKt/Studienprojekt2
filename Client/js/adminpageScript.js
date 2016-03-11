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

socket.on('changeData',function(code){
		switch(code){
			case 0: mess=changeData.mess0; break;
			case 1: mess=changeData.mess1;break;
			case 2: mess=changeData.mess2;break;
			case 3: mess=changeData.mess3;break;
			case 4: mess=changeData.mess4;break;
			case 5: mess=changeData.mess5;break;
		}
		$("#head_modal_dash").text(mess).slideDown(500).delay(2000).slideUp(500);
		if ((mess.search("Fehler") == -1) && (mess.search("Error") == -1) ){ window.setTimeout(function(){$('#profil').modal('hide'); }, 2000);};
});

function changeData(){
	var password=$("#ch_pw").val();
	var password_repeat=$("#ch_pw2").val();
	var email=$("#ch_email").val();
	var username=getUserName();
	
	socket.emit('changeData',{user:username ,pw: password, pw2:password_repeat, mail:email});
}
	

function logOut(){
	location.replace("index.html");
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
				displayKickContent(username,userID);

			$( this ).dialog( "close" );
				
			},
			"Cancel": function() {
				$( this ).dialog( "close" );
			}
		}
	});
}

socket.on('deleteAllUsersFromTeam',function(data){
	socket.emit('deleteTeam',{user:getUserName(),teamid:data.teamid,additional: data});
	window.setTimeout(function() { displayKickContent(data.user,data.userid)},500);
});

function deleteTeam(user,team_id,userID){
	socket.emit('deleteAllUsersFromTeam',{user: user,teamid: team_id,userid:userID});

//erst müssen alle user das team verlassen, damit keine foreign key exceptions in mysql auftreten
	// $.ajax({
			// url: "php/deleteAllUsersFromTeam.php",
			// type: "POST",
			// data: {"team_id": team_id},
			// dataType: "json",
			// success: function(success){
				//$("#message").text(success).slideDown(500).delay(2000).slideUp(500);

				//wenn nutzer erfolgreich aus team entfernt wurden, lösche das Team! 
					
			// },
			// error: function(error){alert("Error: Deleting users from team failed.");}
	// });
	
	
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


socket.on('getMyGroups',function(groups){
	var body=$("#admin_content");
	var string="";
	var memberOf;
	var curTeam;
	var usersTeams;
	var username = groups[3];
	var userID = groups[4];
	
	console.log("userID for fdu "+userID);
	console.log("username for fdu "+username);
	//memberOf ist das team, in welchem der nutzer sich befindet
	memberOf=groups[1];
	//usersteams sind die teams, die dem nutzer gehören (owner/creator)
	usersTeams=groups[2];

				
	//gehe alle nutzererstellten teams durch, wenn er welche erstellt hat / besitzt
	if(usersTeams != null){
		//console.log("user has teams");
				console.log(usersTeams[2]);

		for (var i = 0; i < usersTeams.length; i++){
		console.log(usersTeams[i]);
		curTeamID=usersTeams[i].id;
		curTeam=usersTeams[i].name;
		string+="	<tr id='row"+curTeamID+"'>\
							<th id='teamname"+curTeamID+"'>"+curTeam+"</th>\
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
		console.log("userID for fdu "+userID);
		forceDeleteUser(userID);
	}
});


function displayKickContent(username,userid){
	socket.emit('getGroupsToDelete',[username, userid]);
}


function forceDeleteUser(userID){
	socket.emit('forceDeleteUser',userID);
}


socket.on('forceDeleteUser',function(){
	getUsers();
});

socket.on('getAllUsers',function(all){
	console.log("getallusers");
	var string = "";
	var body = $('#admin_content');
	
	for (var i = 0; i < all.length; i++){
	curUser = all[i];
	console.log(curUser);
				
			id = curUser.id;
			name = curUser.username;
			email = curUser.email;
			teamid = curUser.teamid;
			
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
});

function getUsers(query){
	var body = $('#admin_content');
	var curUser;
	var string="";
	socket.emit('getAllUsers',query);
}


function confirmNewOwner(teamID,oldOwner,oldOwnerID){
var newOwner = $('#newOwner'+teamID).val();
var team = $('#teamname'+teamID).text();
console.log(newOwner);
console.log(team);
	if (newOwner != ""){
		socket.emit('insertTeamOwner', {user: newOwner, team: team, action: 1,userArr: [oldOwner,oldOwnerID]});
	}	
}

socket.on('newOwner', function(data){
	if(data.code == 0){
		mess= defineNewTeamOwner.mess0; 
		displayKickContent(data.user[0], data.user[1]);
	}
});
	
function searchUsers(){
	$('#main-nav').find('.active').removeClass('active');
	$('#main-nav li:first-child').addClass('active');
	var searchQuery=$("#search_field").val();
	getUsers(searchQuery);	
}

