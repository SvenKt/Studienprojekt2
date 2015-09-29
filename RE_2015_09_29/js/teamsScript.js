////////////////
//USES user.js//
////////////////

$(document).ready(function(){
$("#dialog_team_modal").hide();
});

function loadTeamOptions(){
	sizeAccordion();
	refreshTeamData();
	getMyGroups();
}

var teamname;
var justEnteredTeam = false;

socket.on('teamChanged',function(data){
	 insertIntoFeed("Team wurde geändert");
});

socket.on('createTeam',function(code){
	//console.log(code);
	var mess;
	switch (code) {
		case 0: mess = createTeam.mess0; break;
		case 1: mess = createTeam.mess1; break;
	}
	//teams neu laden --> meine Teams
	refreshTeamData(true);	
	$("#team_name").val('');	
	window.setTimeout(function(){$("#head_modal_dash_team").text(mess).slideDown(500).delay(1000).slideUp(500);},3000);
	socket.emit('insertTeamOwner',{user:getUserName(), team: teamname});
});

socket.on('insertTeamOwner', function(data){
	console.log(data);
	var mess2;
	switch (data) {
		case 0: mess2 = insertGroupOwner.mess0; break;
		case 1: mess2 = insertGroupOwner.mess1; break;
	}
	window.setTimeout(function(){$("#head_modal_dash_team").text(mess2).slideDown(500).delay(1000).slideUp(500);},3000);
	refreshTeamData(true);	
});

socket.on('addTeamMember',function(data){
var mess;
console.log(data);
	switch (data.code) {
		case 0: mess = addMember.mess0+" "+data.team; break;
		case 1: mess = addMember.mess1; break;
		case 2: mess = addMember.mess2; break;
		case 3: mess = addMember.mess3; break;
	}
	
	refreshTeamData();
	$("#head_modal_dash_team").text(data.user+" "+mess).slideDown(500).delay(3000).slideUp(500);	
	
	
});

//Neues Team erstellen
function createTeam(){
	teamname = $("#team_name").val();	
	if (teamname != ""){
		socket.emit('createTeam',{user: getUserName(), team: teamname});
	} else {
		$("#head_modal_dash_team").text(createTeam.empty).slideDown(500).delay(2000).slideUp(500);	
	}
}

socket.on('getMyGroups',function(groups){
	var myTeams = groups[0];
	var memberOf = groups[1];
	var userIsCreatorOf = groups[2];
	var user = groups[3];
	var teams = "";
	
	console.log(groups);
	for(var i = 0; i < myTeams.length; i++){
		//wenn elemente (teams) im rückgabeobjekt enthalten sind, führe nachfolgendes aus
		curTeam=myTeams[i].name;
		curTeamID=myTeams[i].id;
		
		
		
		
		//wenn user aktuell kein member irgendeines teams -> zeichne 'team beitreten' button
		if(memberOf == ""){
			teams+="<tr>\
					<th id='team"+curTeamID+"'>"+curTeam+"</th>\
					<th></th>\
					<th class='req-btn'>\
						<button  class='btn btn-default' data-toggle='modal' data-target='#modal_editTeam' onClick='editTeam("+curTeamID+")' aria-label='Left Align'>\
							<span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>\
						</button>\
						<button  class='btn btn-default' onClick='confirmTeamRemoval("+curTeamID+")' aria-label='Right Align'>\
							<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>\
						</button>\
						<button class='btn btn-default' onClick='intoTeam("+curTeamID+")' aria-label='Right Align'>\
							<span class='glyphicon glyphicon-plus' aria-hidden='true'></span>\
						</button>\
					</th>\
					</tr>";	
		//wenn aktueller teamname == teamname, in dem nutzer mitglied ist, dann erstelle noch zusätzlich einen 'leave team' button
		} else if (curTeam == memberOf){
		
		//Übersetzung muss hier gemacht werden, da das DOM bei klick auf englisch/deutsch noch 
					teams+="<tr>\
					<th id='team"+curTeamID+"'>"+curTeam+"</th>\
					<th>"+modal_team.tbl_text+"</th>\
					<th class='req-btn'>\
						<button  class='btn btn-default' data-toggle='modal' data-target='#modal_editTeam' onClick='editTeam("+curTeamID+")' aria-label='Left Align'>\
							<span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>\
						</button>\
						<button  class='btn btn-default' onClick='confirmTeamRemoval("+curTeamID+")' aria-label='Right Align'>\
							<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>\
						</button>\
						<button class='btn btn-default' onClick='leaveTeam()' aria-label='Right Align'>\
							<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>\
						</button>\
					</th>\
					</tr>";	
								
					//überschrift anpassen
						$("#headline_dashboard").text(otherContent.head_dash2+curTeam);

						//bei teams, die der user erstellt hat, in welchen er aber nicht mitglied ist
		} else {
					teams+="<tr>\
					<th id='team"+curTeamID+"'>"+curTeam+"</th>\
					<th></th>\
					<th class='req-btn'>\
						<button class='btn btn-default' data-toggle='modal' data-target='#modal_editTeam' onClick='editTeam("+curTeamID+")' aria-label='Left Align'>\
							<span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>\
						</button>\
						<button class='btn btn-default' onClick='confirmTeamRemoval("+curTeamID+")' aria-label='Right Align'>\
							<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>\
						</button>\
					</th>\
					</tr>";	
		}		
	}
	
	//Übersetzung muss hier gemacht werden, da das DOM bei klick auf englisch/deutsch noch 
			
			$("#content_team").html("<table class='table'><thead style='background-color:#E6E6E6'>\
						<tr>\
							<th class='col-md-4'>"+modal_team.tbl1+"</th>\
							<th class='col-md-5'></th>\
							<th class='col-md-3'>"+modal_team.tbl2+"</th>\
						</tr></thead>\
						<tbody>\
							"+teams+"\
						</tbody></table>");						
	

});
	
	

			
			

//Teams für den User laden
function getMyGroups(){
var user = getUserName();
var curTeam;
var teams = "Noch kein Team vorhanden";
socket.emit('getMyGroups',getUserName());
	
}

socket.on('leaveTeam',function(code){
	var mess;
	switch(code){
		case 0: mess = leaveTeam.mess0; break;
		case 1: mess = leaveTeam.mess1; break;
	}
	refreshTeamData(true);
	$("#head_modal_dash_team").text(mess).slideDown(500).delay(2000).slideUp(500);

});

//Team verlassen
function leaveTeam(){
	var user = getUserName();
	socket.emit('leaveTeam',user);
}

socket.on('intoTeam',function(data){
	console.log("intoTeam");
	var mess;
	switch(data.code){
		case 0: mess = intoTeam.mess0; break;
		case 1: mess = intoTeam.mess1; break;
	}
	refreshTeamData(true);
	$("#head_modal_dash_team").text(mess).slideDown(500).delay(2000).slideUp(500);
	socket.emit('teamChanged',{user: getUserName(), teamID: data.teamid});
});

function intoTeam(team_id){
	var user = getUserName();
	socket.emit('intoTeam',{user:user,teamid:team_id});
}

//Team (&Anforderungen) löschen bestätigen
function confirmTeamRemoval(team_id){
$('#team_modal').hide();
$( "#dialog" ).dialog({
		resizable: false,
		height: 140,
		width: 700,
		title: team.del,
		modal: true,
		bgiframe: true,
		buttons: {
			"OK": function() {
				deleteTeam(team_id);
				$( this ).dialog( "close" );
				$('#team_modal').show();
			},
			"Cancel": function() {
				$( this ).dialog( "close" );
				$('#team_modal').show();
			}
		}
	});
}
socket.on('deleteTeam',function(code){
	console.log("delete answer");
	var mess;
	switch (code) {
				case 0: mess = deleteTeam.mess0; break;
				case 1: mess = deleteTeam.mess1; break;
				case 2: mess = deleteTeam.mess2; break;
				case 3: mess = deleteTeam.mess3; break;
	}
	refreshTeamData();
	$("#head_modal_dash_team").text(mess).slideDown(500).delay(2000).slideUp(500);
	getRequirements();
});

function deleteTeam(team_id){
	var user = getUserName();
	socket.emit('deleteTeam',{user: user,teamid:team_id});
}

socket.on('getTeamDropdown',function(teams){
console.log("dropdown");
	var string="";
	if (teams != null) {
		for(var i = 0; i < teams.length; i++){
			curTeam=teams[i].name;
			string += "<option>"+curTeam+"</option>";
		}
	}				
	$("#team_list").html(
		"<select class='form-control' id='team_dropdown'>"+string+"</select>"
	);
});

function refreshTeamDropdown(){
//füllt das dropdown in [team]->[mitglieder hinzufügen] mit den teams des users
var body = $("#team_list");
var user = getUserName();

socket.emit('getTeamDropdown',getUserName());
}

function refreshTeamData(opt){
	//hier alle funktionen rein, die abhängig von den ausgelesenen teams sind
		$("#headline_dashboard").text("");

	refreshTeamDropdown();
	getMyGroups();
	if (opt){	
		getRequirements();
	}
}

//User zum Team hinzufügen
function addTeamMember(){
	var newMember = $("#team_user").val();
	var team = 	$("#team_list option:selected" ).text();
	socket.emit('addTeamMember',{user: newMember,team: team});
}

socket.on('deleteUserFromTeam',function(data){
var mess;
	switch(data.code){
		case 0: mess=deleteUserFromTeam.mess0;break;
		case 1: mess=deleteUserFromTeam.mess1;break;
	}
	$("#head_modal_dash_team_edit").text(mess).slideDown(500).delay(2000).slideUp(500);
	//aktualisiert die ansicht im editier modal
	editTeam(data.teamid);
});

function deleteUserFromTeam(userID,teamID){
	socket.emit('deleteUserFromTeam',{id: userID,teamid:teamID});
}

socket.on('getMembers',function(members){
	var body = $("#content_editTeam");
	body.html("");
	var mems ="";
	if (members != null){
		for(var i = 0; i < members.length; i++){					
			curUser = members[i].username;
			curUserID = members[i].id;
			mems+="<tr>\
						<th id='user"+curUserID+"'>"+curUser+"</th>\
						<th></th>\
						<th class='req-btn'>\
							<button class='btn btn-default' data-toggle='modal' data-target='#modal_userData' onClick='showUserData("+curUserID+")' aria-label='Right Align'>\
								<span class='glyphicon glyphicon-info-sign' aria-hidden='true'></span>\
							</button>\
							<button class='btn btn-default' onClick='deleteUserFromTeam("+curUserID+","+members[i].teamid+")' aria-label='Right Align'>\
								<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>\
							</button>\
						</th>\
					</tr>";	
		}
		body.html(
			"<table class='table'>\
				<thead style='background-color:#E6E6E6'>\
					<tr>\
						<th class='col-md-4'>"+modal_editTeam.member+"</th>\
						<th class='col-md-5'></th>\
						<th class='col-md-3'>"+modal_editTeam.option+"</th>\
					</tr>\
					</thead>\
					<tbody>	"+mems+"\
					</tbody>\
				</table>"		
		);
	}
});

function editTeam(teamID){
	socket.emit('getMembers',teamID);
}

function placeholder(){
//für funktionen, die eine funktion als param benötigen
//aber diese für den jeweiligen zweck undienlich ist.
}
socket.on('getUserInfos',function(infos){
	var name=infos.username;
	var mail=infos.email;
	var body=$("#content_userData");
			
			//Übersetzung muss hier gemacht werden, da das DOM bei klick auf englisch/deutsch noch nicht existiert!!!
			
	body.html("<div class='row'>\
				<label class='col-md-3'>"+modal_user.name+"</label><label class='col-md-8'>"+name+"</label><br/>\
				<label class='col-md-3'>E-Mail:</label>\
				<label class='col-md-8'>\
					<a href='mailto:"+mail+"?Subject=Kontakt%20über%20Red:Wire'>"+mail+"</a>\
				</label><br/>\
			   </div>");
});
function showUserData(userID){
	socket.emit('getUserInfos',userID);
}
