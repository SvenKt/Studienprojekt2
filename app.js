var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   mysql = require('mysql')
,	md5 = require('js-md5')
,   io = require('socket.io').listen(server);

var db = mysql.createConnection({
    host: 'localhost',
    user: 'reqmanager',
	password: 'Proskater594',
    database: 'requirement'
});

var users = [];	
var reqToEdit;

//db connection, wenn error dann log in console
db.connect(function(err){
    if (err) {throw err;}//console.log(err)
})

//server hört auf port 3000 --> verbindung mittels "localhost:3000"
server.listen(3000);

//dateien aus /public können von server verarbeitet werden
app.use(express.static('RE'));


//bei aufruf des servers landet user auf /public/socket.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/RE/bla.html');
});


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
		if (err) throw err;
		var user = {name: username,id: rows[0].id, teamID: rows[0].team_id, socket: sock};
			var i = isInArray(sock,users);
			if (i == -1) users.push(user);
			////console.log(users);
	});	
	
}

// user wird aus userarray entfernt
function deleteUserFromArray(socketid,arr){
	var i = isInArray(socketid,arr);
	delete users[i];
}



io.on('connection', function (socket) {

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
			if (err) throw err;
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
	
	//console.log(reqToEdit);
	
	});
	
	socket.on('editReq',function(data){
	
	
	
	
		//console.log("Req edited");
		var teamid;
		var members = [];
		var mess; 
		
		//get creator's team id
		for(var i=0;i<users.length;i++){
		//console.log(users[i]);
			if (users[i].name==data.user){
				teamid=users[i].teamID;
			}
		}
		//console.log(users);
		//get members of creator's team
		for(var i=0;i<users.length;i++){
			if (users[i].teamID==teamid){
				members.push(users[i]);
			}
		}
		
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
		var str = "cat_";	
		var view = data.view;
		console.log(view);
		
		
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
			if (err) throw err;
			for(var i=0;i<rows.length;i++){
				requirementsArr.push(rows[i]);
				console.log(rows[i]);
			}
			//console.log(requirementsArr);
			socket.emit('getRequirements',requirementsArr);
		});
	});
	
	socket.on('deleteReq', function(data){
		var query="DELETE FROM requirements WHERE id='"+data.id+"';";
		
		var requirements = db.query(query, function(err){
			if (err) throw err;
			socket.emit('delReq');
		});
		
		//console.log("Req deleted");
		var teamid;
		var members = [];
		
		//get creator's team id
		for(var i=0;i<users.length;i++){
		//console.log(users[i]);
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
		var newData=data;
			var query="select IFNULL(id ,-1) from categories where name='"+data.category+"';";
			var requirements = db.query(query, function(err,rows,fields){
				if (err) {socket.emit('reqFail',1); return;}
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
				//console.log(userid+" "+teamid);
			}
		}
		
		if(teamid !== null){
			if(data.category != null){
			var query="insert into requirements (requirement, priority, project_id, status, relations ,owner_id, team_id, timestamp, category) values ('"+data.req+"', '"+data.prio+"','"+data.id+"','"+data.status+"','"+data.relations+"','"+userid+"','"+teamid+"','"+data.currentTime+"','"+data.category+"');";
			var requirements = db.query(query, function(err){
				if (err) {socket.emit('reqFail',1);}
			});
		
			//console.log("Neue Anforderung");
			var members = [];
		
			//get creator's team id
			for(var i=0;i<users.length;i++){
			//console.log(users[i]);
				if (users[i].name==data.user){
					teamid=users[i].teamID;
				}
			}
			//console.log(users);
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
			if (err){ throw err; code=1;}
			var alreadyExists = false;
			for (var i = 0; i< rows.length; i++){
				////console.log(rows[i]);
				if(data.team == rows[i].name){
					alreadyExists=true;
				}
			}
			if (!alreadyExists){
				var UserID="select id from users where username='"+data.user+"';";
				var getUserID = db.query(UserID, function(err,rows,fields){
					if (err) {throw err;  socket.emit('createTeam',code);}
					var id;
					id=rows[0];
					////console.log(id.id);
				
					var injection = "insert into team (name, creator_id) values('"+data.team+"','"+id.id+"');";
					//console.log(injection);
					var injectTeam = db.query(injection, function(err){
						if (err) throw err;
						//console.log(code);
						socket.emit('createTeam',code);
					});
				
				});
			}
		});
	});
	
	socket.on('createDefaultCategory',function(teamname){
	
		var getTeamID = "select id from team where name='"+teamname+"';";
		var do_getTeamID = db.query(getTeamID, function(err,rows,fields){
			if (err){throw err;}
			var teamid = rows[0].id;
			var query = "insert into categories (name, team_id) values ('uncategorized',"+teamid+");";
			var do_query = db.query(query, function(err,rows,fields){
				if (err){throw err;}
				socket.emit('createDefaultCategory');
			});
		});
	
	});
	
	socket.on('insertTeamOwner', function(data){
		console.log(data);
		
		
		var code;
		var UserID="select team_id,id from users where username='"+data.user+"';";
		var getUserID = db.query(UserID, function(err,rows,fields){
					if (err) {throw err;  code=1; socket.emit('insertTeamOwner',code);}
					var userTeamid;
					userTeamid=rows[0].team_id;
					var userid = rows[0].id;
					if(userTeamid == null){
						console.log(data.action);

							//console.log("Insert as Owner");
							var teamid_query="select id from team where name='"+data.team+"';";
							var getTeamID = db.query(teamid_query, function(err,rows,fields){
								if (err) {throw err;  code=2; socket.emit('insertTeamOwner',code);}
								var teamid = rows[0].id;
								//console.log(teamid);
								var insert_query= "update users set team_id="+teamid+" where username='"+data.user+"';"
								var insertUser = db.query(insert_query, function(err){
									if (err) {throw err;  code=3; socket.emit('insertTeamOwner',code);}
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
								if (err) {throw err;}
								var teamid = rows[0].id;
								//console.log(teamid);
								var insert_query= "update team set creator_id="+userid+" where id='"+teamid+"';"
								var insertUser = db.query(insert_query, function(err){
									var query_del_reqs = "update requirements set owner_id ="+userid+" where owner_id = "+data.userArr[1]+";";
									var insertUser = db.query(query_del_reqs, function(err){
									console.log('overwritten!');
									if (err) {throw err;}
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
					if (err) {throw err;}
					var userExists = (rows[0].total > 0) ? true : false;
					//console.log("exists "+userExists);
					
					if(userExists){
						checkUserIsNotInOtherTeam_query = "select team_id from users where username='"+data.user+"';";
						var checkUserIsNotInOtherTeam = db.query(checkUserIsNotInOtherTeam_query, function(err,rows,fields){
							if (err) {throw err;}
							var userIsInOtherTeam = (rows[0].team_id != null) ? true : false;
							//console.log("is in other team "+userIsInOtherTeam);
						
							if(!userIsInOtherTeam){
								var addUserToTeam_query = "update users, team set users.team_id=team.id where team.name='"+data.team+"' AND users.username='"+data.user+"';";
								var checkUserIsNotInOtherTeam = db.query(addUserToTeam_query, function(err,rows,fields){
									if (err) {throw err;  }
									else {
										code=0; 
										socket.emit('addTeamMember',{user: data.user,code: code,  team: data.team});
										notifyNewMember(data.user);
										var query = "select id from team where name='"+data.team+"';";
										var checkUserIsNotInOtherTeam = db.query(query, function(err,rows,fields){
											if (err) {throw err;  }
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
	if(email.match(/([0-9a-zA-Z_.+-])@([0-9a-zA-Z_.+-]).(\w+)/)){
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
		if (err) {throw err;}
		socket.emit('changeData',0);
	});	
}
	



function registerUser(data){
	var abfrage_query = "SELECT username FROM users where username='"+data.user+"';";
	var abfrage = db.query(abfrage_query, function(err,rows,fields){
		if (err) {throw err;}
		if(rows.length > 0){
			socket.emit('registerUser',4);
		} else {
			var insert_query = "INSERT INTO users (username, password, email) VALUES ('"+data.user+"','"+md5(data.pw)+"','"+data.mail+"')";
			var insert = db.query(insert_query, function(err,rows,fields){
				if (err) {throw err;}
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
		if (err) {throw err;}
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
		if (err) {code=1;socket.emit('leaveTeam',code);}
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
		if (err) {throw err;}
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
		if (err) {code = 1;socket.emit('intoTeam',code);}
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
		if (err) {throw err;}
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
			if (err) {throw err;}
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
			if (err) {throw err;}
			usersTeamID=rows[0].team_id;
			
			//debug
			//console.log("usersTeamID :"+usersTeamID); //ok
			//console.log("teamIDtodelete :"+teamIDtoDelete);
			
			//count users in team
			var query2 = "select users.username from users, team where users.team_id=team.id AND team.id='"+teamIDtoDelete+"';"; 
			var deleteFromTeam =  db.query(query2, function(err,rows,fields){
				if (err) {throw err;}
				numerOfUsersInTeam = rows.length;
				
				//debug
				//console.log("numberOfUsers: "+numerOfUsersInTeam); //ok
				
				// get id of team creator
				var query3 = "select team.creator_id from team where team.id='"+teamIDtoDelete+"';";
				var deleteFromTeam =  db.query(query3, function(err,rows,fields){
					if (err) {throw err;}
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
									if (err) {throw err;}
								});
							}
							//delete all team's requirements		
							var query5 = "delete from requirements where team_id="+teamIDtoDelete+";";
							var deleteFromTeam =  db.query(query5, function(err,rows,fields){
								if (err) {throw err;}
								//delete team
								
								
								var query_deleteCats = "delete from categories where team_id="+teamIDtoDelete+";";
								var deleteCats = db.query(query_deleteCats, function(err,rows,fields){
									if (err) { throw err;}
									
			
								
									var query6 = "delete from team where id="+teamIDtoDelete+";";
									var deleteTeam =  db.query(query6, function(err,rows,fields){
										if (err) { throw err;
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
										if (err) { throw err;}
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
		if (err) {throw err;}
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
		//console.log("query not null");
		var getUsers = "SELECT username, id, team_id, email FROM users WHERE username like '%"+query+"%' OR email like '%"+query+"%' ;";
	} else {
		//console.log("query null");
		var getUsers = "SELECT username, id, team_id, email FROM users;";
	}
	var allUsers = db.query(getUsers, function(err,rows,fields){
		if (err) {throw err;}
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
		if (err) {throw err;} //console.log("q1");}
		//if user has a team...
		if(rows != null){
			//...delete him from the team
			var leaveTeam = "update users set team_id=NULL where id='"+id+"';";
			var teamChecked = db.query(leaveTeam, function(err,rows,fields){
				if (err) {throw err;}//console.log("q1");}
				//console.log("set teamid = null");
			});
			
			var delReqs = "delete from requirements where owner_id="+id+";";
			var teamChecked = db.query(delReqs, function(err,rows,fields){
				if (err) {throw err;}//console.log("q1");}
				//console.log("deleted all user's reqs");
			});
			
			var delUser = "delete from users where id='"+id+"';";
			var teamChecked = db.query(delUser, function(err,rows,fields){
				if (err) {throw err;}//console.log("q1");}
				//console.log("deleted user");
				socket.emit('forceDeleteUser');
				
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
		if (err) {throw err;}
		for (var i= 0; i< rows.length;i++) {
			////console.log(rows[i]);
			//teams the user is owning, or member of
			myTeams.push({name: rows[i].name, id: rows[i].id});
			usersTeamID=rows[i].team_id;
			//console.log("userID "+userID+" row creator id "+rows[i].creator_id);
			if(userID == rows[i].creator_id){
				userIsCreatorOf.push({name: rows[i].name, id: rows[i].id});
			}
		}
		if (myTeams.length > 0){
			for (var i= 0; i< myTeams.length;i++) {
				//console.log("myTeams: "+myTeams[i].name);
			}
			//console.log("usersTeamID: "+usersTeamID);	
			//console.log("userIsCreatorOf "+userIsCreatorOf);	
	
		
			if(usersTeamID != null){
			
				var query2 = "select name from team where id="+usersTeamID+";";
				var getTeamName= db.query(query2, function(err,rows,fields){
					if (err) {throw err;}
					memberOf=rows[0].name;
					//console.log("userIsCreatorOf: "+userIsCreatorOf);
					var groups = [ myTeams,memberOf,userIsCreatorOf,user ];	
					socket.emit('getMyGroups',groups);
				});
			} else {
					var groups = [ myTeams,memberOf,userIsCreatorOf,user];	
					socket.emit('getMyGroups',groups);
				}
			} else {
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
		
	//console.log(userID);
	var query = "select team.name, team.creator_id ,team.id, users.team_id from team,users where (team.creator_id=users.id OR team.id=users.team_id) AND users.username='"+user[0]+"';";
	var getAllTeams = db.query(query, function(err,rows,fields){
		if (err) {throw err;}
		for (var i= 0; i< rows.length;i++) {
			////console.log(rows[i]);
			//teams the user is owning, or member of
			myTeams.push({name: rows[i].name, id: rows[i].id});
			usersTeamID=rows[i].team_id;
			//console.log("userID "+userID+" row creator id "+rows[i].creator_id);
			if(userID == rows[i].creator_id){
				userIsCreatorOf.push({name: rows[i].name, id: rows[i].id});
			}
		}
		if (myTeams.length > 0){
			/*for (var i= 0; i< myTeams.length;i++) {
				//console.log("myTeams: "+myTeams[i].name);
			}
			//console.log("usersTeamID: "+usersTeamID);	
			//console.log("userIsCreatorOf "+userIsCreatorOf);	
	
			//console.log("user[1]: "+user[1]);*/
			if(usersTeamID != null){
			
				var query2 = "select name from team where id="+usersTeamID+";";
				var getTeamName= db.query(query2, function(err,rows,fields){
					if (err) {throw err;}
					memberOf=rows[0].name;
					//console.log("memberOf: "+memberOf);
					//console.log("userIsCreatorOf: "+userIsCreatorOf);
					var groups = [ myTeams,memberOf,userIsCreatorOf,user[0],userID ];	
					socket.emit('getMyGroups',groups);
				});
			} else {
					//console.log(userID);
					var groups = [ myTeams,memberOf,userIsCreatorOf,user[0],userID];					
					socket.emit('getMyGroups',groups);
				}
			} else {
				var groups = [ "", "", "",user[0],userID ];	
				socket.emit('getMyGroups',groups);
		}
	});	
});


socket.on('deleteAllUsersFromTeam',function(data){
	var kickUser = "update users set team_id=NULL where team_id='"+data.teamid+"';";
	var getTeamName= db.query(kickUser, function(err,rows,fields){
					if (err) {throw err;}
					socket.emit('deleteAllUsersFromTeam',{user: data.user, teamid: data.teamid, userid:data.userid});
	});
});

socket.on('submitCategory',function(data){
	console.log("submit "+data.category);
	var teamid;
	var exists=false;
	var members = [];
	
	for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			if (users[i].name==data.username){
				teamid = users[i].teamID;
			}
		}
	}
	
	if (teamid != null){
	
		var getCats = "select name from categories where team_id="+teamid+";";
		var getTeamName= db.query(getCats, function(err,rows,fields){
			if (err) {throw err;}
			for(var i=0;i<rows.length;i++){
				if(rows[i].name == data.category){
					exists=true;
					socket.emit('submitCategory',3);
				}
			} 	if(!exists) {
					var query = "insert into categories (name, team_id) values ('"+data.category+"',"+teamid+");";
					var getTeamName= db.query(query, function(err,rows,fields){
						if (err) {throw err; socket.emit('submitCategory',1);}
						socket.emit('submitCategory',0);
						
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
	//console.log("now acts no. "+data.act);
	for(var i=0;i<users.length;i++){
		if(typeof users[i] != "undefined"){
			if (users[i].name==data.user){
				teamid = users[i].teamID;
			}
		}
	}
	
	var getCats = "select * from categories where team_id="+teamid+";";
	var exec= db.query(getCats, function(err,rows,fields){
		if (err) {throw err;}
		for(var i=0;i<rows.length;i++){
			cats.push(rows[i]);
		}
		switch (data.act){
			case 0: socket.emit('getCategories',cats); break;
			case 1: socket.emit('FillCategoryDropdown',cats); break;
			case 2: socket.emit('fillCategorySelector',cats); break;
		}
		
	});
});

socket.on('deleteCat',function(data){
	//console.log("delete cat");
	var id= data.id;
	var username = data.username;
	 var teamid;
	var members = [];
	
	var query2 = "select name from categories where id="+id+";";
	var exec2= db.query(query2, function(err,rows,fields){
		if (err) {throw err; }
		var cat_name=rows[0].name;
		//console.log(cat_name);
	
	
		var query = "delete from categories where id="+id+";";
		var exec= db.query(query, function(err,rows,fields){
			if (err) {socket.emit('deleteCat',{username:username, code: 1});return }
		
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
				if (err) {throw err; }
				//console.log("updated");
			});
		});
	});
});

socket.on('getEditData',function(id){
	var query = "select id, name, team_id from categories where id="+id+";";
	var exec= db.query(query, function(err,rows,fields){
		if (err) {throw err; }
		console.log(rows[0].name+" "+rows[0].id);
		socket.emit('getEditData',{id: rows[0].id, name: rows[0].name, teamid: rows[0].team_id});
	});
});

socket.on('submitEdit',function(data){
var name = data.newName;
var id= data.id;

var query = "update categories set name='"+name+" 'where id="+id+";";
	var exec= db.query(query, function(err,rows,fields){
		if (err) {throw err; }
		socket.emit('submitEdit');
	});
});
});



