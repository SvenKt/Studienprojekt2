////////////////
//USES user.js//
////////////////

var socket = io.connect('http://localhost:3000');
var feedEmpty=true;
var blocked=false;
	
    // Add a connect listener
   

    // Sends a message to the server via sockets


function isBlocked(){
	return sessionStorage.getItem('blocked');
}

function setBlock(val){
	sessionStorage.setItem('blocked',val);
}

$(document).ready(function(){
getMyGroups();
sessionStorage.setItem('free',true);


 socket.on('connect',function() {
	var id = socket.io.engine.id;
      console.log('Client '+id+' has connected to the server!');
    });
	
	socket.on('requestUsernameLogin', function(){
		socket.emit('receiveUsernameLogin',getUserName());
		//window.setTimeout(function(){ socket.emit('getMyGroups',getUserName()); },300);
	});
	
	socket.on('disconnected', function(){
	   console.log("disconnected from server");
	});
	
	socket.on('requestUsernameLogOut', function(){
		socket.emit('receiveUsernameLogout',getUserName());
	});
    // Add a connect listener
    socket.on('newReq',function(user) {
      var mess = user+reqForm.feed_create;
	  insertIntoFeed(mess);
	  if(isBlocked() == "false"){ getRequirements();}
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
	  
	  setTable(requirements);
	  sortById(requirements);
	  refreshExport(requirements);
	  
    });
	
	socket.on('youBeenAdded',function(){
		console.log("YAY");
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
	
	$("#error").hide();
	$("#dialog").hide();
	refreshTeamData();

    window.setInterval(function(){
	checkHelpEnabled();},3000);
	
	
		
	window.setInterval(function(){
		clearFeed();
	},5000);
		
	$(window).load(function() {
		getRequirements();
		//$('#status').fadeOut(); // will first fade out the loading animation
		$('#preloader').delay(0).fadeOut('slow'); // will fade out the white DIV that covers the website.
		//$('body').delay(2000).css({'overflow':'visible'});
	});
	$('[data-toggle="popover"]').popover();
});

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
		var currentTime = Date.now();
		var activity;

		switch (origin) {
							case 0:	createReqForm(); activity = false;break;
							case 1: getRequirements(); activity = false;break;
							case 2: getRequirements; activity = true; break;
							default: getRequirements(); activity = false; break;
						}
						
		var data = {activity: activity,user: getUserName(), "req": theRequirement, "prio": prio, "username": getUserName(), "id": reqId, "status": reqStatus, "relations": relations, "currentTime": currentTime}
		
		socket.emit('insertReq',data);
		
	}//else alert("Anforderungsfehler");
} 


//löschen einer Anforderung
function deleteReq(id, doAfterThis, param){
	var activity = 0; // 0 -> löschen 1 -> editieren
		if(doAfterThis != placeholder){
			activity = 1;
		} 
		socket.emit('deleteReq',{socketid: socket.io.engine.id, user: getUserName(), id: id, activity: activity});
		if(doAfterThis != placeholder){
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
							req_id=requirements[i].id;
							priority=requirements[i].priority;
							p_id=requirements[i].project_id;
							p_status=requirements[i].status;
							p_rel=requirements[i].relations;
							p_timestamp=requirements[i].timestamp;
							p_time = timeConverter(p_timestamp);
							//Tabelleninhalt
							string+="<tr>\
									<th>"+p_id+"</th>\
									<th id='result"+req_id+"'>"+req+"</th>\
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
					
						body.html("<div id='field' class='panel panel-default'>\
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
