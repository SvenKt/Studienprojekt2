////////////////
//USES user.js//
////////////////

$(document).ready(function(){
	$("#accordion").accordion({collapsible: true});
	$("#patchnotes").html(patchnotes);
	$("#chooseDownload").hide();
	$("#patchnotes").accordion({collapsible: true});
	
	//seite ist auch in adminpage eingebunden
	//TT sollen nur auf dashboard sein
	if(window.location.pathname.search("admin") == -1 ){
		enableTooltips();
	}
	
	switchToDE();
	
	
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
			getResult();
		}
		event.stopPropagation();
	});
		
	//navlist anpassungen nach Modal
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
});

var oldActive;

//						  //
//tooltips and translation//
//						  //

function enableTooltips(){
		
		defineTranslationVars(language);

		$('#l1').attr('title',menu.item1_tt);
		$('#l2').attr('title',menu.item2_tt);
		$('#l3').attr('title',menu.item3_tt);
		$('#l4').attr('title',menu.item4_tt);
		$('#l5').attr('title',menu.item5_tt);
		$('#l6').attr('title',menu.item6_tt);
	
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
					<div class='col-md-4'><input type='text' class='form-control' name='relations' id='relations' placeholder='Abhängigkeiten? (optional)'></div>\
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
	
}

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