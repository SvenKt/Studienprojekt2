var button = {
	ok:"",
	dismiss:""
}
var admin = {
 headline:"",
}

var dropButton;

var login = {
	name1:"",
	pass:"",
	register:"",
	register_2:"",
	headline:"",
	name_2:"",
	pw:"",
	pw_repeat:"",
	mail:"",
	credentials:"",
	mess0:"",
	mess1:"",
	mess2:"",
	mess3:"",
	mess4:"",
	mess5:""
}
var team = {
	added:""
}

var category = {
	mess0:"",
	mess1:"",
	mess2:"",
	mess3:"",
	del0:"",
	del1:"",
	dialog:"",
	feed0:"",
	feed1:"",
	feed2:"",
	fill:""
}

var userdel_admin = {
 title:"",
 message:"",
 teamname:"",
 owner:"",
 ok:"",
 deleteTeam:"",
 user:"",
 mail:"",
 teamid:"",
 option:"",
}
var modal_user = {
 headline:"",
 name:""
}

var menu = {
 item1:"",
 item2:"",
 item3:"",
 item4:"",
 item5:"",
 item6:"",
 item7:"",
 item1_tt: "",
 item2_tt: "",
 item3_tt: "",
 item4_tt: "",
 item5_tt: "",
 item6_tt: "",
 item7_tt: ""
}

var tableHead = {
 item1:"",
 item2:"",
 item3:"",
 item4:"",
 item5:"",
 item6:"",
 item1_tt: "" ,
 item2_tt: "" ,
 item3_tt: "" ,
 item4_tt: "" ,
 item6_tt: "" 
}

var otherContent = {
 search:"",
 helpSearchTitle:"",
 helpSearchBody:"",
 sfp:"",
 news:"",
 head_dash1:"",
 head_dash:"",
 news_text:"",
 helpbox:"",
 download:""
}

var modal_team = {
 headline:"",
 subheadline:"",
 topic:"",
 add_members_head:"",
 create_team_Button:"",
 add_mem1:"",
 add_mem2:"" ,
 add_mem_button:""
}

var editForm = {
	greeting:"",
	prio:""
}

var modal_editTeam = {
 headline:""
}

var modal_profile = {
 tophead:"",
 headline:"",
 pw1:"",
 pw2:"",
 mail:""
}

var team = {
 del:""
}

var reqForm = {
 headline:"",
 prio:"",
 status:"",
 feed_create:"",
 feed_create_u:"",
 feed_edit:"",
 feed_del:"",
 mess0:"",
 mess1:"",
 mess2:"",
 mess3:"",
 optional:"",
 id:"",
 tooLong:"",
}

var csvtxt = {
 req:"",
 prio:"",
 dep:""
}

var deleteReq = {
 confirm:"",
 feedmessage:""
}

var modal_editTeam = {
	member:"",
	option:""
}


//PHP STUFF//
var addMember = {
 mess0:"",
 mess1:"",
 mess2:"",
 mess3:""
}

var changeData = {
 mess0:"",
 mess1:"",
 mess2:"",
 mess3:"",
 mess4:"",
 mess5:""
}

var createTeam = {
 mess0:"",
 mess1:"",
 empty:""
}

var defineNewTeamOwner = {
 mess0:"",
 mess1:"",
 mess2:""
}

var delete_php = {

}

var deleteAllUsersFromTeam = {

}

var deleteTeam = {
 mess0:"",
 mess1:"",
 mess2:"",
 mess3:"",
}

var deleteUser = {

}

var deleteUserFromTeam = {
 mess0:"",
 mess1:""
}

var forceDeleteUser = {

}

var getAllUsers = {

}

var getCookie = {

}

var getMembers = {

}

var getMyGroups = {

}

var getPrioForEdit = {

}

var getReqForEdit = {

}

var getRequirements = {

}

var getUpdates = {

}

var getUserInfos = {

}

var insertGroupOwner = {
 mess0:"",
 mess1:""
}

var insertRequirement = {

}

var intoTeam = {
 mess0:"",
 mess1:"",
}

var leaveTeam = {
 mess0:"",
 mess1:"",
}

var loginCheck = {

}

var registerClass = {

}

var registerUser = {

}

var setCookie = {

}


//PHP STUFF END//

function defineTranslationVars(lang){
	//deutsch
	if(lang == "de"){
	//console.log("de");
		
		deleteUserFromTeam.mess0="User wurde erfolgreich aus Team entfernt";
		deleteUserFromTeam.mess1="Sie können sich nicht selbst entfernen. Klicken Sie bitte im vorigen Menü auf die X Schaltfläche!";
		
		login.name1="Username";
		login.pass="Passwort";
		login.register="Registrieren";
		login.register_2="Registrierung";
		login.headline="Bitte geben Sie die benötigten Informationen ein:";
		login.name_2="Username";
		login.pw="Passwort";
		login.pw_repeat="Passwort wiederholen";
		login.mail="E-Mail";
		login.login="Einloggen";
		login.credentials="Bitte korrekte Daten eingeben!";
		login.mess0="Registrierung erfolgreich";
		login.mess1="Fehler: Bitte alle Felder ausfüllen!";
		login.mess2="Fehler: Email ist nicht gültig!";
		login.mess3="Fehler: Passwörter stimmen nicht überein...";
		login.mess4="Fehler: Username schon vergeben...";
		login.mess5="Fehler: Passwort zu unsicher - mindestens 8 Zeichen eingeben!";
		
		dropButton="Kategorien";
		
		category.mess0="Kategorie erfolgreich eingetragen";
		category.mess1="Fehler: Kategorie konnte nicht eingetragen werden (an Administrator wenden)";
		category.mess2="Fehler: Sie müssen zuerst Mitglied in einem Team sein.";
		category.mess3="Fehler: Kategorie schon vorhanden.";
		category.del0="Kategorie gelöscht";
		category.del1="Fehler: Kategorie konnte nicht gelöscht werden.";
		category.dialog="Kategorie wirklich löschen?";
		category.feed0="Kategorie wurde erstellt";
		category.feed1="Kategorie wurde gelöscht";
		category.feed2="Kategorie wurde editiert";
		category.fill="Bitte einen Namen für die Kategorie eingeben / Keine unerlaubten Zeichen nutzen {_}";
		
			
		admin.headline="Übersicht";
	
		modal_editTeam.member="Mitglieder";
		modal_editTeam.option="Optionen";
	
		team.del="Team mitsamt Anforderungen wirklich löschen?";
		
		deleteReq.confirm="Anforderung wirklich löschen?";
		deleteReq.feedmessage="Sie haben eine Anforderung gelöscht!";
		
		modal_profile.tophead="Profil";
		modal_profile.headline="Geben Sie Ihre neuen Daten ein:";
		modal_profile.pw1="Neues Passwort";
		modal_profile.pw2="Neues Passwort wiederholen";
		modal_profile.mail="Neue E-Mail";	
		
		button.ok="Bestätigen";
		button.dismiss="Abbrechen";
	
		menu.item1_tt ='Gehen Sie zurück auf den Startbildschirm';
		menu.item2_tt ='Erstellen Sie eine neue Anforderung';
		menu.item3_tt ='Erstellen Sie ein Team und arbeiten Sie mit anderen zusammen';
		menu.item4_tt ='Ändern Sie Ihre persönlichen Informationen';
		menu.item5_tt ='Laden Sie Ihre Anforderungen als .csv Datei herunter';
		menu.item6_tt ='Melden Sie sich vom System ab';
		menu.item7_tt ='Erstellen Sie eine neue Kategorie';
	
		tableHead.item1_tt ='Klicken zum Sortieren nach ID';
		tableHead.item2_tt ='Klicken um alphabetisch zu sortieren';
		tableHead.item3_tt ='Klicken zum Sortieren nach Priorität';
		tableHead.item4_tt ='Klicken zum Sortieren nach Status';
		tableHead.item6_tt ='Klicken um nach Änderungsdatum zu sortieren';
		
		tableHead.item1 = "ID";
		tableHead.item2 = "Anforderung";
		tableHead.item3 = "Priorität";
		tableHead.item4 = "Status";
		tableHead.item5 = "Abhängigkeiten";
		tableHead.item6 = "Geändert am";
		tableHead.item7 = "Optionen";
		
		menu.item1="Home";
		menu.item2="Anforderung erstellen";
		menu.item3="Team";
		menu.item4="Profil";
		menu.item5="Download";
		menu.item6="Logout";
		menu.item7 ='Kategorie';
		
		otherContent.search ='Durchsuchen Sie Ihre Anforderungen';
		otherContent.helpSearchTitle = 'Nutze Slash (/) für exakte Suche';
		otherContent.helpSearchBody = 'Bsp: "Test/" schließt Ergebnisse wie "Tester" aus.';
		otherContent.sfp = 'Suche...';
		otherContent.news ='Klicken zum Aktualisieren';
		otherContent.head_dash1= "Anforderungen";
		otherContent.head_dash2= "Anforderungen von Team ";
		otherContent.news_text="Aktualisieren   ";
		otherContent.download="Bitte wähle den Dateityp: ";
		
		modal_team.headline = 'Teamoptionen';
		modal_team.subheadline ="Meine Teams";
		modal_team.topic = "Team erstellen";
		modal_team.create_team_Button="Team erstellen";
		modal_team.add_members_head="Mitglieder hinzufügen";
		modal_team.add_mem1="Mitglied";
		modal_team.add_mem2="Meine Teams";
		modal_team.add_mem_button="Mitglied hinzufügen";
		modal_team.tbl1="Mitglied";
		modal_team.tbl2="Optionen";
		modal_team.tbl_text="Sie sind Mitglied dieses Teams";
		
		modal_editTeam.headline="Bearbeiten Sie Ihr Team";
		
		team.added="Sie wurden einem Team hinzugefügt";
		
		try {
			editForm.greeting="Hallo "+getUserName()+", bearbeiten Sie Ihre Anforderungen";
		} catch (e) {}
		
		editForm.prio="Priorität";
		
		try {
			reqForm.headline="Hallo "+getUserName()+", geben Sie eine neue Anforderung ein:";
		} catch (e) {}
		
		reqForm.prio="Priorität";
		reqForm.status="Status";
		reqForm.feed_create=" hat eine Anforderung erstellt";
		reqForm.feed_del=" hat eine Anforderung gelöscht";
		reqForm.feed_edit=" hat eine Anforderung bearbeitet";
		reqForm.tooLong="Fehler: Anforderung ist zu lang!";

		csvtxt.req="Anforderung";
		csvtxt.prio="Priorität";
		csvtxt.dep="Abhängigkeiten";
		
		modal_user.headline="Nutzerinformationen";
		modal_user.name="Nutzername:";
		
		userdel_admin.title="Nutzer wirklich löschen?";
		userdel_admin.message="Fehler: User ist der Ersteller von mindestens einem Team. Löschen Sie diese/s oder übertragen Sie es an einen anderen User!";
		userdel_admin.teamname="Teamname";
		userdel_admin.owner="Neuer Besitzer";
		userdel_admin.ok="Bestätigen";
		userdel_admin.deleteTeam="Team Löschen";
		userdel_admin.teamTitle="Team mitsamt Usern und allen Anforderungen löschen?";
		userdel_admin.user="Username";
		userdel_admin.mail="E-Mail";
		userdel_admin.teamid="Team-ID";
		userdel_admin.option="Optionen";
		
		//PHP//
		addMember.mess0="wurde hinzugefügt zu Team:";
		addMember.mess1="konnte diesem Team nicht hinzugefügt werden:";
		addMember.mess2="ist bereits in einem anderen Team.\n Dieses muss er erst verlassen, um in Ihr Team aufgenommen zu werden. Fehler!";
		addMember.mess3="existiert nicht. Fehler!";
		
		changeData.mess0="Daten erfolgreich geändert!";
		changeData.mess1="Fehler: Daten konnten nicht geändert werden!";
		changeData.mess2="Fehler: Bitte alle Felder ausfüllen!";
		changeData.mess3="Fehler: E-Mail nicht gültig!";
		changeData.mess4="Fehler: Passwörter sind nicht identisch!";
		changeData.mess5="Fehler: Passwort zu unsicher - mindestens 8 Zeichen eingeben!";
		
		createTeam.mess0="Team erfolgreich erstellt!";
		createTeam.mess1="Fehler: Team schon vorhanden!";
		createTeam.empty="Fehler: Feld darf nicht leer sein!";
		
		insertGroupOwner.mess0="Sie wurden erfolgreich als Teammitglied eingetragen";
		insertGroupOwner.mess1="Sie wurden dem Team nicht hinzugefügt, da Sie schon Mitglied eines anderen Teams sind.";
		
		defineNewTeamOwner.mess0="Team erfolgreich überschrieben";
		defineNewTeamOwner.mess1="Fehler: Team konnte nicht überschrieben werden";
		defineNewTeamOwner.mess2="Fehler: Nutzer existiert nicht!";
		
		reqForm.mess0="Anforderung erfolgreich eingetragen!";
		reqForm.mess1="Warnung: Anforderungs ID ist in diesem Team schon vergeben! Anforderung wurde dennoch eingetragen.";
		reqForm.mess2="Fehler. Bitte an Administrator wenden!";
		reqForm.mess3="Fehler: Sie müssen erst Mitglied eines Teams sein, um Anforderungen eintragen zu können!";
		reqForm.optional="Fehler: Bitte alle nicht-optionalen Felder ausfüllen!";
		reqForm.id="Fehler: Bitte einen ID Wert größer / gleich 0 angeben!";
		
		
		deleteTeam.mess0="Sie haben das Team gelöscht";
		deleteTeam.mess1="Fehler: Sie können das Team nicht löschen, da sich noch mindestens eine weitere Person im Team befindet";
		deleteTeam.mess2="Fehler: Sie haben nicht die Berechtigung, das Team zu löschen!";
		deleteTeam.mess3="Fehler: Sie können das Team nicht löschen, da sich noch mindestens eine weitere Person im Team befindet";
		
		intoTeam.mess0="Sie sind dem Team beigetreten";
		intoTeam.mess1="Fehler: Sie konnten dem Team nicht beitreten";
		
		leaveTeam.mess0="Sie haben das Team verlassen";
		leaveTeam.mess1="Fehler: Sie konnten das Team nicht verlassen";
		
		
	} 
	if(lang == "en"){
	//englisch
	//console.log("en");
	
		deleteUserFromTeam.mess0="User successfully deleted";
		deleteUserFromTeam.mess1="You cannot delete yourself. Please go back to the previous modal an click the X button!";
	
		login.name1="Username";
		login.pass="Password";
		login.register="Register";
		login.register_2="Register";
		login.headline="Please fill out the forms with the required information:";
		login.name_2="Username";
		login.pw="Password";
		login.pw_repeat="Repeat password";
		login.mail="E-Mail";
		login.login="Login";
		login.credentials="Please enter valid credentials!";
		login.mess0="Registration successful";
		login.mess1="Error: Please fill out all forms!";
		login.mess2="Error: E-Mail not valid!";
		login.mess3="Error: Passwords do not match!";
		login.mess4="Error: Username already in use...";
		login.mess5="Error: Password not safe. Please enter at leat 8 characters!";
		
		category.mess0="Category created";
		category.mess1="Error: Category could't be created. Please contact the administrator.";
		category.mess2="Error: You have to be member of a team first.";
		category.mess3="Error: Category already exists.";
		category.del0="Category deleted.";
		category.del1="Error: Couldn't delete category.";
		category.dialog="Do you really want to delete this category?";
		category.feed0="Category created";
		category.feed1="Category deleted";
		category.feed2="Category edited";
		category.fill="Please insert a category name / Do not use invalid characters {_}";
		
		admin.headline="Dashboard";
	
		dropButton="Categories";
	
		modal_editTeam.member="Members";
		modal_editTeam.option="Options";
	
		team.del="Do you really want to delete the team with all it's requirements?";
		
		deleteReq.confirm="Are you sure?";
		deleteReq.feedmessage="You've deleted a requirement!";
		
		modal_profile.tophead="Profile";
		modal_profile.headline="Change your user data:";
		modal_profile.pw1="New password";
		modal_profile.pw2="Repeat new password";
		modal_profile.mail="New E-Mail";	
	
		button.ok="Send";
		button.dismiss="Cancel";
		
		menu.item1_tt ='Go to home screen';
		menu.item2_tt ='Create a new requirement';
		menu.item3_tt ='Manage your teams and do some teamwork!';
		menu.item4_tt ='change your personal data';
		menu.item5_tt ='Download your requirements a .csv data';
		menu.item6_tt ='Logout from the system';
		menu.item7_tt ='Create a new category';
	
		tableHead.item1_tt ='Click for ID sort';
		tableHead.item2_tt ='Click for alphabetical sort';
		tableHead.item3_tt ='Click for priotity sort';
		tableHead.item4_tt ='Click for status sort';
		tableHead.item6_tt ='Click for date time sort';
	
		tableHead.item1 = "ID";
		tableHead.item2 = "Requirement";
		tableHead.item3 = "Priority";
		tableHead.item4 = "Status";
		tableHead.item5 = "Dependencies";
		tableHead.item6 = "Last change";
		tableHead.item7 = "Options";
		
		menu.item1="Home";
		menu.item2="Create Requirement";
		menu.item3="Team";
		menu.item4="Profile";
		menu.item5="Download";
		menu.item6="Logout";
		menu.item7="Category";
		
		otherContent.search ='Search for matching requirements';
		otherContent.helpSearchTitle = 'Use slash (/) for exact searching';
		otherContent.helpSearchBody = 'e.g.: "Test/" excludes results like "Tester".';
		otherContent.sfp = 'pattern...';
		otherContent.news ='Click to update';
		otherContent.head_dash1= "Requirements";
		otherContent.head_dash2= "Requirements of team ";
		otherContent.news_text="Update   ";
		otherContent.download="Please choose the file type: ";
		
		modal_team.headline = 'Team options';
		modal_team.subheadline ="My teams";
		modal_team.topic = "Create team";
		modal_team.create_team_Button="Create team";
		modal_team.add_members_head="Add members";
		modal_team.add_mem1="Member";
		modal_team.add_mem2="My teams";
		modal_team.add_mem_button="Add member";
		modal_team.tbl1="Member";
		modal_team.tbl2="Options";
		modal_team.tbl_text="You're a member of this team";
		
		modal_editTeam.headline="Edit your team";
		
		team.added="You've been added to a team";
		
		try { 
			editForm.greeting="Hello "+getUserName()+", edit your team ";
		} catch (e) {}
		
		editForm.prio="Priority";
		
		try{
			reqForm.headline="Hello "+getUserName()+", enter a new requirement:";
		} catch (e) {}
		
		reqForm.prio="Priority";
		reqForm.status="Status";
		reqForm.feed_create=" created a new requirement";
		reqForm.feed_del=" deleted a requirement";
		reqForm.feed_edit=" edited a requirement";
		reqForm.tooLong="Error: Requirement has to many characters!";
		
		csvtxt.req="Requirement";
		csvtxt.prio="Priority";
		csvtxt.dep="Dependencies";
		
		modal_user.headline="User's information";
		modal_user.name="Username:";
		
		userdel_admin.title="Do you really want to delete this user?";
		userdel_admin.message="Error: User is assigned to at least one team. Please assign it to another user or delete it!";
		userdel_admin.teamname="Team name";
		userdel_admin.owner="New owner";
		userdel_admin.ok="Accept";
		userdel_admin.deleteTeam="Delete team";
		userdel_admin.teamTitle="Delete team with all users and its requirements?";
		userdel_admin.user="Username";
		userdel_admin.mail="E-Mail";
		userdel_admin.teamid="Team-ID";
		userdel_admin.option="Options";
		
		//PHP//
		addMember.mess0="was added to team:";
		addMember.mess1="could not be added to team:";
		addMember.mess2="is already member of a team. He must leave the team first.";
		addMember.mess3="doesn't exist!";
		
		changeData.mess0="Data successfully changed!";
		changeData.mess1="Error: Data couldn't be changed!";
		changeData.mess2="Error: Please fill out all forms!";
		changeData.mess3="Error: E-Mail not valid!";
		changeData.mess4="Error: Passwords do not match!";
		changeData.mess5="Error: Password not safe. Please enter at leat 8 characters!";
		
		createTeam.mess0="Team has been created!";
		createTeam.mess1="Error: Team already exist!";
		createTeam.empty="Error: Form cannot be empty!";
		
		insertGroupOwner.mess0="You've been added successfully as a member";
		insertGroupOwner.mess1="You've not been added as a member, because you're already member of another team";
		
		defineNewTeamOwner.mess0="Team was successfully assigned to a new user";
		defineNewTeamOwner.mess1="Error: Team couldn't be assigned to a new user";
		defineNewTeamOwner.mess2="Error: User doesn't exist!";
		
		reqForm.mess0="Requirement successfully saved!";
		reqForm.mess1="Caution: Requirement ID is already in use. Requirement was saved though.";
		reqForm.mess2="Error: Please contact the admin!";
		reqForm.mess3="Error: You need to be a member of a team to insert requirements!";
		reqForm.optional="Error: Please fill out all non-optional forms!";
		reqForm.id="Error: Please enter an ID value greater / equal 0!";
		
		deleteTeam.mess0="Team was successfully deleted";
		deleteTeam.mess1="Error: You cannot delete this team. It still consists of at least one member.";
		deleteTeam.mess2="Error: You have not the rights to delete this team!";
		deleteTeam.mess3=deleteTeam.mess1;
		
		intoTeam.mess0="You've entered the team";
		intoTeam.mess1="Error: You couldn't enter the team";
		
		leaveTeam.mess0="You left the team";
		leaveTeam.mess1="Error: You couldn't leave the team";
	}	
}

var language = "de";

function switchToEN(){
	language="en";
	changeMenuLanguage();
	$("#languageSwitcher").html("<img title='Wechseln Sie zu deutscher Sprache' onClick='switchToDE()' src='img/de.png'></img>");
	// Until translation is done //
	$("#version").removeAttr("data-toggle");
	$("#version").css("cursor", "default");
	$("#version").css("textDecoration", "none");
}

function switchToDE(){
	language="de";
	changeMenuLanguage();
	$("#languageSwitcher").html("<img title='Switch to english language' onClick='switchToEN()' src='img/uk.png'></img>");
	// Until translation is done //
	$("#version").attr("data-toggle", "modal");
	$("#version").css("cursor", "");
	$("#version").css("textDecoration", "");
}

function changeMenuLanguage(){
	defineTranslationVars(language);
	
	//adminpage//
	
	$("#headline_adminpage").text(admin.headline);
	
	//adminpage//
	
	$('#sortHead1').text(tableHead.item1);
	$('#sortHead2').text(tableHead.item2);
	$('#sortHead3').text(tableHead.item3);
	$('#sortHead4').text(tableHead.item4);
	$('#sortHead5').text(tableHead.item5);
	$('#sortHead6').text(tableHead.item6);
	$('#sortHead7').text(tableHead.item7);
	
	$('#dropButton').text(dropButton);
	
	$('#name_1').text(login.name1);
	$('#pass').text(login.pass);
	$('#regist').text(login.register);
	$('#regist_2').text(login.register_2);
	$('#head_modal').text(login.headline);
	$('#name_2').text(login.name_2);
	$('#pw').text(login.pw);
	$('#pw_repeat').text(login.pw_repeat);
	$('#mail').text(login.mail);
	$('#reg_submit_login').text(login.register);
	$('#login').text(login.login);
	
	$('#home').text(menu.item1);
	$('#create').text(menu.item2);
	$('#team').text(menu.item3);
	$('#prof').text(menu.item4);
	$('#downloadNav').text(menu.item5);
	$('#logt').text(menu.item6);
	$('#catForm').text(menu.item7);
	
	$('#profile_tophead').text(modal_profile.tophead);
	$('#head_modal_dash').text(modal_profile.headline);
	$('#newPW').text(modal_profile.pw1);
	$('#newPW_repeat').text(modal_profile.pw2);
	$('#newEmail').text(modal_profile.mail);
	$('#reg_submit_p').text(button.ok);
	
	$('#helpCheckbox').val(otherContent.helpbox);
	$("#news_text").text(otherContent.news_text);
	$('#search_field').attr('placeholder',otherContent.sfp);
	// popover //
	$('#helpSearch').attr('data-original-title', otherContent.helpSearchTitle);
	$('#helpSearch').attr('data-content', otherContent.helpSearchBody);
	$('#helpSearchMobile').attr('data-original-title', otherContent.helpSearchTitle);
	$('#helpSearchMobile').attr('data-content', otherContent.helpSearchBody);
	
	$("#head_modal_dash_team").text(modal_team.headline);
	$('#modal_dash_team_subheadline').text(modal_team.subheadline);
	$('#modal_dash_team_topic').text(modal_team.topic);
	$('#modal_dash_team_ok').text(modal_team.create_team_Button);
	$('#add_members').text(modal_team.add_members_head);
	$('#add_mem_1').text(modal_team.add_mem1);
	$('#add_mem_2').text(modal_team.add_mem2);
	$('#add_mem_button').text(modal_team.add_mem_button);

	$("#head_modal_dash_team_edit").text(modal_editTeam.headline);
	
	$("#user_info").text(modal_user.headline);
	$("#user_info_name").html(modal_user.name);
	
	if(window.location.pathname.search("index") == -1 ){//getMyGroups();
	}
	

}