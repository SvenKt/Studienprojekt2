var sessionID;



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

function setArrayLength(val){
var arr = JSON.parse(localStorage.getItem("array"));
arr.length=val;
localStorage.setItem("array", JSON.stringify(arr));
}

function getArrayLength(){
var arr = JSON.parse(localStorage.getItem("array"));
return arr.length;
}

function Length(){
var arr = JSON.parse(localStorage.getItem("array"));
return arr.length;
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
		window.location="dashboard_de.php?session="+sessionID;
	}
}

function logOut(){
	localStorage.removeItem("user"+getParameter("session"));
	location.replace("index.php");
}