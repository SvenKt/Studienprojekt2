var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   mysql = require('mysql')
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
    if (err) console.log(err)
})

//server hört auf port 3000 --> verbindung mittels "localhost:3000"
server.listen(3000);

//dateien aus /public können von server verarbeitet werden
app.use(express.static('public'));


//bei aufruf des servers landet user auf /public/socket.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/socket.html');
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
	console.log(username);
	var id = db.query('Select users.team_id, users.id from users where users.username="'+username+'"',  function(err, rows, fields){
		if (err) throw err;
		var user = {name: username,id: rows[0].id, teamID: rows[0].team_id, socket: sock};
			var i = isInArray(sock,users);
			if (i == -1) users.push(user);
	});	
}

// user wird aus userarray entfernt
function deleteUserFromArray(socketid,arr){
	var i = isInArray(socketid,arr);
	delete users[i];
}



io.on('connection', function (socket) {


	//
	//  LISTENERS	
	//
	//

	//nach connection werden userdaten angefragt
	socket.emit('requestUsernameLogin');

	//nach empfang der userdaten werden diese ins userarray eingetragen
	socket.on('receiveUsernameLogin', function(username){
		addUserToArray(username,socket.id);
	});
	
	//bei disconnect wird user aus userarray entfernt
	socket.on('disconnect', function(){
		deleteUserFromArray(socket.id,users);
		socket.emit('disconnected');
	});
	
	// für debug, gibt auf anfrage des clients userarray aus
	socket.on('showUsers',function(){
		console.log(users);
	});
	
	//listener hört auf eintragung einer neuen anforderung 
	socket.on('newReq',function(data){
		console.log("Neue Anforderung");
		var teamid;
		var members = [];
		
		//holt ID des Erstellers der Anforderung
		for(var i=0;i<users.length;i++){
		console.log(users[i]);
			if (users[i].name==data.user){
				teamid=users[i].teamID;
			}
		}
		console.log(users);
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
	
	console.log(reqToEdit);
	
	});
	
	socket.on('editReq',function(data){
	
	
	
	
		console.log("Req edited");
		var teamid;
		var members = [];
		var mess; 
		
		//get creator's team id
		for(var i=0;i<users.length;i++){
		console.log(users[i]);
			if (users[i].name==data.user){
				teamid=users[i].teamID;
			}
		}
		console.log(users);
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
		var query="SELECT  requirements.project_id, requirements.status,  requirements.relations, requirements.id, requirements.requirement, requirements.priority, requirements.timestamp FROM requirements, users WHERE users.username='"+user+"' AND users.team_id=requirements.team_id";
	
		if (typeof data.search !== "undefined"){
			var parts = data.search.split(" ");
			for(var i=0; i<parts.length;i++){
				if(parts[i].indexOf("/") != -1){
					parts[i] = parts[i].replace("/"," ");
				} 
				query += " AND requirements.requirement like '%"+parts[i]+"%'";
			}
		}
		query += ";";
		var requirements = db.query(query,  function(err, rows, fields){
			if (err) throw err;
			for(var i=0;i<rows.length;i++){
				requirementsArr.push(rows[i]);
			}
			socket.emit('getRequirements',requirementsArr);
		});
	});
	
	socket.on('deleteReq', function(data){
		var query="DELETE FROM requirements WHERE id='"+data.id+"';";
		
		var requirements = db.query(query, function(err){
			if (err) throw err;
			socket.emit('delReq');
		});
		
		console.log("Req deleted");
		var teamid;
		var members = [];
		
		//get creator's team id
		for(var i=0;i<users.length;i++){
		console.log(users[i]);
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
	
	socket.on('insertReq', function(data){
		var teamid;
		var userid;
		
		for(var i=0;i<users.length;i++){
			if (users[i].name==data.user){
				teamid=users[i].teamID;
				userid=users[i].id;
				console.log(userid+" "+teamid);
			}
		}
		var query="insert into requirements (requirement, priority, project_id, status, relations ,owner_id, team_id, timestamp) values ('"+data.req+"', '"+data.prio+"','"+data.id+"','"+data.status+"','"+data.relations+"','"+userid+"','"+teamid+"','"+data.currentTime+"');";
		var requirements = db.query(query, function(err){
			if (err) throw err;
		});
		
		console.log("Neue Anforderung");
		var members = [];
		
		//get creator's team id
		for(var i=0;i<users.length;i++){
		console.log(users[i]);
			if (users[i].name==data.user){
				teamid=users[i].teamID;
			}
		}
		console.log(users);
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
	});
	
	socket.on('createTeam',function(data){
		var query = "Select name from team";
		var code = 0;
		
		var existsTeam = db.query(query, function(err,rows,fields){
			if (err){ throw err; code=1;}
			var alreadyExists = false;
			for (var i = 0; i< rows.length; i++){
				console.log(rows[i]);
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
					console.log(id.id);
				
					var injection = "insert into team (name, creator_id) values('"+data.team+"','"+id.id+"');";
					console.log(injection);
					var injectTeam = db.query(injection, function(err){
						if (err) throw err;
						console.log(code);
						socket.emit('createTeam',code);
					});
				
				});
			}
		});
	});
	
	socket.on('insertTeamOwner', function(data){
		console.log(data);
		var code;
		var UserID="select team_id from users where username='"+data.user+"';";
		var getUserID = db.query(UserID, function(err,rows,fields){
					if (err) {throw err;  code=1; socket.emit('insertTeamOwner',code);}
					var userTeamid;
					userTeamid=rows[0].team_id;
					if(userTeamid == null){
						console.log("Insert as Owner");
					var teamid_query="select id from team where name='"+data.team+"';";
					var getTeamID = db.query(teamid_query, function(err,rows,fields){
						if (err) {throw err;  code=2; socket.emit('insertTeamOwner',code);}
						var teamid = rows[0].id;
						console.log(teamid);
						var insert_query= "update users set team_id="+teamid+" where username='"+data.user+"';"
						var insertUser = db.query(insert_query, function(err){
							if (err) {throw err;  code=3; socket.emit('insertTeamOwner',code);}
							else {
								 code=0; socket.emit('insertTeamOwner',code);
							}
						});
					});
					} else {
					console.log(userTeamid);
					}
		});
		
	});
	
});

