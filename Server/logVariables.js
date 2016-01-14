/*
*
*
*	Here are all variables from the log functions
*	exports.error: Number represents the error code
*
*
*/

exports.error = {
		databaseError:"1 could not connect to database. check credentials and / or host",
		getRequirementDataForEdit: "2 could not get requirement data for the edit form. database error",
		getRequirements: "3 could not load requirements from database. database error",
		deleteRequirement: "4 could not delete requirement. already deleted or database error",
		insertRequirement: "5 could not insert requirement. database error",
		checkTeamName: "6 could not load team names from database while processing 'createTeam' function. database error",
		getUser: "7 could not load user information from database. database error",
		createTeam: "8 could not insert team into database while processing 'createTeam'. database error",
		getTeamID_defcat: "9 could not load team id from database while processing 'createDefaultCategory'. database error",
		defaultCategory: "10 could not insert default category 'uncategorized' for newly created team. database error",
		getTeam: "11 could not load team data from database. database error",
		assignTeamToUser: "12 could not assign team to user in database. database error",
		setNewTeamOwner: "13 could not assign team from old user to new user. database error",
		addMember: "14 could not add member to team. database error, check if user is already in team",
		changeData: "15 could not change profile data. database error, check if user exists or if characters are valid",
		registerUser: "16 could not create user. database error",
		checkLogin: "17 could not load any user from database. probably no connection established or connection lost. database error",
		leaveTeam: "18 could not set delete user from team. database error",
		deleteUserFromTeam: "19 could not delete user from team, database error",
		getTeamCreator: "20 could not load team creator from database. database error",
		deleteCategory: "21 could not delete category from database. database error",
		deleteTeam: "22 could not delete Team from database. database error",
		deleteUser: "23 could not delete user from database. database error",
		getCategory: "24 could not get Category name from database. database error",
		submitCategory: "25 could not insert category into database. database error",
		setRequirementCategory: "26 could not set requirement's category. database error",
}
		
		
exports.trace = {
		configCreated: "Configfile has been written",
		databaseTest: "database test successful",
		databaseConfigWritten: "database configuration has been saved",
		mailSent: "an e-mail has been send",
		newRequirement: "a new requirement has been created",
		editRequirement: "a requirement has been edited",
		teamOwner1: "team owner has been inserted as team member",
		teamOwner2: "team owner changed",
		registered: "a new user has been registered",
		login: "new user has logged in",
		10: "",
		11: "",
		12: "",
}