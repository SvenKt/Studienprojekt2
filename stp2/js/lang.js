var language = "de";

$(document).ready(function(){
	switchToDE();
});

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