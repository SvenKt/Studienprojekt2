/*	Sven-Erik Kujat
*	HWR Berlin 
*	08.01.2016
*/


var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   mysql = require('mysql')
,	md5 = require('js-md5')
,   io = require('socket.io').listen(server)
,   fs = require('fs')
,	nodemailer = require('nodemailer')
, 	nconf = require('nconf');


var users = [];	
var reqToEdit;
var date = new Date();
var dateFormatted = date.getFullYear()+"_"+(date.getMonth()+1)+"_"+date.getDate();
var errlog = "log/errorlog"+getCurTime()+".txt";
var log = "log/track"+getCurTime()+".txt";
var confFile = "conf/config.json";
var configData = {
	Reports_Enabled: "",
	Relay_Service:"",
	Mail_Relay_User:"",
	Mail_Relay_Password:"",
	Mail_Sender_Email:"",
	Mail_Recipient_Email:"",
	db_host:"",
	db_user:"",
	db_pass:"",
	db_name:"",
	Admin_Password:""
}

// GET FORMATTED DATE FOR DEFINING LOG NAMES

function getCurTime(){
	var d = new Date();
	var hours = d.getHours();
	var min = d.getMinutes();
	var sec = d.getSeconds();
	var day = d.getFullYear()+"_"+(d.getMonth()+1)+"_"+d.getDate();
	
	if (min < 10) {
		min = "0"+min;
	}
	
	return day+"-"+hours+"-"+min+"-"+sec;
}

///////////////////////////////
// LOAD CONFIGURATION FILE
///////////////////////////////

if (nconf.use('file', { file: confFile })){
	nconf.load();
	console.log("config file successfully loaded");
} else {
	console.log("no config file found");
}


////////////////////////////////////////////////
// SET VALUES TO READ CONFIGURATION VALUES
////////////////////////////////////////////////

var mail = {
	service: nconf.get('Relay_Service'),
	relayUser: nconf.get('Mail_Relay_User'),
	relayPass: nconf.get('Mail_Relay_Password'),
	fromUser: nconf.get('Mail_Sender_Email'),
	toUser: nconf.get('Mail_Recipient_Email'),
	enabled: nconf.get('Reports_Enabled'),
}

var db_connect = {
	host: nconf.get('db_host'),
	user: nconf.get('db_user'),
	pass: nconf.get('db_pass'),
	name: nconf.get('db_name'),
}

//SET MAIL RELAY

var transporter = nodemailer.createTransport({
    service: mail.service,
    auth: {
        user: mail.relayUser,
        pass: mail.relayPass,
    }
});

//////////////////////
// LOG START FUNCTIONS
/////////////////////

fs.writeFile(errlog, "Errorlog file startet on "+getCurTime(), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("Errorlog file created");
}); 


fs.writeFile(log, "Logfile startet on "+getCurTime(), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("Trackingfile file created");
}); 

//////////////////////////////////////
// LOG AND MAIL FUNCTIONS 
//////////////////////////////////////
function logerr(mess) {
	fs.appendFile(errlog, "\r\n#"+mess+" at "+getCurTime(), function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
}



function sendMail(error){
	fs.appendFile(errlog, "\r\n#"+error+" at "+getCurTime(), function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	if(mail.enabled){
		transporter.sendMail({
			from: mail.fromUser,
			to: mail.toUser,
			subject: 'Red:Wire error',
			text: "Red:Wire's socket server had error at "+getCurTime()+" due to following reason: \n'"+error+"'\n\nPlease read logfiles and send it to the developers. Afterwards delete the log files from the directory, they will be recreated by the server. Then restart the server!\n\n\nThis is how you restart the server:\nNavigate to the directory where the app.js server file is located. Then start the server with following command\n\n node app.js",
		});
	}

}


function traceLog(mess) {
	fs.appendFile(log, "\r\n#"+mess+" at "+getCurTime(), function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
}

///////////////////////////////////////////////////
// DEFINE DATABASE CREDENTIALS (FROM CONFIG FILE)
///////////////////////////////////////////////////

var db = mysql.createConnection({
    host: db_connect.host,
    user: db_connect.user,
	password: db_connect.pass,
    database: db_connect.name
});


////////////////////////////////////
// LOG IN DATABASE
////////////////////////////////////
db.connect(function(err){
    if (err) {
		logerr("couldn't connect to database, check credentials");
		throw err;
	}//console.log(err)
	traceLog("connected to database");
	
});

//server hört auf port 3000 --> verbindung mittels "localhost:3000"
server.listen(3000);


// nutzt obj.socket als attribut, nur für array "users" und andere arrays/objekte mit attribut "socket".
function isInArray(sock,arr){
	if (arr.length > 0){
		for(var i=0; i<arr.length;i++){
			if (typeof arr[i] !== "undefined"){
				if(arr[i].socket == sock){
					return i;
				}
			} else {
				users.splice(i,1);
			}
		}
	} return -1
}


//falls neu verbundener user noch nicht im userarray, wird er hinzugefügt
function addUserToArray(username,sock){
	////console.log(username);
	var id = db.query('Select users.team_id, users.id from users where users.username="'+username+'"',  function(err, rows, fields){
		if (err)  { logerr(err); return;}
		var user = {name: username,id: rows[0].id, teamID: rows[0].team_id, socket: sock};
			var i = isInArray(sock,users);
			if (i == -1) users.push(user);
			////console.log(users);
			traceLog("{name: "+user.name+", socket: "+user.socket+"} has been added to array");
	});	
	
}

// user wird aus userarray entfernt
function deleteUserFromArray(socketid,arr){
	var i = isInArray(socketid,arr);
	delete users[i];
}

///////////////////////////////////////////
// CONFIG FILE FUNCTIONS
///////////////////////////////////////////

function openConfig(){
console.log("open");
	fs.writeFile(confFile, "{\n" ,function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
}

function writeConfig(attr,val){
	console.log("writing");
	fs.appendFile(confFile, "\""+attr+"\":\""+val+"\",\n" ,function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
}

function closeConfig(){
	console.log("close");
	fs.appendFile(confFile, "\"val\":\"val\"\n}" ,function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
}
////////////////////////////////////////////////
//  SOCKET START
////////////////////////////////////////////////

io.on('connection', function (socket) {

socket.on('sendEmail', function(){
 sendMail("this is a test");
});

////////////////////////////////////////////////////////////////////////////
// CONFIGURATION LISTENER TO WRITE TEMP DATA INTO CONFIG FILE AND DATABASE
////////////////////////////////////////////////////////////////////////////

socket.on('configureRedWire',function(){
	var data = configData;
	console.log(data);
	
	var db_temp = mysql.createConnection({
		host: data.db_host,
		user: data.db_user,
		password: data.db_pass,
		database: data.db_name
	});

	openConfig();
	
	setTimeout(function(){
		writeConfig("Reports_Enabled",data.Reports_Enabled);
		writeConfig("Relay_Service",data.Relay_Service);
		writeConfig("Mail_Relay_User",data.Mail_Relay_User);
		writeConfig("Mail_Relay_Password",data.Mail_Relay_Password);
		writeConfig("Mail_Sender_Email",data.Mail_Sender_Email);
		writeConfig("Mail_Recipient_Email",data.Mail_Recipient_Email);
		writeConfig("db_host",data.db_host);
		writeConfig("db_user",data.db_user);
		writeConfig("db_pass",data.db_pass);
		writeConfig("db_name",data.db_name);
	},500);
	
	setTimeout(function(){
		closeConfig();
	},600);
	
	db_temp.connect(function(err){
		if (err) {
			logerr("couldn't connect to database, check credentials");
			throw err;
		}
	});
	
	var query = "update users set password='"+md5(data.Admin_Password)+"' where username='admin';"; 
	
	db_temp.query(query,function(err){
		if (err) logerr(err); return;
	});
	
	socket.emit('returnToIndex');
});

//////////////////////////////////////
// ADMIN CONFIGURATION LISTENERS
//////////////////////////////////////
socket.on("writeAdminConfiguration", function(pw){
	configData.Admin_Password=pw;
	console.log(configData);
});


socket.on('showSummary',function(){
	console.log(configData);
	socket.emit('showSummary',configData);
});

//////////////////////////////////////////////////
// DATABASE CONNFIGURATION LISTENERS
//////////////////////////////////////////////////
	
socket.on('testDatabaseConnection',function(data){

console.log(data);
	
	//instanciates temporary database connection with input data from installation form
	//and tries to connect to database
	
	var dbtest = mysql.createConnection({
		host: data.host,
		user: data.user,
		password: data.pass,
		database: data.name,
	});
	
	dbtest.connect(function(err){
		if (err) {
			socket.emit('testDatabaseConnection',1);
		} else {
			socket.emit('testDatabaseConnection',0);
		}
	});	
});


socket.on('writeDatabaseConfiguration',function(data){
	// stores database configuration data in global configData array (later, the array will be flushed into config file and database

	configData.db_host=data.host;
	configData.db_user=data.user;
	configData.db_pass=data.pass;
	configData.db_name=data.name;
	socket.emit('writeDatabaseConfiguration');
});




////////////////////////////////////////////
// MAIL CONFIGURATION LISTENERS 
////////////////////////////////////////////

	socket.on('reloadConf',function(){
		console.log("config file successfully loaded");
	});
	socket.on('testMail', function (data){
	
		transporter = nodemailer.createTransport({
			service: data.relay,
			auth: {
				user: data.relUser,
				pass: data.relPass,
			}
		});
	
	
		transporter.sendMail({
			from: data.fromUser,
			to: data.toUser,
			subject: 'Red:Wire test e-mail',
			text: "If you receive this e-mail, your e-mail configuration is working!"
		});
		console.log("testmail send");
		socket.emit("testMail");
	});

	socket.on('enableReports',function(data){
		socket.emit("redirectYes");
		configData.Reports_Enabled = "yes";
		configData.Relay_Service = data.relay;
		configData.Mail_Relay_User = data.relUser;
		configData.Mail_Relay_Password = data.relPass;
		configData.Mail_Sender_Email = data.fromUser;
		configData.Mail_Recipient_Email = data.toUser;
		
	});

	socket.on('disableReports',function(){
		configData.Reports_Enabled = "no";
		socket.emit("redirectNo");
	});

	console.log("connection of new device");
	
	//
	//  LISTENERS	
	//
	//

	//nach connection werden userdaten angefragt
	socket.emit('requestUsernameLogin');


	//nach empfang der userdaten werden diese ins userarray eingetragen
	socket.on('receiveUsernameLogin', function(username){
		addUserToArray(username,socket.id);
		//getMyGroups_s(username);
	});
	
	//bei disconnect wird user aus userarray entfernt
	socket.on('disconnect', function(){
		deleteUserFromArray(socket.id,users);
		socket.emit('disconnected');
	});
	
	// für debug, gibt auf anfrage des clients userarray aus
	socket.on('showUsers',function(){
		console.log(users);
		sendMail("debug error");
		//console.log("ahuuuu");
	});
	
	//listener hört auf eintragung einer neuen anforderung 
	socket.on('newReq',function(data){
		//console.log("Neue Anforderung");
		var teamid;
		var members = [];
		
		//holt ID des Erstellers der Anforderung
		for(var i=0;i<users.length;i++){
		//console.log(users[i]);
			if (users[i].name==data.user){
				teamid=users[i].teamID;
			}
		}
		//console.log(users);
		//holt die Mitglieder des erstellerteams und speichert sie im membersarray
		for(var i=0;i<users.length;i++){
			if (users[i].teamID==teamid){
				members.push(users[i]);
			}
		}
		 
		//sendet an alle mitglieder des membersarray eine notification
		for(var i=0; i< members.length;i++){
			io.to(members[i].socket).emit('newReq',data.user+" hat eine neue Anforderung erstellt");
		}
	});
	socket.on('doEditReq', function(data){
	var query = "SELECT requirement, priority, project_id, status, relations  FROM requirements where id="+data.id+";";
	var requirements = db.query(query,  function(err, rows, fields){
			var string;
			var req;
			if (err) {sendMail("doEditReq"); }
			req=rows[0];
			wann = req.requirement.split(" &req# ")[0];
			muss =req.requirement.split(" &req# ")[1];
			wer =req.requirement.split(" &req# ")[2];
			wem = req.requirement.split(" &req# ")[3];
			bieten =req.requirement.split(" &req# ")[4];
			objekt =req.requirement.split(" &req# ")[5];
			verb =req.requirement.split(" &req# ")[6];
			verb = verb.split(".")[0];
			priority = req.priority;
			p_id=req.project_id;
			p_status=req.status;
			p_rel=req.relations;
			
			var req_data = {
				wann: wann,
				muss: muss,
				wer: wer,
				wem: wem,
				bieten: bieten,
				objekt: objekt,
				verb: verb,
				priority: priority,
				p_id: p_id,
				p_status: p_status,
				p_rel: p_rel,
				id:data.id,
			}
			
			socket.emit('doEditReq',req_data);
	});
	
	});
	
	socket.on('editReq',function(data){
		var teamid;
		var members = [];
		var mess; 
		
		//get creator's team id
		for(var i=0;i<users.length;i++){
			if (users[i].name==data.user){
				teamid=users[i].teamID;
			}
		}
		//get members of creator's team
		for(var i=0;i<users.length;i++){
			if (users[i].teamID==teamid){
				members.push(users[i]);
			}
		}
		//send messages to all team members
		for(var i=0; i< members.length;i++){
			io.to(members[i].socket).emit('editReq',data.user);
		}
	});
	
	socket.on('getRequirements', function(data){
		var teamid;
		var socketid=data.socket;
		var requirementsArr = [];
		var user=data.user;
		var query="SELECT   project_id, status,  relations, requirements.id as reqid, requirement, priority,  timestamp";
		var str = "cat_";	//categories have a prefix to differ between normal search queries
		var view = data.view;
		
		
		if (typeof data.search != "undefined"){
			if(data.search.substring(0,str.length) == str){
				query+=", categories.name, categories.id as catid";
			}
		}
		
		query+=" FROM requirements";
	  
		if (typeof data.search != "undefined"){		  
			if(data.search.substring(0,str.length) == str){
				query+=" INNER JOIN categories on requirements.category = categories.id";
			}
		}		
			query+=" INNER JOIN users on requirements.team_id=users.team_id\
					 WHERE users.username='"+user+"'";	
		
		if (typeof data.search != "undefined"){		
			if(data.search.substring(0,str.length) == str){
				query+=" AND categories.name = '"+data.search.split("_")[1]+"'"; 
			} 
		}
		
		if (typeof data.search != "undefined"){
			if(data.search.substring(0,str.length) != str){
				var parts = data.search.split(" ");
				for(var i=0; i<parts.length;i++){
					if(parts[i].indexOf("/") != -1){
						parts[i] = parts[i].replace("/"," ");
					} 
					query += " AND requirements.requirement like '%"+parts[i]+"%'";
				}
			}
		}
		
		query += ";";

		var requirements = db.query(query,  function(err, rows, fields){
			if (err) {sendMail("editReq"); logerr(err); return;}
			for(var i=0;i<rows.length;i++){
				requirementsArr.push(rows[i]);
				console.log(rows[i]);
			}
			socket.emit('getRequirements',requirementsArr);
		});
	});
	
	socket.on('deleteReq', function(data){
		var query="DELETE FROM requirements WHERE id='"+data.id+"';";
		
		var requirements = db.query(query, function(err){
			if (err) {sendMail("deleteReq");logerr(err); return;}
			socket.emit('delReq');
		});
		
		var teamid;
		var members = [];
		
		//get creator's team id
		for(var i=0;i<users.length;i++){
			if (users[i].name==data.user){
				teamid=users[i].teamID;
			}
		}

		//get members of creator's team
		for(var i=0;i<users.length;i++){
			if (users[i].teamID==teamid){
				members.push(users[i]);
			}
		}
		 
		if (!data.activity){
			for(var i=0; i< members.length;i++){
				io.to(members[i].socket).emit('deleteReq',data.user);
			}
		}
	});
	
	socket.on('getCatID',function(data){
		if (data.category != ""){
		
		var teamid;
		
		for(var i=0;i<users.length;i++){
			if (users[i].name==data.user){
				teamid=users[i].teamID;
			}
		}
		
		
		
		var newData=data;
			var query="select id from categories where name='"+data.category+"' AND team_id="+teamid+";";
			var requirements = db.query(query, function(err,rows,fields){
				if (err) {socket.emit('reqFail',1);sendMail("getCatID"); logerr(err); return;}
				 if(typeof rows[0] !== "undefined"){
					 newData.category=rows[0].id;
					 console.log(newData);
					 socket.emit('getCatID',newData);
				 } else {
					 socket.emit('reqFail',1);
				 }
			});
		} else {
			socket.emit("reqFail",1);
			}
	});
	
	socket.on('insertReq', function(data){
		var teamid = "";
		var userid;
		
		for(var i=0;i<users.length;i++){
			if (users[i].name==data.user){
				teamid=users[i].teamID;
				userid=users[i].id;
				
			}
		}
		
		if(teamid !== null){
			if(data.category != null){
			var query="insert into requirements (requirement, priority, project_id, status, relations ,owner_id, team_id, timestamp, category) values ('"+data.req+"', '"+data.prio+"','"+data.id+"','"+data.status+"','"+data.relations+"','"+userid+"','"+teamid+"','"+data.currentTime+"','"+data.category+"');";
			var requirements = db.query(query, function(err){
				if (err) {sendMail("insertReq");logerr(err); return; }
				console.log(userid+" "+teamid);
			});
			var members = [];
		
			//get creator's team id
			for(var i=0;i<users.length;i++){
				if (users[i].name==data.user){
					teamid=users[i].teamID;
				}
			}
			//get members of creator's team
			for(var i=0;i<users.length;i++){
				if (users[i].teamID==teamid){
					members.push(users[i]);
				}
			}
		 
			if(!data.activity){
				for(var i=0; i< members.length;i++){
					io.to(members[i].socket).emit('newReq', data.user);
				}
			}
			}
		} else {	
			console.log(teamid);
			code=1;
			socket.emit('reqFail',{code: code});
		}
	});
	
	socket.on('createTeam',function(data){
		var query = "Select name from team";
		var code = 0;
		var existsTeam = db.query(query, function(err,rows,fields){
			if (err){ sendMail("createTeam"); logerr(err);  code=1;return;}
			var alreadyExists = false;
			for (var i = 0; i< rows.length; i++){
				if(data.team == rows[i].name){
					alreadyExists=true;
				}
			}
			if (!alreadyExists){
				var UserID="select id from users where username='"+data.user+"';";
				var getUserID = db.query(UserID, function(err,rows,fields){
					if (err) {  logerr(err);  sendMail("createTeam"); socket.emit('createTeam',code);return;}
					var id = rows[0].id;
					var injection = "insert into team (name, creator_id) values('"+data.team+"','"+id+"');";
					var injectTeam = db.query(injection, function(err){
						if (err) {sendMail("createTeam"); logerr(err); return; }
					});
				});
			} else {
				code = 1;
			}
			socket.emit('createTeam',code);
		});
	});
	
	socket.on('createDefaultCategory',function(teamname){
	
		var getTeamID = "select id from team where name='"+teamname+"';";
		var do_getTeamID = db.query(getTeamID, function(err,rows,fields){
			if (err){sendMail("createDefaultCategory"); logerr(err); return;}
			var teamid = rows[0].id;
			var query = "insert into categories (name, team_id) values ('uncategorized',"+teamid+");";
			var do_query = db.query(query, function(err,rows,fields){
				if (err){sendMail("createDefaultCategory"); logerr(err); return;}
				socket.emit('createDefaultCategory');
			});
		});
	
	});
	
	socket.on('insertTeamOwner', function(data){
		console.log(data);
		
		
		var code;
		var UserID="select team_id,id from users where username='"+data.user+"';";
		var getUserID = db.query(UserID, function(err,rows,fields){
					if (err) {sendMail("insertTeamOwner");  logerr(err); code=1; socket.emit('insertTeamOwner',code); return;}
					var userTeamid;
					
					userTeamid=rows[0].team_id;
					var userid = rows[0].id;
					if(userTeamid == null){
						console.log(data.action);

							//console.log("Insert as Owner");
							var teamid_query="select id from team where name='"+data.team+"';";
							var getTeamID = db.query(teamid_query, function(err,rows,fields){
								if (err) {sendMail("insertTeamOwner"); logerr(err);  code=2; socket.emit('insertTeamOwner',code);return;}
								var teamid = rows[0].id;
								//console.log(teamid);
								var insert_query= "update users set team_id="+teamid+" where username='"+data.user+"';"
								var insertUser = db.query(insert_query, function(err){
									if (err) {sendMail("insertTeamOwner");  logerr(err); code=3; socket.emit('insertTeamOwner',code);return;}
								else {
										for(var i=0;i<users.length;i++){
											if (users[i].name==data.user){
												users[i].teamID=teamid;
											}
										}
										console.log("not entering if");
										code=0; socket.emit('insertTeamOwner',code);
									}		
								});
							});
						
					} else {
						if (data.action == 1){
							var teamid_query="select id from team where name='"+data.team+"';";
							var getTeamID = db.query(teamid_query, function(err,rows,fields){
								if (err) {sendMail("insertTeamOwner"); logerr(err);return;}
								var teamid = rows[0].id;
								//console.log(teamid);
								var insert_query= "update team set creator_id="+userid+" where id='"+teamid+"';"
								var insertUser = db.query(insert_query, function(err){
									var query_del_reqs = "update requirements set owner_id ="+userid+" where owner_id = "+data.userArr[1]+";";
									var insertUser = db.query(query_del_reqs, function(err){
									console.log('overwritten!');
									if (err) {sendMail("insertTeamOwner");logerr(err); return;}
									code=0; socket.emit('newOwner',{code: code, user: data.userArr});
									});
								});
							});
						} else {
							console.log('no action = 1');
						}
					}
		});
		
	});
	
	function notifyNewMember(member){
		var socket; 
		for(var i=0;i<users.length;i++){
			//console.log(users[i]);
			if(typeof users[i] !== "undefined"){
				if (users[i].name==member){
					socket=users[i].socket;
				}
			}
		}
		//if new member is currently online while adding him -> notify him
		if(socket != null){
			io.to(socket).emit('youBeenAdded');
		}
	}
	
	socket.on('addTeamMember', function(data){
		var userIsInOtherTeam=false;
		var userExists=false;
		var code;
		
		var checkUserExists_query="select count(username) as total from users where username='"+data.user+"';";
		var checkUserExists = db.query(checkUserExists_query, function(err,rows,fields){
					if (err) {sendMail("addTeamMember");logerr(err); return; }
					var userExists = (rows[0].total > 0) ? true : false;
					//console.log("exists "+userExists);
					
					if(userExists){
						checkUserIsNotInOtherTeam_query = "select team_id from users where username='"+data.user+"';";
						var checkUserIsNotInOtherTeam = db.query(checkUserIsNotInOtherTeam_query, function(err,rows,fields){
							if (err) {sendMail("addTeamMember"); logerr(err); return;}
							var userIsInOtherTeam = (rows[0].team_id != null) ? true : false;
							//console.log("is in other team "+userIsInOtherTeam);
						
							if(!userIsInOtherTeam){
								var addUserToTeam_query = "update users, team set users.team_id=team.id where team.name='"+data.team+"' AND users.username='"+data.user+"';";
								var checkUserIsNotInOtherTeam = db.query(addUserToTeam_query, function(err,rows,fields){
									if (err) {sendMail("addTeamMember"); logerr(err); return;  }
									else {
										code=0; 
										socket.emit('addTeamMember',{user: data.user,code: code,  team: data.team});
										notifyNewMember(data.user);
										var query = "select id from team where name='"+data.team+"';";
										var checkUserIsNotInOtherTeam = db.query(query, function(err,rows,fields){
											if (err) {sendMail("addTeamMember");  logerr(err); return; }
											var teamid = rows[0].id;		
											for(var i=0;i<users.length;i++){
												if(typeof users[i] !== "undefined"){
													if (users[i].name==data.user){
														users[i].teamID=teamid;
													}
												}
											}
										});
									}
								});
							} else {
								code=2; socket.emit('addTeamMember',{user: data.user,code: code,  team: data.team});
							}
						});
					} else {
						code=3; socket.emit('addTeamMember',{user: data.user,code: code, team: data.team});
					}
		});
	});
	
	
	//REGISTER STUFF
function initInput(username,pw,pw2,email){
//console.log(username+" "+pw+" "+pw2+" "+email);
	if(username != "" && pw != "" && pw2 != "" && email != ""){
		return true;
	} 
}

function checkEmailValid(email){
	if(email.match(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i)){
	    //console.log("email valid "+emailValid);
		return true;
	} 
}

function checkPassLength(pw,pw2){
	if(pw.length > 7 && pw2.length > 7){
		return true;
	}
}	
	
function checkPasswordsEqual(password,password2){
	if (password==password2){
		return true;
	}
}


function changeData(data){
	var insert_query = "UPDATE users SET password='"+md5(data.pw)+"', email='"+data.mail+"' WHERE username='"+data.user+"';";
	var insert = db.query(insert_query, function(err,rows,fields){
		if (err) {sendMail("changeData"); logerr(err); return;}
		socket.emit('changeData',0);
	});	
}
	



function registerUser(data){
	var abfrage_query = "SELECT username FROM users where username='"+data.user+"';";
	var abfrage = db.query(abfrage_query, function(err,rows,fields){
		if (err) { }
		if(rows.length > 0){
			socket.emit('registerUser',4);
		} else {
			var insert_query = "INSERT INTO users (username, password, email) VALUES ('"+data.user+"','"+md5(data.pw)+"','"+data.mail+"')";
			var insert = db.query(insert_query, function(err,rows,fields){
				if (err) {sendMail("registerUser"); logerr(err); return;}
				//console.log("successful!!!!! :-)");
				socket.emit('registerUser',0);
			});	
		}
	});
	
}

socket.on('registerUser', function(data){
	if(initInput(data.user,data.pw,data.pw2,data.mail)){
	var passLengthOK=checkPassLength(data.pw,data.pw2);
	var passEqual=checkPasswordsEqual(data.pw,data.pw2);
	var emailValid=	checkEmailValid(data.mail);
			if(!emailValid){
				socket.emit('registerUser',2);
			} else {
				if(!passLengthOK){
					socket.emit('registerUser',5);
				} else {
					if(!passEqual){
						socket.emit('registerUser',3);
					} else {
							registerUser(data);
					}
				}
			}	

	} else {
		socket.emit('registerUser',1);
	}
});

socket.on('changeData', function(data){
//console.log(data);
	if(initInput(data.user,data.pw,data.pw2,data.mail)){
		var passLengthOK=checkPassLength(data.pw,data.pw2);
		var passEqual=checkPasswordsEqual(data.pw,data.pw2);
		var emailValid=	checkEmailValid(data.mail);
			if(!emailValid){
				socket.emit('changeData',3);
			} else {
				if(!passLengthOK){
					socket.emit('changeData',5);
				} else {
					if(!passEqual){
						socket.emit('changeData',4);
					} else {
							changeData(data);
					}
				}
			}	

	} else {
		socket.emit('changeData',2);
	}

});


socket.on('checkLogin',function(data){
	var username=data.user;
	var password=md5(data.pw);
	var userExists=false;
	//console.log("checking user...");
	var query = "Select * from users";
	var getAllUsers = db.query(query, function(err,rows,fields){
		if (err) {sendMail("checkLogin"); logerr(err); return;}
		for (var i= 0; i< rows.length;i++) {
			//console.log(rows[i]);
			if(username == rows[i].username && password == rows[i].password){userExists=true;}
		}
		//console.log(userExists);
		socket.emit('checkLogin',{exists: userExists, name:data.user});
	});	
});




socket.on('teamChanged', function(data){
	var user=data.user;
	var teamID=data.teamID;
	
	for(var i=0;i<users.length;i++){
		
		if(typeof users[i] != "undefined"){
			if (users[i].name==user){
				users[i].teamID=teamID;
			}
		}
	}
	
	console.log(users);
	
	socket.emit('teamChanged',{newID: teamID, user: user});
});


socket.on('leaveTeam', function(user){
	//delete user's team id in database
	
	//delete user's teamID in users-array
	for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			if (users[i].name==user){
				users[i].teamID=null;
			}
		}
		
		console.log(users);
	}
	
	var code=0;
	var query= "update users set team_id=NULL where username='"+user+"';";
	var leave = db.query(query, function(err,rows,fields){
		if (err) {sendMail("leaveTeam");code=1;socket.emit('leaveTeam',code);logerr(err); return;}
		socket.emit('leaveTeam',code);
	});

	
});

socket.on('getTeamDropdown',function(user){
	var myTeams= [];
	var userID;
	
	//console.log(users);
	for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			if (users[i].name==user){
				userID=users[i].id;
			}
		}
	}
	
	//console.log(userID);
	var query = "select team.name, team.creator_id ,team.id, users.team_id from team,users where (team.creator_id=users.id OR team.id=users.team_id) AND users.username='"+user+"';";
	var getTeams = db.query(query, function(err,rows,fields){
		if (err) {sendMail("getTeamDropdown"); logerr(err); return;}
		for (var i= 0; i< rows.length;i++) {
			console.log(rows[i]);
			//teams the user is owning, or member of
			myTeams.push({name: rows[i].name, id: rows[i].id});
		}
		socket.emit('getTeamDropdown',myTeams);
	});
});

socket.on('intoTeam',function(data){
var user = data.user;
var teamid = data.teamid;
var code = 0;
var query = "update users set team_id="+teamid+" where username='"+user+"';";
	var goIntoTeam = db.query(query, function(err,rows,fields){
		if (err) {sendMail("intoTeam");code = 1;socket.emit('intoTeam',code);}
		for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			console.log("intoTeam id "+teamid);
			if (users[i].name==user){
				users[i].teamID=teamid;
			}
		}
	}
		socket.emit('intoTeam',{code: code, teamid: teamid});
	});
});

socket.on('getUserInfos',function(userid){
var info = {
	username: "",
	email: "",
}
	dataQuery = "select username, email from users where id="+userid+";";
	var catchData =  db.query(dataQuery, function(err,rows,fields){
		if (err) {sendMail("getUserInfos");logerr(err); return; }
		info.username=rows[0].username;
		info.email=rows[0].email;
		
		socket.emit('getUserInfos',info);
	});

});

socket.on('deleteUserFromTeam',function(data){
	var userid=data.id;
	var deletable = true;
	var members = [];
	var teamid=data.teamid;
		
	for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			if (users[i].teamID==teamid){
				members.push(users[i]);
			}
		}
	}	
		
	 for(var i=0;i<users.length;i++){
		 if(typeof users[i] != "undefined"){
			 if (users[i].id==userid){
				users[i].teamID=null;
				console.log("set users team id = null");
			 }
		 }
	 }
	
	if(deletable){
	
		
		var query = "update users set team_id=NULL where id='"+userid+"';";
		var deleteFromTeam =  db.query(query, function(err,rows,fields){
			if (err) {sendMail("deleteUserFromTeam"); logerr(err); return;}
			var code = 0; //user erfolgreich gelöscht
			socket.emit('deleteUserFromTeam',{code: code, teamid: teamid});
			
			for(var i= 0; i < members.length; i++){
				io.to(members[i].socket).emit('gotDeleted');
			}
		}); 
	} else {
		var code = 1; //"Sie können sich nicht selbst entfernen. Klicken Sie bitte im vorigen Menü auf die X Schaltfläche!";
		socket.emit('deleteUserFromTeam',{code: code, teamid: teamid});
	}
});


socket.on('deleteTeam',function(data){
	console.log('will delete team!');
	var username=data.user;
	var userID;
	var teamIDtoDelete=data.teamid;
	var usersTeamId;
	var numerOfUsersInTeam=0;
	var creatorID;
	var code=0;

	for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			if (users[i].name==username){
				userID=users[i].id;
			}
		}
	}
	//console.log("\n\n\n");
	//get user's team id
	var query = "select team_id from users where username='"+username+"';";
	var deleteFromTeam =  db.query(query, function(err,rows,fields){
			if (err) {sendMail("deleteTeam");logerr(err); return; }
			usersTeamID=rows[0].team_id;
			
			//debug
			//console.log("usersTeamID :"+usersTeamID); //ok
			//console.log("teamIDtodelete :"+teamIDtoDelete);
			
			//count users in team
			var query2 = "select users.username from users, team where users.team_id=team.id AND team.id='"+teamIDtoDelete+"';"; 
			var deleteFromTeam =  db.query(query2, function(err,rows,fields){
				if (err) {sendMail("deleteTeam"); logerr(err); return;}
				numerOfUsersInTeam = rows.length;
				
				//debug
				//console.log("numberOfUsers: "+numerOfUsersInTeam); //ok
				
				// get id of team creator
				var query3 = "select team.creator_id from team where team.id='"+teamIDtoDelete+"';";
				var deleteFromTeam =  db.query(query3, function(err,rows,fields){
					if (err) {sendMail("deleteTeam"); logerr(err); return;}
					creatorID=rows[0].creator_id;
					
					//debug
					//console.log("creatorID: "+creatorID); //ok
					
					//check if user is either creator or admin,
					//if not -> no deleting rights
					if(userID == creatorID || username == 'admin'){
						if(numerOfUsersInTeam >1){

							code=3; //at least 1 remaining user in team
							
							//debug
							//console.log("more than 1 user, code=3");
							
							socket.emit('deleteTeam',code);
						} else {
							
							//debug
							//console.log("less or equal than 1 user, continue..."); //ok
							//console.log("usersTeamID :"+usersTeamID); //ok
							//console.log("teamIDtodelete :"+teamIDtoDelete);
							
							//if user is in the team he wants to delete then...
							if (usersTeamID == teamIDtoDelete){
								//console.log("hey, its user's team :D");
								//...set user's team id = null
								var query4 = "update users set team_id=NULL where username='"+username+"';";
								var deleteFromTeam =  db.query(query4, function(err,rows,fields){
									if (err) {sendMail("deleteTeam"); logerr(err); return;}
								});
							}
							//delete all team's requirements		
							var query5 = "delete from requirements where team_id="+teamIDtoDelete+";";
							var deleteFromTeam =  db.query(query5, function(err,rows,fields){
								if (err) {sendMail("deleteTeam"); logerr(err); return;}
								//delete team
								
								
								var query_deleteCats = "delete from categories where team_id="+teamIDtoDelete+";";
								var deleteCats = db.query(query_deleteCats, function(err,rows,fields){
									if (err) {sendMail("deleteTeam"); logerr(err); return; }
									
			
								
									var query6 = "delete from team where id="+teamIDtoDelete+";";
									var deleteTeam =  db.query(query6, function(err,rows,fields){
										if (err) {sendMail("deleteTeam");  
												//console.log("error ,code=1");
												code=1; //konnte nicht gelöscht werden
											socket.emit('deleteTeam',code);
										}
										//debug
										//console.log("all ok!!! ,code=0");
									
										//set teamID in users array = null
										for(var i=0;i<users.length;i++){
											if(typeof users[i] != "undefined"){
												if (users[i].name==username){
													users[i].teamID=null;
												}
											}
										}
										socket.emit('deleteTeam',code); //code=0, alles gut!
									
									
										//now delete categories
										var query7 = "delete from categories where team_id="+teamIDtoDelete+";";
										var deleteTeam =  db.query(query7, function(err,rows,fields){
										if (err) {sendMail("deleteTeam"); logerr(err); return; }
										console.log("deleted teams categories");
										});
									});
									
								});
							});
						}		
					} else {
						code=2;
						//debug
						//console.log("error, u have no rights");
						socket.emit('deleteTeam',code);
					}
				});
			});
		}); 
		

		
});

socket.on('getMembers',function(teamid){
//get all the team's members for the "edit team" modal
	var members= [];
	var query = "SELECT users.id, users.username  FROM users where team_id="+teamid+";";
	var goIntoTeam = db.query(query, function(err,rows,fields){
		if (err) {sendMail("getMembers");logerr(err);return; }
		for(var i = 0;i <rows.length; i++){
			members.push({id: rows[i].id,username: rows[i].username, teamid: teamid})
		}		
		socket.emit('getMembers',members);
	});
});


//////////////////////////////////////////
//ADMIN STUFF ////////////////////////////
//////////////////////////////////////////

socket.on('getAllUsers',function(query){
	var all = [];
	
	if(query != null){
		var getUsers = "SELECT username, id, team_id, email FROM users WHERE username like '%"+query+"%' OR email like '%"+query+"%' ;";
	} else {
		var getUsers = "SELECT username, id, team_id, email FROM users;";
	}
	var allUsers = db.query(getUsers, function(err,rows,fields){
		if (err) {sendMail("getAllUsers"); logerr(err);return;}
		for(var i = 0;i < rows.length;i++){
			all.push({id: rows[i].id, username: rows[i].username, teamid: rows[i].team_id, email: rows[i].email});
		}
		
		socket.emit('getAllUsers',all);
	});
	

});



socket.on('forceDeleteUser', function(id){
//console.log("fdu id "+id);
	//check if user has a team
	var checkTeam = "select team_id from users where id='"+id+"';";
	var teamChecked = db.query(checkTeam, function(err,rows,fields){
		if (err) {sendMail("forceDeleteUser");logerr(err);return; } 
		//if user has a team...
		if(rows != null){
			//...delete him from the team
			var leaveTeam = "update users set team_id=NULL where id='"+id+"';";
			var teamLeft = db.query(leaveTeam, function(err,rows,fields){
				if (err) {sendMail("forceDeleteUser"); return;}
			});
			
			//then delete all requirements from this user
			var delReqs = "delete from requirements where owner_id="+id+";";
			var teamChecked = db.query(delReqs, function(err,rows,fields){
				if (err) {sendMail("forceDeleteUser"); return;}
			});
			 //at last delete the user from database
			var delUser = "delete from users where id='"+id+"';";
			var teamChecked = db.query(delUser, function(err,rows,fields){
				if (err) {sendMail("forceDeleteUser"); logerr(err);return;}
				socket.emit('forceDeleteUser');

			//if the user is online, disconnect him from the server --> logout
			for(var i=0;i<users.length;i++){
				if(typeof users[i] != "undefined"){
					if (users[i].id==id){
						io.to(users[i].socket).emit('disconnected');
						deleteUserFromArray(users[i].socket,users);
					}
				}
			}
				
				
			});
		}
	});

});


socket.on('getMyGroups',function(user){
	var myTeams= [];
	var teamsImAMember;
	var memberOf="";
	var usersTeamID="";
	var userIsCreatorOf = [];
	var userID;
	var userTeamID;
		
	var query = "select team.name, team.creator_id ,team.id, users.team_id from team,users where (team.creator_id=users.id OR team.id=users.team_id) AND users.username='"+user+"';";
	var getAllTeams = db.query(query, function(err,rows,fields){
		if (err) {sendMail("getMyGroups"); logerr(err);return;}
		for (var i= 0; i< rows.length;i++) {
			//teams the user is owning, or member of
			myTeams.push({name: rows[i].name, id: rows[i].id});
			usersTeamID=rows[i].team_id;
			//then get the teams, he is owner/creator of and store them into an array
			if(userID == rows[i].creator_id){
				userIsCreatorOf.push({name: rows[i].name, id: rows[i].id});
			}
		} //check if user has teams at all
		if (myTeams.length > 0){
			//get the team that he is currently member of
			if(usersTeamID != null){
				var query2 = "select name from team where id="+usersTeamID+";";
				var getTeamName= db.query(query2, function(err,rows,fields){
					if (err) {sendMail("getMyGroups"); logerr(err);return;}
					memberOf=rows[0].name;
					//create an array and store all information about the user's teams in there
					var groups = [ myTeams,memberOf,userIsCreatorOf,user ];	
					socket.emit('getMyGroups',groups);
				});
			} else {
				//if user is not member in a team, but still owns teams-->memberOF is just empty
					var groups = [ myTeams,memberOf,userIsCreatorOf,user];	
					socket.emit('getMyGroups',groups);
				}
			} else {
				//if user has no teams at all --> just send empty array only with username
				var groups = [ "", "", "",user];	
				socket.emit('getMyGroups',groups);
			}
	});	
});

socket.on('getGroupsToDelete',function(user){
	var myTeams= [];
	var teamsImAMember;
	var memberOf="";
	var usersTeamID="";
	var userIsCreatorOf = [];
	var userID = user[1];
	var userTeamID;
	var username=user[0];
	//user[0]=username	
	
	//get the user's teams he is member of or creator of
	var query = "select team.name, team.creator_id ,team.id, users.team_id from team,users where (team.creator_id=users.id OR team.id=users.team_id) AND users.username='"+user[0]+"';";
	var getAllTeams = db.query(query, function(err,rows,fields){
		if (err) {sendMail("getGroupsToDelete"); logerr(err);return;}
		
		for (var i= 0; i< rows.length;i++) {
			
			//store all teams in relation to user into an array with name and id
			myTeams.push({name: rows[i].name, id: rows[i].id});
			usersTeamID=rows[i].team_id;

			//if user is creator of teams, store them into another array 
			if(userID == rows[i].creator_id){
				userIsCreatorOf.push({name: rows[i].name, id: rows[i].id});
			}
			
		}//if user has at least one team
		
		if (myTeams.length > 0){
			//if user is member of a team
			if(usersTeamID != null){
		
				//get the name of the user's team he is currently member of
				var query2 = "select name from team where id="+usersTeamID+";";
				var getTeamName= db.query(query2, function(err,rows,fields){
					if (err) {sendMail("getGroupsToDelete"); logerr(err);return;}
					memberOf=rows[0].name;
					
					//store everything into an array and send it
					var groups = [ myTeams,memberOf,userIsCreatorOf,username,userID ];	
					socket.emit('getMyGroups',groups);
				});
			} 	else { //if user has no team --> memberOf will be empty
					var groups = [ myTeams,memberOf,userIsCreatorOf,username,userID];					
					socket.emit('getMyGroups',groups);
				}	
		} 	else {//if user has no teams just send empty array with username and userID
				var groups = [ "", "", "",username,userID ];	
				socket.emit('getMyGroups',groups);
			}
	});	
});


socket.on('deleteAllUsersFromTeam',function(data){
	var kickUser = "update users set team_id=NULL where team_id='"+data.teamid+"';";
	var getTeamName= db.query(kickUser, function(err,rows,fields){
					if (err) {sendMail("deleteAllUsersFromTeam"); logerr(err);return;}
					socket.emit('deleteAllUsersFromTeam',{user: data.user, teamid: data.teamid, userid:data.userid});
	});
});

/////
//CATEGORY STUFF
/////

socket.on('submitCategory',function(data){
	console.log("submit "+data.category);
	var teamid;
	var exists=false;
	var members = [];
	
	//get user's team id via username
	for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			if (users[i].name==data.username){
				teamid = users[i].teamID;
			}
		}
	}
	
	//if user has a team
	if (teamid != null){
	
		var getCats = "select name from categories where team_id="+teamid+";";
		var getTeamName= db.query(getCats, function(err,rows,fields){
			if (err) {sendMail("submitCategory");logerr(err); return; }
			
			for(var i=0;i<rows.length;i++){
				if(rows[i].name == data.category){
					exists=true;
					socket.emit('submitCategory',3);
				}
			} 	
			//check if category exists
			if(!exists) {
				var query = "insert into categories (name, team_id) values ('"+data.category+"',"+teamid+");";
				var getTeamName= db.query(query, function(err,rows,fields){
					if (err) {sendMail("submitCategory"); logerr(err); socket.emit('submitCategory',1); return;}
					socket.emit('submitCategory',0);
						
					//get members
					for(var i=0;i<users.length;i++){
						if (users[i].teamID==teamid){
							members.push(users[i]);
						}
					}

					//sendet an alle mitglieder des membersarray eine notification
					for(var i=0; i< members.length;i++){
						io.to(members[i].socket).emit("submitCategory", {username: data.username, code:0});	
					}
				});
			}
		});	
	} else {
		socket.emit('submitCategory',2);
	}
});

socket.on('getCategories',function(data){
	var teamid;
	var cats = [];
	//hole die TeamID des Users, für welchen die Kategorien geladen werden sollen
	for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			if (users[i].name==data.user){
				teamid = users[i].teamID;
			}
		}
	}
	
	//lade die Kategorien des Teams, welchem der user angehört
	var getCats = "select * from categories where team_id="+teamid+";";
	var exec= db.query(getCats, function(err,rows,fields){
		if (err) {sendMail("getCategories"); logerr(err);return;}
		//schreibe alle in ein array
		for(var i=0;i<rows.length;i++){
			cats.push(rows[i]);
		}
		//je nachdem, wovon diese funktion aufgerufen wurde, schicke bestimmte nachricht zurück
		switch (data.act){
			//0--> kategorien werden für kategoriebildschirm geladen
			//1--> kategorien werden für das "createRequirement" Menü geladen
			//2--> kategorien werden für das dashboard dropdown geladen
			case 0: socket.emit('getCategories',cats); break;
			case 1: socket.emit('FillCategoryDropdown',cats); break;
			case 2: socket.emit('fillCategorySelector',cats); break;
		}
		
	});
});

socket.on('deleteCat',function(data){
	var id= data.id;
	var username = data.username;
	 var teamid;
	var members = [];
	
	var query2 = "select name from categories where id="+id+";";
	var exec2= db.query(query2, function(err,rows,fields){
		if (err) {sendMail("deleteCat"); logerr(err); return; }
		var cat_name=rows[0].name;	
	
		var query = "delete from categories where id="+id+";";
		var exec= db.query(query, function(err,rows,fields){
			if (err) {sendMail("deleteCat");socket.emit('deleteCat',{username:username, code: 1});return; }
		
			//get users team id
			for(var i=0;i<users.length;i++){
				//console.log(users[i]);
				if (users[i].name==username){
					teamid = users[i].teamID;
				}
			}
				//console.log(teamid);

			//get members
			for(var i=0;i<users.length;i++){
				if (users[i].teamID==teamid){
					members.push(users[i]);
				}
			}
	
			//console.log(members);
	
			//sendet an alle mitglieder des membersarray eine notification
			for(var i=0; i< members.length;i++){
				//console.log("sending to "+members[i].name+"...");
				io.to(members[i].socket).emit("deleteCat", {username: username, code:0});	
			}
		
			var query3 = "update requirements,categories set requirements.category = 'uncategorized' WHERE  requirements.category='"+cat_name+"';";
			var exec3= db.query(query3, function(err,rows,fields){
				if (err) {sendMail("deleteCat");logerr(err); return; }
				//console.log("updated");
			});
		});
	});
});

socket.on('getEditData',function(id){
	var query = "select id, name, team_id from categories where id="+id+";";
	var exec= db.query(query, function(err,rows,fields){
		if (err) {sendMail("getEditData");logerr(err);  return;}
		console.log(rows[0].name+" "+rows[0].id);
		socket.emit('getEditData',{id: rows[0].id, name: rows[0].name, teamid: rows[0].team_id});
	});
});

socket.on('submitEdit',function(data){
var name = data.newName;
var id= data.id;

var query = "update categories set name='"+name+" 'where id="+id+";";
	var exec= db.query(query, function(err,rows,fields){
		if (err) {sendMail("submitEdit"); logerr(err);return; }
		socket.emit('submitEdit');
	});
});
});



