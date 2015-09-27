<!DOCTYPE HTML>
<?php
	$version = "1.1b";
?>
<html>
	<head>
		<meta charset="UTF-8">
		<script src="js/jquery-1.11.3.min.js"></script>
		<script src="http://localhost:3000/socket.io/socket.io.js"></script>
		<meta http-equiv="Expires" CONTENT="0">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="Pragma" CONTENT="no-cache">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
		<link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
		<script type="text/javascript" src="js/table2excel.js"></script>
		<script src="bootstrap/js/bootstrap.min.js"></script>
		<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
		<script type="text/javascript" src="js/translate.js"></script>
		<script type="text/javascript" src="js/dashboardScript.js"></script>
		<script type="text/javascript" src="js/dashboardDesignScript.js"></script>
		<script type="text/javascript" src="js/lang.js"></script>
		<script type="text/javascript" src="js/user.js"></script>
		<script type="text/javascript" src="js/teamsScript.js"></script>
		
		<link rel="stylesheet" href="css/dashboard.css">
		
		<title> Dashboard</title>
	</head>
	<body contextmenu="mouseMenu" onload="if (document.referrer == '') self.location='index.php';getRequirements()">
		<!-- Preloader -->
		<div id="preloader">
			<div id="innerPreloader">&nbsp;</div>
		</div>
		<!-- webpage -->
		<div id="head">
			<img id='logo' src='img/logo.png' alt="logo">
			<button style="display:none" onClick=make10Reqs()>1000er</button><!-- Wird nicht dargestellt aber hilfreich zu Testzwecken-->
		</div><!--head-->
	<div id="main">
		<div id="leftSide"  class="col-md-2">
			<!-- Left Navigation Bar -->
			<div id="left_nav">
				<div id="SearchInputGroup" class="input-group">
					<span class="input-group-btn" onClick="getResult()" id="search">
						<button class="btn btn-default" type="button" id="goButton">Go!</button>
					</span>
					<input type="text" id="search_field" class="form-control" title="Durchsuchen Sie Ihre Anforderungen">
						<a id="helpSearch" href="#" title="" data-toggle="popover" data-trigger="hover" data-content="">
							<span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>
						</a>
						<a id="helpSearchMobile" href="#" data-placement="left" title="" data-toggle="popover" data-content="">
							<span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>
						</a>
					</input>
				</div><!--input-group-->
				<ul id="main-nav" class="nav nav-pills nav-stacked">
					<li id="l1" role="presentation" class="navlist active clickable"><a onClick="getRequirements()" id="home" ></a></li>
					<li id="l2" class="navlist clickable"role="presentation"><a onClick="createReqForm()" id="create" ></a></li>
					<li id="l3" class="navlist clickable" role="presentation"><a id="team" data-toggle="modal" data-target="#team_modal" onClick="loadTeamOptions()"  ></a></li>
					<li id="l4" class="navlist clickable" role="presentation"><a data-toggle="modal" id="prof"  data-target="#profil" ></a></li>
					<li id="l5" class="navlist clickable" role="presentation"><a onClick="chooseDownload()" id="downloadNav"></a></li>
					<li id="l6" class="navlist clickable" role="presentation"><a onClick="logOut(), updateOff()" id="logt" ></a></li>
				</ul>
			<!--left_nav-->
			<!-- Update Message -->
			<div class="panel panel-info floater" id="newsFeedPanel">
				<div class="panel-heading">
					<h3 class="panel-title">News-Feed</h3>
				</div>
				<div class="panel-body">
					<div id="feed">
					</div>
				</div>
			</div></div>
		</div>
			<!--content-->
			<div id="content-wrapper" class=" content-wrapper panel col-md-10">
				<button class="clickable btn btn-primary col-md-2" type="button" id="news" title="Klicken zum Aktualisieren" onClick="update()">
					<span id="news_text"></span><span class="badge" id="newsNumber">0</span>
				</button>
				<div class="clickable" id="languageSwitcher">
					<img title="Switch to english language" onClick="switchToEN()" src="img/uk.png"></img>
				</div>
				<div class="checkbox" id="disChecker">
					<input  id="helpCheckbox" type="checkbox" value="Hilfe ausschalten">Tooltips</input>
				</div>

				</br>
				<h2 id="headline_dashboard"></h2>
				<hr>
					<p class="panel panel-warning"id="error"></p>
					<div class="panel panel-warning" id="dialog"></div>
					<div class="panel panel-warning" id="chooseDownload"></div>
					<div id="content" class="panel panel-body">
						
					</div><!--content-->
				<hr>
			</div><!--content-wrapper-->
		</div>
		<footer id="footer">
			<center>
				<a id="footerLink" data-toggle="modal" title="Kontaktinformationen" data-target="#modal_kontact">Kontakt</a>
				-
				<a id="version" data-toggle="modal" title="Informationen zu Version und Patches" data-target="#modal_version">Version <?php echo $version ?></a>
			</center>
		</footer>
		
		
		<!-- Modal Profil-->
			<div class="modal fade" id="profil" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h3 class="modal-title" id="profile_tophead">Profil</h3>
						</div>
						<div class="modal-body">
							<p ><h4 id="head_modal_dash">Geben Sie Ihre neuen Daten ein:</h4></p></br>
							
							<fieldset>
								<label id="newPW">Neues Passwort</label><input type="password" class="form-control" name="passwd" id="ch_pw" ></br>
								<label id="newPW_repeat">Neues Passwort wiederholen</label><input type="password" class="form-control" name="passwd_repeat" id="ch_pw2" ></br>
								<label id="newEmail">Neue E-Mail</label><input type="text" class="form-control" name="email" id="ch_email" ></br>
							</fieldset>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
							<button class="btn btn-success" id="reg_submit_p" onClick="changeData()">Bestätigen</button>
						</div>
					</div>
				</div>
			</div>
			
				<!-- Modal Team-->
			<div class="modal fade" id="team_modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h3 class="modal-title" id="myModalLabel">Team</h3>
						</div>
						<div class="modal-body">
							<p ><h4 id="head_modal_dash_team" >Teamoptionen</h4></p></br>
							<div class="panel panel-warning" id="dialog_team_modal"></div>
							<div id="accordion">
								<h3 id='modal_dash_team_subheadline'>Meine Teams</h3>
								<div id="content_team">
									<!-- hier alle teams des users -> getMyGroups() -->
								</div>
								<h3 id='modal_dash_team_topic'>Team erstellen</h3>
								<div>
									<label for="pw">Teamname</label><input type="text" class="form-control" id="team_name" ></br>
									<button id='modal_dash_team_ok' class="btn btn-success" onClick="createTeam()">Team erstellen</button>
								</div>
								<h3 id='add_members'>Mitglieder hinzufügen</h3>
								<div>
									<div class="row">
										<div id='add_mem_1' class="col-md-5">Mitglied</div>
										<div id='add_mem_2' class="col-md-3">Meine Gruppen</div>
										<div class="col-md-2"></div>
									</div>
									<div class="row">
										<div class="col-md-5"><input type="text" class="form-control" id="team_user" ></div>
										<div id="team_list" class="col-md-3"><!--  dropdown for all teams here -> refreshTeamDropdown() --></div>
										<div class="col-md-2"><button id='add_mem_button' onClick="addTeamMember()" class="btn btn-success">Mitglied hinzufügen</button></div>
									</div>
								</div>
							</div>
							
							
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
							
						</div>
					</div>
				</div>
			</div>
		
		
			<!-- Modal editTeam-->
			<div class="modal fade" id="modal_editTeam" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h3 class="modal-title" id="myModalLabel">Team</h3>
						</div>
						<div class="modal-body">
							<p ><h4 id="head_modal_dash_team_edit" >Bearbeiten Sie Ihr Team</h4></p></br>
							<div id="content_editTeam">
								<!--content here-->
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Modal Kontakt-->
			<div class="modal fade" id="modal_kontact" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h3 class="modal-title" id="myModalLabel">Kontakt</h3>
						</div>
						<div class="modal-body">
								<div class="row">
									<div class="col-md-6">
										<h4>Sven-Erik Kujat</h4>
										sv-kujat@t-online.de<br>
										Germany<br>
									</div>
									<div class="col-md-6">
										<h4>Marvin Hartmann</h4>
										Marvin.hartmann@gmx.de<br>
										Germany<br>
									</div>
								</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Modal Version-->
			<div class="modal fade" id="modal_version" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h3 class="modal-title" id="myModalLabel">Versionen & Patches</h3>
						</div>
						<div class="modal-body">
							<h2>Aktuelle Version: <?php echo $version ?></h2></br>
							<h4>Patchnotes:</h4>
							<div id="patchnotes">
								<!--Content in Variable patchnotes gespeichert-->
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
			
				<!-- Modal User Data-->
			<div class="modal fade" id="modal_userData" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h3 class="modal-title" id="user_info">Nutzerinformationen</h3>
						</div>
						<div class="modal-body">
							<div id="content_userData">
								
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
			
			<menu id="mouseMenu" type="context">
				<menuitem label="Home" onClick="update();"></menuitem>
				<menuitem label="Anforderung erstellen" onClick="createReqForm();"></menuitem>
				<menuitem label="Team" data-toggle="modal" data-target="#team_modal" onClick="loadTeamOptions;"></menuitem>
				<menuitem label="Profil" data-toggle="modal" data-target="#profil" ></menuitem>
				<menuitem label="Logout" onClick="logOut()"></menuitem>
			</menu>
			
	</body>
	</menu>

</html>
