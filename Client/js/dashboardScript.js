// Add a connect listener
var socket = io.connect('http://localhost:3000');

// VARS
var feedEmpty=true;
var oldActive;
var toggle=false;
switchToDE();
var sessionID;

$(document).ready(function(){

if(window.location.pathname.search("summary") != -1 ){
	//will print summarized installation data 
	showSummary();
}




	var version = "1.2";
	setBlock(false);
	
	$("#read").hide();
	switchToDE();
	
	//function will fail, if something is not available
	//so only do certain actions on dashboard, because it's not available on index/admin
	if(window.location.pathname.search("dash") != -1 ){

		$("#accordion").accordion({collapsible: true});
		$("#patchnotes").html(patchnotes);
		$("#chooseDownload").hide();
		$("#patchnotes").accordion({collapsible: true});
		$("#dialog_team_modal").hide();
		$("#dialog").hide();
		$("#error").hide();
		$('#changeCategory').hide();
		$('#version').text(version); 
		$('#version2').text(version);
		
		//category dropdown functions -> elements appear on mouseover and disappear on mouseleave 
		$('#dropButton').mouseover(function(){
			$('#changeCategory').show();
		});
		$('#changeCategory').mouseleave(function(){
			$(this).hide();
		});
		
		window.setInterval(function(){clearFeed();},5000);
		getMyGroups();
		enableTooltips();
		refreshTeamData();
		
		$('#dropToggle').click(function(){
			if(toggle){
				$('#changeCategory').hide();
			} else {
				$('#changeCategory').show();
			}
			toggle = !toggle;
		});
				//enter bestätigung beim erstellen von teams
		$("#team_name").keypress(function(event){
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == '13'){
				createTeam();
			}
			event.stopPropagation();
		});
		

	//enter bestätigung beim hinzufügen von teammitgliedern
		$("#team_user").keypress(function(event){
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == '13'){
				addTeamMember();
			}
			event.stopPropagation();
		});

	//enter bestätigung im suchfeld
	$("#search_field").keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			console.log("enter pressed");
			getResult();
		}
		event.stopPropagation();
	});
		
		
		$('#main-nav li a').on('click', function() {
		oldActive = $(this).parent().parent().find('.active');
		if($(this).attr('id') != "downloadNav") {
			$(this).parent().parent().find('.active').removeClass('active');
			$(this).parent().addClass('active');
		}
	});
	$("#profil").on('hidden.bs.modal', function(){
		$('#main-nav').find('.active').removeClass('active');
		oldActive.addClass('active');
	});
	$("#team_modal").on('hidden.bs.modal', function(){
		$('#main-nav').find('.active').removeClass('active');
		oldActive.addClass('active');
	});
	}
});



if(window.location.pathname.search("dash") != -1 ){
socket.on('connect',function() {
	var id = socket.io.engine.id;
      console.log('Client '+id+' has connected to the server!');
    });
	
	socket.on('requestUsernameLogin', function(){
		socket.emit('receiveUsernameLogin',getUserName());
		//window.setTimeout(function(){ socket.emit('getMyGroups',getUserName()); },300);
	});
	
	socket.on('disconnected', function(){
		alert("You've been disconnected from the server");
	   logOut();
	});
	
	socket.on('requestUsernameLogOut', function(){
		socket.emit('receiveUsernameLogout',getUserName());
	});
    // Add a connect listener
    socket.on('newReq',function(user) {
      var mess = user+reqForm.feed_create;
	  insertIntoFeed(mess);
	  if(isBlocked() == "false"){ getRequirements();}
	  console.log("hey, a new requirement!");
	});
	
	 socket.on('reqFail',function() {
      var mess = reqForm.mess3;
	  $('#error').text(mess).slideDown(500).delay(2000).slideUp(500);
	});
	
    // Add a disconnect listener

	socket.on('requestUsers',function(){
		socket.emit('showUsers');
	});
	
	socket.on('editReq',function(user) {
      var mess = user+reqForm.feed_edit;
	  insertIntoFeed(mess);
	  if(isBlocked() == "false"){ getRequirements();}
    });
	
	socket.on('deleteReq',function(user) {
	var mess = user+reqForm.feed_del;
	  insertIntoFeed(mess);
	  if(isBlocked() == "false"){ getRequirements();}
    });

	socket.on('getRequirements',function(requirements) {
      console.log(requirements);
	  
	  displayedRequirements=requirements;
	  setTable(requirements);
	  //sortById(requirements);
	  refreshExport(requirements);
	  setBlock(false);
	  console.log("now filling dropdown with items");
	  
    });
	
	socket.on('fillCategorySelector',function(categories){
		var body = $('#changeCategory');
		var items = "";
		console.log("dropdown got categories");
		
		for(var i = 0;i < categories.length; i++){
			items+="<li><a onClick=\"getRequirements(\'cat_"+categories[i].name+"\')\">"+categories[i].name+"</a></li>";
		}
		console.log(items);
		body.html(items);
		//body.show();
	});
	
	socket.on('youBeenAdded',function(){
		insertIntoFeed(team.added);
		refreshTeamData(true);
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
	

    window.setInterval(function(){
	checkHelpEnabled();},3000);
		
	$(window).load(function() {
		$('#preloader').delay(0).fadeOut('slow'); // will fade out the white DIV that covers the website.
	});
	$('[data-toggle="popover"]').popover();
}	

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////LOGIN////////START//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

socket.on('gotDeleted',function(){
	insertIntoFeed('Team -1');
	getRequirements();
});

socket.on('registerUser', function(data){
	var mess;
	switch(data){
		case 0: mess=login.mess0; 
			$("#reg_user").val("");
			$("#reg_pw").val("");
			$("#reg_pw2").val("");
			$("#reg_email").val("");
			break;
		case 1: mess=login.mess1;break;
		case 2: mess=login.mess2;break;
		case 3: mess=login.mess3;break;
		case 4: mess=login.mess4;break;
		case 5: mess=login.mess5;break;
	}
	$("#head_modal").text(mess).slideDown(500).delay(2000).slideUp(500);   
	if ((mess.search("Fehler") == -1) && (mess.search("Error") == -1)){ window.setTimeout(function(){$('#register').modal('hide'); }, 2000);};
});


function checkCredentials(){
var user=$("#userPHP").val();
var pass=$("#passPHP").val();
socket.emit('checkLogin',{user: user,pw: pass});
}

socket.on('checkLogin',function(user){
	if(user.exists){
		createUser(user.name);
		redirectToDashboard();
	} else {
		$('#read').text(login.credentials).slideDown(500).delay(2000).slideUp(500); 
	}
});

function registerUser(){
var username=$("#reg_user").val();
var password=$("#reg_pw").val();
var password_repeat=$("#reg_pw2").val();
var email=$("#reg_email").val();

console.log(username+" "+password+" "+password_repeat+" "+email);
socket.emit('registerUser', {user: username,pw:password,pw2:password_repeat,mail:email});


}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////LOGIN////////END////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////DASHBOARD////////START//////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function isBlocked(){
	return sessionStorage.getItem('blocked');
}

function setBlock(val){
	sessionStorage.setItem('blocked',val);
}

function insertIntoFeed(mess){
	 $('#feed').append("<p class='panel feeditem'>"+mess+"</p>");
	  feedEmpty=false;
	}
	
function clearFeed(){
console.log("entering clearFeed()");
	if(!feedEmpty){
		$(".feeditem").delay(6000).fadeOut();
		feedEmpty=true;
	}
}


//ändern der Nutzerdaten
function changeData(){
	var password=$("#ch_pw").val();
	var password_repeat=$("#ch_pw2").val();
	var email=$("#ch_email").val();
	var username=getUserName();
	
	socket.emit('changeData',{user:username ,pw: password, pw2:password_repeat, mail:email});
}
//Eingaben der Anforderung kontrollieren
function checkRequirement(){
	if($('#wann').val() == ""){fieldError(); return false;}
	if($('#system').val() == ""){fieldError(); return false;}
	if($('#objekt').val() == ""){fieldError(); return false;}
	if($('#verb').val() == ""){fieldError(); return false;}
	if(($('#wann').val()+$('#system').val()+$('#objekt').val()+$('#verb').val()+$('#wem').val()+$('#relations').val()).length > 200){ $('#error').text(reqForm.tooLong).slideDown(500).delay(500).slideUp(500); return false;}
	
	var reqId=$('#identity').val();
	if(isNaN(reqId) || reqId < 0 || reqId == ""){$('#error').text(reqForm.id).slideDown(500).delay(2000).slideUp(500); return false;}
	return true;
}

//error Benachrichtigung bei Fehlerhafter Eingabe
function fieldError(){
	$('#error').text(reqForm.optional).slideDown(500).delay(2000).slideUp(500);
}

//Eintragen der zusammengefügten Anforderung
function insertReq(origin){
   
	if(checkRequirement()){
		var user=$('#content');
		var wann=$('#wann').val();
		var muss=$('#muss').val();
		var system=$('#system').val();
		var wem="";
		var bieten=$('#bieten').val();
		var objekt=$('#objekt').val();
		var verb=$('#verb').val();
		var prio=$('#prio').val();
		var reqId=$('#identity').val();
		var reqStatus=$('#status option:selected').text();
		var relations=$('#relations').val();
		relations=relations.replace(/</g, "&lt;").replace(/</g, "&gt;");
		if($('#wem').val() != ""){
			wem=$('#wem').val() + " ";
		}
		var theRequirement = wann + " &req# " + muss + " &req# " + system + " &req# " + wem + " &req# " + bieten + " &req# " + objekt + " &req# " + verb + ".";
		theRequirement=theRequirement.replace(/</g, "&lt;").replace(/</g, "&gt;");
		
		if(theRequirement.length < 220){
			var currentTime = Date.now();
			var activity;
			var category = $('#cats option:selected').text();
			console.log(category);

			//je nachdem, wo funktion aufgerufen wird, wird ein parameter mitgegeben 
			//hier wird der parameter aufgerufen, um folgenden funktionsverlauf zu unterscheiden
			switch (origin) {
				//0 --> requirement kommt aus createReqForm() Funktion --> wurde normal erstellt
				//um schnell mehrere reqs hintereinander zu erstellen, rufe erneut createReqForm auf
				case 0:	createReqForm(); activity = false;break; 
				//1 --> gibt es nicht, ... somehow xD
				case 1: getRequirements(); activity = false;break;
				//2 --> von edit() --> requirement wurde bearbeitet und jetzt neu eingefügt 
				case 2: getRequirements(); activity = true;break;
				default: getRequirements(); activity = false; break;
			}
						
			var data = {activity: activity,user: getUserName(), "req": theRequirement, "prio": prio, "username": getUserName(), "id": reqId, "status": reqStatus, "relations": relations, "currentTime": currentTime, category: category}
			socket.emit('getCatID',data);
		} else {
			$('#error').text(reqForm.tooLong).slideDown(500).delay(2000).slideUp(500);
		}
	}
} 

socket.on('getCatID',function(data){
	socket.emit('insertReq',data);
});

//löschen einer Anforderung
function deleteReq(id, doAfterThis, param){
	var activity = 0; // 0 -> löschen 1 -> editieren
		if(doAfterThis != placeholder){
			activity = 1;
		} 
		socket.emit('deleteReq',{socketid: socket.io.engine.id, user: getUserName(), id: id, activity: activity});
		if(doAfterThis != placeholder){
			//wenn req editiert wird, gibt es eine folgefunktion --> insertreq(2), da param in diesem fall 2 ist
			doAfterThis(param);
		}
		getRequirements();
}

//Auslesen der Anforderungen
var lastReadFromDb;


function getRequirements(query){
	//re-enable instant pop up of new requirements and / or other
	setBlock(false);
	var search = query;	
	socket.emit('getRequirements',{socket: socket.io.engine.id, user: getUserName(), search: search});
}


//Sortier Funktionen -------------------------------------------------------------------------------------------
//arr nach id sortieren
var reversedID = false;//variable für Umkehren bei erneutem Klicken
function sortById(arr){
	$.ajax({
		url: "",
		beforeSend: function() { $('body').addClass('busy'); },
		success: function (success) {
			if (arr.length != 0){
				arr.sort(function(a, b){return a.project_id-b.project_id});
				if(reversedID == false){
					arr.reverse();
					reversedID = true;
				} else {
					reversedID = false;
				}
			}
			displayedRequirements = arr;
			setTable(displayedRequirements);
			refreshExport(displayedRequirements);
		},
		complete: function() { $('body').removeClass('busy'); }
	});
}

//arr nach Anforderungen alphabetisch sortieren
var reversedReq = false;//variable für Umkehren bei erneutem Klicken
function sortByReq(arr){
	$.ajax({
		url: "",
		beforeSend: function() { $('body').addClass('busy'); },
		success: function (success) {
			if (arr.length != 0){
				arr.sort(function(a, b){
					var stringA=a.requirement.toLowerCase(), stringB=b.requirement.toLowerCase(); //gross und kleinschreibung ignorieren
					if (stringA < stringB) //sortieren
						return -1;
					if (stringA > stringB)
						return 1;
					return 0; //default
				});
				if(reversedReq == false){
					arr.reverse();
					reversedReq = true;
				} else {
					reversedReq = false;
				}
			}
			displayedRequirements = arr;
			setTable(displayedRequirements);
			
		},
		complete: function() { $('body').removeClass('busy'); }
	});
}

//arr nach prio sortieren
var reversedPrio = false;//variable für Umkehren bei erneutem Klicken
function sortByPrio(arr){
	$.ajax({
		url: "",
		beforeSend: function() { $('body').addClass('busy'); },
		success: function (success) {
			if (arr.length != 0){
				arr.sort(function(a, b){return a.priority-b.priority});
				if(reversedPrio == false){
					arr.reverse();
					reversedPrio = true;
				} else {
					reversedPrio = false;
				}
			}
			displayedRequirements = arr;
			setTable(displayedRequirements);
			refreshExport(displayedRequirements);
		},
		complete: function() { $('body').removeClass('busy'); }
	});
}

//arr nach Anforderungen alphabetisch sortieren
var reversedStatus = false; //variable für Umkehren bei erneutem Klicken
function sortByStatus(arr){
	$.ajax({
		url: "",
		beforeSend: function() { $('body').addClass('busy'); },
		success: function (success) {
			if (arr.length != 0){
				arr.sort(function(a, b){
					var stringA=a.status.toLowerCase(), stringB=b.status.toLowerCase(); //gross und kleinschreibung ignorieren
					if (stringA < stringB) //sortieren
						return -1;
					if (stringA > stringB)
						return 1;
					return 0; //default
				});
				if(reversedStatus == false){
					arr.reverse();
					reversedStatus = true;
				} else {
					reversedStatus = false;
				}
			}
			displayedRequirements = arr;
			setTable(displayedRequirements);
			refreshExport(displayedRequirements);
		},
		complete: function() { $('body').removeClass('busy'); }
	});
}
//arr nach Zeit sortieren
var reversedTime = false;//variable für Umkehren bei erneutem Klicken
function sortByTime(arr){
	$.ajax({
		url: "",
		beforeSend: function() { $('body').addClass('busy'); },
		success: function (success) {
			if (arr.length != 0){
								arr.sort(function(a, b){return a[6]-b[6]});
								if(reversedTime == false){
									arr.reverse();
									reversedTime = true;
								} else {
									reversedTime = false;
								}
							}
			displayedRequirements = arr;
			setTable(displayedRequirements);
			refreshExport(displayedRequirements);
		},
		complete: function() { $('body').removeClass('busy'); }
	});
}

//Time converter to change timestamp from DB to a string
function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp*1); // *1 to get a number
	var months = ['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	if(min < 10){
		min = "0" + min;		
	}
	var time = date + '. ' + month + ' ' + year + ' ' + hour + ':' + min;
	return time;
}
//Anzeigen der Anforderungen
var displayedRequirements; //Globales Array für onclick() Funktionen der Tabelle
function setTable(requirements){
	var string="";
	var body=$('#content');
	var priority;
	var p_id;
	var p_status;
	var p_rel;
	var req;
	var req_id;
	var p_timestamp;
	var p_time;
	

	  
	
	  for (var i = 0; i < requirements.length; i++){
							req = requirements[i].requirement.replace(/&req#/g," ");
							req_id=requirements[i].reqid;
							priority=requirements[i].priority;
							p_id=requirements[i].project_id;
							p_status=requirements[i].status;
							p_rel=requirements[i].relations;
							p_timestamp=requirements[i].timestamp;
							p_time = timeConverter(p_timestamp);
							//Tabelleninhalt
							
							
							string+="<tr>\
									<th>"+p_id+"</th>\
									<th  id='result"+req_id+"'>"+req+"</th>\
									<th scope='row'>"+priority+"</th>\
									<th>"+p_status+"</th>\
									<th>"+p_rel+"</th>\
									<th>"+p_time+" Uhr</th>\
									<th class='ex req-btn'>\
										<button type='button' class='btn btn-default' onClick='createEditForm("+req_id+")' aria-label='Left Align'>\
											<span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>\
										</button>\
										<button type='button' class='btn btn-default' onClick='confirmRemoval("+req_id+")' aria-label='Right Align'>\
											<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>\
										</button>\
									</th>\
									</tr>";
						}
						
						
						//Tabellenrahmen
					
						body.html(" <div id='field' class='panel panel-default'>\
									<table class='table' id='table2excel'><thead style='background-color:#E6E6E6'>\
								<tr>\
									<th class='sortHead col-md-1' id='sortHead1' onclick='sortById(displayedRequirements)' >"+tableHead.item1+"</th>\
									<th class='sortHead require col-md-5' id='sortHead2' onclick='sortByReq(displayedRequirements)' >"+tableHead.item2+"</th>\
									<th class='sortHead col-md-1' id='sortHead3' onclick='sortByPrio(displayedRequirements)' >"+tableHead.item3+"</th>\
									<th class='sortHead col-md-1' id='sortHead4' onclick='sortByStatus(displayedRequirements)' >"+tableHead.item4+"</th>\
									<th class='col-md-1' id='sortHead5'>"+tableHead.item5+"</th>\
									<th class='sortHead col-md-1' id='sortHead6' onclick='sortByTime(displayedRequirements)' >"+tableHead.item6+"</th>\
									<th class='ex col-md-2' id='sortHead7'>"+tableHead.item7+"</th>\
								</tr></thead>\
								<tbody>\
									"+string+"\
								</tbody></table></div>"
						);
						
						getCategories(getUserName(),2);
	  
}


//Anforderung bearbeiten
function edit(id){
	if(checkRequirement()){
		deleteReq(id, insertReq, 2);
		socket.emit('editReq',{socketid: socket.io.engine.id, user: getUserName()});
	}
}

//"Home" aktiv setzen und Tabelle mit Query neu laden
function getResult(){
	$('#main-nav').find('.active').removeClass('active');
	$('#main-nav li:first-child').addClass('active');
	var searchQuery=$("#search_field").val();
	getRequirements(searchQuery);	
}


//Löschen bestätigen
function confirmRemoval(reqID){
	
	$( "#dialog" ).dialog({
		resizable: false,
		draggable: false,
		height: 140,
		width: 400,
		title: deleteReq.confirm,
		modal: true,
		buttons: {
			"OK": function() {
				deleteReq(reqID,placeholder);
				$( this ).dialog( "close" );
			},
			"Cancel": function() {
				$( this ).dialog( "close" );
			}
		}
	});
}

//Anforderungen als .csv exportieren
var uri="";
var fileName="";
function refreshExport(arr){
	var user = getUserName();
	var csvRows = new Array();
	var prio;
	var req;
	var p_id; //id der anforderung im team p -> projekt
	var p_status;
	var p_rel;
	var req_id;

	// csv daten aufbereiten	
		csvRows.push("ID"+"\t"+csvtxt.req+"\t"+csvtxt.prio+"\t"+"Status"+"\t"+csvtxt.dep);
		for (var i = 0; i< arr.length; i++){
			req = arr[i].requirement.replace(/&req#/g," ");
			prio = arr[i].priority;
			p_id=arr[i].project_id;
			p_status=arr[i].status;
			p_rel=arr[i].relations;
			csvRows.push(p_id+"\t"+req+"\t"+prio+"\t"+p_status+"\t"+p_rel);
		}
	
	
	//csv datei anlegen
	var csvData = csvRows.join("\n");
	uri = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvData);
	fileName = "Anforderungen.csv";
}

function chooseDownload(reqID){
	$( "#chooseDownload" ).dialog({
		resizable: false,
		draggable: false,
		height: 140,
		width: 400,
		title: otherContent.download,
		modal: true,
		buttons: {
			"Excel (.xls)": function() {
				//use JQuery plugin
				$("#table2excel").table2excel({
					// exclude CSS class
					exclude: ".noExl",
					name: "Requirements"
				});
				$( this ).dialog( "close" );
			},
			".CSV": function() {
				// create a clickable element
				var link = document.createElement('a');
				link.href = uri;
				link.download = fileName;
				//Firefox requires the link to be in the body
				document.body.appendChild(link);
				//simulate click
				link.click();
				//remove link
				document.body.removeChild(link);
				$( this ).dialog( "close" );
			}
		}
	});
}

function placeholder(){
//für funktionen, die eine funktion als param benötigen
//aber diese für den jeweiligen zweck undienlich ist.
}

function enableTooltips(){
		
		defineTranslationVars(language);

		$('#l1').attr('title',menu.item1_tt);
		$('#l2').attr('title',menu.item2_tt);
		$('#l3').attr('title',menu.item3_tt);
		$('#l4').attr('title',menu.item4_tt);
		$('#l5').attr('title',menu.item5_tt);
		$('#l6').attr('title',menu.item6_tt);
		$('#l7').attr('title',menu.item7_tt);

		$('#helpSearch').attr('title',otherContent.helpSearchTitle);
	
		$('#sortHead1').attr('title',tableHead.item1_tt);
		$('#sortHead2').attr('title',tableHead.item2_tt);
		$('#sortHead3').attr('title',tableHead.item3_tt);
		$('#sortHead4').attr('title',tableHead.item4_tt);
		$('#sortHead6').attr('title',tableHead.item6_tt);
		
		$('#search_field').attr('title',otherContent.search);
		
		$('#news').attr('title',otherContent.news);
		
		if($(document).width() < 800){
				//no tooltips enabled
				$("#newsFeedPanel").hide();
		} else {
				$(document).tooltip();
				$('#news').tooltip();
				$("#left_nav").tooltip({
					position: { my: "left-10vh center", at: "right center" }
				});
				$("#SearchInputGroup").tooltip({
					position: { my: "center top-83"}
				});
				$("#content").tooltip({
					position: { my: "center top-80", collision: "flipfit" },
					track: true,
				});
		}
}


//returns false if help checkbox ticked
function helpEnabled(){
	var val=$("#helpCheckbox").prop('checked');
	//if(val){ console.log("ja");} else {console.log("nein");}
	return val;
}



function checkHelpEnabled(){
	if(!helpEnabled()){
		$(document).tooltip("disable");
	} else {
	//all vars in translate.js
		enableTooltips();
	
	}
}

//
// 	END tooltips and translation//
//


function sizeAccordion(){
$("#accordion").accordion({ heightStyle: "content" });
}

//erzeugen der Input-Felder
function createReqForm(){
setBlock(true);
var body=$('#content');
var user= getUserName();
	body.html("<h3 class='marginClass'>"+reqForm.headline+"</h3>\
				<fieldset>\
					<div class='col-md-3'><input type='text' class='form-control' name='wann' id='wann' placeholder='Wann?/Bedingung?'></div>\
					<div class='col-md-2'><select class='form-control' name='muss' id='muss'>\
						<option>muss</option>\
						<option>sollte</option>\
						<option>wird</option>\
					</select></div>\
					<div class='col-md-3'><input type='text' class='form-control' name='system' id='system' placeholder='Systemname?'></div>\
					<div class='col-md-2'><input type='text' class='form-control' name='wem' id='wem' placeholder='wem? (optional)'></div>\
					<div class='col-md-2'><select class='form-control' name='bieten' id='bieten'>\
						<option>fähig sein,</option>\
						<option>die Möglichkeit bieten,</option>\
						<option> </option>\
					</select></div>\
				</fieldset></br>\
				<fieldset>\
					<div class='col-md-2'><input type='text' class='form-control' name='objekt'	id='objekt' placeholder='Objekt?'></div>\
					<div class='col-md-2'><input type='text' class='form-control' name='verb' id='verb' placeholder='Verb?'></div>\
					<div class='col-md-2'><input type='text' class='form-control' name='identity' id='identity' placeholder='ID?'></div>\
					<div class='col-md-3'><input type='text' class='form-control' name='relations' id='relations' placeholder='Abhängigkeiten? (optional)'></div>\
					<div class='col-md-2' id='categoryForm'></div>\
				</fieldset></br>\
				<fieldset>\
					<div class='col-md-2'>"+reqForm.prio+"<select id='prio' class='form-control'>\
													<option>0</option>\
													<option>1</option>\
													<option>2</option>\
													<option>3</option>\
												</select>\</div>\
					<div class='col-md-3'>"+reqForm.status+":<select id='status' class='form-control'>\
													<option>im Backlog</option>\
													<option>in Bearbeitung</option>\
													<option>in Testphase</option>\
													<option>abgeschlossen</option>\
												</select>\
					</div>\
				</fieldset>\
		<button class='btn btn-success marginClass' id='reg_submit' onClick='insertReq(0)'>"+button.ok+"</button>");
		
		getCategories(getUserName(),1);
	
}

socket.on('FillCategoryDropdown',function(cats){
	var dropdown = $('#categoryForm');
	var items = "";
	
	for (var i = 0;i < cats.length; i++){
		items+= "<option>"+cats[i].name+"</option>";
	}
	
	dropdown.html("<select class='form-control' name='bieten' id='cats'>"+items+"</select>");
});

socket.on('doEditReq',function(req){
var body=$('#content');

var wann, muss, wer, wem, bieten, objekt, verb, priority,p_id,p_rel,p_status;
wann=req.wann;
muss=req.muss;
wer=req.wer;
wem=req.wem;
bieten=req.bieten;
objekt=req.objekt;
verb=req.verb;
priority=req.priority;
p_id=req.p_id;
p_rel=req.p_rel;
p_status=req.p_status;
id=req.id;



body.html("<h3 class='marginClass'>"+editForm.greeting+"</h3>\
				<fieldset>\
					<div class='col-md-3'><input type='text' class='form-control' name='wann' id='wann' value='"+wann+"'></div>\
					<div class='col-md-2'><select class='form-control' name='muss' id='muss'>\
						<option>"+muss+"</option>\
						<option>muss</option>\
						<option>sollte</option>\
						<option>wird</option>\
					</select></div>\
					<div class='col-md-3'><input type='text' class='form-control' name='system' id='system' value='"+wer+"'></div>\
					<div class='col-md-2'><input type='text' class='form-control' name='wem' id='wem' value='"+wem+"'></div>\
					<div class='col-md-2'><select class='form-control' name='bieten' id='bieten'>\
						<option>"+bieten+"</option>\
						<option>fähig sein,</option>\
						<option>die Möglichkeit bieten,</option>\
						<option> </option>\
					</select></div>\
				</fieldset></br>\
				<fieldset>\
					<div class='col-md-2'><input type='text' class='form-control' name='objekt'	id='objekt' value='"+objekt+"'></div>\
					<div class='col-md-2'><input type='text' class='form-control' name='verb' id='verb'  value='"+verb+"'></div>\
					<div class='col-md-2'><input type='text' class='form-control' name='identity' id='identity'  value='"+p_id+"'></div>\
					<div class='col-md-3'><input type='text' class='form-control' name='relations' id='relations'  value='"+p_rel+"'></div>\
					<div class='col-md-2' id='categoryForm'></div>\
				</fieldset></br>\
				<fieldset>\
					<div class='col-md-2'>"+editForm.prio+"<select id='prio' class='form-control'>\
													<option>"+priority+"</option>\
													<option>0</option>\
													<option>1</option>\
													<option>2</option>\
													<option>3</option>\
												</select></div>\
					<div class='col-md-3'>Status:<select id='status' class='form-control'>\
						<option>"+p_status+"</option>\
						<option>im Backlog</option>\
						<option>in Bearbeitung</option>\
						<option>in Testphase</option>\
						<option>abgeschlossen</option>\
					</select>\
					</div>\
				</fieldset>\
				<button class='btn btn-success marginClass' id='reg_submit' onClick='edit("+id+")'>"+button.ok+"</button>");
				
				getCategories(getUserName(),1);
});

//Formular für Anforderung bearbeiten
function createEditForm(id){
	setBlock(true);
	var user= getUserName();
	socket.emit('doEditReq',{user: user, id: id});
}
var patchnotes = "\
	<h3><span style='font-style:bold'>Version 1.1b</span></h3>\
	<div><ul>\
		<li>Suchfunktion verbessert:</li><ul>\
			<li>Suche nach Wörtern getrennt durch Leertaste optimiert</li>\
			<li>Suche nach exakten Wortstücken begrenz durch / ist nun möglich.</li>\
		</ul></br>\
		<li>Allgemeine Änderungen:</li><ul>\
			<li>Es ist nun der download als csv oder excel Datei möglich.</li>\
		</ul></br>\
		<li>Visuelle Änderungen:</li><ul>\
			<li>Ein Hilfebutton neben dem Suchfeld zeigt zusätzliche Informationen</li>\
			<li>Ladeanimation hinzugefügt</li>\
		</ul></br>\
		<li>Bugfixes:</li><ul>\
			<li>Fehlende Übersetzungen hinzugefügt</li>\
		</ul>\
	</ul></div>\
	\
	<h3><span style='font-style:bold'>Version 1.1a</span></h3>\
	<div><ul>\
		<li>Allgemeine Änderungen:</li><ul>\
			<li>Website kann nun auf Englisch umgestellt werden</li>\
			<li>Ein Klick auf die Email eines Teammitgliedes öffnet direkt eine Vorlage im Standardemailprogramm</li>\
			<li>Tooltips können jetzt deaktiviert werden</li>\
		</ul></br>\
		<li>Visuelle Änderungen:</li><ul>\
			<li>Die aktuelle Uhrzeit wird nun rechts oben angezeigt</li>\
			<li>Feed-Nachrichten beinhalten jetzt ob jemand Anderes oder man selbst eine Aktion durchgeführt hat</li>\
			<li>Beim Laden von vielen Anforderungen wird die Maus nun zum Ladesymbol</li>\
		</ul></br>\
		<li>Bugfixes:</li><ul>\
			<li>Uhrzeit ist jetzt auch bei 0-9 jeweils zweistellig</li>\
			<li>Der Footer ist nun immer korrekt am unteren Bildschirmrand</li>\
		</ul>\
	</ul></div>\
	\
	<h3><span style='font-style:bold'>Version 1.0</span></h3>\
	<div><ul>\
		<li>Allgemeine Änderungen:</li><ul>\
			<li>Möglichkeit zur Abfrage der Nutzerinformationen von Teammitgliedern</li>\
			<li>Inputfeld für Name wird beim Laden der Loginseite automatisch ausgewählt</li>\
			<li>Versionsübersicht hinzugefügt</li>\
		</ul></br>\
		<li>Bugfixes:</li><ul>\
			<li>Suche setzt Menüpunkt Home jetzt als aktiv</li>\
			<li>Abkürzungspunkt vom Monat May entfernt</li>\
		</ul>\
	</ul></div>\
	\
	<h3>Version 0.9</h3>\
	<div><ul>\
		<li>Allgemeine Änderungen:</li><ul>\
			<li>Feed-Performance verbessert</li>\
			<li>Feed-Nachricht bei neuen Anforderungen geändert</li>\
			<li>Feed-Nachricht bei bearbeiteter Anforderung hinzugefügt</li>\
			<li>Link zu Kontaktmöglichkeiten hinzugefügt</li>\
		</ul></br>\
		<li>Visuelle Änderungen:</li><ul>\
			<li>Stern bei neuen Feeds hinzugefügt</li>\
			<li>Anforderungen sind bei kleinem Bildschirm scrollbar</li>\
		</ul>\
	</ul></div>\
	\
	<h3>Version 0.8</h3>\
	<div><ul>\
		<li>News-Feed hinzugefügt:</li><ul>\
			<li>Information bei neuen / gelöschten Anforderungen</li>\
			<li>Feed wird nach nach Aktualisierung des Dashboards zurückgesetzt</li>\
		</ul></br>\
		<li>Visuelle Änderungen:</li><ul>\
			<li>Login und Dashboard für Mobilgeräte angepasst</li>\
			<li>Neue Positionen für Tooltips</li>\
		</ul></br>\
		<li>Bugfixes:</li><ul>\
			<li>Bugfix bezüglich Uhrzeitanzeige</li>\
		</ul>\
	</ul></div>\
	\
	<h3>Version 0.7</h3>\
	<div><ul>\
		<li>Allgemeine Änderungen:</li><ul>\
			<li>Zu Anforderungen wird der Zeitpunkt der letzten Änderungen angezeigt</li>\
			<li>Automatische Suche nach Änderungen von Anforderungen</li>\
			<li>Anzahl der Änderungen wird dargestellt</li>\
		</ul></br>\
		<li>Visuelle Änderungen:</li><ul>\
			<li>Aussehen des Suche-Buttons geändert</li>\
		</ul></br>\
		<li>Bugfixes:</li><ul>\
			<li>Bugfix bezüglich Menüdarstellung</li>\
		</ul>\
	</ul></div>\
	\
	<h3>Version 0.6</h3>\
	<div><ul>\
		<li>Allgemeine Änderungen:</li><ul>\
			<li>Geschwindigkeit verbessert</li>\
		</ul></br>\
		<li>Visuelle Änderungen:</li><ul>\
			<li>Logo geändert</li>\
		</ul></br>\
		<li>Bugfixes:</li><ul>\
			<li>Bugfix bezüglich der Edit-Funktion</li>\
			<li>Bugfix bezüglich der Tabellendarstellung der Anforderungen</li>\
		</ul>\
	</ul></div>\
	<h3>Version 0.5</h3>\
	<div><ul>\
		<li>Teams hinzugefügt:</li>\
		<ul>\
			<li>Teams erstellen, bearbeiten und löschen</li>\
			<li>Eigenen Teams beitreten oder verlassen</li>\
			<li>Mitglieder zu Teams hinzufügen</li>\
		</ul></br>\
		<li>Visuelle Änderungen:</li><ul>\
			<li>Anzeige von Tooltips hinzugefügt</li>\
		</ul></br>\
		<li>Bugfixes:</li><ul>\
			<li>Bugfix bezüglich Menüdarstellung</li>\
		</ul>\
	</ul></div>\
	";
	
	
function createCategory(){
	var body=$('#content');
	getCategories(getUserName(),0);
	body.html("	<div class='col-md-4'><input class='form-control' type='text' placeholder='Neue Kategorie' id='catField' ></input></div>\
				<div class='col-md-2'><button id='sm_cat' onClick='submitCategory()' class='btn btn-default'><span id='glyph' class='glyphicon glyphicon-plus' aria-hidden='true'></span></button></div>\
			    <div id='catList' class='panel col-md-5'></div>");
	setBlock(true);
	
	$("#catField").keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			submitCategory();
		}
		event.stopPropagation();
	});
}	

function submitCategory(){
	var cat = $('#catField').val();
	if((cat != "") && (cat.indexOf("_")==-1)){
		socket.emit('submitCategory',{category: cat, username: getUserName()});
	} else {
		$('#error').text(category.fill).slideDown(500).delay(1000).slideUp(500);
	}
	$('#catField').val("");
}

socket.on('submitCategory',function(data){
	var mess = "";
	
	switch(data.code){
		case 0: mess = category.mess0; 	insertIntoFeed(data.username+": "+category.feed0); break;
		case 1: mess = category.mess1; break;
		case 2: mess = category.mess2; break;		
		case 3: mess = category.mess3; break;		
	}
	//$('#error').text(mess).slideDown(500).delay(1000).slideUp(500);
	getCategories(getUserName(),0);
});

function getCategories(user,act){
	socket.emit('getCategories',{user: user,act: act});
}

socket.on('getCategories',function(categories){
	var string = "";
	var user = getUserName();
	for(var i=0;i<categories.length;i++){
		if(categories[i].name != "uncategorized"){
			string+="<div><label class='col-md-9'>"+categories[i].name+"</label>\
					<button class='btn btn-default' onClick='editCat("+categories[i].id+");'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span></button>\
					<button class='btn btn-default' onClick='deleteCat("+categories[i].id+",\""+user+"\");'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button>\
					</div>";
		}
	}
	$('#catList').html(string);
});

function deleteCat(id, username){
	$( "#dialog" ).dialog({
		resizable: false,
		height: 140,
		width: 700,
		title: category.dialog,
		modal: true,
		bgiframe: true,
		buttons: {
			"OK": function() {
				socket.emit('deleteCat',{id: id, username: username});
				$( this ).dialog( "close" );
			},
			"Cancel": function() {
				$( this ).dialog( "close" );
				getCategories(getUserName(),0);
			}
		}
	});
	
}

socket.on('deleteCat',function(data){
	console.log(data.code);
	var mess = "";
	switch(data.code){
		case 0: mess = category.del0; break;
		case 1: mess = category.del1; break;
	}
	//$('#error').text(mess).slideDown(500).delay(1000).slideUp(500);
	getCategories(getUserName(),0);
	insertIntoFeed(data.username+": "+mess);
});

function editCat(id){
	socket.emit('getEditData',id);
}

socket.on('getEditData',function(data){
	console.log(data.name);
	$('#catField').val(data.name);
	$('#sm_cat').attr("onClick","submitEdit("+data.id+")");
	$('#glyph').removeClass("glyphicon-plus");
	$('#glyph').addClass("glyphicon-ok");
});

function submitEdit(id){
	var newName = $('#catField').val();
	console.log(newName);
	socket.emit('submitEdit',{id: id, newName:newName});
}

socket.on('submitEdit',function(){
	createCategory();
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////DASHBOARD//////END//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////TEAM//////START/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
	var mess;
	switch (code) {
		case 0: mess = createTeam.mess0; socket.emit('submitCategory',{category: "uncategorized", username: getUserName()});break;
		case 1: mess = createTeam.mess1; break;
	}
	//teams neu laden --> meine Teams / nur wenn create erfolgreich
	if(code == 0){
		refreshTeamData(true);	
		$("#team_name").val('');	
		window.setTimeout(function(){$("#head_modal_dash_team").text(mess).slideDown(500).delay(1000).slideUp(500);},3000);
		socket.emit('createDefaultCategory',teamname);
		socket.emit('insertTeamOwner',{user:getUserName(), team: teamname});
	} else {
		// sonst zeige nur Fehlermeldung
		window.setTimeout(function(){$("#head_modal_dash_team").text(mess).slideDown(500).delay(1000).slideUp(500);},3000);
	}
});

socket.on('createDefaultCategory',function(){
	console.log("created uncategorized category");
});

socket.on('insertTeamOwner', function(data){
	console.log(data);
	var mess2;
	switch (data) {
		case 0: mess2 = insertGroupOwner.mess0; break;
		case 1: mess2 = insertGroupOwner.mess1; break;
	}
	//window.setTimeout(function(){$("#head_modal_dash_team").text(mess2).slideDown(500).delay(1000).slideUp(500);},3000);
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
	if (team != ""){
		socket.emit('addTeamMember',{user: newMember,team: team});
	}
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////TEAM//////END///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////USER//////START/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





function getParameter(param){
    var url = window.location.search.substring(1);
    var variables = url.split('&');
    for (var i = 0; i < variables.length; i++) 
    {
        var varName = variables[i].split('=');
        if (varName[0] == param) 
        {
            return varName[1];
        }
    }
}   



function createUser(name){
var user;
sessionID = Date.now();
user= name;
//objekt user wird in den lokalen datenstream übertragen, um überall verfügbar zu sein.
localStorage.setItem("user"+sessionID, JSON.stringify(user));
return sessionID;
}

function getUserName(){
var user;
if (window.location.pathname.search("dash") != -1){	 
	 user = JSON.parse(localStorage.getItem("user"+getParameter("session")));
} else if (window.location.pathname.search("admin") != -1){
		user = JSON.parse(localStorage.getItem("user"+getParameter("session")));
	}
else {	 user = JSON.parse(localStorage.getItem("user"+sessionID));
}
return user; 
}

function redirectToDashboard(){
	if (getUserName() == 'admin'){
		window.location="adminpage.html?session="+sessionID;
	} else {
		window.location="dashboard_de.html?session="+sessionID;
	}
}

function logOut(){
	localStorage.removeItem("user"+getParameter("session"));
	location.replace("index.html");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////USER//////END///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//INSTALL STUFF

function install() {
	var relay = $('#relay').val();
	var relUser = $('#relUser').val();
	var relPass = $('#relPass').val();
	var fromUser = $('#fromUser').val();
	var toUser = $('#toUser').val();
	
	var arr = {
		relay: relay,
		relUser: relUser,
		relPass: relPass,
		fromUser: fromUser,
		toUser : toUser,
	}
	
socket.emit('enableReports',arr);
console.log("yey :D");
}

function skipInstall(){
	socket.emit('disableReports');
}

function sendTestMail(){

	var arr = {
		relay: $('#relay').val(),
		relUser: $('#relUser').val(),
		relPass: $('#relPass').val(),
		fromUser: $('#fromUser').val(),
		toUser : $('#toUser').val(),
	}

	socket.emit('testMail',arr);
}

socket.on('testMail', function(){
	$('#read').show();
	$('#read').text("We have tried to send an e-mail to your specified recipient address. Please check it's account").slideDown(500).delay(2000).slideUp(500);
});
socket.on("redirectYes", function(){
	$('#read').show();
	$('#read').text("configuration successful. You will be redirected to login page in 5 seconds\n");
	window.setTimeout(function(){
		socket.emit('reloadConf');
		location.replace("index.html");
	},5000);
});
	
socket.on("redirectNo", function(){
	$('#read').show();
	$('#read').text("configuration skipped. You will be redirected to login page in 5 seconds\n");
	window.setTimeout(function(){location.replace("index.html");},5000);
});

function testDatabaseConnection(){
	var data = {
		host: $('#db_host').val(),
		user: $('#db_user').val(),
		pass: $('#db_pass').val(),
		name: $('#db_name').val(),
	}
	socket.emit("testDatabaseConnection", data);
}

socket.on('testDatabaseConnection', function(code) {
	if(code=="0"){
		$('#read').text("Can connect to database!").slideDown(500).delay(2000).slideUp(500);
	} else  {
		$('#read').text("Cannot connect to database! Please check data").slideDown(500).delay(2000).slideUp(500);
	}
});

function writeDatabaseConfiguration(){
var data = {
		host: $('#db_host').val(),
		user: $('#db_user').val(),
		pass: $('#db_pass').val(),
		name: $('#db_name').val(),
	}
	socket.emit("writeDatabaseConfiguration", data);
}


socket.on('writeDatabaseConfiguration', function() {
	$('#read').text("Configuration successful").slideDown(500).delay(2000).slideUp(500);
});

function checkAdminConfiguration(){
var pw = $('#adm_pw').val();
var pw2 = $('#adm_pw2').val();

	if(pw != pw2) {
		$('#read').text("passwords do not match!").slideDown(500).delay(2000).slideUp(500);
	} else if(pw.length < 8){
		$('#read').text("password needs to be at least 8 characters long!").slideDown(500).delay(2000).slideUp(500);
	} else {
		socket.emit("writeAdminConfiguration",pw);
		location.replace('summary.html');
	}

}

function showSummary(){
	socket.emit("showSummary");
}

socket.on("showSummary",function(data){
console.log(data.db_host);
var body = $('#summary_field');
var string = "<p>E-Mail Assistant: "+data.Reports_Enabled+"</p>\
			  <p>E-Mail Service: "+data.Relay_Service+"</p>\
			  <p>E-Mail Relay User: "+data.Mail_Relay_User+"</p>\
			  <p>E-Mail Sender: "+data.Mail_Sender_Email+"</p>\
			  <p>E-Mail Recipient: "+data.Mail_Recipient_Email+"</p>\
			  <p>Database host: "+data.db_host+"</p>\
			  <p>Database User: "+data.db_user+"</p>\
			  <p>Database Name: "+data.db_name+"<p>";
			
console.log(string);
body.html(string);

});

function configureRedWire(){
	socket.emit('configureRedWire');
}

socket.on('returnToIndex',function(){
	location.replace('../index.html');
});