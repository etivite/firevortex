//
// ==UserScript==
// @name          FireVortex
// @namespace     http://firevortex.net
// @description   An enhancement for the VWVortex, The Car Lounge, Fourtitude, and AudiZine community forums - http://firevortex.net
// @exclude       http://ads2.vortexmediagroup.com/*
// @exclude       http://www.google-analytics.com/*
// @exclude       http://prstats.postrelease.com/*
// @exclude       http://*.gmodules.com/*
// @exclude       http://*.googlesyndication.com/*
// @exclude       http://pagead2.googlesyndication.com/*
// @exclude       http://*.vortexmediagroup.com/*
// @exclude       http://googleads.g.doubleclick.net/*
// @exclude       http://*.doubleclick.net/*
// @exclude       http://ad.linksynergy.com/*
// @exclude       http://click.linksynergy.com/*
// @exclude       http://stats.big-boards.com/*
// @exclude       http://*.youtube.com/*
// @exclude       http://youtube.com/*
// @exclude       http://*.archive.org/*
// @exclude       http://vwvortex.jbrlsr.com/*
// @exclude       http://la.jbrlsr.com/*
// @exclude       http://www.stumbleupon.com/*
// @exclude       http://http.cdnlayer.com/*
// @exclude       http://ads.adbrite.com/*
// @exclude       http://*.adbrite.com/*
// @exclude       http://ad.technoratimedia.com/*
// @exclude       http://ad-cdn.technoratimedia.com/*
// @exclude       http://*.technoratimedia.com/*
// @exclude       http://*.turn.com/*
// @exclude       http://*.yieldmanager.com/*
// @exclude       http://*.scorecardresearch.com/*
// @exclude       http://*.quantserve.com/*
// @exclude       http://*.viglink.com/*
// @exclude       http://*.realmedia.com/*
// @exclude       http://m.audizine.com/*
// @include       http://forums.vwvortex.com/*
// @include       http://forums.fourtitude.com/*
// @include       http://forums.thecarlounge.net/*
// @include       http://forums.thecarlounge.com/*
// @include       http://forums.subdriven.com/*
// @include       http://forums.swedespeed.com/*
// @include       http://forums.mwerks.com/*
// @include       http://forums.triplezoom.com/*
// @include       http://forums.speedarena.com/*
// @include       http://forums.motivemag.com/*
// @include       http://forums.turbonines.com/*
// @include       http://forums.kilometermagazine.com/*
// @include       http://www.audizine.com/forum/*
// @include       http://audizine.com/forum/*

// ==/UserScript==
//
// FireVortex
// Created 2007-01-25
// Updated 2011-05-26
// Copyright (c) 2007-11, Rich Fuller - rich@firevortex.net
// This work is licensed under a Attribution-Noncommercial-No Derivative Works 3.0 United States License
// http://creativecommons.org/licenses/by-nc-nd/3.0/us/
// --------------------------------------------------------------------

//todo
// - bbcode popups on quickreply

//set some constants
const VERSION = {
	fv : "2.0.10162011",
	created : new Date(2007, 01, 25),
	updated : new Date(2011, 10, 16),
};

const REQUEST_HEADERS = "Mozilla/4.0 (compatible) Greasemonkey (FireVortex."+ VERSION.fv +")";
var SERVER_HOST = "http://"+ window.location.host;

//
// helper functions
//

//extend some basics
String.prototype.endsWith = function(s) { lastIndex = this.lastIndexOf(s); return (lastIndex != -1 && lastIndex == (this.length - s.length)); };
String.prototype.capFirst = function() { return this.substr(0, 1).toUpperCase() + this.substr(1); };
String.prototype.startsWith = function(str){ return (this.indexOf(str) === 0); }


//standard dom xpath
function xpath(query) { return document.evaluate(query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); }

//escape our strings
function encode_utf8( s ) {	return unescape( encodeURIComponent( s ) ); }
function decode_utf8( s ) {	return decodeURIComponent( escape( s ) ); }

function addCSSFile( filename ) { var fileref=document.createElement("link"); fileref.setAttribute("rel", "stylesheet"); fileref.setAttribute("type", "text/css"); fileref.setAttribute("href", filename); document.getElementsByTagName("head")[0].appendChild(fileref); }
function is10( v ) {  return v == true ? '1': '0'; }

function loggedin_username() {
	if (!w.LOGGEDIN)
		return false;

	var markx = xpath("//div[@id='toplinks']/ul/li[@class='welcomelink']/a");
	var mark = markx.snapshotItem(0);
	if (mark) {
		return mark.textContent;
	} else {
		return false;
	}
}
function isthread_locked() {
	if ( $('#newreplylink_top:contains("Closed Thread")').val() == undefined ) {
		return false;
	} else {
		return true;
	}
}
function isChildForum() {
	//thread pagination div is there if a child forum
	if ( $('ul#forumdisplaypopups').length == 0 )
		return false;
	
	return true;
}
function getChildForumId() {
	//var fid = $('input:hidden[name=f]').val()
	var fid = $('form#forum_display_options input:hidden[name=f]').val()
	if ( fid ) {
		return fid;
	} else {
		return null;
	}
}
function isForumFirstPage() {
	if ( $('form#forum_display_options input:hidden[name=page]').val() == 1 )
		return true;
		
	return false;
}
//BULLSHIT - probably bad to use rate thread - as the option can be turned off so change later
function isThreadFirstPage() {
	if ( $('form#showthread_threadrate_form input:hidden[name=page]').val() == 1 )
		return true;
		
	return false;
}
function getThreadPage() {
	return $('form#showthread_threadrate_form input:hidden[name=page]').val();
}
function getThreadId() {
	return $('form#showthread_threadrate_form input:hidden[name=t]').val();
}
function getUserId() {
	var uid = $('form input:hidden[name=userid]').val()
	if ( uid ) {
		return uid;
	} else {
		return null;
	}
}

//simple time of execution function
var exectimer = { start:function () { d = new Date(); time  = d.getTime(); }, diff:function () { d = new Date(); x = ( d.getTime()-time ) / 1000; return x % 60; } };


//grab our window reference
var w;

//if ( window.opera ) {
    //var unsafeWindow = window;
//}

if ( unsafeWindow ) {
	w = unsafeWindow;
} else {
	w = window;
}

//extend an object for localstorage container - firefox + greasemonkey requires unsafe
//w.Storage.prototype.setObject = function(key, value) { this.setItem( key, JSON.stringify(value) ); }
//w.Storage.prototype.getObject = function(key) { return this.getItem( key ) && JSON.parse( this.getItem( key ) ); }
function setStorageObject(name, value) {
	w.localStorage.setItem(name, JSON.stringify(value));
}
function getStorageObject(name) {
	//return w.localStorage.getItem( name ) && JSON.parse( w.localStorage.getItem( name ) );
	data = w.localStorage.getItem(name);
	if (data) {
		return JSON.parse(data);
	} else {
		return null;
	}

}

//nasty hack for chrome to grab some page vars - due to lack of unsafewindow sandbox access
function getChromePageVars() {
	jvars = $('head script:not([src])').text();
	
	//var SECURITYTOKEN = "1305932006-eddef7a702af878abfd7bc1cd8546835db7e15cc";
	//var LOGGEDIN = 2272 > 0 ? true : false;
	
	var matchsecurity = /var SECURITYTOKEN = "([_0-9a-zA-Z-]+)";/i.exec(jvars)
	if (matchsecurity) w.SECURITYTOKEN = matchsecurity[1];

	var matchlogged = /var LOGGEDIN = ([_0-9]+) > 0 \? true : false;/i.exec(jvars)
	if (matchlogged) w.LOGGEDIN = matchlogged[1] > 0 ? true : false;

}

//work around for google chrome and opera for saving data
//if (!this.GM_getValue || this.GM_getValue.toString().indexOf("not supported")>-1) {
//if (typeof GM_getValue === "undefined") {
if ( navigator.userAgent.toLowerCase().indexOf('chrome') > -1 ) {
    
    if(typeof(unsafeWindow) === "undefined") { w=window; }

	function GM_getValue ( key, defaultValue ) {
		var value = w.localStorage.getItem('fv_'+ key);
		if ( value == null ) {
			value = defaultValue;
		} else if (value=='true') {
			value = true;
		} else if(value=='false') {
			value = false;
		}
		return value;
	}
	
	function GM_setValue( key, value ) {
		w.localStorage.setItem( 'fv_'+ key, value );
	}

}

//some top level stuff

var queryString = null;
var userName = null;
var domainKey = null;

/**
 * Processing of the current page.
 */
var FireVortex = {

    init: function() {

		//need to check which vmg domain we are on
		FireVortex.Config.domainCheck();
		
		//don't fire if not proper
		if (domainKey == -1) return;
		
		//don't run on frames or iframes
		//if (w.top != w.self)
			//return;
		//if (top.window.wrappedJSObject != w.self)
			//return;	
		try {
			if (w.frameElement) { return; }
			var tryagain = true;
			try {
				if (w && w.self && w.top) {
					if (w.self!=w.top) {
						return;
					}
					tryagain = false;
				}
			} catch(e) { }
			if (tryagain) {
				if (typeof unsafeWindow!="undefined" && (unsafeWindow!=unsafeWindow.top || unsafeWindow!=unsafeWindow.parent)) { 
					return;
				}
			}
		} catch(e) { return; }
		
		//az has forum has basename instead of subdomain
		if (domainKey == 10) SERVER_HOST = SERVER_HOST + '/forum';

		//start something silly
		exectimer.start();
		
		//load the user preferences	
		FireVortex.Config.init();
		
		if ( navigator.userAgent.toLowerCase().indexOf('chrome') > -1 ) getChromePageVars();
		
		//set some top level vars
		userName = loggedin_username();
		queryString = window.top.location.search.substring(1);
	
		//determine what page we are on and exec
		var pageType = this.determineCurrentPageType();
		this.processPage(pageType);
		
		//something silly
		endtime = exectimer.diff();
		if ( endtime > 4 ) {
			$('p#fv-timer').html('FireVortex choked for '+ endtime +' seconds while your slow 1997 computer processed this page.' );
		} else if ( endtime > 2 ) {
			$('p#fv-timer').html('FireVortex somehow managed to process this page in '+ endtime +' seconds.' );
		} else {
			$('p#fv-timer').html('FireVortex required an additional '+ endtime +' seconds to work some sort of magic on this page.' );
		}
		
    },

    /**
     * Determines which kind of forum page we're on.
     */
    determineCurrentPageType: function() {

        var pageType = null;
		var wloc = window.location.href.toLowerCase();
		
		//http://forums.vwvortex.com/ || http://forums.vwvortex.com/forum.php || http://forums.vwvortex.com/index.php
		if (wloc.indexOf("/index.php") != -1 || wloc.indexOf("/forum.php") != -1 || wloc == SERVER_HOST + '/' )
            return "forumIndex";
		
		//http://forums.vwvortex.com/forumdisplay.php?5002-Community-and-Lifestyle
		if (wloc.indexOf("/forumdisplay.php") != -1 )
            return "forumDisplay";
            
		//http://forums.vwvortex.com/showthread.php?5137050-wife-dropped-laptop
		if (wloc.indexOf("/showthread.php") != -1 )
            return "showThread";
            
        if (wloc.indexOf("/newreply.php?") != -1 )
			return "newReply";
			
		//http://forums.vwvortex.com/newthread.php?do=newthread&f=
        if (wloc.indexOf("/newthread.php?") != -1 )
			return "newThread";
            
		//http://forums.vwvortex.com/editpost.php?do=editpost&p=
        if (wloc.indexOf("/editpost.php?do=editpost&p=") != -1 )
			return "editPost";
            
        //http://forums.vwvortex.com/usercp.php
		if (wloc.indexOf("/usercp.php") != -1 )
            return "profileUserCPList";
            
        //http://forums.vwvortex.com/search.php?search_type=1#ads=1
		if (wloc.indexOf("/search.php?search_type=1") != -1 )
            return "searchSingleContentType";

        //http://forums.vwvortex.com/search.php
		if (wloc.indexOf("/search.php") != -1 )
            return "searchMultipleContentType";
                                    
        //http://forums.vwvortex.com/profile.php?do=ignorelist
		if (wloc.indexOf("/profile.php?do=ignorelist") != -1 )
            return "profileIgnoreList";

        //http://forums.vwvortex.com/profile.php?do=buddylist
		if (wloc.indexOf("/profile.php?do=buddylist") != -1 )
            return "profileBuddyList";
            
        //http://forums.vwvortex.com/subscription.php?do=viewsubscription&daysprune=-1&folderid=all
		if (wloc.indexOf("/subscription.php?do=viewsubscription&daysprune=-1&folderid=all") != -1 )
            return "profileSubscriptionList";
            		
		//http://forums.vwvortex.com/profile.php?do=editfirevortex
		if (wloc.indexOf("/profile.php?do=editfirevortex") != -1 )
            return "profileFireVortexOptions";

		//http://forums.vwvortex.com/profile.php?do=debugfirevortex
		if (wloc.indexOf("/profile.php?do=debugfirevortex") != -1 )
            return "profileFireVortexDebug";

        //http://forums.vwvortex.com/login.php?do=logout&logouthash=
		if (wloc.indexOf("/login.php?do=logout&logouthash=") != -1 )
            return "logout";
            
        //http://forums.vwvortex.com/profile.php?do=addlist&userlist=ignore&u=72990
		if (wloc.indexOf("/profile.php?do=addlist&userlist=ignore&u=") != -1 )
            return "eggAddIgnore";
            		
		//http://forums.vwvortex.com/misc.php?do=buddylist&focus=1
		if (wloc.indexOf("/misc.php?do=buddylist&focus=1") != -1 || wloc.indexOf("/external.php") != -1 || wloc.indexOf("/misc.php?do=whoposted") != -1 || wloc.indexOf("misc.php?do=getsmilies") != -1)
            return "deadPage";
                 		
        return pageType;
    },

    /**
     * Calls the appropriate page processing functions based on the current
     * page type.
     */
    processPage: function(pageType) {
        
		if (pageType != "deadPage" ) this.everyPageProcessor();
        if (pageType !== null) {
            var pageProcessor = pageType + "PageProcessor";
            if (typeof(this[pageProcessor]) == "function") {
                this[pageProcessor]();
            }
        }
	
    },

    /**
     * Executed on every forum page.
     */
    everyPageProcessor: function() {
		
		FireVortex.UI.Panel.init()
		
		if ( FireVortex.Config.getSuperSizeMe() ) {
			
			FireVortex.Scripts.removeAnnouncements();
			FireVortex.Scripts.removeHeaderAboveBodyBlock();
			FireVortex.Scripts.removeHeaderNavbarNoticeBlock();
			FireVortex.Scripts.removeFooterBelowBodyBlock();
			FireVortex.Scripts.removeFooterBlock();
			FireVortex.Scripts.removeFooterIconsBlock();
			
			if (domainKey != 10) {
				FireVortex.Scripts.removeFooterAdBlock();
			} else {
				FireVortex.Scripts.removeAZAdBlocks();
				FireVortex.Scripts.removeAZFooterLinks();
			}
		}
		
		FireVortex.Scripts.injectFireVortexTitle();
		FireVortex.Scripts.injectFireVortexFooter();
		
		if ( w.LOGGEDIN ) FireVortex.Scripts.injectFireVortexSettingsPopupLink();
		
		//bind 
		if ( FireVortex.Config.getKeyBindHidePage() ) FireVortex.Scripts.hidePage();
		
		
		//start background checks
		if ( w.LOGGEDIN ) FireVortex.Parsers.processinit();
		
    },

	/**
     * Executed on index
     */
    forumIndexPageProcessor: function() {
		FireVortex.Scripts.removeFooterIconsLegend();
		if ( FireVortex.Config.getSuperSizeMe() ) FireVortex.Scripts.removeSidebar();
		
		if ( w.LOGGEDIN && FireVortex.Config.getMyPage() ) {
			$('<div id="fv-my-page" class="collapse wgo_block"></div>').insertBefore('#wgo');
			
			$('#fv-my-page').html('<h2><span id="fv-mypage-refresh">My FireVortex</span></h2><div class="floatcontainer"></div>');

			GM_addStyle('.fv-mypage-p-btn{cursor:pointer;}.fv-forumfeed-contentencoded { display:none; padding-left:0px ! important; max-height: 400px; margin: 0px; overflow: auto; width: 100%; }');
			
			FireVortex.Scripts.injectMyPage();
			
			FireVortex.Scripts.injectMyPageRefresh( FireVortex.Config.getForumRefreshRate() );
		}
	},

    /**
     * Executed on forumdisplay.php pages
     */
    forumDisplayPageProcessor: function() {
		
		FireVortex.Scripts.injectForumDisplayCSS();
		
		//make sure this is a child forum
		if ( isChildForum() ) {
			
			//grab the forum id
			var forumId = getChildForumId();
			
			if ( FireVortex.Config.getSuperSizeMe() ) {
				FireVortex.Scripts.removeHeaderForumSponsorAd();
			}
			
			FireVortex.Scripts.injectFireVortexForumToolPopup();
			
			FireVortex.Scripts.injectForumOwnableFlag();
			
			if ( FireVortex.Config.getThreadUserHighlight() ) {
				
				if ( FireVortex.Config.getThreadUserHighlightVMG() ) FireVortex.Scripts.highlightModeratorThreads();
				if ( w.LOGGEDIN ) {
					if ( FireVortex.Config.getThreadUserHighlightOwn() ) FireVortex.Scripts.highlightOwnThreads();
					if ( FireVortex.Config.getThreadUserHighlightBuddy() ) FireVortex.Scripts.highlightBuddyListThreads();
				}
			}
	
			FireVortex.Scripts.killForumUnderstateClass();
			if ( FireVortex.Config.getPreviewHover() ) FireVortex.Scripts.injectThreadPreview();
			
			if ( FireVortex.Config.getForumKillThreads() ) FireVortex.Scripts.injectKillThreads( forumId );
			if ( FireVortex.Config.getForumKillAllStickies() && isForumFirstPage() ) FireVortex.Scripts.killThreadStickies();
			if ( FireVortex.Config.getForumKillAllLocks() ) FireVortex.Scripts.killThreadLocked();
			
			if ( FireVortex.Config.getFullIgnoreUser() ) FireVortex.Scripts.injectKillIgnoredThreads();
			
			if ( FireVortex.Config.getForumThreadsPreview() && $('div#forumbits ol h2.forumtitle a').length ) FireVortex.Scripts.injectForumPreview( 'div#forumbits ol h2.forumtitle a', false );
			if ( FireVortex.Config.getThreadUserHighlight() && FireVortex.Config.getThreadSubscriptionHighlight() ) FireVortex.Scripts.highlightThreadSubscriptions();
			
			if ( FireVortex.Config.getForumRefresh() ) FireVortex.Scripts.injectForumRefresh( FireVortex.Config.getForumRefreshRate(), false );
	
			if ( isForumFirstPage() && FireVortex.Config.getForumLinkedClassifieds() && domainKey == 0 ) FireVortex.Scripts.injectForumLinkedClassifieds( forumId )
	
		} else { //on a parent foum page
			
			if ( FireVortex.Config.getForumThreadsPreview() ) FireVortex.Scripts.injectForumPreview( 'div#forumbits ol h2.forumtitle a', false );
			if ( FireVortex.Config.getThreadUserHighlight() && FireVortex.Config.getForumSubscriptionHighlight() ) FireVortex.Scripts.highlightForumSubscriptions();

		}
		
    },

    /**
     * Executed on showthread.php pages
     */
    showThreadPageProcessor: function() {
		
		if ( FireVortex.Config.getSuperSizeMe() ) {
			if ( !w.LOGGEDIN ) {
				FireVortex.Scripts.removePostsAdBlock();
				FireVortex.Scripts.removePostControls();
			}
			FireVortex.Scripts.removeHeaderForumSponsorAd();
			FireVortex.Scripts.removeFooterThreadInfo();
			FireVortex.Scripts.removeFooterThreadNavLinks();
		}
		
		if ( FireVortex.Config.getThreadFirstPostExcerpt() && !isThreadFirstPage() ) FireVortex.Scripts.injectThreadFirstPostExcerpt();
		
		if ( FireVortex.Config.getThreadKillQuotedImages() ) FireVortex.Scripts.killThreadQuotedImages();
		if ( FireVortex.Config.getThreadKillQuoteInSigs() ) FireVortex.Scripts.killSignatureQuotes();
		if ( FireVortex.Config.getThreadKillItalicQuotesText() ) FireVortex.Scripts.killItalicQuotesText();
		
		if ( FireVortex.Config.getThreadUserHighlight() ) {
			if ( FireVortex.Config.getThreadUserHighlightVMG() ) FireVortex.Scripts.highlightModeratorPosts();
			if ( FireVortex.Config.getThreadUserHighlightAdvertisers() ) FireVortex.Scripts.highlightAdvertisersPosts();
			if ( w.LOGGEDIN && FireVortex.Config.getThreadUserHighlightOwn() ) {
				FireVortex.Scripts.highlightOwnPosts();
				FireVortex.Scripts.highlightOwnQuotes();
			}
			if ( FireVortex.Config.getThreadUserHighlightBuddy() ) {
				FireVortex.Scripts.highlightBuddyListPosts();
				FireVortex.Scripts.highlightBuddyListQuotes();
			}
		}
		
		if ( FireVortex.Config.getFullIgnoreUser() ) {
			FireVortex.Scripts.injectKillIgnoredQuotes();
			FireVortex.Scripts.injectKillIgnoredPosts();
		}
		
		if ( w.LOGGEDIN ) FireVortex.Scripts.injectPostUserInfoAddIgnore();
		
		FireVortex.Scripts.injectThreadPostCount( getThreadId(), getThreadPage() );
		
		if ( FireVortex.Config.getThreadQuickReply() ) {
			if ( w.LOGGEDIN && domainKey != 10) FireVortex.Scripts.injectThreadQuickReply();
			if ( FireVortex.Config.getEmoticons() ) FireVortex.UI.Emoticons.loadQRHtml();
		}
		
    },

    /**
     * Executed on thread reply page w/editor
     */
    newThreadPageProcessor: function() {
		
		if ( FireVortex.Config.getEmoticons() ) FireVortex.UI.Emoticons.init();
		
	},
    
    /**
     * Executed on thread reply page w/editor
     */
    newReplyPageProcessor: function() {
		
		if ( FireVortex.Config.getEmoticons() ) FireVortex.UI.Emoticons.init();
		
	},

    /**
     * Executed on edit post page w/editor
     */
    editPostPageProcessor: function() {
		
		if ( FireVortex.Config.getEmoticons() ) FireVortex.UI.Emoticons.init();
		
	},    
    
    /**
     * Executed on profile ignorelist page
     */
    profileIgnoreListPageProcessor: function() {
		
		if ( FireVortex.Config.getFullIgnoreUser() ) FireVortex.Parsers.parseIgnoreListPage();
		
	},
    
    /**
     * Executed on profile buddylist page
     */
    profileBuddyListPageProcessor: function() {
		
		FireVortex.Parsers.parseBuddyListPage();
		
	},    

    /**
     * Executed on profile subscription page
     */
    profileSubscriptionListPageProcessor: function() {
		
		FireVortex.Parsers.parseAllThreadSubscriptionsPage();
		
	},
	
	profileUserCPListPageProcessor: function() {
		
		FireVortex.Parsers.parseNewPostThreadSubscriptionsPage();
		FireVortex.Parsers.parseForumSubscriptionsPage();
		
		if ( FireVortex.Config.getForumRefresh() ) FireVortex.Scripts.injectForumRefresh( FireVortex.Config.getForumRefreshRate(), true );
		if ( FireVortex.Config.getForumThreadsPreview() ) FireVortex.Scripts.injectForumPreview( 'div#new_subscribed_forums ol h2.forumtitle a', true );
		
	},
	
	profileFireVortexOptionsPageProcessor: function() {
		FireVortex.UI.Options.init();
	},

	profileFireVortexDebugPageProcessor: function() {
		FireVortex.UI.Debug.init();
	},

    /**
     * Executed on search pages
     */	
    searchSingleContentTypePageProcessor: function() {
		FireVortex.Scripts.injectGoogleSearchTab();
		$("#forumchoice").attr("size","15");
	},

    searchMultipleContentTypePageProcessor: function() {
		FireVortex.Scripts.injectGoogleSearchTab();
	},

    logoutPageProcessor: function() {
		FireVortex.Scripts.logout();
	},

    eggAddIgnorePageProcessor: function() {
		
		//ATL_Av8r
		if ( getUserId() == '72990' ) {
			$('.cp_content .blockrow').append('<span title="go gators!" style=" padding: 5px; color:red;">Ignoring the all knowing ATL_Av8r may cause unpredictable results on the forums. Proceed with caution.</span>');
		}
		//rich!
		if ( getUserId() == '233' ) {
			$('.cp_content .blockrow').append('<span title="go gators!" style=" padding: 5px; color:red;">Avoid ignoring the creator of FireVortex... who knows what might happen.</span>');
		}
		//rich!
		if ( getUserId() == '208927' ) {
			$('.cp_content .blockrow').append('<span style=" padding: 5px; color:red;">Who else would love APR? Don\'t ignore this guy.</span>')
		}
	}
	
};



/**
 * Functions which perform the work of one of the scripts being integrated.
 */
FireVortex.Scripts = {

	/**
	 * remove gradient from forumdisplay page
	 */
	injectForumDisplayCSS: function() { 

		GM_addStyle(".forumbit_post .forumrow, .threadbit .nonsticky, .threadbit .discussionrow { background : none !important }");

		var markx = xpath("//div[@id='above_threadlist']/a[@id='newthreadlink_top']");
		var mark = markx.snapshotItem(0);
		if (!mark) GM_addStyle(".above_threadlist { height: 0 ! important }");
		
	},

	injectFireVortexForumToolPopup: function() {
		$('#forumdisplaypopups').prepend('<li id="fv-forumtools" class="popupmenu nohovermenu"><h6><a class="popupctrl" href="javascript://">FireVortex Forum Tools</a></h6><ul id="fv-forumtools-items" class="popupbody"></ul></li>');
	
		$('#fv-forumtools h6 a').bind('click', function( e ){
			$('#fv-forumtools-items').toggle();
			e.stopPropagation();
		});
		
		$(document).click(function( e ) {
			var $target = $(e.target);
			if ( !$target.is("a.fv-forumtools-item") && $('#fv-forumtools-items').is(':visible')) $('#fv-forumtools-items').hide();
		});	
		
	},
	
	injectFireVortexSettingsPopupLink: function() {
		if (domainKey != 10) $('div#toplinks ul.isuser li.item ul.popupbody').append('<li><a href="'+ SERVER_HOST +'/profile.php?do=editfirevortex">FireVortex Settings</a></li');
	},

	injectGoogleSearchTab: function() {
		
		if (domainKey == 10) { //audizine
			$("#searchtypeswitcher").append('<li><a href="http://www.google.com/cse/home?cx=005144035672644049885:yn55sd6_1ga">Search Forums w/Google</a></li>');
			$("#searchtypeswitcher").append('<li><a href="http://www.google.com/cse/home?cx=005144035672644049885%3Ashxyowilvls">Search Audi-Related Sites w/Google</a></li>');
		} else {
			$("#searchtypeswitcher").append('<li><a href="http://www.google.com/cse/home?cx=005144035672644049885:qas-qk2qt_0">Search Forums w/Google</a></li>');
			$("#searchtypeswitcher").append('<li><a href="http://www.google.com/cse/home?cx=005144035672644049885%3Ashxyowilvls">Search VW-Related Sites w/Google</a></li>');			
		}
		
	},

	logout: function() {
		
		if ( $('.standard_error') ) {
			
			w.localStorage.removeItem('fv_parseprocess' );
			w.localStorage.removeItem('fv_buddylist');
			w.localStorage.removeItem('fv_ignorelist');
			w.localStorage.removeItem('fv_threadsubscriptionlist');
			w.localStorage.removeItem('fv_newpostthreadsubscriptionlist');
			w.localStorage.removeItem('fv_forumsubscriptionlist');
			
		}
		
	},

	/**
	 * inject fancy footer
	 */
	injectFireVortexFooter: function() {
	
		var body = document.body;
		if (body) {
			
			GM_addStyle("#fv-footer-container { overflow: hidden; clear: both; padding: 2px 0 0 0; background: #000; border-top: 3px solid #CE6D0D; margin-top:10px; } #fv-footer { overflow: hidden; width: 90%; margin: 0 auto; padding: 10px 0 0 0; color: #f7f7f7; text-align: center; } #fv-footer a { font-style: normal; color: #aaa; } #fv-footer .fv-copyright .fv-footertagline { display: inline; float: left; margin-right: 9px; }");

			var newFooterContDivElement = document.createElement("div");
			newFooterContDivElement.setAttribute("id","fv-footer-container");

			var newFooterDivElement = document.createElement("div");
			newFooterDivElement.setAttribute("id","fv-footer");
			newFooterDivElement.innerHTML = "<p class='fv-footertagline'><span style='color:#CE6D0D'>.:</span> Enhanced by <a href='http://firevortex.net/about/"+ VERSION.fv +"/'>FireVortex</a> (v."+ VERSION.fv +"BETA) - it will break and missing a ton of features <span style='color:#CE6D0D'>::</span> <a href='http://twitter.com/firevortex' target='_blank'>Twitter</a> <span style='color:#CE6D0D'>::</span> <a href='http://shout.firevortex.net' target='_blank'>SHOUTbox</a> <span style='color:#CE6D0D'>:.</span></p><p id='fv-timer'></p>";

			newFooterContDivElement.appendChild(newFooterDivElement);
			body.insertBefore(newFooterContDivElement, body.nextChild);

		}
		
	},
	
	injectFireVortexTitle: function() {
		$(document).attr('title', $(document)[0].title + ' - Enhanced by FireVortex (v.'+VERSION.fv+'BETA)' );
	},

	injectMyPageRefresh: function( rate ) {
		
		var countDownInterval = 60 * rate;
		var countDownTime = countDownInterval + 1;

		w.refreshTimer = function() {
			countDownTime--;
			if (countDownTime <=0){
				countDownTime = countDownInterval;
				clearTimeout(counter);
				
				//$('#fv-newpostthreadsubscriptionlist').remove();
				//$('#fv-threadsubscriptionlist').remove();
				//$('#fv-forumsubscriptionlist').remove();
			
				//FireVortex.Scripts.injectMyPage();
				
				window.location.reload();
				
				return;
			}
			$('#fv-mypage-refresh').text("My FireVortex - "+ countDownTime +"s");
			
			counter = setTimeout("refreshTimer()", 1000);
		}
		
		w.refreshTimer();

	},

	injectMyPage: function() {

		//
		//subscribed topics w/new posts
		//
		var sublist = getStorageObject( 'fv_newpostthreadsubscriptionlist' );
		
		$('#fv-my-page div.floatcontainer').append( '<div class="wgo_subblock" id="fv-newpostthreadsubscriptionlist"><h3>Subscribed Topics with New Posts - fetched <time class="timeago" datetime="'+ sublist.updated +'"></time></h3><div class="feed-content">loading...</div></div>' );

		var html = '';
		if ( sublist ) {
			for ( var i = 0; i < sublist.threadids.length && i < parseInt( FireVortex.Config.getMyPageItemsNewPostThreadSubscriptions() ); i++ ) {
				html += '<li><h3><a href="'+ SERVER_HOST +'/showthread.php?'+ sublist.threadids[i] +'&goto=newpost">'+ sublist.titles[i] +'</a></h3></li>';
			}			
		} else {
			html += '<li><h3><a href="#">No new posts in topics</a></h3></li>';
		}
		html += '<li><h3><a href="'+ SERVER_HOST +'/usercp.php">View All</a></h3></li>';
		$('div#fv-newpostthreadsubscriptionlist div.feed-content').html( '<ul>'+ html +'</ul>' );
		

		//
		//subscribed topics
		//
		var sublist = getStorageObject( 'fv_threadsubscriptionlist' );

		$('#fv-my-page div.floatcontainer').append( '<div class="wgo_subblock" id="fv-threadsubscriptionlist"><h3>Topic Subscriptions - fetched <time class="timeago" datetime="'+ sublist.updated +'"></time></h3><div class="feed-content">loading...</div></div>' );

		var html = '';
		if ( sublist ) {
			for ( var i = 0; i < sublist.threadids.length && i < parseInt( FireVortex.Config.getMyPageItemsThreadSubscriptions() ); i++ ) {
				html += '<li><h3><a title="'+ sublist.descriptions[i] +'" href="'+ SERVER_HOST +'/showthread.php?'+ sublist.threadids[i] +'">'+ sublist.titles[i] +'</a></h3><p>'+ sublist.descriptions[i] +'</p></li>';
			}			
		} else {
			html += '<li><h3><a href="#">No subscribed topics</a></h3></li>';
		}
		html += '<li><h3><a href="'+ SERVER_HOST +'/subscription.php?do=viewsubscription&daysprune=-1&folderid=all">View All</a></h3></li>';
		$('div#fv-threadsubscriptionlist div.feed-content').html( '<ul>'+ html +'</ul>' );

		//register updated ago timestamp
		$("time.timeago").timeago();

		//
		//rss mashup of all subscribed forums
		//		
		var forumlist = getStorageObject( 'fv_forumsubscriptionlist' );

		if ( forumlist && forumlist.forumids.length ) {
		
			$('#fv-my-page div.floatcontainer').append( '<div class="wgo_subblock" id="fv-forumsubscriptionlist"><h3>All Forum Subscriptions - New Topics</h3><div class="feed-content">loading...</div></div>' );
		
//console.log('FireVortex::injectMyPage::fetching feed => http://forums.vwvortex.com/external.php?type=RSS2&forumids='+ forumlist.forumids.toString());
		
			$.getFeed({
		        url: SERVER_HOST +'/external.php?type=RSS2&forumids='+ forumlist.forumids.toString(),
		        cache: false,
		        success: function(feed) {
		
					var html = '';
					var c = 0;
		
					if ( !$(feed.items).length ) {
						html = 'No new topics found';
					}
		
					$(feed.items).each(function(){
						var $item = $(this);
		
						html += '<li id="fv-mypage-preview-'+ c +'">' +
						'<h3><span class="fv-mypage-p-btn">[p]</span> - <a title="('+ $item.attr("updated") +' by '+ $item.attr("creator") +')" href ="' + $item.attr("link") + '">' + $item.attr("title") + '</a> in <a href="'+ $item.attr("categorydomain") +'">'+ $item.attr("category") +'</a></h3> ' +
						'<p class="fv-forumfeed-description" id="fv-mypage-preview-description-'+ c +'">' + $item.attr("description") + '</p><div id="fv-mypage-preview-contentencoded-'+ c +'" class="fv-forumfeed-contentencoded">'+ $item.attr("content") +'</div>' +
						'</li>';
						c++;
					});
		
					$('div#fv-forumsubscriptionlist div.feed-content').html( '<ul>'+ html +'</ul>' );
					
		        }
		    });
		    
		    
		var hideDelay = 550;
		var hideTimer = null;
     
		var hideFunction = function() {
			if ( hideTimer )
				clearTimeout( hideTimer );
			 
			hideTimer = setTimeout( function() { 
				$('.fv-forumfeed-contentencoded').slideUp("fast", function() {
					//$('.fv-forumfeed-contentencoded').hide();
					$('.fv-forumfeed-description').show();
				});
			}, hideDelay);  
		};

		//first post
		$( '.fv-mypage-p-btn' ).live('mouseover', function() {
        
			if ( !$(this).data('hoverIntentAttached') ) {
            
				$(this).data('hoverIntentAttached', true);
			
//TODO
//store hoverintent settings in about:config app
			
				$(this).hoverIntent ( config = {
					// number = sensitivity threshold (must be 1 or higher)
					sensitivity: 6,
					// number = milliseconds for onMouseOver polling interval
					interval: 450,
					// hoverIntent mouseOver
					over: function() {
					
						if ( hideTimer )  
							clearTimeout( hideTimer );  
						
						var id = $(this).parent().parent().attr('id');

						if ( !id )
							return;

						id = id.substring(18); //fv-mypage-preview-

						//make sure the same preview is not already open otherwise they stack
						if ( !$('#fv-mypage-preview-contenencoded-'+ id).is(":visible") ) {
							
							//allow the mouse to actually hover over the preview post (click links and such)
							$('li#fv-mypage-preview-'+id).mouseover( function() {
								if ( hideTimer )
									clearTimeout( hideTimer );
							});
						   
							// Hide after mouseout  
							$('li#fv-mypage-preview-'+ id).mouseout( hideFunction );
							
							//display it and remove display:block as that shifts everything right
							$('#fv-mypage-preview-contentencoded-'+ id).slideDown("slow", function() {
								 //$(this).css('display','');
								 $('#fv-mypage-preview-description-'+ id).hide();
							});
							
						}

					},
					// number = milliseconds delay before onMouseOut  
					timeout: 350,
					// remove the function
					out: function(){}
				});
			
				$(this).trigger('mouseover');
			
			}
		});
		    
			
		}
		
	},

	injectForumRefresh: function( rate, isUserCP ) {
		
		var countDownInterval = 60 * rate;
		var countDownTime = countDownInterval + 1;

		w.refreshTimer = function() {
			countDownTime--;
			if (countDownTime <=0){
				countDownTime = countDownInterval;
				clearTimeout(counter);
				window.location.reload();
				return;
			}
			$('#fv-thread-refresh-counter').text(countDownTime +"s");
			
			counter = setTimeout("refreshTimer()", 1000);
		}
		
		if (!isUserCP) {
			$("#fv-forumtools-items").append('<li><a class="fv-forumtools-item" id="fv-thread-refresh-counter" href="'+ window.location.href +'">Refreshing...</a></li>');
		} else {
			$('div#usercp_content div.cp_content').prepend('<div class="block" id="fv-usercp-message"><h2 class="blockhead">This page will refresh in <span id="fv-thread-refresh-counter">Refreshing...</span></h2></div><div class="clear"></div>');
		}
		
		w.refreshTimer();
		
	},

	/**
	 * highlight "ownable" pages
	 */
	injectForumOwnableFlag: function() {
		
		$('ul.threadstats li a[class="understate"]').each(function (i) {
			
			var pc = $(this).text();
			pc = pc.replace(",", "");
			pc = parseInt( pc ) + 1;
			if ( ( domainKey != 10 && !(pc % 35) ) || ( domainKey == 10 && !(pc % 40) ) ) $(this).parent().parent().css('cssText', 'background-color : #ccc !important');
			
		}).removeClass('understate');
		
	},

	/**
	 * add quick reply to a thread page
	 */
	injectThreadQuickReply: function() {

		//check if thread is locked
		if ( !isthread_locked() ) {

			GM_addStyle(".fv-vbform { clear: both; margin: 85px auto 2em; width: auto; } .fv-vbform .group { padding-bottom: 5px;} #fvqr-emoticons-btn { padding-right: 5px; } #fvqr-emoticons-panel{ display: none; padding:5px; max-height: 250px; margin-right: 20px; margin-left:20px; overflow: auto; width: 83%; }");
			
			var threadId = $("input[name='searchthreadid']").val();
		
			//$("#newreplylink_top").filter(function() { return this.href.replace(/(.+?)\/newreply.php\?p=(.+?)\&noquote=1/gi,"$2"); });
			var postlink = document.getElementById('newreplylink_top');
			var postId = postlink.href.replace(/(.+?)\/newreply.php\?p=(.+?)\&noquote=1/gi,"$2");
			
			//bb_userid is a protected cookie - can we bust it via firefox internal code?
			var userID = 0;
			//var userID = $.cookie('bb_userid');
			
			var newQR = '<form name="vbform" method="post" action="newreply.php?do=postreply&amp;t='+ threadId +'" class="block fv-vbform"><h2 class="blockhead"><strong>F</strong>ire<strong>V</strong>ortex <strong>Q</strong>uick<strong>R</strong>eply</h2><div class="wysiwyg_block"><div class="blockbody formcontrols"><div class="section"><div class="blockrow texteditor" id="vB_Editor_001"><div class="editor_textbox"><textarea dir="ltr" tabindex="1" cols="80" rows="8" id="vB_Editor_001_textarea" name="message"></textarea></div></div><div class="actionbuttons"><div class="group"><a id="fvqr-emoticons-btn"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAABGdBTUEAAK%2FINwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJnSURBVDjLpZPNS9RhEMc%2Fz29t1d1tfSmhCAwjioqoKNYuYkRRFB300MWT3eooeMn6C4TunYoiOgSKkGAUhh0SjJCwsBdtfQMN17Ta2v39nueZ6WBtktGh5jLDMPPhC%2FMdo6r8T5T93nCPTUqVDhVOi5BRBRVGRBhQ4drGc5pfO2%2FWKnCPTbMKN0x9Z4OpzqDxWlCPFnL45VHCd91ZEdprWnRoHcANmhatbu4JtrShiSr8t9dIuIS6IpgKgoqdGBsQztwj%2FDDUWndee0sAO2hqVZmO7b%2BbkuAzvpgF%2BwVxIeqLqxBRTHk9sfL9fBq%2BkBdh%2B9Y2%2FRgAqNARbO9KaRwkzIL7ymBfDiQCH%2FHkIYjN4z6P4cNJEnu6UuLpAAgARDhrahqRYhZ1BVQsx85UomJRb2lqzqMSojaPW3lOWfUuxHN2LWAv5WnErZSWVCzqItRHP2qL%2BggJc0CI9zSUACoU1BXBOx71PmXq7dzqorc%2Fcsj05BKDD%2BZQsaCKCLFfCjxZbAGIc7R5N%2B9ezTI7uYD6EBXLTHaZiTfLZBrTmCCB%2BDJsyETJSCL029zowaC6nkRynqNNDYw9m2L8xSx4S7LSkMlUkUzEKEsfoJCbxkb0l8643GPqRHifarydEvsGnx9HohXUhYj7eUaIJXdi0qeYvn8x7yw7Dl3WxQCgplUXRWj%2FNnELdBuxdCMmVouKgihBfDMb6k6gieMsvezDRrQfuqyL66w8f8ecFM%2F15N7OhvimfQQbAhCHCz1f59%2ByMNyddZZLh6%2FowB9%2FAWD2pkmJp1OE096TcRE4y4izDDhL95Grf3mmf4nvrQOLvcb%2FmlMAAAAASUVORK5CYII%3D" border="0"/></a><label for="subscribe"><input type="checkbox" value="1" class="dep_ctrl" tabindex="2" name="subscribe" id="subscribe"> Subscribe to this thread</label> <input type="submit" tabindex="1" accesskey="s" value="Submit Reply" id="vB_Editor_001_save" name="sbutton" class="button"></div></div></div><div id="fvqr-emoticons-panel"></div></div><input type="hidden" value="FV-QR" id="title" name="title"><input type="hidden" value="" name="s"><input type="hidden" value="'+ w.SECURITYTOKEN +'" name="securitytoken"><input type="hidden" value="postreply" name="do"><input type="hidden" value="'+ threadId +'" name="t"><input type="hidden" value="0" name="specifiedpost"><input type="hidden" value="" name="posthash"><input type="hidden" value="" name="poststarttime"><input type="hidden" value="'+ userID +'" name="loggedinuser"><input type="hidden" value="" id="multiquote_empty_input" name="multiquoteempty"><input type="hidden" id="cb_parseurl" value="1" name="parseurl"><input type="hidden" id="htmloption" value="on_nl2br" name="htmlstate"><input type="hidden" name="emailupdate" value="0"><input type="hidden" value="'+ postId +'" name="p"><input type="hidden" id="cb_signature" name="signature" value="1"></div></form>';
			$('#below_postlist').append( newQR );
			
			if ( !FireVortex.Config.getEmoticons() ) $('#fvqr-emoticons-btn').remove();
			
			var threadlist = getStorageObject( 'fv_threadsubscriptionlist' );
			if ( threadlist && threadlist.threadids.length ) {
				if ( $.inArray( parseInt(threadId), threadlist.threadids) != -1 ) $('input[name=subscribe]').attr('checked', true);
			}
			
		}
	},
	
	injectThreadFirstPostExcerpt: function() {
		$('div#pagetitle').append('<div id="fv-pageexcerpt">'+ $('meta[name=description]').attr('content').replace( /\n/g, '<br />\n' ) +'</div>');
	},
	
	injectPostUserInfoAddIgnore: function() {
		
	if (domainKey != 10) {
		$('div.userinfo ul.memberaction_body img[src="images/vmg/site_icons/add.png"]').each(function (i) {
		
			var xlink = $(this).next().attr("href");
			var userId = xlink.replace(/profile.php\?do=addlist\&userlist=buddy\&u=(.+?)/gi,"$1"); //profile.php?do=addlist&userlist=buddy&u=320777
		
			$(this).parent().parent().append('<li class="right"><img alt="" src="images/vmg/site_icons/ignore.png"><a href="profile.php?do=addlist&userlist=ignore&u='+ userId +'">Add to Ignore List</a></li>');
		
		});

	} else { //audizine
	
		$('div.userinfo ul.memberaction_body img[src="images/site_icons/add.png"]').each(function (i) {
		
			var xlink = $(this).next().attr("href");
			var userId = xlink.replace(/profile.php\?do=addlist\&userlist=buddy\&u=(.+?)/gi,"$1"); //profile.php?do=addlist&userlist=buddy&u=320777
		
			$(this).parent().parent().append('<li class="left"><img alt="" src="images/site_icons/ignore.png"><a href="profile.php?do=addlist&userlist=ignore&u='+ userId +'">Add to Ignore List</a></li>');
		
		});
	
	}

		
	},

	injectForumPreview: function( selector, isUserCP ) {
		
		GM_addStyle(".fv-preview-popup { clear:both; position: relative; margin: 15px 8px 15px 15px } .fv-preview-popup .content { padding: 5px; max-height: 400px; margin: 0px; overflow: auto; width: 100%; } .fv-preview-popup li { margin-top: 15px; margin-bottom: 15px }");

		var hideDelay = 550;
		var hideTimer = null;
     
		var hideFunction = function() {
			if ( hideTimer )
				clearTimeout( hideTimer );
			 
			hideTimer = setTimeout( function() { 
				$('.fv-preview-popup').slideUp("fast", function() {
					$('.fv-preview-popup').remove();
				});
			}, hideDelay);  
		};  

		$( selector ).each( function (i) {
			
			if (!isUserCP) {
				id = $(this).parent().parent().parent().parent().parent().parent().parent().parent().attr('id')
			} else {
				id = $(this).parent().parent().parent().parent().parent().parent().parent().attr('id');
			}
			
			id = id.substring(5); //forum<forumid>
			
			$(this).parent().prepend('<span class="fv-forumpreview-p-btn" id="'+ id +'">[p]</span> - ').css( 'cursor', 'pointer');
		});

		//first post
		$( '.fv-forumpreview-p-btn' ).live('mouseover', function() {
        
			if ( !$(this).data('hoverIntentAttached') ) {
            
				$(this).data('hoverIntentAttached', true);
			
//TODO
//store hoverintent settings in about:config app
			
				$(this).hoverIntent ( config = {
					// number = sensitivity threshold (must be 1 or higher)
					sensitivity: 6,
					// number = milliseconds for onMouseOver polling interval
					interval: 450,
					// hoverIntent mouseOver
					over: function() {
					
						if ( hideTimer )  
							clearTimeout( hideTimer );  
						
						var id = $(this).attr('id');
					
						if ( !id )
							return;
						
						//make sure the same preview is not already open otherwise they stack
						if ( $('#fv-thread-preview-'+ id).length == 0 ) {

							if (!isUserCP) {
								$(this).parent().parent().parent().parent().parent().parent().parent().after('<div class="fv-preview-popup" style="display:none" id="fv-thread-preview-'+ id +'">fetching first post...</div>');
							} else {
								$(this).parent().parent().parent().parent().parent().parent().after('<div class="fv-preview-popup" style="display:none" id="fv-thread-preview-'+ id +'">fetching first post...</div>');
							}

							$.getFeed({
						        url: SERVER_HOST +'/external.php?type=RSS2&forumids='+ id,
						        cache: false,
						        success: function(feed) {
						
									var html = '<div class="content"><ul>';
						
									if ( !$(feed.items).length ) {
										html = 'No new topics found';
									}
						
									$(feed.items).each(function(){
										var $item = $(this);
						
										html += '<li>' +
										'<h3><a title="('+ $item.attr("updated") +' by '+ $item.attr("creator") +')" href ="' + $item.attr("link") + '">' + $item.attr("title") + '</a></h3> ' +
										'<p>' + $item.attr("description") + '</p>' +
										'</li>';
									});
						
									html += '</ul></div>';
						
									$('#fv-thread-preview-' + id).html( html );
									
						        }
						    });
							
							//allow the mouse to actually hover over the preview post (click links and such)
							$('li#forum'+id).mouseover( function() {
								if ( hideTimer )
									clearTimeout( hideTimer );
							});
						   
							// Hide after mouseout  
							$('li#forum'+id).mouseout( hideFunction );
							
//TODO
//determine page position to slideup or slide down depending on x/y
							
							//display it and remove display:block as that shifts everything right
							$('#fv-thread-preview-' + id).slideDown("slow", function() {
								 $(this).css('display','');
							});
							
						}

					},
					// number = milliseconds delay before onMouseOut  
					timeout: 350,
					// remove the function
					out: function(){}
				});
			
				$(this).trigger('mouseover');
			
			}
		});
		
	},
	
	/**
	 * Add thread preivew to forumdisplay.php
	 */
	injectThreadPreview: function() {

		$('ol#threads div.threadinfo').each(function (i) {
			$(this).removeAttr('title');
		});
		
		GM_addStyle(".fv-preview-p-btn { } .fv-preview-popup { clear:both; position: relative; margin: 15px 8px 15px 15px } .fv-preview-popup .content { padding: 5px; max-height: 400px; margin: 0px; overflow: auto; width: 100%; }");

		var hideDelay = 550;
		var hideTimer = null;
     
		var hideFunction = function() {
			if ( hideTimer )
				clearTimeout( hideTimer );
			 
			hideTimer = setTimeout( function() { 
				$('.fv-preview-popup').slideUp("fast", function() {
					$('.fv-preview-popup').remove();
				});
			}, hideDelay);  
		};
		
		//insert preview button
		$('ol#threads h3.threadtitle').each( function (i) {
			var id = $(this).find('a.title').attr('id');
			id = id.substring(13); //thread_title_<threadid>
			$(this).prepend('<span class="fv-preview-p-btn" id="'+ id +'">[p]</span> - ').css( 'cursor', 'pointer');
		});

		//first post
		$('ol#threads h3.threadtitle span.fv-preview-p-btn').live('mouseover', function() {
        
			if ( !$(this).data('hoverIntentAttached') ) {
            
				$(this).data('hoverIntentAttached', true);
			
//TODO
//store hoverintent settings in about:config app
			
				$(this).hoverIntent ( config = {
					// number = sensitivity threshold (must be 1 or higher)
					sensitivity: 6,
					// number = milliseconds for onMouseOver polling interval
					interval: 450,
					// hoverIntent mouseOver
					over: function() {
					
						if ( hideTimer )  
							clearTimeout( hideTimer );  
						
						var id = $(this).attr('id');
					
						if ( !id )
							return;
						
						//make sure the same preview is not already open otherwise they stack
						if ( $('#fv-thread-preview-'+ id).length == 0 ) {

							$(this).parent().parent().parent().parent().after('<div class="fv-preview-popup" style="display:none" id="fv-thread-preview-'+ id +'">fetching first post...</div>');
							
							//send out ajax request
							$('#fv-thread-preview-' + id).load( SERVER_HOST + "/printthread.php" + " li#post_1 .content", "t="+ id +"&pp=35&page=1", null, function (responseText, textStatus, XMLHttpRequest) {
								if (textStatus == success) {
									return $(this).html();
								}
								if (textStatus == error) {
									return 'something went wrong'
								}
							});
							
							//allow the mouse to actually hover over the preview post (click links and such)
							$('li#thread_'+id).mouseover( function() {
								if ( hideTimer )
									clearTimeout( hideTimer );
							});
						   
							// Hide after mouseout  
							$('li#thread_'+id).mouseout( hideFunction );
							
//TODO
//determine page position to slideup or slide down depending on x/y
							
							//display it and remove display:block as that shifts everything right
							$('#fv-thread-preview-' + id).slideDown("slow", function() {
								 $(this).css('display','');
							});
							
						}

					},
					// number = milliseconds delay before onMouseOut  
					timeout: 350,
					// remove the function
					out: function(){}
				});
			
				$(this).trigger('mouseover');
			
			}
		});
		
		//last post
		$('ol#threads dl.threadlastpost a.lastpostdate').live('mouseover', function() {
        
			if ( !$(this).data('hoverIntentAttached') ) {
            
				$(this).data('hoverIntentAttached', true);
			
				$(this).hoverIntent ( config = {
					// number = sensitivity threshold (must be 1 or higher)
					sensitivity: 6,
					// number = milliseconds for onMouseOver polling interval
					interval: 450,
					// hoverIntent mouseOver
					over: function() {
					
						if ( hideTimer )  
							clearTimeout( hideTimer );  
						
						var page = $(this).attr('href');
						
						if (page.indexOf('page=') != -1) {
							page = page.substring( page.indexOf('page=')+5, page.indexOf('#post') ); //showthread.php?p=69275576&page=2#post69275576
						} else {
							page = '1';
						}
						
						if ( !page )
							return;
						
						var id = $(this).parent().parent().parent().parent().attr('id');
						id = id.substring(7); //thread_<threadid>
					
						if ( !id )
							return;
						
						//make sure the same preview is not already open otherwise they stack
						if ( $('#fv-thread-preview-'+ id).length == 0 ) {

							$(this).parent().parent().parent().after('<div class="fv-preview-popup" style="display:none" id="fv-thread-preview-'+ id +'">fetching last post...</div>');
							
							//send out ajax request
							$('#fv-thread-preview-' + id).load( SERVER_HOST + "/printthread.php" + " li.postbit:last .content", "t="+ id +"&pp=35&page="+page, null, function (responseText, textStatus, XMLHttpRequest) {
								if (textStatus == success) {
									return $(this).html();
								}
								if (textStatus == error) {
									return 'something went wrong'
								}
							});
							
							//allow the mouse to actually hover over the preview post (click links and such)
							$('li#thread_'+id).mouseover( function() {
								if ( hideTimer )
									clearTimeout( hideTimer );
							});
						   
							// Hide after mouseout  
							$('li#thread_'+id).mouseout( hideFunction );
							
							//display it and remove display:block as that shifts everything right
							$('#fv-thread-preview-' + id).slideDown("slow", function() {
								 $(this).css('display','');
							});
							
						}

					},
					// number = milliseconds delay before onMouseOut  
					timeout: 350,
					// remove the function
					out: function(){}
				});
			
				$(this).trigger('mouseover');
			
			}
		});

	},
	
	injectThreadPostCount: function(id, page) {
		
		GM_addStyle('.fv-post-count { text-align: center; padding: 2px;  }');
		
		i = $("#postlist ol#posts li.postcontainer").length;

		if (domainKey != 10) {
			if (i == 35) {
				innerStuff = 'last post for current page';
			} else {
				i = 35 - i;
				innerStuff = i + ' posts left for current page';
			}
		} else {
			if (i == 40) {
				innerStuff = 'last post for current page';
			} else {
				i = 40 - i;
				innerStuff = i + ' posts left for current page';
			}		
		}
			
		if (domainKey == 0) {
			if (page && page != '1') {
				innerStuff = innerStuff + ' - Short Url: <a href="http://tinytex.com/'+ id +'/'+ page +'">http://tinytex.com/'+ id +'/'+ page +'</a>';
			} else {
				innerStuff = innerStuff + ' - Short Url: <a href="http://tinytex.com/'+ id +'">http://tinytex.com/'+ id +'</a>';
			}
		}
		
		$("ol#posts").append('<li class="postbitlegacy postbitim postcontainer"><div class="fv-post-count">'+ innerStuff +'</div></li>');
		
	},
	
	injectKillThreads: function( fid ) {
		
		GM_addStyle(".fv-killthread-x { color: red; } .fv-killthread-r { color: green !important } .iskilled { background-color: #FF6633; !important }");
		
		//pull kill thread list for given forum
		var forumKills = getStorageObject('fv_killedthreads_'+ fid );

		//loop over threads and kill
		if ( FireVortex.Config.getForumKillAllStickies() ) {
			selector = "ol#threads li div.threadmeta div.author";
		} else {
			selector = "ol#stickies li div.threadmeta div.author, ol#threads li div.threadmeta div.author";
		}
		
		$(selector).each(function (i) {
			
			var id = $(this).parent().parent().parent().parent().parent().attr('id');
			id = parseInt( id.substring(7) ); //thread_<threadid>
			
			if ( forumKills && $.inArray( id , forumKills) != -1 ) {
				$(this).parent().parent().parent().parent().parent().hide();
				$(this).parent().parent().parent().parent().parent().addClass('iskilled')
				$(this).append(' - <span class="fv-killthread fv-killthread-r" title="re-Add this topic!">[+]</span>');
			} else {
				$(this).append(' - <span class="fv-killthread fv-killthread-x" title="Kill this topic!">[x]</span>');
			}
			
		});
		
		$('span.fv-killthread').live('click', function() {
			
			var fid = getChildForumId();
			var forumKills = getStorageObject('fv_killedthreads_'+ fid );
			if ( !forumKills ) forumKills = new Array();

			var id = $(this).parent().parent().parent().parent().parent().parent().attr('id');
			id = parseInt( id.substring(7) ); //thread_<threadid>
			var i = $.inArray( id , forumKills );
			
			if ( i != -1 ) {
				forumKills.splice(i, 1);
				$(this).parent().parent().parent().parent().parent().parent().removeClass('iskilled');
				$(this).removeClass('fv-killthread-r').addClass('fv-killthread-x').attr('title','Kill this topic!').text('[x]');
			} else {
				forumKills.push(id);
				$(this).parent().parent().parent().parent().parent().parent().addClass('iskilled');
				$(this).removeClass('fv-killthread-x').addClass('fv-killthread-r').attr('title','re-Add this topic!').text('[+]');
				if ( $('#fv-toggle-kill-threads').text() === 'Show Killed' ) $(this).parent().parent().parent().parent().parent().parent().slideUp('slow'); //if we toggled to display killed threads, then display
			}
			
			setStorageObject('fv_killedthreads_'+ fid , forumKills);
			
			$('span#fv-count-kill-threads').text( forumKills.length );
			
		}).css( 'cursor', 'pointer');
		
//TODO
//check if killed threads then add menu item
			//add a toggle to the forum tools popup link
			$("#fv-forumtools-items").append('<li><a class="fv-forumtools-item" id="fv-toggle-kill-threads">Show Killed</a></li>');
			
			//add toggle effect
			$('#fv-toggle-kill-threads').bind('click', function(){
				$('ol li.iskilled').slideToggle('slow', function() {
					$("#fv-toggle-kill-threads").text($(this).is(':visible') ? "Hide Killed" : "Show Killed");
				});
			}).css( 'cursor', 'pointer');

			//add a toggle to the forum tools popup link
			if (forumKills) {
				$("#fv-forumtools-items").append('<li><a class="fv-forumtools-item" id="fv-clear-kill-threads">Clear Forum Kills (<span id="fv-count-kill-threads">'+ forumKills.length +'</span>)</a></li>');
			} else {
				$("#fv-forumtools-items").append('<li><a class="fv-forumtools-item" id="fv-clear-kill-threads">Clear Forum Kills (<span id="fv-count-kill-threads">0</span>)</a></li>');
			}
			
			//add toggle effect
			$('#fv-clear-kill-threads').bind('click', function() {
				var fid = getChildForumId();
				w.localStorage.removeItem('fv_killedthreads_'+ fid);
				window.location.reload();
			}).css( 'cursor', 'pointer');
		
	},
	
	/**
	 * remove stickies and add toggle to forum tools
	 */
	killThreadStickies: function() {

		//check if stickes then add menu item		
		if ( $("ol#stickies").length ) {
		
			GM_addStyle('div.sticky { background : none; background-color: #FFFFCC !important; }');
			
			//remove the sticky threads first
			$("ol#stickies").hide();

			//add a toggle to the forum tools popup link
			$("#fv-forumtools-items").append('<li><a class="fv-forumtools-item" id="fv-toggle-stickies">Show Stickies</a></li>');
			
			//add toggle effect
			$('#fv-toggle-stickies').bind('click', function(){
				$('ol#stickies').slideToggle('slow', function() {
					$("#fv-toggle-stickies").text($(this).is(':visible') ? "Hide Stickies" : "Show Stickies");
				});
			}).css( 'cursor', 'pointer');
		}

	},

	/**
	 * remove locked threads and add toggle to forum tools
	 */
	killThreadLocked: function() {
		
		//check if locked then add menu item
		if ( $("ol#threads li.lock").length ) {
		
			//GM_addStyle('div.lock { background-color: #FFFFCC ! important; }');
		
			//remove the sticky threads first
			$("ol#threads li.lock").hide();

			//add a toggle to the forum tools popup link
			$("#fv-forumtools-items").append('<li><a class="fv-forumtools-item" id="fv-toggle-locked">Show Locked</a></li>');
			
			//add toggle effect
			$('#fv-toggle-locked').bind('click', function(){
				$('ol#threads li.lock').slideToggle('slow', function() { 
					$("#fv-toggle-locked").text($(this).is(':visible') ? "Hide Locked" : "Show Locked");
				});
			}).css( 'cursor', 'pointer');
			
		}

	},

	/**
	 * remove any quoted images in posts and replace with link
	 */
	killThreadQuotedImages: function() {

		if ( $(".quote_container .message img").length ) {

			GM_addStyle('#fv-quoted-img-preview { display: none;position: absolute;color: #FFFFFF;background: #333333;padding: 2px; } #fv-quoted-img-preview img { max-width: 450px; }');

			$('body').append('<div id="fv-quoted-img-preview"></div>');
	
			//.find("img:not([@src^=(?:(?!vwvortex.com).)+$])")
			$(".quote_container .message img").each(function (i) {
				thesrc = $(this).attr("src");
				if ( thesrc.indexOf("vwvortex.com") == -1 && thesrc.indexOf("e.tinytex.com") == -1 ) $(this).replaceWith("<div class='fv-quoted-img'>img: <a class='fv-quoted-img-a' href='"+ thesrc +"'>"+ thesrc +"</a></div>");
			});
			
			$(".fv-quoted-img-a").hover( function(e) {
				$("#fv-quoted-img-preview").css("top",(e.pageY+5)+"px").css("left",(e.pageX+5)+"px").html("<img src="+ $(this).attr("href") +" />").fadeIn("slow"); 
			}, function() {
				$("#fv-quoted-img-preview").fadeOut("fast");
			});
		
		
		}
		
	},

	/**
	 * remove any quotes in signatures
	 */
	killSignatureQuotes: function() {
		$("ol#posts .after_content .signaturecontainer .bbcode_quote").remove();
	},
	
	killItalicQuotesText: function() {
		GM_addStyle('.content .bbcode_container div.bbcode_quote { font-style:normal ! important; }');
	},
	
	killForumUnderstateClass: function() {
		$("ol#threads .label a").removeClass('understate');
	},


	/**
	 * highlight advertisers posts in threads
	 */
	highlightAdvertisersPosts: function() {

		$('div.userinfo span.usertitle:contains("Forum Sponsor"), div.userinfo span.usertitle:contains("Forum Advertiser")').each(function (i) {
			$(this).parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorForum() +' !important');
			$(this).parent().parent().css('cssText', 'background-color : #BDCAD7 !important');
		});

		$('div.userinfo span.usertitle:contains("Banner Advertiser")').each(function (i) {
			$(this).parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorBanner() +' !important');
			$(this).parent().parent().css('cssText', 'background-color : #BDD7BD !important');
		});

		$('div.userinfo span.usertitle:contains("Classified Advertiser")').each(function (i) {
			$(this).parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorClassified() +'!important');
			$(this).parent().parent().css('cssText', 'background-color : #E5BDBD !important');
		});

	},

	/**
	 * highlight own posts in threads
	 */
	highlightOwnPosts: function() {
		$('div.userinfo div.username_container strong:contains("'+ unescape( userName ) +'")').each(function (i) {
			$(this).parent().parent().parent().parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorOwn() +' !important');
			$(this).parent().parent().parent().parent().parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorOwn() +' !important');
		});
	},

	highlightOwnQuotes: function() {	
		//loop over quotes
		$('ol#posts .postrow div.bbcode_postedby strong:contains("'+ unescape( userName ) +'")').each(function (i) {
			$(this).parent().parent().parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorOwn() +' !important');
		});
		
	},

	/**
	 * highlight own thread topics (if started or last posted)
	 */
	highlightOwnThreads: function() {
		
		//threaded started by
		var markx = xpath("//ol[@id='threads']//div[@class='threadmeta']//div[@class='author']/span/a[text() = '"+ unescape( userName ) +"']");
		if (markx) {
			for (var i = 0; i < markx.snapshotLength; i++) {
				var mark = markx.snapshotItem(i);
				if (mark) mark.parentNode.parentNode.parentNode.parentNode.parentNode.setAttribute('style','background-color: '+ FireVortex.Config.getThreadUserHighlightColorOwn() +' !important');
			}
		}		
		
		//last reply by
		var markx = xpath("//ol[@id='threads']//dl[@class='threadlastpost td']/dd/div/a/strong[text() = '"+ unescape( userName ) +"']");
		if (markx) {
			for (var i = 0; i < markx.snapshotLength; i++) {
				var mark = markx.snapshotItem(i);
				if (mark) mark.parentNode.parentNode.parentNode.parentNode.setAttribute('style','background-color: '+ FireVortex.Config.getThreadUserHighlightColorOwn() +' !important');
			}
		}
		
	},
	
	/**
	 * highlight moderator posts
	 */
	highlightModeratorPosts: function() {

		$('div.userinfo span.usertitle span:contains("Moderator"), div.userinfo span.usertitle:contains("Moderator")').each(function (i) {
			if (domainKey != 10) { 
				$(this).parent().parent().css('cssText', 'background-color : #ABCEF2 !important');
				$(this).parent().parent().parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorVMG() +' !important'); 
			} else { 
				$(this).parent().css('cssText', 'background-color : #ABCEF2 !important');
				$(this).parent().parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorVMG() +' !important'); 
			}
		});

		$('div.userinfo span.usertitle span:contains("Administrator"), div.userinfo span.usertitle:contains("Administrator"), div.userinfo span.usertitle span:contains("VMG Staff")').each(function (i) {
			if (domainKey != 10) { 
				$(this).parent().parent().css('cssText', 'background-color : #ABCEF2 !important');
				$(this).parent().parent().parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorVMG() +' !important');
			} else {
				$(this).parent().css('cssText', 'background-color : #ABCEF2 !important');
				$(this).parent().parent().css('cssText', 'background-color : '+ FireVortex.Config.getThreadUserHighlightColorVMG() +' !important');
			}
		});
		
	},
	
	/**
	 * highlight moderator thread topics (if started or last posted)
	 */
	highlightModeratorThreads: function() {
		
		var mods = new Array();
		
		//find all moderators for the current forum
		var xmods = xpath("//div[@id='forum_moderators']/ul/li/a");
		if (xmods) {
			for (var i = 0; i < xmods.snapshotLength; i++) {
				var mod = xmods.snapshotItem(i);
				if (mod) mods.push( mod.textContent );
			}
		}
		
		//threaded started by
		for (var j = 0; j < mods.length; j++) {
			var markx = xpath("//ol[@id='threads']//div[@class='threadmeta']//div[@class='author']/span/a[text() = '"+ unescape( mods[j] ) +"']");
			var mark = markx.snapshotItem(0);
			if (mark) mark.parentNode.parentNode.parentNode.parentNode.parentNode.setAttribute('style','background-color: '+ FireVortex.Config.getThreadUserHighlightColorVMG() +' !important');
		}
		
		//last reply by
		for (var j = 0; j < mods.length; j++) {
			var markx = xpath("//ol[@id='threads']//dl[@class='threadlastpost td']/dd/div/a/strong[text() = '"+ unescape( mods[j] ) +"']");
			var mark = markx.snapshotItem(0);
			if (mark) mark.parentNode.parentNode.parentNode.parentNode.setAttribute('style','background-color: '+ FireVortex.Config.getThreadUserHighlightColorVMG() +' !important');
		}
		
	},
	
	highlightBuddyListThreads: function() {
		
		var buddylist = getStorageObject( 'fv_buddylist' );

		if (buddylist) {
			GM_addStyle(".isbuddy { background-color: "+ FireVortex.Config.getThreadUserHighlightColorBuddy() +" !important; }");
			
			//loop over threads
			$("ol#threads li div.threadmeta div.author a.username").each(function (i) {
				var id = $(this).attr('href');
				id = parseInt( id.substring(11,id.indexOf('-') ) ); //member.php?16242-Karma
				
				if ( $.inArray( id , buddylist.userids) != -1 ) $(this).parent().parent().parent().parent().parent().parent().parent().addClass('isbuddy');
			});

//TODO
//loop over last post
			
		}
		
	},
	

	highlightForumSubscriptions: function() {
		
		var forumlist = getStorageObject( 'fv_forumsubscriptionlist' );

		if ( forumlist && forumlist.forumids.length ) {
			GM_addStyle(".issub { background-color: "+ FireVortex.Config.getForumSubscriptionHighlightColor() +" !important; }");
			
			for ( var i = 0; i < forumlist.forumids.length; i++ ) {
				$("#forum"+ forumlist.forumids[i] ).addClass('issub');
			}
			
		}
		
	},
	highlightThreadSubscriptions: function() {
		
		var threadlist = getStorageObject( 'fv_threadsubscriptionlist' );

		if ( threadlist && threadlist.threadids.length ) {
			GM_addStyle(".issub { background-color: "+ FireVortex.Config.getThreadSubscriptionHighlightColor() +" !important; }");
			
			for ( var i = 0; i < threadlist.threadids.length; i++ ) {
				$("li#thread_"+ threadlist.threadids[i] ).addClass('issub');
			}
			
		}
		
	},
	
	highlightBuddyListPosts: function() {
		
		var buddylist = getStorageObject( 'fv_buddylist' );

		if (buddylist && buddylist.userids.length ) {
			GM_addStyle(".isbuddy { background-color: "+ FireVortex.Config.getThreadUserHighlightColorBuddy() +" !important; }");
			
			//loop over threads
			$("ol#posts div.userinfo div.username_container a.username").each(function (i) {
				var id = $(this).attr('href');
				id = parseInt( id.substring(11,id.indexOf('-') ) ); //member.php?16242-Karma
				
				if ( $.inArray( id , buddylist.userids) != -1 ) {
					$(this).parent().parent().parent().addClass('isbuddy');
					$(this).parent().parent().parent().parent().addClass('isbuddy');
				}
			});
		}
		
	},
	
	highlightBuddyListQuotes: function() {
		
		var buddylist = getStorageObject( 'fv_buddylist' );

		if (buddylist && buddylist.usernames.length ) {
			GM_addStyle(".isbuddy { background-color: "+ FireVortex.Config.getThreadUserHighlightColorBuddy() +" !important; }");
			
			//loop over quotes
			$("ol#posts .postrow div.bbcode_postedby strong").each(function (i) {
				var usern = $(this).text();
				
				if ( $.inArray( usern , buddylist.usernames) != -1 ) $(this).parent().parent().parent().addClass('isbuddy');
			});
		}
	},
	
	injectKillIgnoredThreads: function() {
		
		var ignorelist = getStorageObject( 'fv_ignorelist' );

		if (ignorelist && ignorelist.userids.length ) {
			
			GM_addStyle(".isignored { background-color: "+ FireVortex.Config.getThreadUserHighlightColorIgnore() +" !important; }");
			
			//loop over threads and kill
			$("ol#threads li div.threadmeta div.author a.username").each(function (i) {
				
				var id = $(this).attr('href');
				id = parseInt( id.substring(11,id.indexOf('-') ) ); //member.php?16242-Karma
				
				if ( $.inArray( id , ignorelist.userids) != -1 ) {
					$(this).parent().parent().parent().parent().parent().parent().parent().hide();
					$(this).parent().parent().parent().parent().parent().parent().parent().addClass('isignored')
				}
			});

			//check if ignored then add menu item
			if ( $('ol#threads li.isignored').length ) {
				//add a toggle to the forum tools popup link
				$("#fv-forumtools-items").append('<li><a class="fv-forumtools-item" id="fv-toggle-ignored-threads">Show Ignored</a></li>');
			
				//add toggle effect
				$('#fv-toggle-ignored-threads').bind('click', function(){
					$('ol#threads li.isignored').slideToggle('slow', function() {
						$("#fv-toggle-ignored-threads").text($(this).is(':visible') ? "Hide Ignored" : "Show Ignored");
					});
				}).css( 'cursor', 'pointer');
			}
			
		}
	},
	
	injectKillIgnoredQuotes: function() {
		
		var ignorelist = getStorageObject( 'fv_ignorelist' );

		if (ignorelist && ignorelist.usernames.length ) {
			GM_addStyle(".isignored { background-color: "+ FireVortex.Config.getThreadUserHighlightColorIgnore() +" !important; }");
			
			//loop over quotes
			$("ol#posts div.bbcode_postedby strong").each(function (i) {
				var usern = $(this).text();

				if ( $.inArray( usern, ignorelist.usernames) != -1 ) {
					$(this).parent().parent().parent().addClass('isignored');
					$(this).parent().next().addClass('fv-ignored-quote').hide();	
				}
			});
			
//TODO
// add a firevortex thread tools - show quoted toggle (also - ignore toggle fetch post via vbul ajax)
			
		}
	},
	
	injectKillIgnoredPosts: function() {

		$("ol#posts .postbitignored").each(function (i) {
			$(this).addClass('isignored');
			$(this).find('.posthead').append('<span style="color:red">Post Ignored</span>')
			$(this).find('.userinfo').hide();
			$(this).find('.postbody').hide();
		});
		
//TODO
// add a firevortex thread tools - show quoted toggle (also - ignore toggle fetch post via vbul ajax)

	},
	
	injectForumLinkedClassifieds: function(id) {
		
		var linkedClassifieds = {
			"0" : {
				"2":"808,809", "3":"810,811", "4":"812,813", "5":"824,825", "7":"818,819", "9":"838,839", "6":"820,821", "8":"826,827", "10":"531,899", "11":"802,807", "13":"832,833", "25":"812,813", "26":"529,903", "39":"828,829", "71":"834,835", "112":"1133,1135,", "142":"816,817", "145":"814,815", "152":"836,837", "549":"530,904",  "550":"529,903", "728":"822,823", "731":"855,907", "786":"984,985", "865":"1056,1057", "970":"1150,1151", "1149":"1152,1153", "1062":"1179,1180", "1061":"1181,1182", "1136": "1188,1189", "1051":"1071,1072", "548":"532,902", "870":"1049,1050"
			}
		};

		if (  linkedClassifieds[domainKey][id] ) {

			$('<div id="fv-linked-classifieds" class="forum_info"><div class="collapse"><h4 class="forumoptiontitle"><span class="optiontitle">Linked Classifieds</span></h4></div><div class="forum_info_block"><div class="forum_info_subblock" id="fv-forumclassifiedslist"><div class="feed-content">loading...</div></div></div></div>').insertBefore('#breadcrumb_two');

			$.getFeed({
		        url: SERVER_HOST +'/external.php?type=RSS2&forumids='+ linkedClassifieds[domainKey][id],
		        cache: false,
		        success: function(feed) {
		
					var html = '';
					var c = 0;
					
					if ( !$(feed.items).length ) {
						fids = linkedClassifieds[domainKey][id].split(',');
						html = 'No new topics found - check out the <a href="/forumdisplay.php?'+ fids[0] +'">Parts</a> and <a href="/forumdisplay.php?'+ fids[1] +'">Cars</a> classifieds.';
					}
					
					$(feed.items).each( function() {
						var $item = $(this);
		
						html += '<li id="fv-forumfeed-preview-'+ c +'">' +
						'<h3><span class="fv-forumfeed-p-btn">[p]</span> - <a title="('+ $item.attr("updated") +' by '+ $item.attr("creator") +')" href ="' + $item.attr("link") + '">' + $item.attr("title") + '</a> in <a href="'+ $item.attr("categorydomain") +'">'+ $item.attr("category") +'</a></h3> ' +
						'<p class="fv-forumfeed-description" id="fv-forumfeed-preview-description-'+ c +'">' + $item.attr("description") + '</p><div id="fv-forumfeed-preview-contentencoded-'+ c +'" class="fv-forumfeed-contentencoded">'+ $item.attr("content") +'</div>' +
						'</li>';
						c++;
					});
		
					$('div#fv-forumclassifiedslist div.feed-content').html( '<ul>'+ html +'</ul>' );
					
		        }
		    });
		    
			GM_addStyle('.forum_info{ font-size: 12px ! important } .forum_info_subblock ul li { margin-bottom: 8px; ! important}.fv-forumfeed-p-btn{cursor:pointer;}.fv-forumfeed-contentencoded { display:none; padding-left:0px ! important; max-height: 400px; margin-top: 8px; overflow: auto; width: 100%; }');

		    
			var hideDelay = 550;
			var hideTimer = null;
	     
			var hideFunction = function() {
				if ( hideTimer )
					clearTimeout( hideTimer );
				 
				hideTimer = setTimeout( function() { 
					$('.fv-forumfeed-contentencoded').slideUp("fast", function() {
						//$('.fv-forumfeed-contentencoded').hide();
						$('.fv-forumfeed-description').show();
					});
				}, hideDelay);  
			};
	
			//first post
			$( '.fv-forumfeed-p-btn' ).live('mouseover', function() {
	        
				if ( !$(this).data('hoverIntentAttached') ) {
	            
					$(this).data('hoverIntentAttached', true);
				
	//TODO
	//store hoverintent settings in about:config app
				
					$(this).hoverIntent ( config = {
						// number = sensitivity threshold (must be 1 or higher)
						sensitivity: 6,
						// number = milliseconds for onMouseOver polling interval
						interval: 450,
						// hoverIntent mouseOver
						over: function() {
						
							if ( hideTimer )  
								clearTimeout( hideTimer );  
							
							var id = $(this).parent().parent().attr('id');
	
							if ( !id )
								return;
	
							id = id.substring(21); //fv-forumfeed-preview-
	
							//make sure the same preview is not already open otherwise they stack
							if ( !$('#fv-forumfeed-preview-contenencoded-'+ id).is(":visible") ) {
								
								//allow the mouse to actually hover over the preview post (click links and such)
								$('li#fv-forumfeed-preview-'+id).mouseover( function() {
									if ( hideTimer )
										clearTimeout( hideTimer );
								});
							   
								// Hide after mouseout  
								$('li#fv-forumfeed-preview-'+ id).mouseout( hideFunction );
								
								//display it and remove display:block as that shifts everything right
								$('#fv-forumfeed-preview-contentencoded-'+ id).slideDown("slow", function() {
									 //$(this).css('display','');
									 $('#fv-forumfeed-preview-description-'+ id).hide();
								});
								
							}
	
						},
						// number = milliseconds delay before onMouseOut  
						timeout: 350,
						// remove the function
						out: function(){}
					});
				
					$(this).trigger('mouseover');
				
				}
			});

		}
		
	},
	
	
	hidePage: function() {
		
		$(document).ready(function() {
			var isCtrl = false;
			$( document ).keyup( function (e) {
				if( e.which == 18 ) isCombo = false;
			}).keydown( function (e) {
				if( e.which == 18 ) isCombo = true;
				if( e.which == 90 && isCombo == true  ) {
					$("body").toggle();
				}
			});
		});
		
	},
	
	//
	//remove all the extra crap we don't want to see
	//
	
	removeSidebar: function() {
		$("#sidebar_container").remove();
		GM_addStyle("#content_container #content { margin-right: 0px !important; }");
	},
	
	removePostControls: function() {
		$(".postfoot").remove();
	},

	removeAnnouncements: function() {
		$("#announcements").remove();
	},

	removeFooterIconsBlock: function() {
		$("#forum_info_options .options_block_container").remove();
	},
	
	removeFooterIconsLegend: function() {
		$("div#wgo_legend").remove();
	},
	
	removeFooterAdBlock: function() {
		$("#ad_global_above_footer").remove();
	},

	removeFooterBlock: function() {
		$("#footer").remove();
	},
	
	removeFooterBelowBodyBlock: function() {
		$(".below_body #footer_time").parent().remove();
	},
	
	removeFooterThreadInfo: function() {
		$(".thread_info").remove();
	},
	
	removeFooterThreadNavLinks: function() {
		$(".body_wrapper .navlinks").remove();
	},
	
	removeHeaderAboveBodyBlock: function() {
		if (domainKey != 10) {
			$(".above_body #header").remove();
		} else {
			$("#topNavLeftStretch").parent().remove();
		}
	},
	
	removeHeaderNavbarNoticeBlock: function() {
		$("#navbar_notice_1").parent().remove();
	},
	
	removeHeaderForumSponsorAd: function() {
		$("#ad_global_below_navbar").remove();
	},
	
	removePostsAdBlock: function() {
		var markx = xpath("//div[@id='postlist']/ol[@id='posts']/li[contains(@style, 'text-align: center')]");
		var mark = markx.snapshotItem(0);
		if (mark) mark.style.display = 'none';
	},
	
	removeAZAdBlocks: function() {
		$('.body_wrapper').prev().prev().prev().remove();
		$('#below_postlist #pagination_bottom div:last-child').remove();
		$('ins').remove();
	},
	
	removeAZFooterLinks: function() {
		$('.footerLeft').parent().parent().parent().remove();
		
	}
	
};

/**
 * 
 * routines to parse out data from certain forum pages
 *  
 */
FireVortex.Parsers = {
	
	processinit: function() {
		var doProcess = false;
		var starttimestamp = new Date();
		
		var parsetimestamp = getStorageObject( 'fv_parseprocess' );
		
		if (parsetimestamp) {
			delta = ( starttimestamp.getTime() - (new Date(parsetimestamp.starttime)).getTime() ) / 1000;
			if ( (FireVortex.Config.getParseRefreshRate() * 60) < delta ) {
				doProcess = true;
//console.log('FireVortex.Parsers::processinit: process check => '+ FireVortex.Config.getParseRefreshRate() * 60 +' < '+ delta);
			}
		} else {
			parsetimestamp = { "endtime" : null, "starttime" : null, "pagestime" : { "buddylist" : null, "ignorelist" : null, "usercp" : null, "subscription" : null } };
			doProcess = true;
		}
		
		if ( doProcess ) {
			parsetimestamp.starttime = starttimestamp;
			setStorageObject('fv_parseprocess' , parsetimestamp);
			
			delta = ( starttimestamp.getTime() - (new Date(parsetimestamp.pagestime.buddylist)).getTime() ) / 1000;
			if ( parsetimestamp.pagestime.buddylist == null || 60*60 < delta ) {
//console.log('FireVortex.Parsers::processinit: buddylist process check => '+ 60 * 60 +' < '+ delta);
				this.parseBuddyListAjax();
				parsetimestamp.pagestime.buddylist = new Date();
				setStorageObject('fv_parseprocess' , parsetimestamp);
			}

			delta = ( starttimestamp.getTime() - (new Date(parsetimestamp.pagestime.ignorelist)).getTime() ) / 1000;
			if ( parsetimestamp.pagestime.ignorelist  == null || 60*60 < delta ) {
//console.log('FireVortex.Parsers::processinit: ignorelist process check => '+ 60 * 60 +' < '+ delta);
				this.parseIgnoreListAjax();
				parsetimestamp.pagestime.ignorelist = new Date();
				setStorageObject('fv_parseprocess' , parsetimestamp);
			}		
			
			this.parseForumSubscriptionsAjax();
			this.parseNewPostThreadSubscriptionsAjax();
			parsetimestamp.pagestime.usercp = new Date();
			
			this.parseAllThreadSubscriptionsAjax();
			parsetimestamp.pagestime.subscription = new Date();
			
			parsetimestamp.endtime = new Date();
			setStorageObject('fv_parseprocess' , parsetimestamp);
		}
		
	},

	//
	// Friends/Contacts List Parsers
	//
	
	parseBuddyListAjax: function() {
		$.ajax({
			context: this,
			type: "GET",
			url: SERVER_HOST +"/profile.php?do=buddylist",
			cache: false,
			success: function( data ){
				this.updateBuddyList(data, true);
			}
		});
	},
	
	parseBuddyListPage: function() {
		listobj = $("ul#buddylist li");
		this.updateBuddyList(listobj, false);
	},
	
	updateBuddyList: function( listobj, isBackground ) {
		buddylist = { "updated" : null, "userids" : new Array(), "usernames" : new Array() };
		
		if (isBackground) {
			listobj = $(listobj).find('ul#buddylist li');
		}
		
		//loop over dom set
		$.each(listobj, function() {
			var userid = $(this).attr("id");
			userid = parseInt( userid.replace('buddylist_user','') ); //buddylist_user208927
			var usern = $(this).find('div.buddylist_details a').text();
		
			if ( usern && userid) {
//console.log('FireVortex.Parsers::updateBuddyList => userid: '+userid +' usern: '+usern);
				buddylist.userids.push(userid);
				buddylist.usernames.push(usern);
			}
		});
		
		buddylist.updated = new Date();
		
		setStorageObject('fv_buddylist' , buddylist);
//console.log('FireVortex.Parsers::updateBuddyList => total items: '+ buddylist.userids.length);
	},
	
	//
	// Ignore List Parsers
	//
	
	parseIgnoreListAjax: function() {
		$.ajax({
			context: this,
			type: "GET",
			url: SERVER_HOST +"/profile.php?do=ignorelist",
			cache: false,
			success: function( data ){
				this.updateIgnoreList( data, true );
			}
		});		
	},
	parseIgnoreListPage: function() {
		listobj = $("ul#ignorelist li");
		this.updateIgnoreList(listobj, false);
	},
	updateIgnoreList: function( listobj, isBackground ){
		ignorelist = { "updated" : null, "userids" : new Array(), "usernames" : new Array() };

		if (isBackground) {
			listobj = $(listobj).find('ul#ignorelist li');
		}
				
		//loop over dom set
		$.each(listobj, function() {
			var userid = $(this).attr("id");
			userid = parseInt( userid.replace('user','') ); //user16242
			var usern = $(this).find('a').text();
			
			if ( usern && userid) {
//console.log('FireVortex.Parsers::updateBuddyList => userid: '+userid +' usern: '+usern);
				ignorelist.userids.push(userid);
				ignorelist.usernames.push(usern);
			}
			
		});
		
		ignorelist.updated = new Date();

		setStorageObject('fv_ignorelist' , ignorelist);
//console.log('FireVortex.Parsers::updateIgnoreList => total items: '+ ignorelist.userids.length);
	},
	
	//
	// All Thread Subscriptions List Parsers
	//
	
	parseAllThreadSubscriptionsAjax: function() {
		$.ajax({
			context: this,
			type: "GET",
			url: SERVER_HOST +"/subscription.php",
			data: "do=viewsubscription&daysprune=-1&folderid=all",
			cache: false,
			success: function( data ) {
				this.updateAllThreadSubscriptions( data, true );
			}
		});	
	},
	parseAllThreadSubscriptionsPage: function() {
		listobj = $("ol#threads li h3.threadtitle a");
		this.updateAllThreadSubscriptions(listobj, false);
	},
	updateAllThreadSubscriptions: function(listobj, isBackground) {
		sublist = { "updated" : null, "threadids" : new Array(), "titles" : new Array(), "descriptions" : new Array() };
		
		if (isBackground) {
			//loop over dom set
			$(listobj).find('ol#threads li.threadbit').each( function(i) {

				var threadid = $(this).find("h3.threadtitle a.title").attr("id");
				threadid = parseInt( threadid.replace('thread_title_','') ); //thread_title_5168342
				var threadtitle = $(this).find("h3.threadtitle a.title").text();
				var threaddesc = $(this).find("div.threadinfo div.threadmeta p.threaddesc").text();
				
				if ( threadid && threadtitle && threaddesc ) {
//console.log('FireVortex.Parsers::updateAllThreadSubscriptions => threadid: '+ threadid +' threadtitle: '+ threadtitle +' threaddesc: '+ threaddesc);
					sublist.threadids.push( threadid );
					sublist.titles.push( threadtitle );
					sublist.descriptions.push( threaddesc );
				}
			});
			
		} else {
			//loop over dom set
			$.each(listobj, function (i) {
				var threadid = $(this).attr("id");
				threadid = parseInt( threadid.replace('thread_title_','') ); //thread_title_5168342
				var threadtitle = $(this).text();
				var threaddesc = $(this).parent().parent().parent().attr("title");
				
				if ( threadid && threadtitle && threaddesc ) {
//console.log('FireVortex.Parsers::updateAllThreadSubscriptions => threadid: '+ threadid +' threadtitle: '+ threadtitle +' threaddesc: '+ threaddesc);
					sublist.threadids.push( threadid );
					sublist.titles.push( threadtitle );
					sublist.descriptions.push( threaddesc );
				}
			});
			
		}
		
		sublist.updated = new Date();

		setStorageObject('fv_threadsubscriptionlist' , sublist);
		$("#fv-panel-data").attr("rel", "loading");
//console.log('FireVortex.Parsers::updateAllThreadSubscriptions => total items: '+ sublist.threadids.length);
	},
	
	
	//
	// Topics with new posts Parsers
	//
	
	parseNewPostThreadSubscriptionsAjax: function() {
		$.ajax({
			context: this,
			type: "GET",
			url: SERVER_HOST +"/usercp.php",
			cache: false,
			success: function( data ){
				this.updateNewPostThreadSubscriptions( data, true );
			}
		});	
	},
	parseNewPostThreadSubscriptionsPage: function() {
		listobj = $("ol#threadlist li h3.threadtitle a.title");
		this.updateAllThreadSubscriptions(listobj, false);
	},
	updateNewPostThreadSubscriptions: function( listobj, isBackground ) {
		sublist = { "updated" : null, "threadids" : new Array(), "titles" : new Array() };
		
		if (isBackground) {
			listobj = $(listobj).find('ol#threadlist li h3.threadtitle a.title');
		}
				
		//loop over dom set
		$.each(listobj, function (i) {

			var threadid = $(this).attr("id");
			threadid = parseInt( threadid.replace('thread_title_','') ); //thread_title_5168342
			var threadtitle = $(this).text();

			if ( threadid && threadtitle ) {
//console.log('FireVortex.Parsers::updateNewPostThreadSubscriptions => threadid: '+ threadid +' threadtitle: '+ threadtitle);
				sublist.threadids.push( threadid );
				sublist.titles.push( threadtitle );
			}
			
		});
		
		sublist.updated = new Date();

		setStorageObject('fv_newpostthreadsubscriptionlist' , sublist);
		$("#fv-panel-data").attr("rel", "loading");
//console.log('FireVortex.Parsers::updateNewPostThreadSubscriptions => total items: '+ sublist.threadids.length);
	},


	//
	// Forum Subscription List Parsers
	//
	
	parseForumSubscriptionsAjax: function() {
		$.ajax({
			context: this,
			type: "GET",
			url: SERVER_HOST +"/usercp.php",
			cache: false,
			success: function( data ){
				this.updateForumSubscriptions( data, true );
			}
		});	
	},
	parseForumSubscriptionsPage: function() {
		listobj = $("ol#forumlist li h2.forumtitle a");
		this.updateForumSubscriptions(listobj, false);
	},
	updateForumSubscriptions: function( listobj, isBackground ) {
		sublist = { "updated" : null, "forumids" : new Array(), "forumtitles" : new Array() };
		
		if (isBackground) {
			listobj = $(listobj).find("ol#forumlist li h2.forumtitle a");
		}
				
		//loop over dom set
		$.each(listobj, function (i) {
				
			var forumid = $(this).parent().parent().parent().parent().parent().parent().parent().attr("id");
			forumid = parseInt( forumid.replace('forum','') ); //forum79
			var forumtitle = $(this).text();
			
			if ( forumid && forumtitle ) {
//console.log('FireVortex.Parsers::updateForumSubscriptions => forumid: '+ forumid +' forumtitle: '+ forumtitle);
				sublist.forumids.push( forumid );
				sublist.forumtitles.push( forumtitle );
			}
			
		});
		
		sublist.updated = new Date();

		setStorageObject('fv_forumsubscriptionlist' , sublist);
		$("#fv-panel-data").attr("rel", "loading");
//console.log('FireVortex.Parsers::updateForumSubscriptions => total items: '+ sublist.forumids.length);
	
	},
	
};

FireVortex.UI = {
	
};

FireVortex.UI.Emoticons = {

	init: function() {
		//this.loadData();
		this.loadHalloweenData();
		
		this.loadHtml();
	},
	
	loadHtml: function() {
		
		var d = new Date();
		
		GM_addStyle('#fv-emoticons {width:83%;max-height:75px; overflow:auto;padding-left:5px;margin-top: 10px;} #fv-emoticonlist li { display: inline; list-style-type: none; padding-right: 20px; margin-bottom: 8px;} ');
		
		$("#vB_Editor_001").parent().append('<div id="fv-emoticons"><div><ul id="fv-emoticonlist"></ul></div></div>');
		
		var emoticonlist = getStorageObject( 'fv_emoticonlist' );

		if ( emoticonlist && emoticonlist.emoticons.length ) {
			for ( var i = 0; i < emoticonlist.emoticons.length; i++ ) {
				$("#fv-emoticonlist").append('<li><a href="" class="fv-emoticon-item"><img src="'+ emoticonlist.emoticons[i].url +'" rel="'+ emoticonlist.emoticons[i].url +'" border="0"/></a></li>');
			}			
		} else {
			$("#fv-emoticonlist").append('<li><a href="'+ SERVER_HOST +'/profile.php?do=editfirevortex">No emoticons found - add them via FireVortex Settings.</a></li>');
		}
		
		//Holiday - Halloween
		if ( d.getMonth() == 9 ) {				
			var hemoticonlist = getStorageObject( 'fv_halloweenemoticonlist' );
			if ( hemoticonlist && hemoticonlist.emoticons.length ) {
				for ( var i = 0; i < hemoticonlist.emoticons.length; i++ ) {
					$("#fv-emoticonlist").append('<li><a href="" class="fv-emoticon-item"><img src="'+ hemoticonlist.emoticons[i].url +'" rel="'+ hemoticonlist.emoticons[i].url +'" border="0"/></a></li>');
				}			
			}
		}
		
		
		$("a.fv-emoticon-item").click(function() {
			var eurl = $(this).find('img').attr("rel");
			
			if ( $("#vB_Editor_001_iframe").length ) {
				//'<img border="0" src="'+ eurl +'" class="inlineimg">'
			} else {
				$("#vB_Editor_001_textarea").insertAtCaret('[img]'+ eurl +'[/img]');	
			}
			return false;
		});
		
	},
	
	loadQRHtml: function() {

		var d = new Date();

		GM_addStyle('#fv-emoticonlist li { display: inline; list-style-type: none; padding-right: 20px; } ');
		
		if ( domainKey == 10 ) {
			
			$('#quick_reply .editor_control_group').next().append('<li class="editor_control_group_item"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAABGdBTUEAAK%2FINwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJnSURBVDjLpZPNS9RhEMc%2Fz29t1d1tfSmhCAwjioqoKNYuYkRRFB300MWT3eooeMn6C4TunYoiOgSKkGAUhh0SjJCwsBdtfQMN17Ta2v39nueZ6WBtktGh5jLDMPPhC%2FMdo6r8T5T93nCPTUqVDhVOi5BRBRVGRBhQ4drGc5pfO2%2FWKnCPTbMKN0x9Z4OpzqDxWlCPFnL45VHCd91ZEdprWnRoHcANmhatbu4JtrShiSr8t9dIuIS6IpgKgoqdGBsQztwj%2FDDUWndee0sAO2hqVZmO7b%2BbkuAzvpgF%2BwVxIeqLqxBRTHk9sfL9fBq%2BkBdh%2B9Y2%2FRgAqNARbO9KaRwkzIL7ymBfDiQCH%2FHkIYjN4z6P4cNJEnu6UuLpAAgARDhrahqRYhZ1BVQsx85UomJRb2lqzqMSojaPW3lOWfUuxHN2LWAv5WnErZSWVCzqItRHP2qL%2BggJc0CI9zSUACoU1BXBOx71PmXq7dzqorc%2Fcsj05BKDD%2BZQsaCKCLFfCjxZbAGIc7R5N%2B9ezTI7uYD6EBXLTHaZiTfLZBrTmCCB%2BDJsyETJSCL029zowaC6nkRynqNNDYw9m2L8xSx4S7LSkMlUkUzEKEsfoJCbxkb0l8643GPqRHifarydEvsGnx9HohXUhYj7eUaIJXdi0qeYvn8x7yw7Dl3WxQCgplUXRWj%2FNnELdBuxdCMmVouKgihBfDMb6k6gieMsvezDRrQfuqyL66w8f8ecFM%2F15N7OhvimfQQbAhCHCz1f59%2ByMNyddZZLh6%2FowB9%2FAWD2pkmJp1OE096TcRE4y4izDDhL95Grf3mmf4nvrQOLvcb%2FmlMAAAAASUVORK5CYII%3D" border="0" class="imagebutton" title="emoticons" id="fvqr-emoticons-btn"/></li>');
			
			$('#quick_reply .wysiwyg_block').append('<div id="fvqr-emoticons-panel"></div>');
			
		}
		
		//listener
		$('#fvqr-emoticons-btn').bind('click', function(){

			//load once
			if ( $("#fv-emoticonlist").length == 0 ) {
				
				$("#fvqr-emoticons-panel").append('<div><ul id="fv-emoticonlist"></ul></div>');
				
				var emoticonlist = getStorageObject( 'fv_emoticonlist' );
		
				if ( emoticonlist && emoticonlist.emoticons.length ) {
					for ( var i = 0; i < emoticonlist.emoticons.length; i++ ) {
						$("#fv-emoticonlist").append('<li><a href="" class="fv-emoticon-item"><img src="'+ emoticonlist.emoticons[i].url +'" rel="'+ emoticonlist.emoticons[i].url +'" border="0"/></a></li>');
					}			
				} else {
					$("#fv-emoticonlist").append('<li><a href="'+ SERVER_HOST +'/profile.php?do=editfirevortex">No emoticons found - add them via FireVortex Settings.</a></li>');
				}
				
				//Holiday - Halloween
				if ( d.getMonth() == 9 ) {				
					var hemoticonlist = getStorageObject( 'fv_halloweenemoticonlist' );
					if ( hemoticonlist && hemoticonlist.emoticons.length ) {
						for ( var i = 0; i < hemoticonlist.emoticons.length; i++ ) {
							$("#fv-emoticonlist").append('<li><a href="" class="fv-emoticon-item"><img src="'+ hemoticonlist.emoticons[i].url +'" rel="'+ hemoticonlist.emoticons[i].url +'" border="0"/></a></li>');
						}			
					}
				}
				
				
				$("a.fv-emoticon-item").click(function() {
					var eurl = $(this).find('img').attr("rel");
					if (domainKey != 10) {
						$("#vB_Editor_001_textarea").insertAtCaret('[img]'+ eurl +'[/img]');
					} else {
						$("#vB_Editor_QR_textarea").insertAtCaret('[img]'+ eurl +'[/img]');
					}
					return false;
				});
				
			}
			
			$('#fvqr-emoticons-panel').slideToggle('slow', function() {
				
			});
			
		}).css( 'cursor', 'pointer');
		
	},
	
	loadJSONForSettings: function() {
		
		//fv-ajax-emoticonlist-panel
		//load data to div - when clicked, add to new input box text and clone the blank
		
		
	},
	
	//Holiday - Halloween
	loadHalloweenData: function() {

		var d = new Date();
		if ( d.getMonth() != 9 ) return;

		//load only once
		var halloweenlist = getStorageObject( 'fv_halloweenemoticonlist' );

		if ( !halloweenlist ) {

			var thelist = ["026","027","002","003","004","032","006","007","008","009","011","012","013","014","028","029","031","005","010","033","015","001"];

			var emoticonlist = { "updated" : null, "emoticons" : new Array() };

			for ( var i = 0; i < thelist.length; i++ ) {
				var emoticon = { "fvhalloween" : false, "shortcode" : false, "url" : "http://e.tinytex.com/h/" + thelist[i] + ".gif", "added" : new Date() };		
				emoticonlist.emoticons.push(emoticon);
			}

			emoticonlist.updated = new Date();
			setStorageObject('fv_halloweenemoticonlist' , emoticonlist);
		}
		
	},
	
};

FireVortex.UI.Panel = {
	
	init: function() {
		this.loadHtml();
	},
	
	loadHtml: function() {
		
		GM_addStyle('.fv-panel h3{color:#CE6D0D;font-size:130%;font-weight:bold;}.fv-panel{position:fixed;top:135px;left:0;display:none;background:#000;border:1px solid #111;-moz-border-radius-topright:8px;-webkit-border-top-right-radius:8px;-moz-border-radius-bottomright:8px;-webkit-border-bottom-right-radius:8px;width:225px;height:auto;opacity:.95;padding:5px 5px 15px 50px;}.fv-panel p{color:#ccc;margin:0 0 15px;padding:0;}.fv-panel a{text-decoration:none;border-bottom:1px solid #CE6D0D;margin:0;padding:0;}.fv-panel a:hover{color:#fff;text-decoration:none;border-bottom:1px solid #fff;margin:0;padding:0;}a.fv-panel-trigger{position:fixed;text-decoration:none;top:135px;left:0;font-size:16px;letter-spacing:-1px;color:#fff;background:#000;font-weight:700;border:1px solid #444;-moz-border-radius-topright:8px;-webkit-border-top-right-radius:8px;-moz-border-radius-bottomright:8px;-webkit-border-bottom-right-radius:8px;-moz-border-radius-bottomleft:0;-webkit-border-bottom-left-radius:0;display:block;padding:10px;}a.fv-panel-trigger:hover{position:fixed;text-decoration:none;top:135px;left:0;font-size:16px;letter-spacing:-1px;color:#ccc;background:#000;font-weight:700;border:1px solid #444;-moz-border-radius-topright:8px;-webkit-border-top-right-radius:8px;-moz-border-radius-bottomright:8px;-webkit-border-bottom-right-radius:8px;-moz-border-radius-bottomleft:0;-webkit-border-bottom-left-radius:0;display:block;padding:10px;}');
		GM_addStyle('.fv-panel .dropdown dd, .fv-panel .dropdown dt, .fv-panel .dropdown ul { margin:0px; padding:0px; }.fv-panel .dropdown dd { position:relative; }.fv-panel .dropdown { margin-top:5px; }.fv-panel .dropdown a{ color:#816c5b; text-decoration:none; outline:none;}.fv-panel .dropdown a:hover { color:#5d4617;}.fv-panel .dropdown dt a:hover, .fv-panel .dropdown dt a:focus { color:#5d4617; border: 1px solid #5d4617;}.fv-panel .dropdown dt a {background:#e4dfcb url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAABGdBTUEAAK%2FINwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACHSURBVHjaYvz%2F%2Fz8DJYBxGBmwZn4SyZpDEucxMDFQCNAN6ALi%2FwTwbSAWxWVAGRDPxWPhUyB2BuLXuAwAgXRQkGARfw3V%2FAifF0DgLxBHA%2FE%2BJLGPQOwJxDcJhQEM%2FAJiHyA%2BBcTfgdgfiM9iU8iCx7%2FfobYaAPFBYmMBHbxD88pwzAsAAQYAWCA25%2BSAqKIAAAAASUVORK5CYII%3D) no-repeat scroll right center; display:block; padding-right:20px; border:1px solid #d4ca9a; width:150px;}.fv-panel .dropdown dt a span {cursor:pointer; display:block; padding:5px;}.fv-panel .dropdown dd ul { background:#e4dfcb none repeat scroll 0 0; border:1px solid #d4ca9a; color:#C5C0B0; display:none;left:0px; padding:5px 0px; position:absolute; top:2px; width:auto; min-width:170px; list-style:none; max-height: 200px; overflow: auto;}.fv-panel .dropdown span.value { display:none;}.fv-panel .dropdown dd ul li a { padding:5px; display:block;}.fv-panel .dropdown dd ul li a:hover { background-color:#d0c9af;} #fv-panel-meta { font-size: 10px; margin-top:8px;padding:1px;}#fv-panel-meta a { color:#CE6D0D;text-decoration:none;}');
		
		
		$('body').append('<div id="fv-panel" class="fv-panel"><h3>FireVortex</h3><div style="clear:both;"></div><div id="fv-panel-data" rel="loading"><div id="fv-panel-loading-msg">loading data...</div></div><div style="clear:both;"></div><div id="fv-panel-meta"><a title="FireVortex About" href="http://firevortex.net/about/'+ VERSION.fv +'/">About</a> | <a title="FireVortex Settings" href="'+ SERVER_HOST +'/profile.php?do=editfirevortex">Settings</a> | <a title="Donate! Daddy needs diapers" href="http://firevortex.net/donate/" target="_blank">Donate</a> | <a title="SHOUTbox!" href="http://shout.firevortex.net" target="_blank">SB</a></div></div><a class="fv-panel-trigger" href="#">FV</a>');
		
		
		$(".fv-panel-trigger").click(function(){
			
			if ( $("#fv-panel-data").attr("rel") == 'loading' ) {
				
				FireVortex.UI.Panel.createSubscribedForumsList();
				FireVortex.UI.Panel.createSubscribedNewThreadsList();
				FireVortex.UI.Panel.createSubscribedThreadsList();
				FireVortex.UI.Panel.createFriendsFollowList();
				
				$("#fv-panel-data").attr("rel", "done");
				$("#fv-panel-loading-msg").hide();
			}
			
			$(".fv-panel").toggle("fast");
			$(this).toggleClass("active");
			return false;
		});
		
		$(document).bind('click', function(e) {
			var $clicked = $(e.target);
			if (! $clicked.parents().hasClass("dropdown"))
				$(".dropdown dd ul").hide();
		});
				
	},
	
	createSubscribedForumsList: function() {

		$("#fv-panel-data").append('<dl id="fv-panel-subforums-dd" class="dropdown"><dt><a id="fv-panel-subforums-select" href="#"><span>Subscribed Forums</span></a></dt><dd><ul id="fv-panel-subforums-list"></ul></dd></dl>');
		
		var forumlist = getStorageObject( 'fv_forumsubscriptionlist' );

		if ( forumlist ) {
			for ( var i = 0; i < forumlist.forumids.length; i++ ) {
				$("#fv-panel-subforums-list").append('<li><a href="'+ SERVER_HOST +'/forumdisplay.php?'+ forumlist.forumids[i] +'">'+ forumlist.forumtitles[i] +'</a></li>');
			}			
		} else {
			$("#fv-panel-subforums-list").append('<li><a href="#">No forum subscriptions</a></li>');
		}
		$("#fv-panel-subforums-list").append('<li><a href="'+ SERVER_HOST +'/usercp.php">View All</a></li>');
		
		$("a#fv-panel-subforums-select").click(function() {
			
			if ( !$("#fv-panel-subforums-list").is(":visible") ) $(".dropdown dd ul").hide();
			$("#fv-panel-subforums-list").toggle();
			return false;
		});
		
	},

	createSubscribedThreadsList: function() {

		$("#fv-panel-data").append('<dl id="fv-panel-subthreads-dd" class="dropdown"><dt><a id="fv-panel-subthreads-select" href="#"><span>Subscribed Topics</span></a></dt><dd><ul id="fv-panel-subthreads-list"></ul></dd></dl>');
		
		var sublist = getStorageObject( 'fv_threadsubscriptionlist' );

		if ( sublist ) {
			for ( var i = 0; i < sublist.threadids.length; i++ ) {
				$("#fv-panel-subthreads-list").append('<li><a title="'+ sublist.descriptions[i] +'" href="'+ SERVER_HOST +'/showthread.php?'+ sublist.threadids[i] +'">'+ sublist.titles[i].substring(0, 50) +'</a></li>');
			}			
		} else {
			$("#fv-panel-subthreads-list").append('<li><a href="#">No subscribed topics</a></li>');
		}
		$("#fv-panel-subthreads-list").append('<li><a href="'+ SERVER_HOST +'/subscription.php?do=viewsubscription&daysprune=-1&folderid=all">View All</a></li>');
		
		$("a#fv-panel-subthreads-select").click(function() {
			if ( !$("#fv-panel-subthreads-list").is(":visible") ) $(".dropdown dd ul").hide();
			$("#fv-panel-subthreads-list").toggle();
			return false;
		});
		
	},
	
	createSubscribedNewThreadsList: function() {

		$("#fv-panel-data").append('<dl id="fv-panel-subnewthreads-dd" class="dropdown"><dt><a id="fv-panel-subnewthreads-select" href="#"><span>New Topic Posts</span></a></dt><dd><ul id="fv-panel-subnewthreads-list"></ul></dd></dl>');
		
		var sublist = getStorageObject( 'fv_newpostthreadsubscriptionlist' );

		if ( sublist ) {
			for ( var i = 0; i < sublist.threadids.length; i++ ) {
				$("#fv-panel-subnewthreads-list").append('<li><a href="'+ SERVER_HOST +'/showthread.php?'+ sublist.threadids[i] +'&goto=newpost">'+ sublist.titles[i].substring(0, 50) +'</a></li>');
			}			
		} else {
			$("#fv-panel-subnewthreads-list").append('<li><a href="#">No new posts in topics</a></li>');
		}
		$("#fv-panel-subnewthreads-list").append('<li><a href="'+ SERVER_HOST +'/usercp.php">View All</a></li>');
		
		$("a#fv-panel-subnewthreads-select").click(function() {
			if ( !$("#fv-panel-subnewthreads-list").is(":visible") ) $(".dropdown dd ul").hide();
			$("#fv-panel-subnewthreads-list").toggle();
			return false;
		});
		
	},
	
	createFriendsFollowList: function() {

		$("#fv-panel-data").append('<dl id="fv-panel-subfriends-dd" class="dropdown"><dt><a id="fv-panel-subfriends-select" href="#"><span>Friends/Following</span></a></dt><dd><ul id="fv-panel-subfriends-list"></ul></dd></dl>');
		
		var buddylist = getStorageObject( 'fv_buddylist' );

		if ( buddylist ) {
			for ( var i = 0; i < buddylist.userids.length; i++ ) {
				$("#fv-panel-subfriends-list").append('<li><a href="'+ SERVER_HOST +'/member.php?'+ buddylist.userids[i] +'">'+ buddylist.usernames[i] +'</a></li>');
			}			
		} else {
			$("#fv-panel-subfriends-list").append('<li><a href="#" title="forever alone...">No friends</a></li>');
		}
		$("#fv-panel-subfriends-list").append('<li><a href="'+ SERVER_HOST +'/profile.php?do=buddylist">View All</a></li>');
		
		$("a#fv-panel-subfriends-select").click(function() {
			if ( !$("#fv-panel-subfriends-list").is(":visible") ) $(".dropdown dd ul").hide();
			$("#fv-panel-subfriends-list").toggle();
			return false;
		});		
		
	},
	
	
};

FireVortex.UI.Options = {
	
	init: function() {
		if ( $('.standard_error').length == 0 ) {
			this.loadHtml();
			this.loadOptions();
		}
	},
	
	loadHtml: function() {
		
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=bbcode.css,editor.css,popupmenu.css,reset-fonts.css,vbulletin.css,vbulletin-chrome.css,vbulletin-formcontrols.css');
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=attachments.css,forumbits.css,forumdisplay.css,postlist.css,projecttools.css,threadlist.css,usercp.css');
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=additional.css');
		
		GM_addStyle('.formcontrols .blockrow { height:auto !important; } #fv-edit-emoticonlist-panel { display: none; padding:5px; max-height: 400px; margin: 0px; overflow: auto; width: 100%; } img.ep { max-width: 100px; max-height: 100px;}'); 
		GM_addStyle('.miniColors-trigger{height:22px;width:22px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw%2FeHBhY2tldCBiZWdpbj0i77u%2FIiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8%2BIDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjU3RTU1MzIzNERFMTFFMDg1NENGREUxMTA5MjQ5M0QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjU3RTU1MzMzNERFMTFFMDg1NENGREUxMTA5MjQ5M0QiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4OEQxNkIyMTM0REUxMUUwODU0Q0ZERTExMDkyNDkzRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4OEQxNkIyMjM0REUxMUUwODU0Q0ZERTExMDkyNDkzRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI%2FPiDK9P0AAAHySURBVHjarJVBasJAFIYnyVgXtrorusgdXOrWZaHgFbooegv1EoI7j%2BAtXLsXFFy0FFRs0LYxmXT%2BYV6YxIgpzcDzJcN73%2Fz5M06s4XD4zBhrsGLHGxdCNEaj0aRI6mAw6AFs4SaKokKglmUxMHkYhgqKaDabvf9AF4vFBBwwAbbkCgpcqVTYfD7%2FkjWnjD6BB9MZEeocyLhrt9suOBhgJhRXq1WmodsrMBNo5gfZ65KdpFhBsVqtVmO6MLwBEkYdwkZvAhwEgUXgUqmEeV%2FGzw1Q%2Bl71EhhMpRhQBOcc8986TAgWg%2FdHfU3zaiPIuEev4XFSsQYfNSTUC3xq38WVzQCZPnoTivGTUnzScE9nkWOnCVMxgdNWAPiht1HekQZnWrHNAeXaArIiurDifD7Hih3HYTmgzng8floul%2FXEpOwlxWAmFGtwwlN5%2BqkwX9ZqtarLg2aCt28OWADGtZcnTGhGVn4C4vt%2B5iEUW0GKbduOwSmVMRj1qKOe2WzGNpsNc12XdbtdNa9q0las12uRBaWBfxjqqEeeiGy326lMh5lS7HmeTYcQlEyn09dbe4sUI6C01WqpTHNg8v1%2Bb5PH%2FX4%2F95cE%2FtIu6HQ68TUymPxwODh4tHK5%2FKevCHr0LrqYB9OSwBf5aI9FfvOk6vdfAQYA4jTPF9eEdoEAAAAASUVORK5CYII%3D)center no-repeat;vertical-align:middle;margin:0.25em;display:inline-block;outline:none}.miniColors-selector{position:absolute;width:175px;height:150px;background:#FFF;border:solid 1px#BBB;-moz-box-shadow:0 0 6px rgba(0,0,0,.25);-webkit-box-shadow:0 0 6px rgba(0,0,0,.25);box-shadow:0 0 6px rgba(0,0,0,.25);-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5px;padding:5px;z-index:999999}.miniColors-selector.black{background:#000;border-color:#000}.miniColors-colors{position:absolute;top:5px;left:5px;width:150px;height:150px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHotAACAlQAA%2BNcAAIhSAABxRQAA6mYAADkHAAAh%2BQMnhVYAACf5SURBVHja7H3LjuRIkqQaJ%2Be0wB72T%2Fs7%2Bw%2FqOKduoLBd3ZVZmeEP0z0UjSUUiqqpuUf1AoMJIBDuTjrdwyhUERVVMzZ3%2Fy8z%2B99m9jAz33%2F7%2Fhs97vb7zzv7qff54n7HNncv7Vc9nnjuf%2FIxsv2i7y%2F328eii%2FEMP9vd5fjvr3cc4%2FFa793dvffe%2B%2FP57Pf73b99%2B9b%2F8pe%2F9C%2B99%2F9jZv9rB8Dsn3kWT9RsQCIgzE7Us3r8le%2BIg%2FfqMRKAp8cAEPAY4%2FGy93l2cY393P0J%2B%2FnYBtvH8%2Be%2BrfXe246cBr%2F%2BeDz68%2Fm0%2B%2F3uHx8f9v37d%2Fv69av9%2FPPP%2FtNPP9lf%2F%2FpX%2B9J7f%2BygenzCSfPZgLxz0l48oeEvXKVv7fPisU4%2Fv28yM7O2%2F5q7t%2BA5P3Y8hvq772%2Fu3nYQjdePfXbgbDuYxmv%2BfD7t%2BXza4%2FGwx%2BPh9%2Fvdbreb3W43%2F%2F79u%2F3666%2F2z3%2F%2B0%2F72t7%2F5Tz%2F9ZN%2B%2BfbMv8A%2BVfmj%2FZmZtf63hgLXWVo7z0ueOgQ0enwY9%2BMH9Kp99%2BVw8wcG2bQc%2B7%2BcF8BgcC4957EevNwDRRgByAFYbQILIdIDI3e35fFrvvY2%2Fj8ejPR6P7X6%2F%2B%2B1284%2BPj%2Fbjxw%2F79u1b%2B%2FXXX9s%2F%2FvGP9ve%2F%2F91%2B%2Fvnn9ng82pfe%2B8qJ5YH1FeAEJ28KEPpsg5NyArEA3%2BlEtdaOE8MXQvBZDBKbAYv3w%2BPhNnhsapu7W2tt671ba63vf1vvPQQWRaUjUu2%2FB9D2c34C0YhSO5B8j1B9%2F9uez2e73%2B%2B2%2F247BfrXr1%2FtX%2F%2F6l%2F3yyy%2F2yy%2B%2F%2BNevX%2B35fNoUWDAwKZCKESYEZyGCpSdeAEnRTRW4YSQKgJQBy%2BHxRkHUOZrtwEGAMICOY%2FwRhE60NsDTB7DGMZHuzMx778Zgcnd7PB4DWPZ8Pn0A6na79dvtZvf7fbvf7%2Fbbb78dwPr111%2Ft69ev%2Fttvv1nvfQqs8Y%2F5Im2VIluR3sag%2BuQ7toDi5PcQ39FEVLqALgNW8HgDJPWE0i5gIp00ANSZ0sxs0BkCyDBCjef7376%2FNgT51ns%2FIhYCCzXV%2FX63j48P%2F%2FHjR%2F%2F4%2BGj3%2B719%2B%2FbNxu%2F379%2F9drv9DqwoUlQBpehnIk6jSOSr%2Bir4jnysCCDZ%2B46T1FrDk%2B2tNcOLESN6AKzTRwFQZsByEteK7hrS3R6ZBngaRizQUcfj5%2FPZdh01QDWe266p2uPxsPv93m632%2Fi179%2B%2Ft99%2B%2B619fHwMrdV%2B%2FPjRbrebPR6PZmZaY1WFNdFkKwCqLYjriI48SCAqkU5RldJEXtBLBhGpR8AiACGNdd4v0EuH%2BGZggd7aRJTqCKRBhyN6YYQaVLhrqra%2FtokscEQs%2B%2Fj4sG%2Ffvg0hbz9%2B%2FLDb7eaPx8Pc%2FUKFHlz1L9GkONk%2BiXQZ9UnwKKApQNIxWyGVtxkV9t7bHsGOyBYAq%2B3jzGDCCHWIa6C%2BJva9ZHs7tWEE25D6CEwDaObu2wDW8%2Fn0XVPZ4%2FFAkLUBKgTWANK3b9%2F6x8fHtuuwASy%2FUOEMT8paSFJzn2WEETjpODK4Bd6PR1GVhT1mZgIUjhdYkt35hOKG3cD7oDVw8pYYdOOYw7AkXXWiwmEbDDpES2Hoqp3ybKfAE%2F09n8%2B2R6p2v9%2FbrrdOVIiPPz4%2B2sfHhz0ej%2B3xePQRGTliTb2fLErR1e0FjeQB2CLqi7Ix3keefBF5HPZzYQd4JNCVfzRokSmTQDYcbtZU214iMQBiI5G%2BDaug%2F%2F5zimSwDS2Ek0AHj2oYn0dk6r0fgn3XVna%2F3%2F1%2Bv%2Ffn87kNU3QI%2BX2bff%2F%2Bvd%2Fvd3s8HkekvGisiVGYgSoDVEsiT2iyigzsopeQgnbvx%2FGqx%2BPTtgiATQBGelCUwTUGDBxzUxkd6qMByID6DEouaG6iN9VRoO9AQyBhJriBV3VQ4W6EbgJYdr%2Ff%2B%2BPx2G63G2aJvgNxZJI%2BwH0CFmc8k2wrjXJIQXBCj9d3s%2FL0VgDJBcScKJzMIG0BuNJ5FKkuEXCAqxClsowuMi3VYxbiJ62EYAIgDVrrHLH2KIXaagBpRCnctiGwBqD2yLXtUWgAaQAMjdIDgB8fHw4R96yxXgBV5rAfJ1fQravPGumyos8MaALUlwwPwYRCXgGNdZWyDlico%2FYR9oADAE7uusr20DkHf8r2E8flmAFMh%2BcbRqjn83lsez6f296NcESpkQkOnXS%2F3we42g6utkerfr%2FffddhbQflQaPj89y9lahwxesKKC0T4XiVSwOTNJLyiDLt1DIdJQS82rYSlSLfaRNU2MAaQOd9i7K9AUb0o0a0IothwzLN8%2Fkc20YmeGis%2FbUTre1Z4TYi1g4wu91uDr6X7zRruw5rkgoDEKlolUWKCCAVoEURxZSQJ8CYMk5VticikQEFSkc9K%2F4yeJSOQ0obQh6jFdoSqLcITJ0tBQTT0FXjdbQUIAvsz%2BezuXvbW1%2Bs9953CtzAbrDb7dZHlENb4na79cfjsaFFMT5jnI%2BS3VDcJwJPRG2evB%2BBEkU4BTKPaJIozIPOAUWBzlEIvxcBS%2B2LOglFuTM4oeRy2m8%2FYRdLAbRVH71S6LSzdwUdC0iPB609Hg9398NuGIVnduL3bUcHBEdPM%2BvTiFWNYBOgWGYh0L6H97MQiZTx6YHYNnDLEUwciYztAlWjE%2FttlME5ZXlHJBrWA9b5JhGLHfROADuAhNFrWAoAtpHFdXcfAh47Ghr0YA09tqGRumutkwE7LA4z2xBYUQmkUqbxLCIJY1JRIeopT7SUKUCojI7KMxYArqExySZn1gfFAAs01sm7wmwPTE9JjQCyEaUYZNu%2B30AYgqcrd33fZxuFZtZYe4RyyBjb7XbroMl8aCoE6gDr%2BO5fVIE0A0zv3aGJ7wjp%2B2tH9rJbB6ayqQb%2BAz8fINn7jxToOCPzSG8RxTXhtl%2FcdwCnTwT7MR4ELG6oc5HtObnpp%2F4poJWTFTGi0XjfSO%2FJAPVdQw2v6jnApOyGYTOAI98AiIdbPxx4LFbvugw7Kw5cfBGV%2Bik1BtX6qB32orH4GIKO0ZJQ1MmRT1Irl0w4SkJDnZHmMWETXLwxtgYIdJjhdUGF3IhnAJgjGRj6CemPxLtDG8ygvw6txdtOhaOp73gO9oPt4NqGyN8j0jaAOOgSW5VHZOMCOFPhTF8p51s994QOmfqUPvJApB%2FutqBJRX0bTBy4RC%2Fx%2FGRaMkgmlsJF3KOFEBidbG4iNSItbnDS0EbAks62U1pD8xTAZgAutBs6UJ7v%2B2yot0D0H%2FqLitqnwvnQsFVgqZpd9FxZES0CUKSjqLxigYnJ2VhEmS6EOReAT811rL8WgLXh8Vg3ofWwA%2BmSNQLINmExdDBFEWRSvA%2FAjegzBHvkY8H%2Bp6gEYv6IbFjGuUQsprAqLSYgs4mQtwmNeUCfyvl2bo6j6KLc9YstwPvS%2B0xYAxcdFbjsjaLVoHjpvKPdgJoKAMcaC2fXODbwPZ9PN7OGzvjYd4js4aADiNpuJRwZ6PCp0LLgRIUK7meNNfOZEjBkJRaOVJdSSkSTIqM7rgZBca5qjMpZh6Jw5%2BiV1fJWtqFews8D7WSsozgqiVrhAEDn%2FSBadSjpDCAeVEjUeNo2DFLY5rhtHHOPdCNK%2BU6XGwD%2FbDfMIlY1WhE4PHHNI4A1dYxAU4XHUIYoHwMjmSpCZ6BT9Dd6pLDTYUxcIJpE6uukqzpMdjhto8cdvKpOvesH3cF%2Bh%2FOOtIglHnDtj5LOHgEdmgZP%2ByEFAtuUqLAFnQtyP8iyuMB8WBJgR1yyxgGAkakFwLlENkFpRkLc4AQbgc0n%2B51oblAOfO4lewQKc4peWFh2ENzOzXy4DaIWuutO7cdD6xx0ho%2BHVTDEOLxnFKbZUjg04E6Bg2o9MIevdgObo4UIFWmrBuhN9QtrGQQI%2BEPsVXUVEVkHBd7UpeeKIo8JbYXFYRP2ggmLAT2ok8M%2BohmA01QkwuiFpihEqUYRa2Mq3CMNUmFjWtyp7JQtDsCOrHAHU8dmweGZjYwSorSdSjpF6otqgCXARTQ5iUycBQ7dwVkh7yd9LAYaG6WTDHD6GgOL%2FKqTjUBA6kpjsa1AuoofH5kgPwbnHUE3PCoGXaPCNb5%2FdDQ4jLFjQpSJ9xmwLAFVn4AtAowFYPGkM8ECC8Gw15wzFirhOLnkTdT4PAIbFIgjMDkbqUizkN1dtou%2B9Q7PO2WGG7bGoI8VAM0hCrGYd0oAnH0rBBOiKrUbkozPFwA3jWbZZwsgeTKBIXL2I%2Bq1RNzPgHbyvYbmEdmeilJOFsXIFk009xnPA6TuBnyM2grfh1rqpLmoHnn6HlBQvui28b7xOWKisIxYF7tAgKklloGanOBFoLRk1ktEY5445JZkf1GdEBfQkBYD1sXIp7pQoXjM2R33sOO%2BLcoKdzBjScfJee9QG%2BSscPRnjcenyIbvo3LQhiCmHvsOLTMW2g0TuptFuAs4lI5SACRwc8lF%2BVZNUaYQ9TMtZYGQb0Hr8Ba0w1QfH5po2ApCsGMJp2OGBuDBiIVA29DvejwekgrBQkCN5ZCVnqgOaRLXi4DEb5yDlApLYCIxHwnxVyjPgga8GXg8oEDuS3dM8xNKPOk9thCGTqJJppbQX4Pow%2FsZ2wtAPyb621FjOTb3DbpCehs2whhLbPaDx2pSa4eGANSXijFi8f4GmEyUY6Jow3pHinoB1Ma1uARIDF6mxVeimQVCHP0tg8LyicbAuzpFL9jviF7Q%2FtKhsH0yQckQ7QAiJyo8KA0jFACpg9vuoiLg6MqTIXpcV6tUaNEMYUVbKu2f7RcBSWR%2FGTVeQJFto8euwMRZ57hyx7iRWMcGvosgB7P40GVDXOMx0I8S1Gg4E4eywE1RIWaFBJDDx%2BLskUE2to3pZSozBJDNs8IJpZ0a%2F9TJ3534sV9pG9sNTE0U9bB%2FyYVRe9nGrcojonDNUVkUUTSb6SoCz0Ws4zGSbQg6zgLlNnTY99c6l35GZCI6RN13lG6gG3YjmwGXw6xHrGx71uxHK6ZY5G5Tx4EFUUxFPVetLcEyQKps48JB5%2B%2BEeuJSHcBtrLfAjmg41ii8iU6noKOuBuPno8MBvC%2BMbidLAnSd4TR%2FZWUgaOm8vq6xotphdKJFS0oTGaAFYLKgCM0n10UHQ0aLbFq66HDwaMlF9Rqk2a40VqCrsCW57ye0K%2FCwxsIeLKKtC90hLY7C86DXPZrhhAvH%2Fi%2B0Mjh6EQ2ySeqr4l3ZCGo61ax3KrMfPNFHHmgsfu%2BlyMxLA0WinCjPlaNOkQdLMZfIQ89PugomWaDzPhz1LTipJ10FNgQ%2Bb1w7xONNjn8CJOspFvNUysEVoXONNel8UK3HvmAtmABGRrGtCC7V0WDsSzHdcQE9mFjBFoKiTAvsBiedhfbCKVoCHbH9cBLwAU3iMRCIbCOw%2FjqKyWhhiPmQp%2ByXHPe8VhgBYCWyiQxy9tcUpTGNFo7VAi2XUiE77qp7Qbjrp3mHSGdAb5sAlQQFWgoYXiArRKrifixTVoTICtFuONEpRCaHibK8aK7D3Mlxg4JtSbwHLTGhXprNoIkiV9BLlQEwshRc1ASjKV3Sn1JCP8r8gomopuwGKuEgWNhtv1Am05aIRsP34udHBgfgQQCdgKkoEj0tBJT9cVMEEzdPuFLhrDwza%2FKLAEZzDUfjXybW8X1oSRj3rcMqNU10MKi7MrRoHiF3JYCzfsr88H1oVSC10usnpx7pMrMb4DV23Q93HVeiYRrjKfmDEqF33Uk3Oq0WqHrcj4xY0KCmwqh9Zva3oNOauEOCV8Q7ao%2FEL1MWA9Of6njgRj4X7cdGRWjpwuNECIpUHkS%2BjQDNrTKYKXJDIEYsIz8Ko9RGbcUYlRymxWON0Fig49pb4pYpuEqhpsKqYRqUbFINlYh8SXcBeCzyoQJH3YLGPksoMivjXPQW7XeiuERHZRHqoEVw0Lnxj%2B2Fk%2FOO1IeuOWZ36HGx5hL7bwxAPK0DjO8AK1vJxSagU4150eKwFpRvLlYA2xFKZwn91YLPOhWTsYwzsxTgdiJhNIs0G0QJg5PEpRvOItEcPYEJdJPNwMMrKw8A9T%2FC0waAOmmeEcna7%2BWXksaKIs4sml0AtmgjqC4GGcnUcRSlUshW7noDB91EZuk0%2BcEFxbONEIl%2BZyCJ%2FYymrV9KQ%2BTOG82W9ijikuNvgcbEi%2Bk%2FMPJyVeEljVWIYiH4koJxtmZV1sulsj3LqFFEM349ctRN0aJ6zuBlW6FChaKDAd9zoSRhYLLxqaIXZ5ONi9M4NY1tDl5c1%2FJb6r0NrOo2bpO53CcmAODqtkukigCnthGNZVEJqaHT%2B0KNhdqJhbly14nqTpYFLfxh7HFRDfGizSjCskiX20TUisCV2w3FTFD2ZbGPla02o3rXZ9FsITNUjX6RQGeLIRL6FkyYcCXsxW1LVCZ4cegJOMYOvIq%2B2Iajoi5aHXa%2BodPlQsXvwKsfTvR3q4p3dsSz5j%2B%2B8SJ%2FKZt0Mlh0jCgaTWgwms4VaQwP9mui%2FyqNRASyTLybcNeV3trIGe9KwON%2BogUGC9enY1BN8RSFqIpwMUrtfOfY17LCpI041EbBzGSV0cmisOipsgJFqrZi9X%2BkuinTYgJA8jhMd7iUJMyQOQGVTzIDieyGkz4iUc%2FOe4dVbzZBh05FZ4%2FoTznxEljD5c6iUmQrDGc9obGmoh4CZEzFh8YyC3wsizI3Me39otPIdc78rBBYTBViZo4pK0LNI6RtRgC69E%2BhpQDH3sR0fKepXXwHi4bgIMA79Iixj4WPOxWjrxqrUjuMSjdqra2kPhjZBvgdwvmEAd15ZoKSpSAb1hD4Qo%2B5yh4ZmFFEEyCRjjyPI%2Ftg4II3QZenLJPAPsZno2LypXKA27MVHVliKLshKwRPxbuKSgkoZRdnRndCw10ojyOiaitOIl00jT6kPWE%2FlEDF2eOgrsBuiKyHjagLb9WLJR0T9oOLzPVEjQN8SnO11oab31prDu77MErnGqvappzMPK4CzZXADmwJi6Z8BdrsYpAGNcx3gSXFexVkILw70h2e%2BKGbRNaIgn0LANRoRcBO%2B25KN4F%2B6sQiKFcODyu1G16xHxIDVa1Eo1aJ8cmxs2JytGJfVIy2aA6hinJEd0p%2F%2BcwgnbjrJhoDjaZfScCDFJH%2FB72u5kBmcxPUvAE1sfi0ul8UseQUeBLtbRKFZhNTLZh5YyrDg5MrJ66Kx9Iby05M9lwtYzSJYivg2qA%2BN8vSkO4syBJNUSG56CzAnZr1Tlnh6Mfax%2BJ4PBr9IKot%2BVgVSyFccDaqNRZn9yhATgGzAKooWqkZOjh3sAUa5ZLdLYLM1DHIrnBlEzAQry93pNcGqwaeqBZ1GtCcUfXkdFqXqTCYfm6VVWMyAEZrZgWWRhM9QKlrn0U1sbAarzBzWbVPTNBwtSQR2wsq26YSUGQtyP0R5ERxFyqcPVa2h8iYnTLSU8Mle5IV5z2cqJoJ74Du1H6WzGbOKLMUkYIZzp5Qps9Ee0XMs3e1Eqn4GJn7zk2EahtMyjhFupHBcXZKrceZu47UucmI9Q4VfvJfZSuE0Yw0oCXlnFRDrWx7RU%2BxF5WBh%2BwG1Dboe3UwP7swQtuMFvE1BAr2YkU%2FqMHUtjKwVrRWBArVnCeOO41YybZoTXYLANlIY83mH34KsKIINekm5ULxBvTEBucmOhTYYO2Be99QsEcRKrMjXrIbXphqP5soMRXyiZg3RasqokW99up4yj4Q%2FfIl2syi1mT%2F6cSKV6IprlHBvmCwOLGpIKDmRXCTXykrnAjyCyWpGdAV0CjjM3hPGKHQkpjMal61Ilql0BzpLdHa0oniD8oTC3Hw1HY%2BtjJSp1SGnQ404%2FmwFPx8oy2eMCF11ytUyECyqp8ljhFRYaWmmIl4FxHKkt72ioeljMRNZamRcBelGgWWLTBfsU345C0xILhZT0THxmUdpZlGnRCSNxf2g9Rd7zjvLeppd73YbATIMt0FlDa1FqJIJ%2BqRlixZxHXFavuyqYwz6Yl3VYxG519M0PDo%2ByYTPGZlL3nBk9OeUWWJCtMidAYK9cWSfipTglropdPxsZk%2FMTgtG8hKJlh9raK5YKVlhzIQrliTaS%2BMKEq8MzU20eqy8RQuFO%2BRG09rjI5WmRaI95LznkYo3xdPE6CoUKFHi3cosKjOhYjiou%2FAV3kCqtmV3agzIQNXqxSnDe7uEGilMLsTq7%2BEoEt0Fy9LEFkNNko6YVY4A9ZouptRGO8HzxtZ%2F5dUO4lYYRbHa55y8Ve1xwRTuySgKDJmIMzmFWYTYC8aCBaNVYYrg0KKegJPn2Sfl%2FYZO995TYEQI5W9bDcks3iiKFJp%2BrPA85rpNBOTMyT1ZdqJVgEMPS7XyyCFES1q3OMEYFbsTioIVun7Clx1NYMZP2cjAW%2FBxInNzjekr9sNb04Bk6I5ocJSVHKx0GxgP6T%2FC1JhJGgrmip4LqMIZoUFw3QaibDLAxYekTqKoq3KJi%2FRS0yOUKUcL1PhZ80trHphKvIks3iiWUItiy4V8LzTUrPw%2Bibm53G%2FuSfU52w9FKiQPSZTAl2BhyZHRHXCnAor0%2BSjSDHRR%2BE6Ddl0MY5Y1W0ZZfp16e1wichkgZGs5TmkqmSbqwkbLC9YqwoAnjRitE1Eqct71HlJlgNQoG7u%2FjsVvhOhViOYJ2tofWbEUgD8jIj1KlVSppVGpUm2p7apblZ0wtMoJaZ0WVILtGRq%2FVljfTKwShpL2As%2BmZg6O36a7U2cd59NvCj6XS3SWMpVT7LHkOKo5SUCYIOJppca6OwYag4h02miuUIqjIDliRHqlanzZEOEWWHi9l8ilrp5wMTNP9FJkFm2QlaYeWxhVljVbOJ3KSuEC5QjVsggOzi6KMifzldrrSeF6OWI1SbT6ytZoru%2Bl2BGhe0zIpZoRmwTz6tNJhfMjiGn2WfbJkDjyNRmVMhzBFgrCfozmEvITvvJfE1o8o%2Bs0Oc3DLBocY%2BCeJ%2FtF3VFmOijT8V61NEgDNCmJmEm8w3D4nIwuZUjVIkKwc2faSk1u4n3a5GjruhOtQ2prJDbygVNloDVBAVeXo8yPdHWosxNTzLElgl2MfO5VP5h2npFyE8ojW%2FFYolgj3RYKwj2BnP9VGRrQv031Fi4YiECRL0naJHREWumsWbZnOtbyVXc9WxF5iZmgmRWwgWoCb2qmUVRd4NP9JYHzr4pLRY0FFo0z4%2BzWnH%2FaY9aeFTHBHZJiHmBPjQwfz6v3Ke%2B47LGyiJV0CLsSYdpEyvMRCc%2B%2BtzmwXpbijYnAJveVzoo8zTuREhotWXGaBKxGBRIbU3onsox25giDxNlT5ke9MM3YbC2SdRa0lih2A5626OZzjZZlC1qObaJWPcos0sshmmbdHEGUNgZkfTYN%2BWiD6AyVRKgZsKedZSzrlLgEZJBaimIXNENBNbtBhfLDlWjmxdX96uUgsS8xjbRZekcxSBCSr00KVaXgTabdDKZDGIqeqpedLXOgud3SruMu6JBoj2nx8t2w2UtiFdn6aw%2BT2ZYS4DNTlTyOWHr8gs98j6ZNCspTFBatB2bBi9ZZXRRctZo55uKXgzW3Xf8%2FcXf9VdUoLYMWDNB7QUd5olm8SjqqTbjZJ0IOWs6Wj0mWg9iZZbQqxljYkmE0VNZA5HGUtsYJGSOKpo8ZYEIJlHCacqFh225xsoMUdN3hOeTnE4sLYhxD45XmXoW%2BVHHohXQWhvdE3oGKmcdmCxkEiYK1QQAszkRsXwCzBZotsu5YC2Fj1U7MtwPqZ%2BA5fkNAaKsrBK50tVrZms3JAuLyAgQbTO9Zle4hGREw4XJr6WW5yxdp0bJTApEU%2BV4llKLLq7J3ED%2BXkc7DGfe8LOV7IZK94Ja4sjyNbCmvV8RKAmIrThP0YNo5gVwHItf0KSNbCGT2WODe0TPoll2T%2BpTdiZ0WESFFwolf8wpU22ZnhJF6andICNUEm0yYW%2FZdHkFSl7hRZmZ6vssAHC6yFtkJ7ygv0K7wa73f7yARzy%2BlIjUeWMqBM3UAr01Lib2uKaUKrLDuvMujE6vrOOQTXCd7avmrLlYzJ9S3Wx57xBkQdboonzkgQ2hwDKL0O76lnd8k%2FaQwuiejyEVqpJWQGkRDVZ%2F1px3RnoAlnQlwEADhTOdg2wuA4O6430YRZJk4aXF3Cy%2FeVQKas7qmJJEs1%2Fo8NNYuIp6UbSEJQqixr6WWA2SCmW5xvRdvGS0CGgypEX6otFM53BFP%2FE%2BlXmqyNGoU7KtmLaFRU3k8YN9WpDVZced0mTCBsp6uFBxpOdIXzXx2vZqEfpIkyEMZ9nd6R8e97UjUSp77llEi6jHt%2BxNbyhgtM57Eh0vjXmV8g%2FeQKE6jS6iyaizZDETHrZKmHTtjX3KcR%2FfoQdO%2BxoVFhr6mpiXl7YsGy3g7ws3MVflC4%2BX4bbAT4vuPOHqs5NJIWGPF2dukT8nwOau762YabNwfATItqxDlywEFYk2%2Fr8m0WuLgFWxGUoAFNGsfC8dNTMoygotuZcOR6wCjdmsnvnqJF%2FqXvWZLlNue0WjTVqUXF1QykIItke9WgbA2krAssLdVhO9ZUJQZ9tkCSiaK8hRrgCeyv2r24y%2BkszykqREyxREYprXlA%2FGP5y0IRItj7ZlIFNRifcTrTdaY0WaqkJzE701NUhnJ00lCQEwsruQtaQtR1GiKX0XZcSq3x9Ape6tqDJbaTvw%2B7m7IehAiNgntCCqVkRQOWhlKpwAa%2BVWKFlkakmWWB5wC27bG2SIL93Z1ea3zCttq1wkynmPji0incxARWRSkccCZ139fZkKU8c40UcZ3aQDLpz%2FsLZXAJm6OtOLYWX5gJVtxRM%2FpdkK3RFlVujfo0SENNccWEkEyoCQvged%2BeL0MC%2BK2PTkUEZ5cuOD%2BYvRhaHc9ugv949faI7oFFN5eZfXzPkOdFgUwdOCd8AW2b4hZVbshupKyZXV%2FppK%2BUUnwZQu%2BOQVqGsq7JPoMt03atku7hutKJ2uv5pF90CUl6IeZ3wiK6zQYY0KZzbDRD%2BF1FeJNsWsLdNA4Y2eIkG%2BAKQl8BSpMFpLtfRX7R9kdDITRCciyvyULvtsYL26nQvXK6DhbC2LSrLSb%2FmtVyyLhivabEWjTcpIUaG%2FVTUTue8ntx3%2FCuB07l6ZAQp7tsysZRortQsyWgw0i7%2BwXxrBJkapnASQNPXNXn%2F17%2BzzKxNIZEeE0l7B9LqNvtcmXHd83zaZO5h1Pcw1lriyohM9i0rT6MXiepH%2BlujzE%2BjulUXnymAU9cyZxOA%2B9EaNchcao6zPIvqLsmwKEKi%2F%2FiOkwkRHVeiwqrlUCC6DJaHLyrpdHvRNyWiyApwsSnv9tjBLEVFNfXshqjrNxpK0V9Bfsd1QHUhlAUyc33DwTawFUb3iA41Volo66ThnsXxh8ISRzC2HDojliykzgCsXjZr8gdO2ZvT6VqPf7MQWoluoubIu0iwardb4qE1aDlRB21T2LS%2FtZGICb9Jq3YQf5rNxy8xhQXkyYwyikE0MUrtErGwyRdKk5wG4wmn4BX1mBZqcgilq3KPHFwO18v6F5QeyMcnqmCt%2BXoUaS9osiXQp0FJgsTgfwvH3fjyb9rejm7yH%2BSk1BS65Rc452gCT99nEeA09rFmf%2F4rVUJUT1WJ81vxXKIJ70KDHTn8nK2IWnaJt799hddaxUNFfq1d7YOAp8LcJrVc1nK1GjVmnwCSNXynuz8Y9M2952wYRp3x88Tn5vXQy8R2d8IS2ImBYRI8FqktnoVQj0qSNZOkkW2Eyb2G%2FENAe30CrelFENGkzGgz0Va6xFoBlBdMzsx%2BsAMw2%2B8ez42VC3q7rPFgFdK%2B8JjRlJTpbpbtDXAipPgoqDyFIFsAUAat9mWUxFe0xEdvlq3ySGEyv6iIgLSiCX6h1ov2y%2FWRL9IsXxiXlL1BuutbF7DiJLVFx3%2BtUOANJAZAvAUFllJOBtSJNlibmJu8vj0ehM6Q6HlaRDOyoT4Dq3NIjHHULMsQocmkqTNLRWYSJ%2FpmVfavcz5liBRQrYCtnigWQTcfrxfctA%2BmNCzKjWN7%2Bh92QDeCLUWsm6itXepT1hSvYvXhS1bHlehKFx%2Br%2FqZysGeVYVqoqHqN8Yb1QeJ5TYeWERf1Z1cczWqtQwgsAj56Xv8vKZ70g9g26S18Z5yVGwGhXAL0XBXxKhauRoBTiI4p9ZUCKgLQKgF8By%2BLjy8JmwRKas%2FF4aayidbImGiuqF8p1Q98GVvZPRxMpOPNKsrCLo6s4vBgRo8FV6028FfU%2B8z0JMK3yv2ZjIKKTPJYAzyyKaWAVwrP0qWb7FY8XtuNUo1oVeFWRXDhRSyd0Ieq%2BStcWRN9IXL%2BroS4rKb%2BssYoRbAVAFaBcwLUIIp8BYuVkV9qBXvn%2F3rhIOBq98v%2BFUWghQtWpcAYYE1O7FgfOViJCcHWWBi%2FL0lYo6819qxdgCZQTvfbKxcUyJKPEGQBjKlxMQzM6e2dQl04AaUr1vALiFcCvnECbXQR0wlqwQNzKBZPNE1QgerfB7xRcoog1PakU%2FlKAvHuyiiG9fKzZSXklYolWlYo9sxLVo%2FPwKcCOnos7U2QUOaXCtL3lVXAt%2FOP2Zw3UKuheeT4By2dfiC9duG%2BMXUv01RxYBYpLwQZNf2NVvsNRV8%2FVe2YDhfuLIvClKEz2gnz%2BDrDwlmxOt2hzccu2NwE6u1iWLnjTyxGkIAqAlmusd8Bm8U0yj31oichsUZHsua1ShSooF6l%2FetUnd%2BIwS%2BY8zjLOYvTl%2F1U%2BV3qouNpQVXed7QabtKysgE3RpLqSKldb9SpNTpjP3le1WCqvBRfa7AKogPnVqJXtUx7HSrQ6LW6b1KaWgFR9TXzJV8BTeQ3D%2ByVqBO9NFxyrjo8ARBlwn%2FjadHwqF%2BKCthqvnanwzcFcAZeKaMvgLAz0pbRUOAGlzymcQCu44y9fNCsAiFzyBQC9Yje0acRaOLnLJz07cew7rZ7kyeBZdVALBfmXx2p1TFZBTp5eNbq%2FPFbGq828GKHSiLQKxhWQUSZnnzAgqwBafv2dC1QIeV%2BJrquRsxC9PImAVyqcXYkjZVb7i22n9hnYdnHXs22RNmOHXXzfYQGE08f3z22R6SeuePx8qTnE6%2BG2JFJE52TFTa9E42XqK7zn7LxPIlBkCagaVmWbXL5xEsGq0c3oam9R1lNJ6YvR6E%2FZlnhOKxGqHKWK22ZRrE6FVeAFYCiD5Z3BenfQKlfjnzk2s%2FcuXmjLY%2Ffu2EyBNRmg0vY3BupdMK0O2lIPeqXHXLnwq%2FtkOq0KpM%2B4EBcuuHgyxeIAzsBV3mcCwqV9XgBrKwJ6%2BeSJIndqylYnRiwAwQoXin%2FGPvSzXeyGPwsUk5NVOWHVaPUpA754oqvezn%2FLsQr7sQJgrUwtaoXBWBmUTxucKh28eZVWLsK3x2oFlCsR992xsqi74QWP6t0r8933rAz4CkDfeU8LLJeq1qy8b%2BWiWAFGaHu8eAG2jArfAcorJ3%2F1arIXrqxXr8iXxPtqlMre9xkX0rvRbAG8ORV%2BEsBWuNzeHbDPHLw35cFnSIG3xuGViPxJ0bAOLFrd7%2BDVVwZahPxy2UCl68k%2BlcHzxYFtK%2F%2FfZHw%2BPZH4BEB68XNnwGpf3g3vq1ffK0nBm9T06VfuvzGb%2FLOBtGwzFT%2B3fem9f%2Fn%2F%2Bc%2F8Gwa%2B2X%2Fzn38DSFd%2F%2FvNL7%2F3%2FmtnD%2Fufnf34%2B7%2Bdf%2F28AkXg9KZ7Ze3oAAAAASUVORK5CYII%3D)center no-repeat;cursor:crosshair}.miniColors-hues{position:absolute;top:5px;left:160px;width:20px;height:150px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAACWCAIAAABRkz%2BJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw%2FeHBhY2tldCBiZWdpbj0i77u%2FIiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8%2BIDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0FDOTcyRjQzNEFFMTFFMDg1NENGREUxMTA5MjQ5M0QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0FDOTcyRjUzNEFFMTFFMDg1NENGREUxMTA5MjQ5M0QiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3QUM5NzJGMjM0QUUxMUUwODU0Q0ZERTExMDkyNDkzRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3QUM5NzJGMzM0QUUxMUUwODU0Q0ZERTExMDkyNDkzRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI%2FPnzKFbcAAAcCSURBVHjanFnbcttGDMVZsbVlp0knb52%2B9%2F8%2Fqh%2FQNrElpxVR7B3YxVJOlExCUQviDhyA%2BPOPTyfsoPhh5vQ%2FIf2h8k3%2BZwDyI1DvMN0obL%2FTG%2FFO4yeeH79WDuX5jI3oM5Eizg%2FXXPoT0s3yiHhSiD8RdiJ7VDMRAk3WDwgxPsbntOfpT4A6ytOBSPyh02F4Bso%2FXAQlsBKMROxnpR4XQqBf98PGAUlnPCuelJ5dlWxHy7W1f%2BRcxKbRYN1CnPmoi0YcnpNVtbawMmZzotu1yiI6nwufrsygKo0%2F1YeK2E%2FFk01zLIIEKk7i%2BUgsnENXj6y2TYD8dO153pO1u2F1GLFRfn4chHN4jJyZfJvn82GMrejRfU86y5cw8KtWoEoZJoOFSPyYxA7KKzacMNm%2FPEKIQ%2BJcMtGm1BCVQYlTXaV0DiqMoNO4Kd8sL38j53OUGZOd5q%2FmgrOrHovCQw3pF9kWqnx1P2fOzbxBx7YNDMM%2Fi00PFE69vmk7B1W6eIoEZM4xPK2EONSZtM6ROPQIYZtcNpN6egrxjoeA0PUE%2BR8MD%2BJdxL4SnZrx29Nh8pobZ1XCpFxvV24alxLG7JVh2xR2TsQX5mxr1rnIo4V6gUg%2F7Yl%2Be0vcYMXT9bt5qpTAeiBzppZT3d5syrFWuNklchbiQKqKsAoSnmtYfVrjHKDsVLU31rYtIN%2BJnK8SH6oVS6seUwAqtZUeSeydA3oCsS0n3RA89psktliLVVx7tV6naTNNJH7JOu%2BJGDVOJptn5NH9nM6In9HhhxtVbJu0%2BmyvPEVfrWI8N3wYg2%2Bvka%2ByBdPywlxHI0fOcEsfe%2BGhwljkE86mqvmfhRTR2rpyur1q1L8aL3LOMTCgoHaTFLYZjm1fvdTV4anTbbDJ9pJShBXu0dczpOipImJ%2FmTm44TFFiNzfvmTc5QIXT2BWyCNxttk3aq57Loy%2Ft3%2BAG4MNFLZgCE7PyYVeSi8XWi6JBbJAnXqesnXKFqHrFEJsI5K1HdAh5bb%2FPIbuUPxYFT1YYLzRWSaPZVCvYrxE2P7AujzpMJ5doNM%2B5jOfTa43AGzEHqo%2FcrETsH6e4DIvEtuYJpbFRLwqBvNXOzgoziuz0CR2Mxg9dujoVxMeG1W1mOj8dFB%2BDr2WdIYD6t%2FncSHmOg554q3URmxWSWd4R%2FnenUQMAxB5crXr9ogrkMQO%2FP1Gi929%2Bhmr4WmN6XbtZ1fIVdhy9vND0tnpRuoazjiXxU6uCjhqbq44RmxMYvNhbHc%2FBzoCB3PO7UXnWkiPbcvT5uLGifNJKTYHKRaRc2s6Y3Iv1onNzWDbjU78HYnVXRWnmwuxVboBxgPJ9zIaXYvcDVoMVb%2FVXtbLE%2BF8U8T8vkq%2F94SuxDxhgWGfZLZN%2BXTWmcIIh2CjmedFQiZma7DWFIfg5EkXbpxbfDLTMsVG7YX4rSwElmpzx2Lm1yh2gq7jqA4zJ7ECNax3Brjk8m8GRj1wr4BWNZgqoHrJxDCzZQM1BbsUg2HcoQxzvoYsbZhkqsRubHgDtJopIucXszpyNpZeryl7Enrtk%2FfdZISecTkZbJZ2XtjMw3tssSI2T6WTbW3BVJXr6vKrOT3X6gmKtDMSJC%2BqP9u5j21U98QsAF90%2FqrmiaGAkGvlirGRxd4XOyWL1sdVSdy4%2Fp22zPeqD6vZvngriNh%2FxRE1DNMC%2Bz2K9U3Jh9d1u8HhaLuXTdhBJByF3OZnLN9DRmrltd7buR2rSrR9JvrXzhg4RLA5lITnT0L8m3mXcK%2B%2Fq6lL6Ldftf3ttMt2eczzOPhx2gS4WB9ebmy%2F2CjsxKqQs9qf9HxHJmbP1RMUNGVqT2I%2Fz4CCj2CFKiRCPHHGEMU%2BAkzjYAS9YewtZpBFH7kApbno%2FKG998ilXr8DodFCw%2Fi2naFEdper3tI5d5HtadoEz0M62x1khdvCua370d8sEdaDluZ8bpl1dyJxrJ0LyQF2XCwjo9hPKJt8fwFl%2Fdz3T3G4oe2xLdPt3hUDUICt3HvaPp651j%2BowNIYZGqxGYVEsWUmO7UcgvfGyEZbfg3BCesng3FZrPtZ5cVMAvpZZ4wjRu5k%2FoatqnXLnE%2Fwqgyc6UafiTqHb%2FFNxLuAPtunyJiANwU9ecL1q75TZoyrwa3LKXg25y0Tz6t1WkyUA2dcCWG9pFg0fOQdYBsxlmK7snSd1Vu2OyOwT%2BzisKPXoWnjiuuPLVky54tX7vhwos5QVYhlSkC4h0DceHN0dlcy3uSPovOcMjjcUzWDGZ158dp5seraCg5zXYL1VgzN2uEQOy3addq4XhbrBdDxkisW%2FTZi3EFArs64eGF8sPBAx82JM99bXS72H0nnY6S53rwkzu%2BpG16vT%2BHJP5RVWLmK3pEkQnz9zzZ3OCUacBwhvep%2FAQYA%2FfsCsjFZHQIAAAAASUVORK5CYII%3D)center no-repeat;cursor:crosshair}.miniColors-colorPicker{position:absolute;width:11px;height:11px;background:url(data:image/gif;base64,R0lGODlhCwALAJECAAAAAP%2F%2F%2F%2F%2F%2F%2FwAAACH5BAEAAAIALAAAAAALAAsAAAIflINoG%2BAeGFgGxEaXxVns2X2dh4CZJXBadDxQlihGAQA7)center no-repeat}.miniColors-huePicker{position:absolute;left:-3px;width:26px;height:3px;background:url(data:image/gif;base64,R0lGODlhGgADAIAAAP%2F%2F%2FwAAACH%2FC1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3QUM5NzJGODM0QUUxMUUwODU0Q0ZERTExMDkyNDkzRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3QUM5NzJGOTM0QUUxMUUwODU0Q0ZERTExMDkyNDkzRCI%2BIDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjdBQzk3MkY2MzRBRTExRTA4NTRDRkRFMTEwOTI0OTNEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjdBQzk3MkY3MzRBRTExRTA4NTRDRkRFMTEwOTI0OTNEIi8%2BIDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY%2BIDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8%2BAf%2F%2B%2Ffz7%2Bvn49%2Fb19PPy8fDv7u3s6%2Brp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M%2FOzczLysnIx8bFxMPCwcC%2Fvr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ%2BenZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8%2BPTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAAAAAAAsAAAAABoAAwAAAguEj6ka7Q%2BjW7SeAgA7)center no-repeat}');
		
		GM_addStyle('#fv-edit-emoticonlist-panel p { margin:10px 0; } #fv-edit-emoticonlist-panel p:first-child span.emoticon-remove { display:none; } .emoticon-preview{ padding-left: 5px;padding-right:3px; } .emoticon-remove { color:red; cursor:pointer;} .emoticon-add { color:green; cursor:pointer;}');
		
		$('body').prepend('<div class="above_body"></div><div class="body_wrapper"><div class="breadcrumb"id="breadcrumb"><ul class="floatcontainer"><li class="navbithome"><a accesskey="1"href="index.php"><img alt="Home"src="/images/vmg/misc/navbit-home.png"title="Home"></a></li><li class="navbit"><a href="usercp.php">Settings</a></li><li class="navbit lastnavbit"><span>Edit FireVortex</span></li></ul><hr></div><br style="clear:both;"/><div id="usercp_content"><div class="cp_content"><form id="profileform"class="block"><h2 class="blockhead">Edit FireVortex Settings</h2><div class="blockbody formcontrols settings_form_border"><h3 class="blocksubhead">General</h3><div class="section"><div class="blockrow"><label for="myPage">My FireVortex</label><div class="rightcol"><select tabindex="1" id="myPage" class="primary" name="myPage"><option value="1">Enable</option><option value="0">Disable</option></select></div><div class="rightcol"><label for="myPageItemsNewPostThreadSubscriptions">New Post Items</label><select tabindex="1" id="myPageItemsNewPostThreadSubscriptions" name="myPageItemsNewPostThreadSubscriptions"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option><option value="35">35</option></select></div><div class="rightcol"><label for="myPageItemsThreadSubscriptions">Thread Subscription Items</label><select tabindex="1" id="myPageItemsThreadSubscriptions" name="myPageItemsThreadSubscriptions"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option><option value="35">35</option></select></div><p class="description">Displays New Posts, Subscribed Topics, and Subcribed Forums feeds on forum homepage when logged in.</p></div><div class="blockrow"><label for="fullIgnoreUser">Extend Ignore Users</label><div class="rightcol"><select tabindex="1"id="fullIgnoreUser"class="primary"name="fullIgnoreUser"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Removes threads started by,quotes,and removes vBulletins ignore user message post.</p></div><div class="blockrow"><label for="keyBindHidePage">Hide Page</label><div class="rightcol"><select tabindex="3"id="keyBindHidePage"class="primary"name="keyBindHidePage"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Use the keyboard shortcut:alt+z which toggles page blank.</p></div><div class="blockrow"><label for="superSizeMe">SuperSize Forums</label><div class="rightcol"><select tabindex="2"id="superSizeMe"class="primary"name="superSizeMe"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Removes all extra whitespace,banners,header and footer.<a href="http://adblockplus.org/en/">Adblock Plus</a> (available for Chrome too) is recommended to increase browsing performance. Enter this filter subscription url: http:\/\/update.firevortex.net\/abp\/vmg.supersizeme.txt</p><p class="description">You can add filter subscriptions by opening Adblock Plus preferences.Then add a new subscription by going to menu Filters/Add filter subscription.Once you are done with your changes click OK.</p></div></div><h3 class="blocksubhead">Forums</h3><div class="section"><div class="blockrow"><label for="forumKillThreads">Kill a Thread</label><div class="rightcol"><select tabindex="4"id="forumKillThreads"class="primary"name="forumKillThreads"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Removed selected threads from view within a forum category</p></div><div class="blockrow"><label for="forumKillAllStickies">Kill Stickies</label><div class="rightcol"><select tabindex="5"id="forumKillAllStickies"class="primary"name="forumKillAllStickies"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove stickies</p></div><div class="blockrow"><label for="forumKillAllLocks">Kill Locked</label><div class="rightcol"><select tabindex="6"id="forumKillAllLocks"class="primary"name="forumKillAllLocks"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove locked threads</p></div><div class="blockrow"><label for="previewHover">Preview Posts</label><div class="rightcol"><select tabindex="7"id="previewHover"class="primary"name="previewHover"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Preview the first or last post for a given thread.</p></div><div class="blockrow"><label for="forumThreadsPreview">Preview Topics</label><div class="rightcol"><select tabindex="7"id="forumThreadsPreview"class="primary"name="forumThreadsPreview"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Preview new topics for a given forum.</p></div><div class="blockrow"><label for="forumLinkedClassifieds">Linked Classifieds</label><div class="rightcol"><select tabindex="7" id="forumLinkedClassifieds" class="primary" name="forumLinkedClassifieds"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Display new topics feeds for linked Parts and Cars classifieds in a sub model forum</p></div><div class="blockrow"><label>Page Refresh Timer</label><div class="rightcol"><label for="forumRefresh"></label><select tabindex="4"id="forumRefresh"class="primary"name="forumRefresh"><option value="1">Enable</option><option value="0">Disable</option></select></div><div class="rightcol"><label for="forumRefreshRate">Rate(Minutes)</label><select tabindex="1"id="forumRefreshRate"name="forumRefreshRate"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option></select></div><p class="description">Auto-refresh a forum category and my post pages.</p></div></div><h3 class="blocksubhead">Topics</h3><div class="section"><div class="blockrow"><label for="threadQuickReply">Quick Reply</label><div class="rightcol"><select tabindex="1"id="threadQuickReply"class="primary"name="threadQuickReply"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description"></p></div><div class="blockrow"><label for="threadFirstPostExcerpt">View First Post Excerpt</label><div class="rightcol"><select tabindex="2"id="threadFirstPostExcerpt"class="primary"name="threadFirstPostExcerpt"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Displays the excerpt of the first post on each page.</p></div><div class="blockrow"><label for="threadKillQuotedImages">Remove Quoted Images</label><div class="rightcol"><select tabindex="3"id="threadKillQuotedImages"class="primary"name="threadKillQuotedImages"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove(replaced with a link)images within quoted posts.</p></div><div class="blockrow"><label for="threadKillQuoteInSigs">Remove Quotes in Signatures</label><div class="rightcol"><select tabindex="3"id="threadKillQuoteInSigs"class="primary"name="threadKillQuoteInSigs"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove quotes within signatues.</p></div><div class="blockrow"><label for="threadKillItalicQuotesText">Remove Italic text in Quotes</label><div class="rightcol"><select tabindex="3" id="threadKillItalicQuotesText" class="primary" name="threadKillItalicQuotesText"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove the italics font from quoted text</p></div><div class="blockrow"><label for="emoticons">Enable Emoticons</label><div class="rightcol"><select tabindex="3" id="emoticons" class="primary" name="emoticons"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Enable custom emoticons on thread reply/post/quick reply.</p></div><div class="blockrow singlebutton"><label>Emoticons:</label><div class="rightcol"><a id="fv-edit-emoticonlist" class="button">Edit Emoticon List</a></div><div id="fv-edit-emoticonlist-panel"></div><p class="description">Add your own emoticon image links (use full url, ie http://somedomain.com/someonestolenimage.gif ).</p></div></div><h3 class="blocksubhead">Highlight</h3><div class="section"><div class="blockrow"><label for="threadUserHighlight">User Highlight</label><div class="rightcol"><select tabindex="3"id="threadUserHighlight"class="primary"name="threadUserHighlight"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description"></p></div><fieldset class="blockrow"><legend>Highlight Colors</legend><ul class="group"><li><select tabindex="3" id="threadUserHighlightOwn" class="primary" name="threadUserHighlightOwn"><option value="1">Enable</option><option value="0">Disable</option></select><label for="threadUserHighlightColorOwn">Self:</label><input type="hidden" value="" name="threadUserHighlightColorOwn" id="threadUserHighlightColorOwn" class="colors"></li><li><select tabindex="3" id="threadUserHighlightAdvertisers" class="primary" name="threadUserHighlightAdvertisers"><option value="1">Enable</option><option value="0">Disable</option></select></li><li><label for="threadUserHighlightColorBanner">Banner Advertiser:</label><input type="hidden" value="" name="threadUserHighlightColorBanner" id="threadUserHighlightColorBanner" class="colors"></li><li><label for="threadUserHighlightColorClassified">Classified Advertiser:</label><input type="hidden" value="" name="threadUserHighlightColorClassified" id="threadUserHighlightColorClassified" class="colors"></li><li><label for="threadUserHighlightColorForum">Forum Advertiser:</label><input type="hidden" value="" name="threadUserHighlightColorForum" id="threadUserHighlightColorForum" class="colors"></li><li><select tabindex="3" id="threadUserHighlightVMG" class="primary" name="threadUserHighlightVMG"><option value="1">Enable</option><option value="0">Disable</option></select></li><li><label for="threadUserHighlightColorVMG">VMG Staff, Moderators, Admins</label><input type="hidden" value="" name="threadUserHighlightColorVMG" id="threadUserHighlightColorVMG" class="colors"></li><li><label for="threadUserHighlightColorFV">FireVortex Admin</label><input type="hidden" value="" name="threadUserHighlightColorFV" id="threadUserHighlightColorFV" class="colors"></li><li><select tabindex="3" id="threadUserHighlightIgnore" class="primary" name="threadUserHighlightIgnore"><option value="1">Enable</option><option value="0">Disable</option></select><label for="threadUserHighlightColorIgnore">Ignored Users</label><input type="hidden" value="" name="threadUserHighlightColorIgnore" id="threadUserHighlightColorIgnore" class="colors"></li><li><select tabindex="3" id="threadUserHighlightBuddy" class="primary" name="threadUserHighlightBuddy"><option value="1">Enable</option><option value="0">Disable</option></select><label for="threadUserHighlightColorBuddy">Friends and Following</label><input type="hidden" value="" name="threadUserHighlightColorBuddy" id="threadUserHighlightColorBuddy" class="colors"></li><li><select tabindex="3" id="forumSubscriptionHighlight" class="primary" name="forumSubscriptionHighlight"><option value="1">Enable</option><option value="0">Disable</option></select><label for="forumSubscriptionHighlightColor">Subscribed Forums</label><input type="hidden" value="" name="forumSubscriptionHighlightColor" id="forumSubscriptionHighlightColor" class="colors"></li><li><select tabindex="3" id="threadSubscriptionHighlight" class="primary" name="threadSubscriptionHighlight"><option value="1">Enable</option><option value="0">Disable</option></select><label for="threadSubscriptionHighlightColor">Subscribed Topics</label><input type="hidden" value="" name="threadSubscriptionHighlightColor" id="threadSubscriptionHighlightColor" class="colors"></li></ul><p class="description"></p></fieldset></div></div><div class="blockfoot actionbuttons settings_form_border"><div class="group"><input id="savefvsettings"type="submit"accesskey="s"tabindex="1"value="Save Changes"class="button"></div><div class="confirm"></div></div></form></div></div><div id="usercp_nav"><div class="block"></div></div></div>');
	},
	
	loadOptions: function() {

		//listener
		$('#fv-edit-emoticonlist').bind('click', function(){
			$('#fv-edit-emoticonlist-panel').slideToggle('slow', function() {
				
				$("#fv-edit-emoticonlist").text($(this).is(':visible') ? "Close Emoticon List" : "Edit Emoticon List");
				
			});
		}).css( 'cursor', 'pointer');

		//General
		$('#fullIgnoreUser option[value="'+ is10( FireVortex.Config.getFullIgnoreUser() ) +'"]').attr("selected",true);
		$('#keyBindHidePage option[value="'+ is10( FireVortex.Config.getKeyBindHidePage() ) +'"]').attr("selected",true);
		$('#superSizeMe option[value="'+ is10( FireVortex.Config.getSuperSizeMe() ) +'"]').attr("selected",true);
		$('#myPage option[value="'+ is10( FireVortex.Config.getMyPage() ) +'"]').attr("selected",true);
		$('#myPageItemsNewPostThreadSubscriptions option[value="'+ FireVortex.Config.getMyPageItemsNewPostThreadSubscriptions() +'"]').attr("selected",true);
		$('#myPageItemsThreadSubscriptions option[value="'+ FireVortex.Config.getMyPageItemsThreadSubscriptions() +'"]').attr("selected",true);
		
		//Forums
		$('#forumKillThreads option[value="'+ is10( FireVortex.Config.getForumKillThreads() ) +'"]').attr("selected",true);
		$('#forumKillAllStickies option[value="'+ is10( FireVortex.Config.getForumKillAllStickies() ) +'"]').attr("selected",true);
		$('#forumKillAllLocks option[value="'+ is10( FireVortex.Config.getForumKillAllLocks() ) +'"]').attr("selected",true);
		$('#previewHover option[value="'+ is10( FireVortex.Config.getPreviewHover() ) +'"]').attr("selected",true);
		$('#forumThreadsPreview option[value="'+ is10( FireVortex.Config.getForumThreadsPreview() ) +'"]').attr("selected",true);
		$('#forumLinkedClassifieds option[value="'+ is10( FireVortex.Config.getForumLinkedClassifieds() ) +'"]').attr("selected",true);
		$('#forumRefresh option[value="'+ is10( FireVortex.Config.getForumRefresh() ) +'"]').attr("selected",true);
		$('#forumRefreshRate option[value="'+ FireVortex.Config.getForumRefreshRate() +'"]').attr("selected",true);
		
		//Topics
		$('#threadQuickReply  option[value="'+ is10( FireVortex.Config.getThreadQuickReply() ) +'"]').attr("selected",true);
		$('#threadFirstPostExcerpt  option[value="'+ is10( FireVortex.Config.getThreadFirstPostExcerpt() ) +'"]').attr("selected",true);
		$('#threadKillQuotedImages option[value="'+ is10( FireVortex.Config.getThreadKillQuotedImages() ) +'"]').attr("selected",true);
		$('#threadKillQuoteInSigs option[value="'+ is10( FireVortex.Config.getThreadKillQuoteInSigs() ) +'"]').attr("selected",true);
		$('#threadKillItalicQuotesText option[value="'+ is10( FireVortex.Config.getThreadKillItalicQuotesText() ) +'"]').attr("selected",true);
		$('#emoticons option[value="'+ is10( FireVortex.Config.getEmoticons() ) +'"]').attr("selected",true);
		
		//Highlighting
		$('#threadUserHighlight option[value="'+ is10( FireVortex.Config.getThreadUserHighlight() ) +'"]').attr("selected",true);
		$('#threadUserHighlightOwn option[value="'+ is10( FireVortex.Config.getThreadUserHighlightOwn() ) +'"]').attr("selected",true);
		$('#threadUserHighlightAdvertisers option[value="'+ is10( FireVortex.Config.getThreadUserHighlightAdvertisers() ) +'"]').attr("selected",true);
		$('#threadUserHighlightVMG option[value="'+ is10( FireVortex.Config.getThreadUserHighlightVMG() ) +'"]').attr("selected",true);
		$('#threadUserHighlightIgnore option[value="'+ is10( FireVortex.Config.getThreadUserHighlightIgnore() ) +'"]').attr("selected",true);
		$('#threadUserHighlightBuddy option[value="'+ is10( FireVortex.Config.getThreadUserHighlightBuddy() ) +'"]').attr("selected",true);
		$('#forumSubscriptionHighlight option[value="'+ is10( FireVortex.Config.getForumSubscriptionHighlight() ) +'"]').attr("selected",true);
		$('#threadSubscriptionHighlight option[value="'+ is10( FireVortex.Config.getThreadSubscriptionHighlight() ) +'"]').attr("selected",true);

		$('#threadUserHighlightColorOwn').val( FireVortex.Config.getThreadUserHighlightColorOwn() );
		$('#threadUserHighlightColorBanner').val( FireVortex.Config.getThreadUserHighlightColorBanner() );
		$('#threadUserHighlightColorClassified').val( FireVortex.Config.getThreadUserHighlightColorClassified() );
		$('#threadUserHighlightColorForum').val( FireVortex.Config.getThreadUserHighlightColorForum() );
		$('#threadUserHighlightColorVMG').val( FireVortex.Config.getThreadUserHighlightColorVMG() );
		$('#threadUserHighlightColorFV').val( FireVortex.Config.getThreadUserHighlightColorFV() );
		$('#threadUserHighlightColorIgnore').val( FireVortex.Config.getThreadUserHighlightColorIgnore() );
		$('#threadUserHighlightColorBuddy').val( FireVortex.Config.getThreadUserHighlightColorBuddy() );
		$('#forumSubscriptionHighlightColor').val( FireVortex.Config.getForumSubscriptionHighlightColor() );
		$('#threadSubscriptionHighlightColor').val( FireVortex.Config.getThreadSubscriptionHighlightColor() );
		
		//load up color pickers
		$(".colors").miniColors({ 
			change: function(hex, rgb) {
				$("#console").prepend('HEX: ' + hex + ' (RGB: ' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')<br />');
			}
		});
		
		
		//load up emoticons to panel
		var emoticonlist = getStorageObject( 'fv_emoticonlist' );
		if ( emoticonlist && emoticonlist.emoticons.length ) {
			for ( var i = 0; i < emoticonlist.emoticons.length; i++ ) {
				$("#fv-edit-emoticonlist-panel").append('<p><span>Image Url:</span> <input id="'+ i +'" class="emoticon-item" size="55" type="text" value="'+ emoticonlist.emoticons[i].url +'"/><span class="emoticon-preview"><img src="'+ emoticonlist.emoticons[i].url +'" class="ep"/></span><span class="emoticon-remove">Remove</span></p>');
			}
		} else {
			$("#fv-edit-emoticonlist-panel").append('<p><span>Image Url:</span> <input id="0" class="emoticon-item" size="55" type="text"><span class="emoticon-preview"/></span><span class="emoticon-remove">Remove</span></p>');
		}

		$("#fv-edit-emoticonlist-panel").append('<p><span class="emoticon-add">Add</span> - you may use <a href="http://e.tinytex.com/g.list.html" target="_blank">emoticons hosted by FireVortex</a></p>');
		
		$(".emoticon-add").click(function() {
			$("#fv-edit-emoticonlist-panel > p:first-child").clone(true).find('input').attr({value: ''}).end().find('.emoticon-preview').html('').end().insertBefore("#fv-edit-emoticonlist-panel > p:last-child");
			return false;
		});
		$(".emoticon-remove").click(function() {
			$(this).parent().remove();
		});
		
		
		//capture settings save
		$("form").submit(function() {

			//General
			FireVortex.Config.setFullIgnoreUser( $('#fullIgnoreUser :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setSuperSizeMe( $('#superSizeMe :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setKeyBindHidePage( $('#keyBindHidePage :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setMyPage( $('#myPage :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setMyPageItemsNewPostThreadSubscriptions( $('#myPageItemsNewPostThreadSubscriptions :selected').attr('value') );
			FireVortex.Config.setMyPageItemsThreadSubscriptions( $('#myPageItemsThreadSubscriptions :selected').attr('value') );


			//Forums
			FireVortex.Config.setForumKillThreads( $('#forumKillThreads :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setForumKillAllStickies( $('#forumKillAllStickies :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setForumKillAllLocks( $('#forumKillAllLocks :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setPreviewHover( $('#previewHover :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setForumThreadsPreview( $('#forumThreadsPreview :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setForumLinkedClassifieds( $('#forumLinkedClassifieds :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setForumRefresh( $('#forumRefresh :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setForumRefreshRate( $('#forumRefreshRate :selected').attr('value') );
			
			//Topics
			FireVortex.Config.setThreadQuickReply( $('#threadQuickReply :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setThreadFirstPostExcerpt( $('#threadFirstPostExcerpt :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setThreadKillQuotedImages( $('#threadKillQuotedImages :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setThreadKillQuoteInSigs($('#threadKillQuoteInSigs :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setThreadKillItalicQuotesText($('#threadKillItalicQuotesText :selected').attr('value') == 1 ? true: false );
			FireVortex.Config.setEmoticons($('#emoticons :selected').attr('value') == 1 ? true: false );
			
			//Highlighting
			FireVortex.Config.setThreadUserHighlight($('#threadUserHighlight :selected').attr('value') == 1 ? true: false );
			
			FireVortex.Config.setThreadUserHighlightOwn($('#threadUserHighlightOwn :selected').attr('value') == 1 ? true: false );
			if ( $('#threadUserHighlightColorOwn').val().startsWith("#") ) FireVortex.Config.setThreadUserHighlightColorOwn( $('#threadUserHighlightColorOwn').val() );
			
			FireVortex.Config.setThreadUserHighlightAdvertisers($('#threadUserHighlightAdvertisers :selected').attr('value') == 1 ? true: false );
			if ( $('#threadUserHighlightColorBanner').val().startsWith("#") ) FireVortex.Config.setThreadUserHighlightColorBanner( $('#threadUserHighlightColorBanner').val() );
			if ( $('#threadUserHighlightColorClassified').val().startsWith("#") ) FireVortex.Config.setThreadUserHighlightColorClassified( $('#threadUserHighlightColorClassified').val() );
			if ( $('#threadUserHighlightColorForum').val().startsWith("#") ) FireVortex.Config.setThreadUserHighlightColorForum( $('#threadUserHighlightColorForum').val() );
			
			FireVortex.Config.setThreadUserHighlightVMG($('#threadUserHighlightVMG :selected').attr('value') == 1 ? true: false );
			if ( $('#threadUserHighlightColorVMG').val().startsWith("#") ) FireVortex.Config.setThreadUserHighlightColorVMG( $('#threadUserHighlightColorVMG').val() );
			if ( $('#threadUserHighlightColorFV').val().startsWith("#") ) FireVortex.Config.setThreadUserHighlightColorFV( $('#threadUserHighlightColorFV').val() );
			
			FireVortex.Config.setThreadUserHighlightIgnore($('#threadUserHighlightIgnore :selected').attr('value') == 1 ? true: false );
			if ( $('#threadUserHighlightColorIgnore').val().startsWith("#") ) FireVortex.Config.setThreadUserHighlightColorIgnore( $('#threadUserHighlightColorIgnore').val() );
			
			FireVortex.Config.setThreadUserHighlightBuddy($('#threadUserHighlightBuddy :selected').attr('value') == 1 ? true: false );
			if ( $('#threadUserHighlightColorBuddy').val().startsWith("#") ) FireVortex.Config.setThreadUserHighlightColorBuddy( $('#threadUserHighlightColorBuddy').val() );
			
			FireVortex.Config.setForumSubscriptionHighlight($('#forumSubscriptionHighlight :selected').attr('value') == 1 ? true: false );
			if ( $('#forumSubscriptionHighlightColor').val().startsWith("#") ) FireVortex.Config.setForumSubscriptionHighlightColor( $('#forumSubscriptionHighlightColor').val() );
			
			FireVortex.Config.setThreadSubscriptionHighlight($('#threadSubscriptionHighlight :selected').attr('value') == 1 ? true: false );
			if ( $('#threadSubscriptionHighlightColor').val().startsWith("#") ) FireVortex.Config.setThreadSubscriptionHighlightColor( $('#threadSubscriptionHighlightColor').val() );

			//emoticons
			var emoticonlist = { "updated" : null, "emoticons" : new Array() };
			$('.emoticon-item').each( function(i) {
			
				if ( $(this).val().startsWith("http://") && ( $(this).val().endsWith(".jpg") || $(this).val().endsWith(".gif") || $(this).val().endsWith(".png") ) ) {
			
					var emoticon = { "fvqr" : false, "shortcode" : false, "url" : $(this).val(), "added" : new Date() };		
					emoticonlist.emoticons.push(emoticon);
				}
				
			});
			emoticonlist.updated = new Date();
			setStorageObject('fv_emoticonlist' , emoticonlist);


			$('.blockfoot .confirm').show();
			$('.blockfoot .confirm').html('settings updated...').fadeOut(2000);

			return false;
		});
		
	},
	
};

FireVortex.UI.Debug = {
	
	init: function() {
		if ( $('.standard_error').length == 0 ) {
			this.loadHtml();
			this.loadOptions();
		}
	},
	
	loadHtml: function() {
		
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=bbcode.css,editor.css,popupmenu.css,reset-fonts.css,vbulletin.css,vbulletin-chrome.css,vbulletin-formcontrols.css');
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=attachments.css,forumbits.css,forumdisplay.css,postlist.css,projecttools.css,threadlist.css,usercp.css');
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=additional.css');

		$('body').prepend('<div class="above_body"></div><div class="body_wrapper"><div class="breadcrumb"id="breadcrumb"><ul class="floatcontainer"><li class="navbithome"><a accesskey="1"href="index.php"><img alt="Home"src="/images/vmg/misc/navbit-home.png"title="Home"></a></li><li class="navbit"><a href="usercp.php">Settings</a></li><li class="navbit lastnavbit"><span>Debug FireVortex</span></li></ul><hr></div><br style="clear:both;"/><div id="usercp_content"><div class="cp_content"></div></div><div id="usercp_nav"><div class="block"></div></div></div>');
	},
	
	loadOptions: function() {
		
		var echoconfig = {
			"General" : {
				"fullIgnoreUser" : FireVortex.Config.getFullIgnoreUser(),
				"keyBindHidePage" : FireVortex.Config.getKeyBindHidePage(),
				"superSizeMe" : FireVortex.Config.getSuperSizeMe(),
				"myPage" : FireVortex.Config.getMyPage(),
				"myPageItemsNewPostThreadSubscriptions" : FireVortex.Config.getMyPageItemsNewPostThreadSubscriptions(),
				"myPageItemsThreadSubscriptions" : FireVortex.Config.getMyPageItemsThreadSubscriptions()
			},
			
			"Forums" : {
				"forumKillThreads" : FireVortex.Config.getForumKillThreads(),
				"forumKillAllStickies" : FireVortex.Config.getForumKillAllStickies(),
				"forumKillAllLocks" : FireVortex.Config.getForumKillAllLocks(),
				"previewHover" : FireVortex.Config.getPreviewHover(),
				"forumThreadsPreview" : FireVortex.Config.getForumThreadsPreview(),
				"forumLinkedClassifieds" : FireVortex.Config.getForumLinkedClassifieds(),
				"forumRefresh" : FireVortex.Config.getForumRefresh(),
				"forumRefreshRate" : FireVortex.Config.getForumRefreshRate(),
			},

			"Topics" : {
				"threadQuickReply" : FireVortex.Config.getThreadQuickReply(),
				"threadFirstPostExcerpt" : FireVortex.Config.getThreadFirstPostExcerpt(),
				"threadKillQuotedImages" : FireVortex.Config.getThreadKillQuotedImages(),
				"threadKillQuoteInSigs" : FireVortex.Config.getThreadKillQuoteInSigs(),
				"threadKillItalicQuotesText" : FireVortex.Config.getThreadKillItalicQuotesText(),
				"emoticons" : FireVortex.Config.getEmoticons(),
			},
			
			"Highlighting" : {
				"Enabled" : {
					"threadUserHighlight" : FireVortex.Config.getThreadUserHighlight(),
					"threadUserHighlightOwn" : FireVortex.Config.getThreadUserHighlightOwn(),
					"threadUserHighlightAdvertisers" : FireVortex.Config.getThreadUserHighlightAdvertisers(),
					"threadUserHighlightVMG" : FireVortex.Config.getThreadUserHighlightVMG(),
					"threadUserHighlightIgnore" : FireVortex.Config.getThreadUserHighlightIgnore(),
					"threadUserHighlightBuddy" : FireVortex.Config.getThreadUserHighlightBuddy(),
					"forumSubscriptionHighlight" : FireVortex.Config.getForumSubscriptionHighlight(),
					"threadSubscriptionHighlight" : FireVortex.Config.getThreadSubscriptionHighlight(),
				},
				"Colors" : {
					"threadUserHighlightColorOwn" : FireVortex.Config.getThreadUserHighlightColorOwn(),
					"threadUserHighlightColorBanner" : FireVortex.Config.getThreadUserHighlightColorBanner(),
					"threadUserHighlightColorClassified" : FireVortex.Config.getThreadUserHighlightColorClassified(),
					"threadUserHighlightColorForum" : FireVortex.Config.getThreadUserHighlightColorForum(),
					"threadUserHighlightColorVMG" : FireVortex.Config.getThreadUserHighlightColorVMG(),
					"threadUserHighlightColorFV" : FireVortex.Config.getThreadUserHighlightColorFV(),
					"threadUserHighlightColorIgnore" : FireVortex.Config.getThreadUserHighlightColorIgnore(),
					"threadUserHighlightColorBuddy" : FireVortex.Config.getThreadUserHighlightColorBuddy(),
					"forumSubscriptionHighlightColor" : FireVortex.Config.getForumSubscriptionHighlightColor(),
					"threadSubscriptionHighlightColor" : FireVortex.Config.getThreadSubscriptionHighlightColor(),
				},
			},
			
		};
		
		$('.cp_content').append( "<div style='margin-top:25px; margin-bottom:25px;'><h2>FireVortex</h2><p style='margin-top:5px;'><code>{ \"version\" : "+ VERSION.fv +", \"url\" : \""+ SERVER_HOST +"\", \"key\" : "+ domainKey +" }</code></p></div>" );

		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Browser</h2><p style='margin-top:5px;'><code>"+ navigator.userAgent +"</code></p></div>" );
		
		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Configuration</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( echoconfig ) +"</code></p></div>" );
		
		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Parse Procoess</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_parseprocess' ) ) +"</code></p></div>" );

		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Buddy List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_buddylist' ) ) +"</code></p></div>" );

		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Ignore List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_ignorelist' ) ) +"</code></p></div>" );

		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Thread Subscription List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_threadsubscriptionlist' ) ) +"</code></p></div>" );

		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>New Post Thread Subscription List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_newpostthreadsubscriptionlist' ) ) +"</code></p></div>" );

		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Forum Subscription List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_forumsubscriptionlist' ) ) +"</code></p></div>" );
		
		$('.cp_content').append( "<div><h2>Emoticon List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_emoticonlist' ) ) +"</code></p></div>" );
				
	},
	
};

/**
 * Encapsulates access to configuration preferences, providing getters and
 * setters for each preference.
 */
FireVortex.Config = {
	
	props: { "name" : new Array(), "getter" : new Array(), "setter" : new Array() },
	
    init: function() {
    
		// Set up forums
		this._booleanProperty("forumKillThreads", true);
        this._booleanProperty("forumKillAllStickies", false);
		this._booleanProperty("forumKillAllLocks", false);
        this._booleanProperty("forumRefresh", false);
        this._booleanProperty("forumRefreshRate", '10');
        this._booleanProperty("forumThreadsPreview", true);
        this._booleanProperty("forumLinkedClassifieds", true);

        // Set up threads
        this._booleanProperty("threadKillQuotedImages", false);
		this._booleanProperty("threadKillQuoteInSigs", false);
		this._booleanProperty("threadKillItalicQuotesText", false);
		this._booleanProperty("threadQuickReply", true);
		this._booleanProperty("threadFirstPostExcerpt", true);

		//highlighting
		this._booleanProperty("threadUserHighlight", true);
		this._booleanProperty("threadUserHighlightOwn", true);
		this._booleanProperty("threadUserHighlightAdvertisers", true);
		this._booleanProperty("threadUserHighlightVMG", true);
		this._booleanProperty("threadUserHighlightIgnore", true);
		this._booleanProperty("threadUserHighlightBuddy", true);
		this._booleanProperty("forumSubscriptionHighlight", true);
		this._booleanProperty("threadSubscriptionHighlight", true);
		this._booleanProperty("threadUserHighlightColorOwn", '#999999');
		this._booleanProperty("threadUserHighlightColorBanner", '#BDD7BD');
		this._booleanProperty("threadUserHighlightColorClassified", '#E5BDBD');
		this._booleanProperty("threadUserHighlightColorForum", '#BDCAD7');
		this._booleanProperty("threadUserHighlightColorVMG", '#ABCEF2');
		this._booleanProperty("threadUserHighlightColorFV", '#FFC06F');
		this._booleanProperty("threadUserHighlightColorIgnore", '#FF6666');
		this._booleanProperty("threadUserHighlightColorBuddy", '#99CCCC');
		this._booleanProperty("forumSubscriptionHighlightColor", '#999999');
		this._booleanProperty("threadSubscriptionHighlightColor", '#999999');

		//Set up preview threads
        this._booleanProperty("previewHover", true)
        this._booleanProperty("previewImageHover", true);
		this._booleanProperty("previewWindowBtn", false);
        this._booleanProperty("previewHoverSig", true);
		this._booleanProperty("previewHoverLinks", true);
        this._booleanProperty("previewWindowSizeWidth", "600");
		this._booleanProperty("previewWindowSizeHeight", "500");
		
		//Set up posting
		this._booleanProperty("emoticons", true);
		
		//Set up general pref
		this._booleanProperty("superSizeMe", false);
		this._booleanProperty("vorsitzender", false);
		this._booleanProperty("fullIgnoreUser", true);
		this._booleanProperty("keyBindHidePage", true);
		this._booleanProperty("parseRefreshRate", '5');
		this._booleanProperty("myPage", true);
		this._booleanProperty("myPageItemsNewPostThreadSubscriptions", '15');
		this._booleanProperty("myPageItemsThreadSubscriptions", '15');

    },

    /**
     * Registers getter and setter functions with the given preference name,
     * with the getter returning the given default value if the preference has
     * not previously been set.
     */
    _booleanProperty: function(name, defaultValue) {
        var suffix = name.capFirst();
        this["get" + suffix] = function() { return this._getPreference(name, defaultValue); };
        this["set" + suffix] = function(newValue) { GM_setValue(name, newValue); };
        this.props.name.push(name);
        this.props.getter.push("FireVortex.Config.get" + suffix +"()");
        this.props.setter.push("FireVortex.Config.set" + suffix +"()");
        
        //if (defaultValue === true ||  defaultValue === false) console.log('is boolean '+ name + defaultValue);
    },


//TODO
// - need chrome/opera for html5 storage checks here
//http://devign.me/greasemonkey-gm_getvaluegm_setvalue-functions-for-google-chrome/
//http://www.flickr.com/groups/flickrhacks/discuss/72157625067644050/

    /**
     * Retrieves a preference, setting it to the given default value and
     * returning the default value if not already set.
     */
    _getPreference: function(name, defaultValue) {
        var config = GM_getValue(name);
        if (config === undefined) {
            GM_setValue(name, defaultValue);
            config = defaultValue;
        }
        return config;
    },
    
    domainCheck: function() {
		
		switch( SERVER_HOST ) {
            case "http://forums.vwvortex.com": domainKey = 0;
            break;
            case "http://forums.fourtitude.com": domainKey = 1;
            break;
            case "http://forums.thecarlounge.com": domainKey = 2;
            break;
            case "http://forums.thecarlounge.net": domainKey = 2;
            break;
            case "http://forums.subdriven.com": domainKey = 3;
            break;
            case "http://forums.swedespeed.com": domainKey = 4;
            break;
            case "http://forums.mwerks.com": domainKey = 5;
            break;
            case "http://forums.triplezoom.com": domainKey = 6;
            break;
            case "http://forums.speedarena.com": domainKey = 7;
            break;
            case "http://forums.motivemag.com": domainKey = 8;
            break;
            case "http://forums.kilometermagazine.com": domainKey = 9;
            break;
            case "http://audizine.com": domainKey = 10;
            break;
            case "http://www.audizine.com": domainKey = 10;
            break;
            default: domainKey = -1;
        }
		
	}
};

//
// third party plugins
//

//include jquery with a gm hack
(function(window,undefined){var jQuery=function(selector,context){return new jQuery.fn.init(selector,context)},_jQuery=window.jQuery,_$=window.$,document=window.document,rootjQuery,quickExpr=/^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,isSimple=/^.[^:#\[\.,]*$/,rnotwhite=/\S/,rtrim=/^(\s|\u00A0)+|(\s|\u00A0)+$/g,rsingleTag=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,userAgent=navigator.userAgent,browserMatch,readyBound=false,readyList=[],DOMContentLoaded,toString=Object.prototype.toString,hasOwnProperty=Object.prototype.hasOwnProperty,push=Array.prototype.push,slice=Array.prototype.slice,indexOf=Array.prototype.indexOf;jQuery.fn=jQuery.prototype={init:function(selector,context){var match,elem,ret,doc;if(!selector){return this}if(selector.nodeType){this.context=this[0]=selector;this.length=1;return this}if(selector==="body"&&!context){this.context=document;this[0]=document.body;this.selector="body";this.length=1;return this}if(typeof selector==="string"){match=quickExpr.exec(selector);if(match&&(match[1]||!context)){if(match[1]){doc=(context?context.ownerDocument||context:document);ret=rsingleTag.exec(selector);if(ret){if(jQuery.isPlainObject(context)){selector=[document.createElement(ret[1])];jQuery.fn.attr.call(selector,context,true)}else{selector=[doc.createElement(ret[1])]}}else{ret=buildFragment([match[1]],[doc]);selector=(ret.cacheable?ret.fragment.cloneNode(true):ret.fragment).childNodes}return jQuery.merge(this,selector)}else{elem=document.getElementById(match[2]);if(elem){if(elem.id!==match[2]){return rootjQuery.find(selector)}this.length=1;this[0]=elem}this.context=document;this.selector=selector;return this}}else if(!context&&/^\w+$/.test(selector)){this.selector=selector;this.context=document;selector=document.getElementsByTagName(selector);return jQuery.merge(this,selector)}else if(!context||context.jquery){return(context||rootjQuery).find(selector)}else{return jQuery(context).find(selector)}}else if(jQuery.isFunction(selector)){return rootjQuery.ready(selector)}if(selector.selector!==undefined){this.selector=selector.selector;this.context=selector.context}return jQuery.makeArray(selector,this)},selector:"",jquery:"1.4.2",length:0,size:function(){return this.length},toArray:function(){return slice.call(this,0)},get:function(num){return num==null?this.toArray():(num<0?this.slice(num)[0]:this[num])},pushStack:function(elems,name,selector){var ret=jQuery();if(jQuery.isArray(elems)){push.apply(ret,elems)}else{jQuery.merge(ret,elems)}ret.prevObject=this;ret.context=this.context;if(name==="find"){ret.selector=this.selector+(this.selector?" ":"")+selector}else if(name){ret.selector=this.selector+"."+name+"("+selector+")"}return ret},each:function(callback,args){return jQuery.each(this,callback,args)},ready:function(fn){jQuery.bindReady();if(jQuery.isReady){fn.call(document,jQuery)}else if(readyList){readyList.push(fn)}return this},eq:function(i){return i===-1?this.slice(i):this.slice(i,+i+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(slice.apply(this,arguments),"slice",slice.call(arguments).join(","))},map:function(callback){return this.pushStack(jQuery.map(this,function(elem,i){return callback.call(elem,i,elem)}))},end:function(){return this.prevObject||jQuery(null)},push:push,sort:[].sort,splice:[].splice};jQuery.fn.init.prototype=jQuery.fn;jQuery.extend=jQuery.fn.extend=function(){var target=arguments[0]||{},i=1,length=arguments.length,deep=false,options,name,src,copy;if(typeof target==="boolean"){deep=target;target=arguments[1]||{};i=2}if(typeof target!=="object"&&!jQuery.isFunction(target)){target={}}if(length===i){target=this;--i}for(;i<length;i++){if((options=arguments[i])!=null){for(name in options){src=target[name];copy=options[name];if(target===copy){continue}if(deep&&copy&&(jQuery.isPlainObject(copy)||jQuery.isArray(copy))){var clone=src&&(jQuery.isPlainObject(src)||jQuery.isArray(src))?src:jQuery.isArray(copy)?[]:{};target[name]=jQuery.extend(deep,clone,copy)}else if(copy!==undefined){target[name]=copy}}}}return target};jQuery.extend({noConflict:function(deep){window.$=_$;if(deep){window.jQuery=_jQuery}return jQuery},isReady:false,ready:function(){if(!jQuery.isReady){if(!document.body){return setTimeout(jQuery.ready,13)}jQuery.isReady=true;if(readyList){var fn,i=0;while((fn=readyList[i++])){fn.call(document,jQuery)}readyList=null}if(jQuery.fn.triggerHandler){jQuery(document).triggerHandler("ready")}}},bindReady:function(){if(readyBound){return}readyBound=true;if(document.readyState==="complete"){return jQuery.ready()}if(document.addEventListener){document.addEventListener("DOMContentLoaded",DOMContentLoaded,false);window.addEventListener("load",jQuery.ready,false)}else if(document.attachEvent){document.attachEvent("onreadystatechange",DOMContentLoaded);window.attachEvent("onload",jQuery.ready);var toplevel=false;try{toplevel=window.frameElement==null}catch(e){}if(document.documentElement.doScroll&&toplevel){doScrollCheck()}}},isFunction:function(obj){return toString.call(obj)==="[object Function]"},isArray:function(obj){return toString.call(obj)==="[object Array]"},isPlainObject:function(obj){if(!obj||toString.call(obj)!=="[object Object]"||obj.nodeType||obj.setInterval){return false}if(obj.constructor&&!hasOwnProperty.call(obj,"constructor")&&!hasOwnProperty.call(obj.constructor.prototype,"isPrototypeOf")){return false}var key;for(key in obj){}return key===undefined||hasOwnProperty.call(obj,key)},isEmptyObject:function(obj){for(var name in obj){if(hasOwnProperty.call(obj,name)){return false}}return true},error:function(msg){throw msg;},parseJSON:function(data){if(typeof data!=="string"||!data){return null}data=jQuery.trim(data);if(/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){return window.JSON&&window.JSON.parse?window.JSON.parse(data):(new Function("return "+data))()}else{jQuery.error("Invalid JSON: "+data)}},noop:function(){},globalEval:function(data){if(data&&rnotwhite.test(data)){var head=document.getElementsByTagName("head")[0]||document.documentElement,script=document.createElement("script");script.type="text/javascript";if(jQuery.support.scriptEval){script.appendChild(document.createTextNode(data))}else{script.text=data}head.insertBefore(script,head.firstChild);head.removeChild(script)}},nodeName:function(elem,name){return elem.nodeName&&elem.nodeName.toUpperCase()===name.toUpperCase()},each:function(object,callback,args){var name,i=0,length=object.length,isObj=length===undefined||jQuery.isFunction(object);if(args){if(isObj){for(name in object){if(callback.apply(object[name],args)===false){break}}}else{for(;i<length;){if(callback.apply(object[i++],args)===false){break}}}}else{if(isObj){for(name in object){if(callback.call(object[name],name,object[name])===false){break}}}else{for(var value=object[0];i<length&&callback.call(value,i,value)!==false;value=object[++i]){}}}return object},trim:function(text){return(text||"").replace(rtrim,"")},makeArray:function(array,results){var ret=results||[];if(array!=null){if(array.length==null||typeof array==="string"||jQuery.isFunction(array)||(typeof array!=="function"&&array.setInterval)){push.call(ret,array)}else{jQuery.merge(ret,array)}}return ret},inArray:function(elem,array){if(array.indexOf){return array.indexOf(elem)}for(var i=0,length=array.length;i<length;i++){if(array[i]===elem){return i}}return-1},merge:function(first,second){var i=first.length,j=0;if(typeof second.length==="number"){for(var l=second.length;j<l;j++){first[i++]=second[j]}}else{while(second[j]!==undefined){first[i++]=second[j++]}}first.length=i;return first},grep:function(elems,callback,inv){var ret=[];for(var i=0,length=elems.length;i<length;i++){if(!inv!==!callback(elems[i],i)){ret.push(elems[i])}}return ret},map:function(elems,callback,arg){var ret=[],value;for(var i=0,length=elems.length;i<length;i++){value=callback(elems[i],i,arg);if(value!=null){ret[ret.length]=value}}return ret.concat.apply([],ret)},guid:1,proxy:function(fn,proxy,thisObject){if(arguments.length===2){if(typeof proxy==="string"){thisObject=fn;fn=thisObject[proxy];proxy=undefined}else if(proxy&&!jQuery.isFunction(proxy)){thisObject=proxy;proxy=undefined}}if(!proxy&&fn){proxy=function(){return fn.apply(thisObject||this,arguments)}}if(fn){proxy.guid=fn.guid=fn.guid||proxy.guid||jQuery.guid++}return proxy},uaMatch:function(ua){ua=ua.toLowerCase();var match=/(webkit)[ \/]([\w.]+)/.exec(ua)||/(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua)||/(msie) ([\w.]+)/.exec(ua)||!/compatible/.test(ua)&&/(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua)||[];return{browser:match[1]||"",version:match[2]||"0"}},browser:{}});browserMatch=jQuery.uaMatch(userAgent);if(browserMatch.browser){jQuery.browser[browserMatch.browser]=true;jQuery.browser.version=browserMatch.version}if(jQuery.browser.webkit){jQuery.browser.safari=true}if(indexOf){jQuery.inArray=function(elem,array){return indexOf.call(array,elem)}}rootjQuery=jQuery(document);if(document.addEventListener){DOMContentLoaded=function(){document.removeEventListener("DOMContentLoaded",DOMContentLoaded,false);jQuery.ready()}}else if(document.attachEvent){DOMContentLoaded=function(){if(document.readyState==="complete"){document.detachEvent("onreadystatechange",DOMContentLoaded);jQuery.ready()}}}function doScrollCheck(){if(jQuery.isReady){return}try{document.documentElement.doScroll("left")}catch(error){setTimeout(doScrollCheck,1);return}jQuery.ready()}function evalScript(i,elem){if(elem.src){jQuery.ajax({url:elem.src,async:false,dataType:"script"})}else{jQuery.globalEval(elem.text||elem.textContent||elem.innerHTML||"")}if(elem.parentNode){elem.parentNode.removeChild(elem)}}function access(elems,key,value,exec,fn,pass){var length=elems.length;if(typeof key==="object"){for(var k in key){access(elems,k,key[k],exec,fn,value)}return elems}if(value!==undefined){exec=!pass&&exec&&jQuery.isFunction(value);for(var i=0;i<length;i++){fn(elems[i],key,exec?value.call(elems[i],i,fn(elems[i],key)):value,pass)}return elems}return length?fn(elems[0],key):undefined}function now(){return(new Date).getTime()}(function(){jQuery.support={};var root=document.documentElement,script=document.createElement("script"),div=document.createElement("div"),id="script"+now();div.style.display="none";div.innerHTML="   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";var all=div.getElementsByTagName("*"),a=div.getElementsByTagName("a")[0];if(!all||!all.length||!a){return}jQuery.support={leadingWhitespace:div.firstChild.nodeType===3,tbody:!div.getElementsByTagName("tbody").length,htmlSerialize:!!div.getElementsByTagName("link").length,style:/red/.test(a.getAttribute("style")),hrefNormalized:a.getAttribute("href")==="/a",opacity:/^0.55$/.test(a.style.opacity),cssFloat:!!a.style.cssFloat,checkOn:div.getElementsByTagName("input")[0].value==="on",optSelected:document.createElement("select").appendChild(document.createElement("option")).selected,parentNode:div.removeChild(div.appendChild(document.createElement("div"))).parentNode===null,deleteExpando:true,checkClone:false,scriptEval:false,noCloneEvent:true,boxModel:null};script.type="text/javascript";try{script.appendChild(document.createTextNode("window."+id+"=1;"))}catch(e){}root.insertBefore(script,root.firstChild);if(window[id]){jQuery.support.scriptEval=true;delete window[id]}try{delete script.test}catch(e){jQuery.support.deleteExpando=false}root.removeChild(script);if(div.attachEvent&&div.fireEvent){div.attachEvent("onclick",function click(){jQuery.support.noCloneEvent=false;div.detachEvent("onclick",click)});div.cloneNode(true).fireEvent("onclick")}div=document.createElement("div");div.innerHTML="<input type='radio' name='radiotest' checked='checked'/>";var fragment=document.createDocumentFragment();fragment.appendChild(div.firstChild);jQuery.support.checkClone=fragment.cloneNode(true).cloneNode(true).lastChild.checked;jQuery(function(){var div=document.createElement("div");div.style.width=div.style.paddingLeft="1px";document.body.appendChild(div);jQuery.boxModel=jQuery.support.boxModel=div.offsetWidth===2;document.body.removeChild(div).style.display='none';div=null});var eventSupported=function(eventName){var el=document.createElement("div");eventName="on"+eventName;var isSupported=false;for(i=0;i<2;i++){try{isSupported=(eventName in el);if(!isSupported){el.setAttribute(eventName,"return;");isSupported=typeof el[eventName]==="function"}el=null;return isSupported}catch(e){if(!(el=el.wrappedJSObject))return false}}};jQuery.support.submitBubbles=eventSupported("submit");jQuery.support.changeBubbles=eventSupported("change");root=script=div=all=a=null})();jQuery.props={"for":"htmlFor","class":"className",readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",colspan:"colSpan",tabindex:"tabIndex",usemap:"useMap",frameborder:"frameBorder"};var expando="jQuery"+now(),uuid=0,windowData={};jQuery.extend({cache:{},expando:expando,noData:{"embed":true,"object":true,"applet":true},data:function(elem,name,data){if(elem.nodeName&&jQuery.noData[elem.nodeName.toLowerCase()]){return}elem=elem==window?windowData:elem;var id=elem[expando],cache=jQuery.cache,thisCache;if(!id&&typeof name==="string"&&data===undefined){return null}if(!id){id=++uuid}if(typeof name==="object"){elem[expando]=id;thisCache=cache[id]=jQuery.extend(true,{},name)}else if(!cache[id]){elem[expando]=id;cache[id]={}}thisCache=cache[id];if(data!==undefined){thisCache[name]=data}return typeof name==="string"?thisCache[name]:thisCache},removeData:function(elem,name){if(elem.nodeName&&jQuery.noData[elem.nodeName.toLowerCase()]){return}elem=elem==window?windowData:elem;var id=elem[expando],cache=jQuery.cache,thisCache=cache[id];if(name){if(thisCache){delete thisCache[name];if(jQuery.isEmptyObject(thisCache)){jQuery.removeData(elem)}}}else{if(jQuery.support.deleteExpando){delete elem[jQuery.expando]}else if(elem.removeAttribute){elem.removeAttribute(jQuery.expando)}delete cache[id]}}});jQuery.fn.extend({data:function(key,value){if(typeof key==="undefined"&&this.length){return jQuery.data(this[0])}else if(typeof key==="object"){return this.each(function(){jQuery.data(this,key)})}var parts=key.split(".");parts[1]=parts[1]?"."+parts[1]:"";if(value===undefined){var data=this.triggerHandler("getData"+parts[1]+"!",[parts[0]]);if(data===undefined&&this.length){data=jQuery.data(this[0],key)}return data===undefined&&parts[1]?this.data(parts[0]):data}else{return this.trigger("setData"+parts[1]+"!",[parts[0],value]).each(function(){jQuery.data(this,key,value)})}},removeData:function(key){return this.each(function(){jQuery.removeData(this,key)})}});jQuery.extend({queue:function(elem,type,data){if(!elem){return}type=(type||"fx")+"queue";var q=jQuery.data(elem,type);if(!data){return q||[]}if(!q||jQuery.isArray(data)){q=jQuery.data(elem,type,jQuery.makeArray(data))}else{q.push(data)}return q},dequeue:function(elem,type){type=type||"fx";var queue=jQuery.queue(elem,type),fn=queue.shift();if(fn==="inprogress"){fn=queue.shift()}if(fn){if(type==="fx"){queue.unshift("inprogress")}fn.call(elem,function(){jQuery.dequeue(elem,type)})}}});jQuery.fn.extend({queue:function(type,data){if(typeof type!=="string"){data=type;type="fx"}if(data===undefined){return jQuery.queue(this[0],type)}return this.each(function(i,elem){var queue=jQuery.queue(this,type,data);if(type==="fx"&&queue[0]!=="inprogress"){jQuery.dequeue(this,type)}})},dequeue:function(type){return this.each(function(){jQuery.dequeue(this,type)})},delay:function(time,type){time=jQuery.fx?jQuery.fx.speeds[time]||time:time;type=type||"fx";return this.queue(type,function(){var elem=this;setTimeout(function(){jQuery.dequeue(elem,type)},time)})},clearQueue:function(type){return this.queue(type||"fx",[])}});var rclass=/[\n\t]/g,rspace=/\s+/,rreturn=/\r/g,rspecialurl=/href|src|style/,rtype=/(button|input)/i,rfocusable=/(button|input|object|select|textarea)/i,rclickable=/^(a|area)$/i,rradiocheck=/radio|checkbox/;jQuery.fn.extend({attr:function(name,value){return access(this,name,value,true,jQuery.attr)},removeAttr:function(name,fn){return this.each(function(){jQuery.attr(this,name,"");if(this.nodeType===1){this.removeAttribute(name)}})},addClass:function(value){if(jQuery.isFunction(value)){return this.each(function(i){var self=jQuery(this);self.addClass(value.call(this,i,self.attr("class")))})}if(value&&typeof value==="string"){var classNames=(value||"").split(rspace);for(var i=0,l=this.length;i<l;i++){var elem=this[i];if(elem.nodeType===1){if(!elem.className){elem.className=value}else{var className=" "+elem.className+" ",setClass=elem.className;for(var c=0,cl=classNames.length;c<cl;c++){if(className.indexOf(" "+classNames[c]+" ")<0){setClass+=" "+classNames[c]}}elem.className=jQuery.trim(setClass)}}}}return this},removeClass:function(value){if(jQuery.isFunction(value)){return this.each(function(i){var self=jQuery(this);self.removeClass(value.call(this,i,self.attr("class")))})}if((value&&typeof value==="string")||value===undefined){var classNames=(value||"").split(rspace);for(var i=0,l=this.length;i<l;i++){var elem=this[i];if(elem.nodeType===1&&elem.className){if(value){var className=(" "+elem.className+" ").replace(rclass," ");for(var c=0,cl=classNames.length;c<cl;c++){className=className.replace(" "+classNames[c]+" "," ")}elem.className=jQuery.trim(className)}else{elem.className=""}}}}return this},toggleClass:function(value,stateVal){var type=typeof value,isBool=typeof stateVal==="boolean";if(jQuery.isFunction(value)){return this.each(function(i){var self=jQuery(this);self.toggleClass(value.call(this,i,self.attr("class"),stateVal),stateVal)})}return this.each(function(){if(type==="string"){var className,i=0,self=jQuery(this),state=stateVal,classNames=value.split(rspace);while((className=classNames[i++])){state=isBool?state:!self.hasClass(className);self[state?"addClass":"removeClass"](className)}}else if(type==="undefined"||type==="boolean"){if(this.className){jQuery.data(this,"__className__",this.className)}this.className=this.className||value===false?"":jQuery.data(this,"__className__")||""}})},hasClass:function(selector){var className=" "+selector+" ";for(var i=0,l=this.length;i<l;i++){if((" "+this[i].className+" ").replace(rclass," ").indexOf(className)>-1){return true}}return false},val:function(value){if(value===undefined){var elem=this[0];if(elem){if(jQuery.nodeName(elem,"option")){return(elem.attributes.value||{}).specified?elem.value:elem.text}if(jQuery.nodeName(elem,"select")){var index=elem.selectedIndex,values=[],options=elem.options,one=elem.type==="select-one";if(index<0){return null}for(var i=one?index:0,max=one?index+1:options.length;i<max;i++){var option=options[i];if(option.selected){value=jQuery(option).val();if(one){return value}values.push(value)}}return values}if(rradiocheck.test(elem.type)&&!jQuery.support.checkOn){return elem.getAttribute("value")===null?"on":elem.value}return(elem.value||"").replace(rreturn,"")}return undefined}var isFunction=jQuery.isFunction(value);return this.each(function(i){var self=jQuery(this),val=value;if(this.nodeType!==1){return}if(isFunction){val=value.call(this,i,self.val())}if(typeof val==="number"){val+=""}if(jQuery.isArray(val)&&rradiocheck.test(this.type)){this.checked=jQuery.inArray(self.val(),val)>=0}else if(jQuery.nodeName(this,"select")){var values=jQuery.makeArray(val);jQuery("option",this).each(function(){this.selected=jQuery.inArray(jQuery(this).val(),values)>=0});if(!values.length){this.selectedIndex=-1}}else{this.value=val}})}});jQuery.extend({attrFn:{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true},attr:function(elem,name,value,pass){if(!elem||elem.nodeType===3||elem.nodeType===8){return undefined}if(pass&&name in jQuery.attrFn){return jQuery(elem)[name](value)}var notxml=elem.nodeType!==1||!jQuery.isXMLDoc(elem),set=value!==undefined;name=notxml&&jQuery.props[name]||name;if(elem.nodeType===1){var special=rspecialurl.test(name);if(name==="selected"&&!jQuery.support.optSelected){var parent=elem.parentNode;if(parent){parent.selectedIndex;if(parent.parentNode){parent.parentNode.selectedIndex}}}if(name in elem&&notxml&&!special){if(set){if(name==="type"&&rtype.test(elem.nodeName)&&elem.parentNode){jQuery.error("type property can't be changed")}elem[name]=value}if(jQuery.nodeName(elem,"form")&&elem.getAttributeNode(name)){return elem.getAttributeNode(name).nodeValue}if(name==="tabIndex"){var attributeNode=elem.getAttributeNode("tabIndex");return attributeNode&&attributeNode.specified?attributeNode.value:rfocusable.test(elem.nodeName)||rclickable.test(elem.nodeName)&&elem.href?0:undefined}return elem[name]}if(!jQuery.support.style&&notxml&&name==="style"){if(set){elem.style.cssText=""+value}return elem.style.cssText}if(set){elem.setAttribute(name,""+value)}var attr=!jQuery.support.hrefNormalized&&notxml&&special?elem.getAttribute(name,2):elem.getAttribute(name);return attr===null?undefined:attr}return jQuery.style(elem,name,value)}});var rnamespaces=/\.(.*)$/,fcleanup=function(nm){return nm.replace(/[^\w\s\.\|`]/g,function(ch){return"\\"+ch})};jQuery.event={add:function(elem,types,handler,data){if(elem.nodeType===3||elem.nodeType===8){return}if(elem.setInterval&&(elem!==window&&!elem.frameElement)){elem=window}var handleObjIn,handleObj;if(handler.handler){handleObjIn=handler;handler=handleObjIn.handler}if(!handler.guid){handler.guid=jQuery.guid++}var elemData=jQuery.data(elem);if(!elemData){return}var events=elemData.events=elemData.events||{},eventHandle=elemData.handle,eventHandle;if(!eventHandle){elemData.handle=eventHandle=function(){return typeof jQuery!=="undefined"&&!jQuery.event.triggered?jQuery.event.handle.apply(eventHandle.elem,arguments):undefined}}eventHandle.elem=elem;types=types.split(" ");var type,i=0,namespaces;while((type=types[i++])){handleObj=handleObjIn?jQuery.extend({},handleObjIn):{handler:handler,data:data};if(type.indexOf(".")>-1){namespaces=type.split(".");type=namespaces.shift();handleObj.namespace=namespaces.slice(0).sort().join(".")}else{namespaces=[];handleObj.namespace=""}handleObj.type=type;handleObj.guid=handler.guid;var handlers=events[type],special=jQuery.event.special[type]||{};if(!handlers){handlers=events[type]=[];if(!special.setup||special.setup.call(elem,data,namespaces,eventHandle)===false){if(elem.addEventListener){elem.addEventListener(type,eventHandle,false)}else if(elem.attachEvent){elem.attachEvent("on"+type,eventHandle)}}}if(special.add){special.add.call(elem,handleObj);if(!handleObj.handler.guid){handleObj.handler.guid=handler.guid}}handlers.push(handleObj);jQuery.event.global[type]=true}elem=null},global:{},remove:function(elem,types,handler,pos){if(elem.nodeType===3||elem.nodeType===8){return}var ret,type,fn,i=0,all,namespaces,namespace,special,eventType,handleObj,origType,elemData=jQuery.data(elem),events=elemData&&elemData.events;if(!elemData||!events){return}if(types&&types.type){handler=types.handler;types=types.type}if(!types||typeof types==="string"&&types.charAt(0)==="."){types=types||"";for(type in events){jQuery.event.remove(elem,type+types)}return}types=types.split(" ");while((type=types[i++])){origType=type;handleObj=null;all=type.indexOf(".")<0;namespaces=[];if(!all){namespaces=type.split(".");type=namespaces.shift();namespace=new RegExp("(^|\\.)"+jQuery.map(namespaces.slice(0).sort(),fcleanup).join("\\.(?:.*\\.)?")+"(\\.|$)")}eventType=events[type];if(!eventType){continue}if(!handler){for(var j=0;j<eventType.length;j++){handleObj=eventType[j];if(all||namespace.test(handleObj.namespace)){jQuery.event.remove(elem,origType,handleObj.handler,j);eventType.splice(j--,1)}}continue}special=jQuery.event.special[type]||{};for(var j=pos||0;j<eventType.length;j++){handleObj=eventType[j];if(handler.guid===handleObj.guid){if(all||namespace.test(handleObj.namespace)){if(pos==null){eventType.splice(j--,1)}if(special.remove){special.remove.call(elem,handleObj)}}if(pos!=null){break}}}if(eventType.length===0||pos!=null&&eventType.length===1){if(!special.teardown||special.teardown.call(elem,namespaces)===false){removeEvent(elem,type,elemData.handle)}ret=null;delete events[type]}}if(jQuery.isEmptyObject(events)){var handle=elemData.handle;if(handle){handle.elem=null}delete elemData.events;delete elemData.handle;if(jQuery.isEmptyObject(elemData)){jQuery.removeData(elem)}}},trigger:function(event,data,elem){var type=event.type||event,bubbling=arguments[3];if(!bubbling){event=typeof event==="object"?event[expando]?event:jQuery.extend(jQuery.Event(type),event):jQuery.Event(type);if(type.indexOf("!")>=0){event.type=type=type.slice(0,-1);event.exclusive=true}if(!elem){event.stopPropagation();if(jQuery.event.global[type]){jQuery.each(jQuery.cache,function(){if(this.events&&this.events[type]){jQuery.event.trigger(event,data,this.handle.elem)}})}}if(!elem||elem.nodeType===3||elem.nodeType===8){return undefined}event.result=undefined;event.target=elem;data=jQuery.makeArray(data);data.unshift(event)}event.currentTarget=elem;var handle=jQuery.data(elem,"handle");if(handle){handle.apply(elem,data)}var parent=elem.parentNode||elem.ownerDocument;try{if(!(elem&&elem.nodeName&&jQuery.noData[elem.nodeName.toLowerCase()])){if(elem["on"+type]&&elem["on"+type].apply(elem,data)===false){event.result=false}}}catch(e){}if(!event.isPropagationStopped()&&parent){jQuery.event.trigger(event,data,parent,true)}else if(!event.isDefaultPrevented()){var target=event.target,old,isClick=jQuery.nodeName(target,"a")&&type==="click",special=jQuery.event.special[type]||{};if((!special._default||special._default.call(elem,event)===false)&&!isClick&&!(target&&target.nodeName&&jQuery.noData[target.nodeName.toLowerCase()])){try{if(target[type]){old=target["on"+type];if(old){target["on"+type]=null}jQuery.event.triggered=true;target[type]()}}catch(e){}if(old){target["on"+type]=old}jQuery.event.triggered=false}}},handle:function(event){var all,handlers,namespaces,namespace,events;event=arguments[0]=jQuery.event.fix(event||window.event);event.currentTarget=this;all=event.type.indexOf(".")<0&&!event.exclusive;if(!all){namespaces=event.type.split(".");event.type=namespaces.shift();namespace=new RegExp("(^|\\.)"+namespaces.slice(0).sort().join("\\.(?:.*\\.)?")+"(\\.|$)")}var events=jQuery.data(this,"events"),handlers=events[event.type];if(events&&handlers){handlers=handlers.slice(0);for(var j=0,l=handlers.length;j<l;j++){var handleObj=handlers[j];if(all||namespace.test(handleObj.namespace)){event.handler=handleObj.handler;event.data=handleObj.data;event.handleObj=handleObj;var ret=handleObj.handler.apply(this,arguments);if(ret!==undefined){event.result=ret;if(ret===false){event.preventDefault();event.stopPropagation()}}if(event.isImmediatePropagationStopped()){break}}}}return event.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(event){if(event[expando]){return event}var originalEvent=event;event=jQuery.Event(originalEvent);for(var i=this.props.length,prop;i;){prop=this.props[--i];event[prop]=originalEvent[prop]}if(!event.target){event.target=event.srcElement||document}if(event.target.nodeType===3){event.target=event.target.parentNode}if(!event.relatedTarget&&event.fromElement){event.relatedTarget=event.fromElement===event.target?event.toElement:event.fromElement}if(event.pageX==null&&event.clientX!=null){var doc=document.documentElement,body=document.body;event.pageX=event.clientX+(doc&&doc.scrollLeft||body&&body.scrollLeft||0)-(doc&&doc.clientLeft||body&&body.clientLeft||0);event.pageY=event.clientY+(doc&&doc.scrollTop||body&&body.scrollTop||0)-(doc&&doc.clientTop||body&&body.clientTop||0)}if(!event.which&&((event.charCode||event.charCode===0)?event.charCode:event.keyCode)){event.which=event.charCode||event.keyCode}if(!event.metaKey&&event.ctrlKey){event.metaKey=event.ctrlKey}if(!event.which&&event.button!==undefined){event.which=(event.button&1?1:(event.button&2?3:(event.button&4?2:0)))}return event},guid:1E8,proxy:jQuery.proxy,special:{ready:{setup:jQuery.bindReady,teardown:jQuery.noop},live:{add:function(handleObj){jQuery.event.add(this,handleObj.origType,jQuery.extend({},handleObj,{handler:liveHandler}))},remove:function(handleObj){var remove=true,type=handleObj.origType.replace(rnamespaces,"");jQuery.each(jQuery.data(this,"events").live||[],function(){if(type===this.origType.replace(rnamespaces,"")){remove=false;return false}});if(remove){jQuery.event.remove(this,handleObj.origType,liveHandler)}}},beforeunload:{setup:function(data,namespaces,eventHandle){if(this.setInterval){this.onbeforeunload=eventHandle}return false},teardown:function(namespaces,eventHandle){if(this.onbeforeunload===eventHandle){this.onbeforeunload=null}}}}};var removeEvent=document.removeEventListener?function(elem,type,handle){elem.removeEventListener(type,handle,false)}:function(elem,type,handle){elem.detachEvent("on"+type,handle)};jQuery.Event=function(src){if(!this.preventDefault){return new jQuery.Event(src)}if(src&&src.type){this.originalEvent=src;this.type=src.type}else{this.type=src}this.timeStamp=now();this[expando]=true};function returnFalse(){return false}function returnTrue(){return true}jQuery.Event.prototype={preventDefault:function(){this.isDefaultPrevented=returnTrue;var e=this.originalEvent;if(!e){return}if(e.preventDefault){e.preventDefault()}e.returnValue=false},stopPropagation:function(){this.isPropagationStopped=returnTrue;var e=this.originalEvent;if(!e){return}if(e.stopPropagation){e.stopPropagation()}e.cancelBubble=true},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=returnTrue;this.stopPropagation()},isDefaultPrevented:returnFalse,isPropagationStopped:returnFalse,isImmediatePropagationStopped:returnFalse};var withinElement=function(event){var parent=event.relatedTarget;try{while(parent&&parent!==this){parent=parent.parentNode}if(parent!==this){event.type=event.data;jQuery.event.handle.apply(this,arguments)}}catch(e){}},delegate=function(event){event.type=event.data;jQuery.event.handle.apply(this,arguments)};jQuery.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(orig,fix){jQuery.event.special[orig]={setup:function(data){jQuery.event.add(this,fix,data&&data.selector?delegate:withinElement,orig)},teardown:function(data){jQuery.event.remove(this,fix,data&&data.selector?delegate:withinElement)}}});if(!jQuery.support.submitBubbles){jQuery.event.special.submit={setup:function(data,namespaces){if(this.nodeName.toLowerCase()!=="form"){jQuery.event.add(this,"click.specialSubmit",function(e){var elem=e.target,type=elem.type;if((type==="submit"||type==="image")&&jQuery(elem).closest("form").length){return trigger("submit",this,arguments)}});jQuery.event.add(this,"keypress.specialSubmit",function(e){var elem=e.target,type=elem.type;if((type==="text"||type==="password")&&jQuery(elem).closest("form").length&&e.keyCode===13){return trigger("submit",this,arguments)}})}else{return false}},teardown:function(namespaces){jQuery.event.remove(this,".specialSubmit")}}}if(!jQuery.support.changeBubbles){var formElems=/textarea|input|select/i,changeFilters,getVal=function(elem){var type=elem.type,val=elem.value;if(type==="radio"||type==="checkbox"){val=elem.checked}else if(type==="select-multiple"){val=elem.selectedIndex>-1?jQuery.map(elem.options,function(elem){return elem.selected}).join("-"):""}else if(elem.nodeName.toLowerCase()==="select"){val=elem.selectedIndex}return val},testChange=function testChange(e){var elem=e.target,data,val;if(!formElems.test(elem.nodeName)||elem.readOnly){return}data=jQuery.data(elem,"_change_data");val=getVal(elem);if(e.type!=="focusout"||elem.type!=="radio"){jQuery.data(elem,"_change_data",val)}if(data===undefined||val===data){return}if(data!=null||val){e.type="change";return jQuery.event.trigger(e,arguments[1],elem)}};jQuery.event.special.change={filters:{focusout:testChange,click:function(e){var elem=e.target,type=elem.type;if(type==="radio"||type==="checkbox"||elem.nodeName.toLowerCase()==="select"){return testChange.call(this,e)}},keydown:function(e){var elem=e.target,type=elem.type;if((e.keyCode===13&&elem.nodeName.toLowerCase()!=="textarea")||(e.keyCode===32&&(type==="checkbox"||type==="radio"))||type==="select-multiple"){return testChange.call(this,e)}},beforeactivate:function(e){var elem=e.target;jQuery.data(elem,"_change_data",getVal(elem))}},setup:function(data,namespaces){if(this.type==="file"){return false}for(var type in changeFilters){jQuery.event.add(this,type+".specialChange",changeFilters[type])}return formElems.test(this.nodeName)},teardown:function(namespaces){jQuery.event.remove(this,".specialChange");return formElems.test(this.nodeName)}};changeFilters=jQuery.event.special.change.filters}function trigger(type,elem,args){args[0].type=type;return jQuery.event.handle.apply(elem,args)}if(document.addEventListener){jQuery.each({focus:"focusin",blur:"focusout"},function(orig,fix){jQuery.event.special[fix]={setup:function(){this.addEventListener(orig,handler,true)},teardown:function(){this.removeEventListener(orig,handler,true)}};function handler(e){e=jQuery.event.fix(e);e.type=fix;return jQuery.event.handle.call(this,e)}})}jQuery.each(["bind","one"],function(i,name){jQuery.fn[name]=function(type,data,fn){if(typeof type==="object"){for(var key in type){this[name](key,data,type[key],fn)}return this}if(jQuery.isFunction(data)){fn=data;data=undefined}var handler=name==="one"?jQuery.proxy(fn,function(event){jQuery(this).unbind(event,handler);return fn.apply(this,arguments)}):fn;if(type==="unload"&&name!=="one"){this.one(type,data,fn)}else{for(var i=0,l=this.length;i<l;i++){jQuery.event.add(this[i],type,handler,data)}}return this}});jQuery.fn.extend({unbind:function(type,fn){if(typeof type==="object"&&!type.preventDefault){for(var key in type){this.unbind(key,type[key])}}else{for(var i=0,l=this.length;i<l;i++){jQuery.event.remove(this[i],type,fn)}}return this},delegate:function(selector,types,data,fn){return this.live(types,data,fn,selector)},undelegate:function(selector,types,fn){if(arguments.length===0){return this.unbind("live")}else{return this.die(types,null,fn,selector)}},trigger:function(type,data){return this.each(function(){jQuery.event.trigger(type,data,this)})},triggerHandler:function(type,data){if(this[0]){var event=jQuery.Event(type);event.preventDefault();event.stopPropagation();jQuery.event.trigger(event,data,this[0]);return event.result}},toggle:function(fn){var args=arguments,i=1;while(i<args.length){jQuery.proxy(fn,args[i++])}return this.click(jQuery.proxy(fn,function(event){var lastToggle=(jQuery.data(this,"lastToggle"+fn.guid)||0)%i;jQuery.data(this,"lastToggle"+fn.guid,lastToggle+1);event.preventDefault();return args[lastToggle].apply(this,arguments)||false}))},hover:function(fnOver,fnOut){return this.mouseenter(fnOver).mouseleave(fnOut||fnOver)}});var liveMap={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};jQuery.each(["live","die"],function(i,name){jQuery.fn[name]=function(types,data,fn,origSelector){var type,i=0,match,namespaces,preType,selector=origSelector||this.selector,context=origSelector?this:jQuery(this.context);if(jQuery.isFunction(data)){fn=data;data=undefined}types=(types||"").split(" ");while((type=types[i++])!=null){match=rnamespaces.exec(type);namespaces="";if(match){namespaces=match[0];type=type.replace(rnamespaces,"")}if(type==="hover"){types.push("mouseenter"+namespaces,"mouseleave"+namespaces);continue}preType=type;if(type==="focus"||type==="blur"){types.push(liveMap[type]+namespaces);type=type+namespaces}else{type=(liveMap[type]||type)+namespaces}if(name==="live"){context.each(function(){jQuery.event.add(this,liveConvert(type,selector),{data:data,selector:selector,handler:fn,origType:type,origHandler:fn,preType:preType})})}else{context.unbind(liveConvert(type,selector),fn)}}return this}});function liveHandler(event){var stop,elems=[],selectors=[],args=arguments,related,match,handleObj,elem,j,i,l,data,events=jQuery.data(this,"events");if(event.liveFired===this||!events||!events.live||event.button&&event.type==="click"){return}event.liveFired=this;var live=events.live.slice(0);for(j=0;j<live.length;j++){handleObj=live[j];if(handleObj.origType.replace(rnamespaces,"")===event.type){selectors.push(handleObj.selector)}else{live.splice(j--,1)}}match=jQuery(event.target).closest(selectors,event.currentTarget);for(i=0,l=match.length;i<l;i++){for(j=0;j<live.length;j++){handleObj=live[j];if(match[i].selector===handleObj.selector){elem=match[i].elem;related=null;if(handleObj.preType==="mouseenter"||handleObj.preType==="mouseleave"){related=jQuery(event.relatedTarget).closest(handleObj.selector)[0]}if(!related||related!==elem){elems.push({elem:elem,handleObj:handleObj})}}}}for(i=0,l=elems.length;i<l;i++){match=elems[i];event.currentTarget=match.elem;event.data=match.handleObj.data;event.handleObj=match.handleObj;if(match.handleObj.origHandler.apply(match.elem,args)===false){stop=false;break}}return stop}function liveConvert(type,selector){return"live."+(type&&type!=="*"?type+".":"")+selector.replace(/\./g,"`").replace(/ /g,"&")}jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick "+"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave "+"change select submit keydown keypress keyup error").split(" "),function(i,name){jQuery.fn[name]=function(fn){return fn?this.bind(name,fn):this.trigger(name)};if(jQuery.attrFn){jQuery.attrFn[name]=true}});if(window.attachEvent&&!window.addEventListener){window.attachEvent("onunload",function(){for(var id in jQuery.cache){if(jQuery.cache[id].handle){try{jQuery.event.remove(jQuery.cache[id].handle.elem)}catch(e){}}}})}(function(){var chunker=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,done=0,toString=Object.prototype.toString,hasDuplicate=false,baseHasDuplicate=true;[0,0].sort(function(){baseHasDuplicate=false;return 0});var Sizzle=function(selector,context,results,seed){results=results||[];var origContext=context=context||document;if(context.nodeType!==1&&context.nodeType!==9){return[]}if(!selector||typeof selector!=="string"){return results}var parts=[],m,set,checkSet,extra,prune=true,contextXML=isXML(context),soFar=selector;while((chunker.exec(""),m=chunker.exec(soFar))!==null){soFar=m[3];parts.push(m[1]);if(m[2]){extra=m[3];break}}if(parts.length>1&&origPOS.exec(selector)){if(parts.length===2&&Expr.relative[parts[0]]){set=posProcess(parts[0]+parts[1],context)}else{set=Expr.relative[parts[0]]?[context]:Sizzle(parts.shift(),context);while(parts.length){selector=parts.shift();if(Expr.relative[selector]){selector+=parts.shift()}set=posProcess(selector,set)}}}else{if(!seed&&parts.length>1&&context.nodeType===9&&!contextXML&&Expr.match.ID.test(parts[0])&&!Expr.match.ID.test(parts[parts.length-1])){var ret=Sizzle.find(parts.shift(),context,contextXML);context=ret.expr?Sizzle.filter(ret.expr,ret.set)[0]:ret.set[0]}if(context){var ret=seed?{expr:parts.pop(),set:makeArray(seed)}:Sizzle.find(parts.pop(),parts.length===1&&(parts[0]==="~"||parts[0]==="+")&&context.parentNode?context.parentNode:context,contextXML);set=ret.expr?Sizzle.filter(ret.expr,ret.set):ret.set;if(parts.length>0){checkSet=makeArray(set)}else{prune=false}while(parts.length){var cur=parts.pop(),pop=cur;if(!Expr.relative[cur]){cur=""}else{pop=parts.pop()}if(pop==null){pop=context}Expr.relative[cur](checkSet,pop,contextXML)}}else{checkSet=parts=[]}}if(!checkSet){checkSet=set}if(!checkSet){Sizzle.error(cur||selector)}if(toString.call(checkSet)==="[object Array]"){if(!prune){results.push.apply(results,checkSet)}else if(context&&context.nodeType===1){for(var i=0;checkSet[i]!=null;i++){if(checkSet[i]&&(checkSet[i]===true||checkSet[i].nodeType===1&&contains(context,checkSet[i]))){results.push(set[i])}}}else{for(var i=0;checkSet[i]!=null;i++){if(checkSet[i]&&checkSet[i].nodeType===1){results.push(set[i])}}}}else{makeArray(checkSet,results)}if(extra){Sizzle(extra,origContext,results,seed);Sizzle.uniqueSort(results)}return results};Sizzle.uniqueSort=function(results){if(sortOrder){hasDuplicate=baseHasDuplicate;results.sort(sortOrder);if(hasDuplicate){for(var i=1;i<results.length;i++){if(results[i]===results[i-1]){results.splice(i--,1)}}}}return results};Sizzle.matches=function(expr,set){return Sizzle(expr,null,null,set)};Sizzle.find=function(expr,context,isXML){var set,match;if(!expr){return[]}for(var i=0,l=Expr.order.length;i<l;i++){var type=Expr.order[i],match;if((match=Expr.leftMatch[type].exec(expr))){var left=match[1];match.splice(1,1);if(left.substr(left.length-1)!=="\\"){match[1]=(match[1]||"").replace(/\\/g,"");set=Expr.find[type](match,context,isXML);if(set!=null){expr=expr.replace(Expr.match[type],"");break}}}}if(!set){set=context.getElementsByTagName("*")}return{set:set,expr:expr}};Sizzle.filter=function(expr,set,inplace,not){var old=expr,result=[],curLoop=set,match,anyFound,isXMLFilter=set&&set[0]&&isXML(set[0]);while(expr&&set.length){for(var type in Expr.filter){if((match=Expr.leftMatch[type].exec(expr))!=null&&match[2]){var filter=Expr.filter[type],found,item,left=match[1];anyFound=false;match.splice(1,1);if(left.substr(left.length-1)==="\\"){continue}if(curLoop===result){result=[]}if(Expr.preFilter[type]){match=Expr.preFilter[type](match,curLoop,inplace,result,not,isXMLFilter);if(!match){anyFound=found=true}else if(match===true){continue}}if(match){for(var i=0;(item=curLoop[i])!=null;i++){if(item){found=filter(item,match,i,curLoop);var pass=not^!!found;if(inplace&&found!=null){if(pass){anyFound=true}else{curLoop[i]=false}}else if(pass){result.push(item);anyFound=true}}}}if(found!==undefined){if(!inplace){curLoop=result}expr=expr.replace(Expr.match[type],"");if(!anyFound){return[]}break}}}if(expr===old){if(anyFound==null){Sizzle.error(expr)}else{break}}old=expr}return curLoop};Sizzle.error=function(msg){throw"Syntax error, unrecognized expression: "+msg;};var Expr=Sizzle.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(elem){return elem.getAttribute("href")}},relative:{"+":function(checkSet,part){var isPartStr=typeof part==="string",isTag=isPartStr&&!/\W/.test(part),isPartStrNotTag=isPartStr&&!isTag;if(isTag){part=part.toLowerCase()}for(var i=0,l=checkSet.length,elem;i<l;i++){if((elem=checkSet[i])){while((elem=elem.previousSibling)&&elem.nodeType!==1){}checkSet[i]=isPartStrNotTag||elem&&elem.nodeName.toLowerCase()===part?elem||false:elem===part}}if(isPartStrNotTag){Sizzle.filter(part,checkSet,true)}},">":function(checkSet,part){var isPartStr=typeof part==="string";if(isPartStr&&!/\W/.test(part)){part=part.toLowerCase();for(var i=0,l=checkSet.length;i<l;i++){var elem=checkSet[i];if(elem){var parent=elem.parentNode;checkSet[i]=parent.nodeName.toLowerCase()===part?parent:false}}}else{for(var i=0,l=checkSet.length;i<l;i++){var elem=checkSet[i];if(elem){checkSet[i]=isPartStr?elem.parentNode:elem.parentNode===part}}if(isPartStr){Sizzle.filter(part,checkSet,true)}}},"":function(checkSet,part,isXML){var doneName=done++,checkFn=dirCheck;if(typeof part==="string"&&!/\W/.test(part)){var nodeCheck=part=part.toLowerCase();checkFn=dirNodeCheck}checkFn("parentNode",part,doneName,checkSet,nodeCheck,isXML)},"~":function(checkSet,part,isXML){var doneName=done++,checkFn=dirCheck;if(typeof part==="string"&&!/\W/.test(part)){var nodeCheck=part=part.toLowerCase();checkFn=dirNodeCheck}checkFn("previousSibling",part,doneName,checkSet,nodeCheck,isXML)}},find:{ID:function(match,context,isXML){if(typeof context.getElementById!=="undefined"&&!isXML){var m=context.getElementById(match[1]);return m?[m]:[]}},NAME:function(match,context){if(typeof context.getElementsByName!=="undefined"){var ret=[],results=context.getElementsByName(match[1]);for(var i=0,l=results.length;i<l;i++){if(results[i].getAttribute("name")===match[1]){ret.push(results[i])}}return ret.length===0?null:ret}},TAG:function(match,context){return context.getElementsByTagName(match[1])}},preFilter:{CLASS:function(match,curLoop,inplace,result,not,isXML){match=" "+match[1].replace(/\\/g,"")+" ";if(isXML){return match}for(var i=0,elem;(elem=curLoop[i])!=null;i++){if(elem){if(not^(elem.className&&(" "+elem.className+" ").replace(/[\t\n]/g," ").indexOf(match)>=0)){if(!inplace){result.push(elem)}}else if(inplace){curLoop[i]=false}}}return false},ID:function(match){return match[1].replace(/\\/g,"")},TAG:function(match,curLoop){return match[1].toLowerCase()},CHILD:function(match){if(match[1]==="nth"){var test=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(match[2]==="even"&&"2n"||match[2]==="odd"&&"2n+1"||!/\D/.test(match[2])&&"0n+"+match[2]||match[2]);match[2]=(test[1]+(test[2]||1))-0;match[3]=test[3]-0}match[0]=done++;return match},ATTR:function(match,curLoop,inplace,result,not,isXML){var name=match[1].replace(/\\/g,"");if(!isXML&&Expr.attrMap[name]){match[1]=Expr.attrMap[name]}if(match[2]==="~="){match[4]=" "+match[4]+" "}return match},PSEUDO:function(match,curLoop,inplace,result,not){if(match[1]==="not"){if((chunker.exec(match[3])||"").length>1||/^\w/.test(match[3])){match[3]=Sizzle(match[3],null,null,curLoop)}else{var ret=Sizzle.filter(match[3],curLoop,inplace,true^not);if(!inplace){result.push.apply(result,ret)}return false}}else if(Expr.match.POS.test(match[0])||Expr.match.CHILD.test(match[0])){return true}return match},POS:function(match){match.unshift(true);return match}},filters:{enabled:function(elem){return elem.disabled===false&&elem.type!=="hidden"},disabled:function(elem){return elem.disabled===true},checked:function(elem){return elem.checked===true},selected:function(elem){elem.parentNode.selectedIndex;return elem.selected===true},parent:function(elem){return!!elem.firstChild},empty:function(elem){return!elem.firstChild},has:function(elem,i,match){return!!Sizzle(match[3],elem).length},header:function(elem){return/h\d/i.test(elem.nodeName)},text:function(elem){return"text"===elem.type},radio:function(elem){return"radio"===elem.type},checkbox:function(elem){return"checkbox"===elem.type},file:function(elem){return"file"===elem.type},password:function(elem){return"password"===elem.type},submit:function(elem){return"submit"===elem.type},image:function(elem){return"image"===elem.type},reset:function(elem){return"reset"===elem.type},button:function(elem){return"button"===elem.type||elem.nodeName.toLowerCase()==="button"},input:function(elem){return/input|select|textarea|button/i.test(elem.nodeName)}},setFilters:{first:function(elem,i){return i===0},last:function(elem,i,match,array){return i===array.length-1},even:function(elem,i){return i%2===0},odd:function(elem,i){return i%2===1},lt:function(elem,i,match){return i<match[3]-0},gt:function(elem,i,match){return i>match[3]-0},nth:function(elem,i,match){return match[3]-0===i},eq:function(elem,i,match){return match[3]-0===i}},filter:{PSEUDO:function(elem,match,i,array){var name=match[1],filter=Expr.filters[name];if(filter){return filter(elem,i,match,array)}else if(name==="contains"){return(elem.textContent||elem.innerText||getText([elem])||"").indexOf(match[3])>=0}else if(name==="not"){var not=match[3];for(var i=0,l=not.length;i<l;i++){if(not[i]===elem){return false}}return true}else{Sizzle.error("Syntax error, unrecognized expression: "+name)}},CHILD:function(elem,match){var type=match[1],node=elem;switch(type){case'only':case'first':while((node=node.previousSibling)){if(node.nodeType===1){return false}}if(type==="first"){return true}node=elem;case'last':while((node=node.nextSibling)){if(node.nodeType===1){return false}}return true;case'nth':var first=match[2],last=match[3];if(first===1&&last===0){return true}var doneName=match[0],parent=elem.parentNode;if(parent&&(parent.sizcache!==doneName||!elem.nodeIndex)){var count=0;for(node=parent.firstChild;node;node=node.nextSibling){if(node.nodeType===1){node.nodeIndex=++count}}parent.sizcache=doneName}var diff=elem.nodeIndex-last;if(first===0){return diff===0}else{return(diff%first===0&&diff/first>=0)}}},ID:function(elem,match){return elem.nodeType===1&&elem.getAttribute("id")===match},TAG:function(elem,match){return(match==="*"&&elem.nodeType===1)||elem.nodeName.toLowerCase()===match},CLASS:function(elem,match){return(" "+(elem.className||elem.getAttribute("class"))+" ").indexOf(match)>-1},ATTR:function(elem,match){var name=match[1],result=Expr.attrHandle[name]?Expr.attrHandle[name](elem):elem[name]!=null?elem[name]:elem.getAttribute(name),value=result+"",type=match[2],check=match[4];return result==null?type==="!=":type==="="?value===check:type==="*="?value.indexOf(check)>=0:type==="~="?(" "+value+" ").indexOf(check)>=0:!check?value&&result!==false:type==="!="?value!==check:type==="^="?value.indexOf(check)===0:type==="$="?value.substr(value.length-check.length)===check:type==="|="?value===check||value.substr(0,check.length+1)===check+"-":false},POS:function(elem,match,i,array){var name=match[2],filter=Expr.setFilters[name];if(filter){return filter(elem,i,match,array)}}}};var origPOS=Expr.match.POS;for(var type in Expr.match){Expr.match[type]=new RegExp(Expr.match[type].source+/(?![^\[]*\])(?![^\(]*\))/.source);Expr.leftMatch[type]=new RegExp(/(^(?:.|\r|\n)*?)/.source+Expr.match[type].source.replace(/\\(\d+)/g,function(all,num){return"\\"+(num-0+1)}))}var makeArray=function(array,results){array=Array.prototype.slice.call(array,0);if(results){results.push.apply(results,array);return results}return array};try{Array.prototype.slice.call(document.documentElement.childNodes,0)[0].nodeType}catch(e){makeArray=function(array,results){var ret=results||[];if(toString.call(array)==="[object Array]"){Array.prototype.push.apply(ret,array)}else{if(typeof array.length==="number"){for(var i=0,l=array.length;i<l;i++){ret.push(array[i])}}else{for(var i=0;array[i];i++){ret.push(array[i])}}}return ret}}var sortOrder;if(document.documentElement.compareDocumentPosition){sortOrder=function(a,b){if(!a.compareDocumentPosition||!b.compareDocumentPosition){if(a==b){hasDuplicate=true}return a.compareDocumentPosition?-1:1}var ret=a.compareDocumentPosition(b)&4?-1:a===b?0:1;if(ret===0){hasDuplicate=true}return ret}}else if("sourceIndex"in document.documentElement){sortOrder=function(a,b){if(!a.sourceIndex||!b.sourceIndex){if(a==b){hasDuplicate=true}return a.sourceIndex?-1:1}var ret=a.sourceIndex-b.sourceIndex;if(ret===0){hasDuplicate=true}return ret}}else if(document.createRange){sortOrder=function(a,b){if(!a.ownerDocument||!b.ownerDocument){if(a==b){hasDuplicate=true}return a.ownerDocument?-1:1}var aRange=a.ownerDocument.createRange(),bRange=b.ownerDocument.createRange();aRange.setStart(a,0);aRange.setEnd(a,0);bRange.setStart(b,0);bRange.setEnd(b,0);var ret=aRange.compareBoundaryPoints(Range.START_TO_END,bRange);if(ret===0){hasDuplicate=true}return ret}}function getText(elems){var ret="",elem;for(var i=0;elems[i];i++){elem=elems[i];if(elem.nodeType===3||elem.nodeType===4){ret+=elem.nodeValue}else if(elem.nodeType!==8){ret+=getText(elem.childNodes)}}return ret}(function(){var form=document.createElement("div"),id="script"+(new Date).getTime();form.innerHTML="<a name='"+id+"'/>";var root=document.documentElement;root.insertBefore(form,root.firstChild);if(document.getElementById(id)){Expr.find.ID=function(match,context,isXML){if(typeof context.getElementById!=="undefined"&&!isXML){var m=context.getElementById(match[1]);return m?m.id===match[1]||typeof m.getAttributeNode!=="undefined"&&m.getAttributeNode("id").nodeValue===match[1]?[m]:undefined:[]}};Expr.filter.ID=function(elem,match){var node=typeof elem.getAttributeNode!=="undefined"&&elem.getAttributeNode("id");return elem.nodeType===1&&node&&node.nodeValue===match}}root.removeChild(form);root=form=null})();(function(){var div=document.createElement("div");div.appendChild(document.createComment(""));if(div.getElementsByTagName("*").length>0){Expr.find.TAG=function(match,context){var results=context.getElementsByTagName(match[1]);if(match[1]==="*"){var tmp=[];for(var i=0;results[i];i++){if(results[i].nodeType===1){tmp.push(results[i])}}results=tmp}return results}}div.innerHTML="<a href='#'></a>";if(div.firstChild&&typeof div.firstChild.getAttribute!=="undefined"&&div.firstChild.getAttribute("href")!=="#"){Expr.attrHandle.href=function(elem){return elem.getAttribute("href",2)}}div=null})();if(document.querySelectorAll){(function(){var oldSizzle=Sizzle,div=document.createElement("div");div.innerHTML="<p class='TEST'></p>";if(div.querySelectorAll&&div.querySelectorAll(".TEST").length===0){return}Sizzle=function(query,context,extra,seed){context=context||document;if(!seed&&context.nodeType===9&&!isXML(context)){try{return makeArray(context.querySelectorAll(query),extra)}catch(e){}}return oldSizzle(query,context,extra,seed)};for(var prop in oldSizzle){Sizzle[prop]=oldSizzle[prop]}div=null})()}(function(){var div=document.createElement("div");div.innerHTML="<div class='test e'></div><div class='test'></div>";if(!div.getElementsByClassName||div.getElementsByClassName("e").length===0){return}div.lastChild.className="e";if(div.getElementsByClassName("e").length===1){return}Expr.order.splice(1,0,"CLASS");Expr.find.CLASS=function(match,context,isXML){if(typeof context.getElementsByClassName!=="undefined"&&!isXML){return context.getElementsByClassName(match[1])}};div=null})();function dirNodeCheck(dir,cur,doneName,checkSet,nodeCheck,isXML){for(var i=0,l=checkSet.length;i<l;i++){var elem=checkSet[i];if(elem){elem=elem[dir];var match=false;while(elem){if(elem.sizcache===doneName){match=checkSet[elem.sizset];break}if(elem.nodeType===1&&!isXML){elem.sizcache=doneName;elem.sizset=i}if(elem.nodeName.toLowerCase()===cur){match=elem;break}elem=elem[dir]}checkSet[i]=match}}}function dirCheck(dir,cur,doneName,checkSet,nodeCheck,isXML){for(var i=0,l=checkSet.length;i<l;i++){var elem=checkSet[i];if(elem){elem=elem[dir];var match=false;while(elem){if(elem.sizcache===doneName){match=checkSet[elem.sizset];break}if(elem.nodeType===1){if(!isXML){elem.sizcache=doneName;elem.sizset=i}if(typeof cur!=="string"){if(elem===cur){match=true;break}}else if(Sizzle.filter(cur,[elem]).length>0){match=elem;break}}elem=elem[dir]}checkSet[i]=match}}}var contains=document.compareDocumentPosition?function(a,b){return!!(a.compareDocumentPosition(b)&16)}:function(a,b){return a!==b&&(a.contains?a.contains(b):true)};var isXML=function(elem){var documentElement=(elem?elem.ownerDocument||elem:0).documentElement;return documentElement?documentElement.nodeName!=="HTML":false};var posProcess=function(selector,context){var tmpSet=[],later="",match,root=context.nodeType?[context]:context;while((match=Expr.match.PSEUDO.exec(selector))){later+=match[0];selector=selector.replace(Expr.match.PSEUDO,"")}selector=Expr.relative[selector]?selector+"*":selector;for(var i=0,l=root.length;i<l;i++){Sizzle(selector,root[i],tmpSet)}return Sizzle.filter(later,tmpSet)};jQuery.find=Sizzle;jQuery.expr=Sizzle.selectors;jQuery.expr[":"]=jQuery.expr.filters;jQuery.unique=Sizzle.uniqueSort;jQuery.text=getText;jQuery.isXMLDoc=isXML;jQuery.contains=contains;return;window.Sizzle=Sizzle})();var runtil=/Until$/,rparentsprev=/^(?:parents|prevUntil|prevAll)/,rmultiselector=/,/,slice=Array.prototype.slice;var winnow=function(elements,qualifier,keep){if(jQuery.isFunction(qualifier)){return jQuery.grep(elements,function(elem,i){return!!qualifier.call(elem,i,elem)===keep})}else if(qualifier.nodeType){return jQuery.grep(elements,function(elem,i){return(elem===qualifier)===keep})}else if(typeof qualifier==="string"){var filtered=jQuery.grep(elements,function(elem){return elem.nodeType===1});if(isSimple.test(qualifier)){return jQuery.filter(qualifier,filtered,!keep)}else{qualifier=jQuery.filter(qualifier,filtered)}}return jQuery.grep(elements,function(elem,i){return(jQuery.inArray(elem,qualifier)>=0)===keep})};jQuery.fn.extend({find:function(selector){var ret=this.pushStack("","find",selector),length=0;for(var i=0,l=this.length;i<l;i++){length=ret.length;jQuery.find(selector,this[i],ret);if(i>0){for(var n=length;n<ret.length;n++){for(var r=0;r<length;r++){if(ret[r]===ret[n]){ret.splice(n--,1);break}}}}}return ret},has:function(target){var targets=jQuery(target);return this.filter(function(){for(var i=0,l=targets.length;i<l;i++){if(jQuery.contains(this,targets[i])){return true}}})},not:function(selector){return this.pushStack(winnow(this,selector,false),"not",selector)},filter:function(selector){return this.pushStack(winnow(this,selector,true),"filter",selector)},is:function(selector){return!!selector&&jQuery.filter(selector,this).length>0},closest:function(selectors,context){if(jQuery.isArray(selectors)){var ret=[],cur=this[0],match,matches={},selector;if(cur&&selectors.length){for(var i=0,l=selectors.length;i<l;i++){selector=selectors[i];if(!matches[selector]){matches[selector]=jQuery.expr.match.POS.test(selector)?jQuery(selector,context||this.context):selector}}while(cur&&cur.ownerDocument&&cur!==context){for(selector in matches){match=matches[selector];if(match.jquery?match.index(cur)>-1:jQuery(cur).is(match)){ret.push({selector:selector,elem:cur});delete matches[selector]}}cur=cur.parentNode}}return ret}var pos=jQuery.expr.match.POS.test(selectors)?jQuery(selectors,context||this.context):null;return this.map(function(i,cur){while(cur&&cur.ownerDocument&&cur!==context){if(pos?pos.index(cur)>-1:jQuery(cur).is(selectors)){return cur}cur=cur.parentNode}return null})},index:function(elem){if(!elem||typeof elem==="string"){return jQuery.inArray(this[0],elem?jQuery(elem):this.parent().children())}return jQuery.inArray(elem.jquery?elem[0]:elem,this)},add:function(selector,context){var set=typeof selector==="string"?jQuery(selector,context||this.context):jQuery.makeArray(selector),all=jQuery.merge(this.get(),set);return this.pushStack(isDisconnected(set[0])||isDisconnected(all[0])?all:jQuery.unique(all))},andSelf:function(){return this.add(this.prevObject)}});function isDisconnected(node){return!node||!node.parentNode||node.parentNode.nodeType===11}jQuery.each({parent:function(elem){var parent=elem.parentNode;return parent&&parent.nodeType!==11?parent:null},parents:function(elem){return jQuery.dir(elem,"parentNode")},parentsUntil:function(elem,i,until){return jQuery.dir(elem,"parentNode",until)},next:function(elem){return jQuery.nth(elem,2,"nextSibling")},prev:function(elem){return jQuery.nth(elem,2,"previousSibling")},nextAll:function(elem){return jQuery.dir(elem,"nextSibling")},prevAll:function(elem){return jQuery.dir(elem,"previousSibling")},nextUntil:function(elem,i,until){return jQuery.dir(elem,"nextSibling",until)},prevUntil:function(elem,i,until){return jQuery.dir(elem,"previousSibling",until)},siblings:function(elem){return jQuery.sibling(elem.parentNode.firstChild,elem)},children:function(elem){return jQuery.sibling(elem.firstChild)},contents:function(elem){return jQuery.nodeName(elem,"iframe")?elem.contentDocument||elem.contentWindow.document:jQuery.makeArray(elem.childNodes)}},function(name,fn){jQuery.fn[name]=function(until,selector){var ret=jQuery.map(this,fn,until);if(!runtil.test(name)){selector=until}if(selector&&typeof selector==="string"){ret=jQuery.filter(selector,ret)}ret=this.length>1?jQuery.unique(ret):ret;if((this.length>1||rmultiselector.test(selector))&&rparentsprev.test(name)){ret=ret.reverse()}return this.pushStack(ret,name,slice.call(arguments).join(","))}});jQuery.extend({filter:function(expr,elems,not){if(not){expr=":not("+expr+")"}return jQuery.find.matches(expr,elems)},dir:function(elem,dir,until){var matched=[],cur=elem[dir];while(cur&&cur.nodeType!==9&&(until===undefined||cur.nodeType!==1||!jQuery(cur).is(until))){if(cur.nodeType===1){matched.push(cur)}cur=cur[dir]}return matched},nth:function(cur,result,dir,elem){result=result||1;var num=0;for(;cur;cur=cur[dir]){if(cur.nodeType===1&&++num===result){break}}return cur},sibling:function(n,elem){var r=[];for(;n;n=n.nextSibling){if(n.nodeType===1&&n!==elem){r.push(n)}}return r}});var rinlinejQuery=/ jQuery\d+="(?:\d+|null)"/g,rleadingWhitespace=/^\s+/,rxhtmlTag=/(<([\w:]+)[^>]*?)\/>/g,rselfClosing=/^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,rtagName=/<([\w:]+)/,rtbody=/<tbody/i,rhtml=/<|&#?\w+;/,rnocache=/<script|<object|<embed|<option|<style/i,rchecked=/checked\s*(?:[^=]|=\s*.checked.)/i,fcloseTag=function(all,front,tag){return rselfClosing.test(tag)?all:front+"></"+tag+">"},wrapMap={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};wrapMap.optgroup=wrapMap.option;wrapMap.tbody=wrapMap.tfoot=wrapMap.colgroup=wrapMap.caption=wrapMap.thead;wrapMap.th=wrapMap.td;if(!jQuery.support.htmlSerialize){wrapMap._default=[1,"div<div>","</div>"]}jQuery.fn.extend({text:function(text){if(jQuery.isFunction(text)){return this.each(function(i){var self=jQuery(this);self.text(text.call(this,i,self.text()))})}if(typeof text!=="object"&&text!==undefined){return this.empty().append((this[0]&&this[0].ownerDocument||document).createTextNode(text))}return jQuery.text(this)},wrapAll:function(html){if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapAll(html.call(this,i))})}if(this[0]){var wrap=jQuery(html,this[0].ownerDocument).eq(0).clone(true);if(this[0].parentNode){wrap.insertBefore(this[0])}wrap.map(function(){var elem=this;while(elem.firstChild&&elem.firstChild.nodeType===1){elem=elem.firstChild}return elem}).append(this)}return this},wrapInner:function(html){if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapInner(html.call(this,i))})}return this.each(function(){var self=jQuery(this),contents=self.contents();if(contents.length){contents.wrapAll(html)}else{self.append(html)}})},wrap:function(html){return this.each(function(){jQuery(this).wrapAll(html)})},unwrap:function(){return this.parent().each(function(){if(!jQuery.nodeName(this,"body")){jQuery(this).replaceWith(this.childNodes)}}).end()},append:function(){return this.domManip(arguments,true,function(elem){if(this.nodeType===1){this.appendChild(elem)}})},prepend:function(){return this.domManip(arguments,true,function(elem){if(this.nodeType===1){this.insertBefore(elem,this.firstChild)}})},before:function(){if(this[0]&&this[0].parentNode){return this.domManip(arguments,false,function(elem){this.parentNode.insertBefore(elem,this)})}else if(arguments.length){var set=jQuery(arguments[0]);set.push.apply(set,this.toArray());return this.pushStack(set,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode){return this.domManip(arguments,false,function(elem){this.parentNode.insertBefore(elem,this.nextSibling)})}else if(arguments.length){var set=this.pushStack(this,"after",arguments);set.push.apply(set,jQuery(arguments[0]).toArray());return set}},remove:function(selector,keepData){for(var i=0,elem;(elem=this[i])!=null;i++){if(!selector||jQuery.filter(selector,[elem]).length){if(!keepData&&elem.nodeType===1){jQuery.cleanData(elem.getElementsByTagName("*"));jQuery.cleanData([elem])}if(elem.parentNode){elem.parentNode.removeChild(elem)}}}return this},empty:function(){for(var i=0,elem;(elem=this[i])!=null;i++){if(elem.nodeType===1){jQuery.cleanData(elem.getElementsByTagName("*"))}while(elem.firstChild){elem.removeChild(elem.firstChild)}}return this},clone:function(events){var ret=this.map(function(){if(!jQuery.support.noCloneEvent&&!jQuery.isXMLDoc(this)){var html=this.outerHTML,ownerDocument=this.ownerDocument;if(!html){var div=ownerDocument.createElement("div");div.appendChild(this.cloneNode(true));html=div.innerHTML}return jQuery.clean([html.replace(rinlinejQuery,"").replace(/=([^="'>\s]+\/)>/g,'="$1">').replace(rleadingWhitespace,"")],ownerDocument)[0]}else{return this.cloneNode(true)}});if(events===true){cloneCopyEvent(this,ret);cloneCopyEvent(this.find("*"),ret.find("*"))}return ret},html:function(value){if(value===undefined){return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(rinlinejQuery,""):null}else if(typeof value==="string"&&!rnocache.test(value)&&(jQuery.support.leadingWhitespace||!rleadingWhitespace.test(value))&&!wrapMap[(rtagName.exec(value)||["",""])[1].toLowerCase()]){value=value.replace(rxhtmlTag,fcloseTag);try{for(var i=0,l=this.length;i<l;i++){if(this[i].nodeType===1){jQuery.cleanData(this[i].getElementsByTagName("*"));this[i].innerHTML=value}}}catch(e){this.empty().append(value)}}else if(jQuery.isFunction(value)){this.each(function(i){var self=jQuery(this),old=self.html();self.empty().append(function(){return value.call(this,i,old)})})}else{this.empty().append(value)}return this},replaceWith:function(value){if(this[0]&&this[0].parentNode){if(jQuery.isFunction(value)){return this.each(function(i){var self=jQuery(this),old=self.html();self.replaceWith(value.call(this,i,old))})}if(typeof value!=="string"){value=jQuery(value).detach()}return this.each(function(){var next=this.nextSibling,parent=this.parentNode;jQuery(this).remove();if(next){jQuery(next).before(value)}else{jQuery(parent).append(value)}})}else{return this.pushStack(jQuery(jQuery.isFunction(value)?value():value),"replaceWith",value)}},detach:function(selector){return this.remove(selector,true)},domManip:function(args,table,callback){var results,first,value=args[0],scripts=[],fragment,parent;if(!jQuery.support.checkClone&&arguments.length===3&&typeof value==="string"&&rchecked.test(value)){return this.each(function(){jQuery(this).domManip(args,table,callback,true)})}if(jQuery.isFunction(value)){return this.each(function(i){var self=jQuery(this);args[0]=value.call(this,i,table?self.html():undefined);self.domManip(args,table,callback)})}if(this[0]){parent=value&&value.parentNode;if(jQuery.support.parentNode&&parent&&parent.nodeType===11&&parent.childNodes.length===this.length){results={fragment:parent}}else{results=buildFragment(args,this,scripts)}fragment=results.fragment;if(fragment.childNodes.length===1){first=fragment=fragment.firstChild}else{first=fragment.firstChild}if(first){table=table&&jQuery.nodeName(first,"tr");for(var i=0,l=this.length;i<l;i++){callback.call(table?root(this[i],first):this[i],i>0||results.cacheable||this.length>1?fragment.cloneNode(true):fragment)}}if(scripts.length){jQuery.each(scripts,evalScript)}}return this;function root(elem,cur){return jQuery.nodeName(elem,"table")?(elem.getElementsByTagName("tbody")[0]||elem.appendChild(elem.ownerDocument.createElement("tbody"))):elem}}});function cloneCopyEvent(orig,ret){var i=0;ret.each(function(){if(this.nodeName!==(orig[i]&&orig[i].nodeName)){return}var oldData=jQuery.data(orig[i++]),curData=jQuery.data(this,oldData),events=oldData&&oldData.events;if(events){delete curData.handle;curData.events={};for(var type in events){for(var handler in events[type]){jQuery.event.add(this,type,events[type][handler],events[type][handler].data)}}}})}function buildFragment(args,nodes,scripts){var fragment,cacheable,cacheresults,doc=(nodes&&nodes[0]?nodes[0].ownerDocument||nodes[0]:document);if(args.length===1&&typeof args[0]==="string"&&args[0].length<512&&doc===document&&!rnocache.test(args[0])&&(jQuery.support.checkClone||!rchecked.test(args[0]))){cacheable=true;cacheresults=jQuery.fragments[args[0]];if(cacheresults){if(cacheresults!==1){fragment=cacheresults}}}if(!fragment){fragment=doc.createDocumentFragment();jQuery.clean(args,doc,fragment,scripts)}if(cacheable){jQuery.fragments[args[0]]=cacheresults?fragment:1}return{fragment:fragment,cacheable:cacheable}}jQuery.fragments={};jQuery.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(name,original){jQuery.fn[name]=function(selector){var ret=[],insert=jQuery(selector),parent=this.length===1&&this[0].parentNode;if(parent&&parent.nodeType===11&&parent.childNodes.length===1&&insert.length===1){insert[original](this[0]);return this}else{for(var i=0,l=insert.length;i<l;i++){var elems=(i>0?this.clone(true):this).get();jQuery.fn[original].apply(jQuery(insert[i]),elems);ret=ret.concat(elems)}return this.pushStack(ret,name,insert.selector)}}});jQuery.extend({clean:function(elems,context,fragment,scripts){context=context||document;if(typeof context.createElement==="undefined"){context=context.ownerDocument||context[0]&&context[0].ownerDocument||document}var ret=[];for(var i=0,elem;(elem=elems[i])!=null;i++){if(typeof elem==="number"){elem+=""}if(!elem){continue}if(typeof elem==="string"&&!rhtml.test(elem)){elem=context.createTextNode(elem)}else if(typeof elem==="string"){elem=elem.replace(rxhtmlTag,fcloseTag);var tag=(rtagName.exec(elem)||["",""])[1].toLowerCase(),wrap=wrapMap[tag]||wrapMap._default,depth=wrap[0],div=context.createElement("div");div.innerHTML=wrap[1]+elem+wrap[2];while(depth--){div=div.lastChild}if(!jQuery.support.tbody){var hasBody=rtbody.test(elem),tbody=tag==="table"&&!hasBody?div.firstChild&&div.firstChild.childNodes:wrap[1]==="<table>"&&!hasBody?div.childNodes:[];for(var j=tbody.length-1;j>=0;--j){if(jQuery.nodeName(tbody[j],"tbody")&&!tbody[j].childNodes.length){tbody[j].parentNode.removeChild(tbody[j])}}}if(!jQuery.support.leadingWhitespace&&rleadingWhitespace.test(elem)){div.insertBefore(context.createTextNode(rleadingWhitespace.exec(elem)[0]),div.firstChild)}elem=div.childNodes}if(elem.nodeType){ret.push(elem)}else{ret=jQuery.merge(ret,elem)}}if(fragment){for(var i=0;ret[i];i++){if(scripts&&jQuery.nodeName(ret[i],"script")&&(!ret[i].type||ret[i].type.toLowerCase()==="text/javascript")){scripts.push(ret[i].parentNode?ret[i].parentNode.removeChild(ret[i]):ret[i])}else{if(ret[i].nodeType===1){ret.splice.apply(ret,[i+1,0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))))}fragment.appendChild(ret[i])}}}return ret},cleanData:function(elems){var data,id,cache=jQuery.cache,special=jQuery.event.special,deleteExpando=jQuery.support.deleteExpando;for(var i=0,elem;(elem=elems[i])!=null;i++){id=elem[jQuery.expando];if(id){data=cache[id];if(data.events){for(var type in data.events){if(special[type]){jQuery.event.remove(elem,type)}else{removeEvent(elem,type,data.handle)}}}if(deleteExpando){delete elem[jQuery.expando]}else if(elem.removeAttribute){elem.removeAttribute(jQuery.expando)}delete cache[id]}}}});var rexclude=/z-?index|font-?weight|opacity|zoom|line-?height/i,ralpha=/alpha\([^)]*\)/,ropacity=/opacity=([^)]*)/,rfloat=/float/i,rdashAlpha=/-([a-z])/ig,rupper=/([A-Z])/g,rnumpx=/^-?\d+(?:px)?$/i,rnum=/^-?\d/,cssShow={position:"absolute",visibility:"hidden",display:"block"},cssWidth=["Left","Right"],cssHeight=["Top","Bottom"],getComputedStyle=document.defaultView&&document.defaultView.getComputedStyle,styleFloat=jQuery.support.cssFloat?"cssFloat":"styleFloat",fcamelCase=function(all,letter){return letter.toUpperCase()};jQuery.fn.css=function(name,value){return access(this,name,value,true,function(elem,name,value){if(value===undefined){return jQuery.curCSS(elem,name)}if(typeof value==="number"&&!rexclude.test(name)){value+="px"}jQuery.style(elem,name,value)})};jQuery.extend({style:function(elem,name,value){if(!elem||elem.nodeType===3||elem.nodeType===8){return undefined}if((name==="width"||name==="height")&&parseFloat(value)<0){value=undefined}var style=elem.style||elem,set=value!==undefined;if(!jQuery.support.opacity&&name==="opacity"){if(set){style.zoom=1;var opacity=parseInt(value,10)+""==="NaN"?"":"alpha(opacity="+value*100+")";var filter=style.filter||jQuery.curCSS(elem,"filter")||"";style.filter=ralpha.test(filter)?filter.replace(ralpha,opacity):opacity}return style.filter&&style.filter.indexOf("opacity=")>=0?(parseFloat(ropacity.exec(style.filter)[1])/100)+"":""}if(rfloat.test(name)){name=styleFloat}name=name.replace(rdashAlpha,fcamelCase);if(set){style[name]=value}return style[name]},css:function(elem,name,force,extra){if(name==="width"||name==="height"){var val,props=cssShow,which=name==="width"?cssWidth:cssHeight;function getWH(){val=name==="width"?elem.offsetWidth:elem.offsetHeight;if(extra==="border"){return}jQuery.each(which,function(){if(!extra){val-=parseFloat(jQuery.curCSS(elem,"padding"+this,true))||0}if(extra==="margin"){val+=parseFloat(jQuery.curCSS(elem,"margin"+this,true))||0}else{val-=parseFloat(jQuery.curCSS(elem,"border"+this+"Width",true))||0}})}if(elem.offsetWidth!==0){getWH()}else{jQuery.swap(elem,props,getWH)}return Math.max(0,Math.round(val))}return jQuery.curCSS(elem,name,force)},curCSS:function(elem,name,force){var ret,style=elem.style,filter;if(!jQuery.support.opacity&&name==="opacity"&&elem.currentStyle){ret=ropacity.test(elem.currentStyle.filter||"")?(parseFloat(RegExp.$1)/100)+"":"";return ret===""?"1":ret}if(rfloat.test(name)){name=styleFloat}if(!force&&style&&style[name]){ret=style[name]}else if(getComputedStyle){if(rfloat.test(name)){name="float"}name=name.replace(rupper,"-$1").toLowerCase();var defaultView=elem.ownerDocument.defaultView;if(!defaultView){return null}var computedStyle=defaultView.getComputedStyle(elem,null);if(computedStyle){ret=computedStyle.getPropertyValue(name)}if(name==="opacity"&&ret===""){ret="1"}}else if(elem.currentStyle){var camelCase=name.replace(rdashAlpha,fcamelCase);ret=elem.currentStyle[name]||elem.currentStyle[camelCase];if(!rnumpx.test(ret)&&rnum.test(ret)){var left=style.left,rsLeft=elem.runtimeStyle.left;elem.runtimeStyle.left=elem.currentStyle.left;style.left=camelCase==="fontSize"?"1em":(ret||0);ret=style.pixelLeft+"px";style.left=left;elem.runtimeStyle.left=rsLeft}}return ret},swap:function(elem,options,callback){var old={};for(var name in options){old[name]=elem.style[name];elem.style[name]=options[name]}callback.call(elem);for(var name in options){elem.style[name]=old[name]}}});if(jQuery.expr&&jQuery.expr.filters){jQuery.expr.filters.hidden=function(elem){var width=elem.offsetWidth,height=elem.offsetHeight,skip=elem.nodeName.toLowerCase()==="tr";return width===0&&height===0&&!skip?true:width>0&&height>0&&!skip?false:jQuery.curCSS(elem,"display")==="none"};jQuery.expr.filters.visible=function(elem){return!jQuery.expr.filters.hidden(elem)}}var jsc=now(),rscript=/<script(.|\s)*?\/script>/gi,rselectTextarea=/select|textarea/i,rinput=/color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,jsre=/=\?(&|$)/,rquery=/\?/,rts=/(\?|&)_=.*?(&|$)/,rurl=/^(\w+:)?\/\/([^\/?#]+)/,r20=/%20/g,_load=jQuery.fn.load;jQuery.fn.extend({load:function(url,params,callback){if(typeof url!=="string"){return _load.call(this,url)}else if(!this.length){return this}var off=url.indexOf(" ");if(off>=0){var selector=url.slice(off,url.length);url=url.slice(0,off)}var type="GET";if(params){if(jQuery.isFunction(params)){callback=params;params=null}else if(typeof params==="object"){params=jQuery.param(params,jQuery.ajaxSettings.traditional);type="POST"}}var self=this;jQuery.ajax({url:url,type:type,dataType:"html",data:params,complete:function(res,status){if(status==="success"||status==="notmodified"){self.html(selector?jQuery("<div />").append(res.responseText.replace(rscript,"")).find(selector):res.responseText)}if(callback){self.each(callback,[res.responseText,status,res])}}});return this},serialize:function(){return jQuery.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?jQuery.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||rselectTextarea.test(this.nodeName)||rinput.test(this.type))}).map(function(i,elem){var val=jQuery(this).val();return val==null?null:jQuery.isArray(val)?jQuery.map(val,function(val,i){return{name:elem.name,value:val}}):{name:elem.name,value:val}}).get()}});jQuery.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(i,o){jQuery.fn[o]=function(f){return this.bind(o,f)}});jQuery.extend({get:function(url,data,callback,type){if(jQuery.isFunction(data)){type=type||callback;callback=data;data=null}return jQuery.ajax({type:"GET",url:url,data:data,success:callback,dataType:type})},getScript:function(url,callback){return jQuery.get(url,null,callback,"script")},getJSON:function(url,data,callback){return jQuery.get(url,data,callback,"json")},post:function(url,data,callback,type){if(jQuery.isFunction(data)){type=type||callback;callback=data;data={}}return jQuery.ajax({type:"POST",url:url,data:data,success:callback,dataType:type})},ajaxSetup:function(settings){jQuery.extend(jQuery.ajaxSettings,settings)},ajaxSettings:{url:location.href,global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:window.XMLHttpRequest&&(window.location.protocol!=="file:"||!window.ActiveXObject)?function(){return new window.XMLHttpRequest()}:function(){try{return new window.ActiveXObject("Microsoft.XMLHTTP")}catch(e){}},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},etag:{},ajax:function(origSettings){var s=jQuery.extend(true,{},jQuery.ajaxSettings,origSettings);var jsonp,status,data,callbackContext=origSettings&&origSettings.context||s,type=s.type.toUpperCase();if(s.data&&s.processData&&typeof s.data!=="string"){s.data=jQuery.param(s.data,s.traditional)}if(s.dataType==="jsonp"){if(type==="GET"){if(!jsre.test(s.url)){s.url+=(rquery.test(s.url)?"&":"?")+(s.jsonp||"callback")+"=?"}}else if(!s.data||!jsre.test(s.data)){s.data=(s.data?s.data+"&":"")+(s.jsonp||"callback")+"=?"}s.dataType="json"}if(s.dataType==="json"&&(s.data&&jsre.test(s.data)||jsre.test(s.url))){jsonp=s.jsonpCallback||("jsonp"+jsc++);if(s.data){s.data=(s.data+"").replace(jsre,"="+jsonp+"$1")}s.url=s.url.replace(jsre,"="+jsonp+"$1");s.dataType="script";window[jsonp]=window[jsonp]||function(tmp){data=tmp;success();complete();window[jsonp]=undefined;try{delete window[jsonp]}catch(e){}if(head){head.removeChild(script)}}}if(s.dataType==="script"&&s.cache===null){s.cache=false}if(s.cache===false&&type==="GET"){var ts=now();var ret=s.url.replace(rts,"$1_="+ts+"$2");s.url=ret+((ret===s.url)?(rquery.test(s.url)?"&":"?")+"_="+ts:"")}if(s.data&&type==="GET"){s.url+=(rquery.test(s.url)?"&":"?")+s.data}if(s.global&&!jQuery.active++){jQuery.event.trigger("ajaxStart")}var parts=rurl.exec(s.url),remote=parts&&(parts[1]&&parts[1]!==location.protocol||parts[2]!==location.host);if(s.dataType==="script"&&type==="GET"&&remote){var head=document.getElementsByTagName("head")[0]||document.documentElement;var script=document.createElement("script");script.src=s.url;if(s.scriptCharset){script.charset=s.scriptCharset}if(!jsonp){var done=false;script.onload=script.onreadystatechange=function(){if(!done&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){done=true;success();complete();script.onload=script.onreadystatechange=null;if(head&&script.parentNode){head.removeChild(script)}}}}head.insertBefore(script,head.firstChild);return undefined}var requestDone=false;var xhr=s.xhr();if(!xhr){return}if(s.username){xhr.open(type,s.url,s.async,s.username,s.password)}else{xhr.open(type,s.url,s.async)}try{if(s.data||origSettings&&origSettings.contentType){xhr.setRequestHeader("Content-Type",s.contentType)}if(s.ifModified){if(jQuery.lastModified[s.url]){xhr.setRequestHeader("If-Modified-Since",jQuery.lastModified[s.url])}if(jQuery.etag[s.url]){xhr.setRequestHeader("If-None-Match",jQuery.etag[s.url])}}if(!remote){xhr.setRequestHeader("X-Requested-With","XMLHttpRequest")}xhr.setRequestHeader("Accept",s.dataType&&s.accepts[s.dataType]?s.accepts[s.dataType]+", */*":s.accepts._default)}catch(e){}if(s.beforeSend&&s.beforeSend.call(callbackContext,xhr,s)===false){if(s.global&&!--jQuery.active){jQuery.event.trigger("ajaxStop")}xhr.abort();return false}if(s.global){trigger("ajaxSend",[xhr,s])}var onreadystatechange=xhr.onreadystatechange=function(isTimeout){if(!xhr||xhr.readyState===0||isTimeout==="abort"){if(!requestDone){complete()}requestDone=true;if(xhr){xhr.onreadystatechange=jQuery.noop}}else if(!requestDone&&xhr&&(xhr.readyState===4||isTimeout==="timeout")){requestDone=true;xhr.onreadystatechange=jQuery.noop;status=isTimeout==="timeout"?"timeout":!jQuery.httpSuccess(xhr)?"error":s.ifModified&&jQuery.httpNotModified(xhr,s.url)?"notmodified":"success";var errMsg;if(status==="success"){try{data=jQuery.httpData(xhr,s.dataType,s)}catch(err){status="parsererror";errMsg=err}}if(status==="success"||status==="notmodified"){if(!jsonp){success()}}else{jQuery.handleError(s,xhr,status,errMsg)}complete();if(isTimeout==="timeout"){xhr.abort()}if(s.async){xhr=null}}};try{var oldAbort=xhr.abort;xhr.abort=function(){if(xhr){oldAbort.call(xhr)}onreadystatechange("abort")}}catch(e){}if(s.async&&s.timeout>0){setTimeout(function(){if(xhr&&!requestDone){onreadystatechange("timeout")}},s.timeout)}try{xhr.send(type==="POST"||type==="PUT"||type==="DELETE"?s.data:null)}catch(e){jQuery.handleError(s,xhr,null,e);complete()}if(!s.async){onreadystatechange()}function success(){if(s.success){s.success.call(callbackContext,data,status,xhr)}if(s.global){trigger("ajaxSuccess",[xhr,s])}}function complete(){if(s.complete){s.complete.call(callbackContext,xhr,status)}if(s.global){trigger("ajaxComplete",[xhr,s])}if(s.global&&!--jQuery.active){jQuery.event.trigger("ajaxStop")}}function trigger(type,args){(s.context?jQuery(s.context):jQuery.event).trigger(type,args)}return xhr},handleError:function(s,xhr,status,e){if(s.error){s.error.call(s.context||s,xhr,status,e)}if(s.global){(s.context?jQuery(s.context):jQuery.event).trigger("ajaxError",[xhr,s,e])}},active:0,httpSuccess:function(xhr){try{return!xhr.status&&location.protocol==="file:"||(xhr.status>=200&&xhr.status<300)||xhr.status===304||xhr.status===1223||xhr.status===0}catch(e){}return false},httpNotModified:function(xhr,url){var lastModified=xhr.getResponseHeader("Last-Modified"),etag=xhr.getResponseHeader("Etag");if(lastModified){jQuery.lastModified[url]=lastModified}if(etag){jQuery.etag[url]=etag}return xhr.status===304||xhr.status===0},httpData:function(xhr,type,s){var ct=xhr.getResponseHeader("content-type")||"",xml=type==="xml"||!type&&ct.indexOf("xml")>=0,data=xml?xhr.responseXML:xhr.responseText;if(xml&&data.documentElement.nodeName==="parsererror"){jQuery.error("parsererror")}if(s&&s.dataFilter){data=s.dataFilter(data,type)}if(typeof data==="string"){if(type==="json"||!type&&ct.indexOf("json")>=0){data=jQuery.parseJSON(data)}else if(type==="script"||!type&&ct.indexOf("javascript")>=0){jQuery.globalEval(data)}}return data},param:function(a,traditional){var s=[];if(traditional===undefined){traditional=jQuery.ajaxSettings.traditional}if(jQuery.isArray(a)||a.jquery){jQuery.each(a,function(){add(this.name,this.value)})}else{for(var prefix in a){buildParams(prefix,a[prefix])}}return s.join("&").replace(r20,"+");function buildParams(prefix,obj){if(jQuery.isArray(obj)){jQuery.each(obj,function(i,v){if(traditional||/\[\]$/.test(prefix)){add(prefix,v)}else{buildParams(prefix+"["+(typeof v==="object"||jQuery.isArray(v)?i:"")+"]",v)}})}else if(!traditional&&obj!=null&&typeof obj==="object"){jQuery.each(obj,function(k,v){buildParams(prefix+"["+k+"]",v)})}else{add(prefix,obj)}}function add(key,value){value=jQuery.isFunction(value)?value():value;s[s.length]=encodeURIComponent(key)+"="+encodeURIComponent(value)}}});var elemdisplay={},rfxtypes=/toggle|show|hide/,rfxnum=/^([+-]=)?([\d+-.]+)(.*)$/,timerId,fxAttrs=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];jQuery.fn.extend({show:function(speed,callback){if(speed||speed===0){return this.animate(genFx("show",3),speed,callback)}else{for(var i=0,l=this.length;i<l;i++){var old=jQuery.data(this[i],"olddisplay");this[i].style.display=old||"";if(jQuery.css(this[i],"display")==="none"){var nodeName=this[i].nodeName,display;if(elemdisplay[nodeName]){display=elemdisplay[nodeName]}else{var elem=jQuery("<"+nodeName+" />").appendTo("body");display=elem.css("display");if(display==="none"){display="block"}elem.remove();elemdisplay[nodeName]=display}jQuery.data(this[i],"olddisplay",display)}}for(var j=0,k=this.length;j<k;j++){this[j].style.display=jQuery.data(this[j],"olddisplay")||""}return this}},hide:function(speed,callback){if(speed||speed===0){return this.animate(genFx("hide",3),speed,callback)}else{for(var i=0,l=this.length;i<l;i++){var old=jQuery.data(this[i],"olddisplay");if(!old&&old!=="none"){jQuery.data(this[i],"olddisplay",jQuery.css(this[i],"display"))}}for(var j=0,k=this.length;j<k;j++){this[j].style.display="none"}return this}},_toggle:jQuery.fn.toggle,toggle:function(fn,fn2){var bool=typeof fn==="boolean";if(jQuery.isFunction(fn)&&jQuery.isFunction(fn2)){this._toggle.apply(this,arguments)}else if(fn==null||bool){this.each(function(){var state=bool?fn:jQuery(this).is(":hidden");jQuery(this)[state?"show":"hide"]()})}else{this.animate(genFx("toggle",3),fn,fn2)}return this},fadeTo:function(speed,to,callback){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:to},speed,callback)},animate:function(prop,speed,easing,callback){var optall=jQuery.speed(speed,easing,callback);if(jQuery.isEmptyObject(prop)){return this.each(optall.complete)}return this[optall.queue===false?"each":"queue"](function(){var opt=jQuery.extend({},optall),p,hidden=this.nodeType===1&&jQuery(this).is(":hidden"),self=this;for(p in prop){var name=p.replace(rdashAlpha,fcamelCase);if(p!==name){prop[name]=prop[p];delete prop[p];p=name}if(prop[p]==="hide"&&hidden||prop[p]==="show"&&!hidden){return opt.complete.call(this)}if((p==="height"||p==="width")&&this.style){opt.display=jQuery.css(this,"display");opt.overflow=this.style.overflow}if(jQuery.isArray(prop[p])){(opt.specialEasing=opt.specialEasing||{})[p]=prop[p][1];prop[p]=prop[p][0]}}if(opt.overflow!=null){this.style.overflow="hidden"}opt.curAnim=jQuery.extend({},prop);jQuery.each(prop,function(name,val){var e=new jQuery.fx(self,opt,name);if(rfxtypes.test(val)){e[val==="toggle"?hidden?"show":"hide":val](prop)}else{var parts=rfxnum.exec(val),start=e.cur(true)||0;if(parts){var end=parseFloat(parts[2]),unit=parts[3]||"px";if(unit!=="px"){self.style[name]=(end||1)+unit;start=((end||1)/e.cur(true))*start;self.style[name]=start+unit}if(parts[1]){end=((parts[1]==="-="?-1:1)*end)+start}e.custom(start,end,unit)}else{e.custom(start,val,"")}}});return true})},stop:function(clearQueue,gotoEnd){var timers=jQuery.timers;if(clearQueue){this.queue([])}this.each(function(){for(var i=timers.length-1;i>=0;i--){if(timers[i].elem===this){if(gotoEnd){timers[i](true)}timers.splice(i,1)}}});if(!gotoEnd){this.dequeue()}return this}});jQuery.each({slideDown:genFx("show",1),slideUp:genFx("hide",1),slideToggle:genFx("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(name,props){jQuery.fn[name]=function(speed,callback){return this.animate(props,speed,callback)}});jQuery.extend({speed:function(speed,easing,fn){var opt=speed&&typeof speed==="object"?speed:{complete:fn||!fn&&easing||jQuery.isFunction(speed)&&speed,duration:speed,easing:fn&&easing||easing&&!jQuery.isFunction(easing)&&easing};opt.duration=jQuery.fx.off?0:typeof opt.duration==="number"?opt.duration:jQuery.fx.speeds[opt.duration]||jQuery.fx.speeds._default;opt.old=opt.complete;opt.complete=function(){if(opt.queue!==false){jQuery(this).dequeue()}if(jQuery.isFunction(opt.old)){opt.old.call(this)}};return opt},easing:{linear:function(p,n,firstNum,diff){return firstNum+diff*p},swing:function(p,n,firstNum,diff){return((-Math.cos(p*Math.PI)/2)+0.5)*diff+firstNum}},timers:[],fx:function(elem,options,prop){this.options=options;this.elem=elem;this.prop=prop;if(!options.orig){options.orig={}}}});jQuery.fx.prototype={update:function(){if(this.options.step){this.options.step.call(this.elem,this.now,this)}(jQuery.fx.step[this.prop]||jQuery.fx.step._default)(this);if((this.prop==="height"||this.prop==="width")&&this.elem.style){this.elem.style.display="block"}},cur:function(force){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null)){return this.elem[this.prop]}var r=parseFloat(jQuery.css(this.elem,this.prop,force));return r&&r>-10000?r:parseFloat(jQuery.curCSS(this.elem,this.prop))||0},custom:function(from,to,unit){this.startTime=now();this.start=from;this.end=to;this.unit=unit||this.unit||"px";this.now=this.start;this.pos=this.state=0;var self=this;function t(gotoEnd){return self.step(gotoEnd)}t.elem=this.elem;if(t()&&jQuery.timers.push(t)&&!timerId){timerId=setInterval(jQuery.fx.tick,13)}},show:function(){this.options.orig[this.prop]=jQuery.style(this.elem,this.prop);this.options.show=true;this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur());jQuery(this.elem).show()},hide:function(){this.options.orig[this.prop]=jQuery.style(this.elem,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(gotoEnd){var t=now(),done=true;if(gotoEnd||t>=this.options.duration+this.startTime){this.now=this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;for(var i in this.options.curAnim){if(this.options.curAnim[i]!==true){done=false}}if(done){if(this.options.display!=null){this.elem.style.overflow=this.options.overflow;var old=jQuery.data(this.elem,"olddisplay");this.elem.style.display=old?old:this.options.display;if(jQuery.css(this.elem,"display")==="none"){this.elem.style.display="block"}}if(this.options.hide){jQuery(this.elem).hide()}if(this.options.hide||this.options.show){for(var p in this.options.curAnim){jQuery.style(this.elem,p,this.options.orig[p])}}this.options.complete.call(this.elem)}return false}else{var n=t-this.startTime;this.state=n/this.options.duration;var specialEasing=this.options.specialEasing&&this.options.specialEasing[this.prop];var defaultEasing=this.options.easing||(jQuery.easing.swing?"swing":"linear");this.pos=jQuery.easing[specialEasing||defaultEasing](this.state,n,0,1,this.options.duration);this.now=this.start+((this.end-this.start)*this.pos);this.update()}return true}};jQuery.extend(jQuery.fx,{tick:function(){var timers=jQuery.timers;for(var i=0;i<timers.length;i++){if(!timers[i]()){timers.splice(i--,1)}}if(!timers.length){jQuery.fx.stop()}},stop:function(){clearInterval(timerId);timerId=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(fx){jQuery.style(fx.elem,"opacity",fx.now)},_default:function(fx){if(fx.elem.style&&fx.elem.style[fx.prop]!=null){fx.elem.style[fx.prop]=(fx.prop==="width"||fx.prop==="height"?Math.max(0,fx.now):fx.now)+fx.unit}else{fx.elem[fx.prop]=fx.now}}}});if(jQuery.expr&&jQuery.expr.filters){jQuery.expr.filters.animated=function(elem){return jQuery.grep(jQuery.timers,function(fn){return elem===fn.elem}).length}}function genFx(type,num){var obj={};jQuery.each(fxAttrs.concat.apply([],fxAttrs.slice(0,num)),function(){obj[this]=type});return obj}if("getBoundingClientRect"in document.documentElement){jQuery.fn.offset=function(options){var elem=this[0];if(options){return this.each(function(i){jQuery.offset.setOffset(this,options,i)})}if(!elem||!elem.ownerDocument){return null}if(elem===elem.ownerDocument.body){return jQuery.offset.bodyOffset(elem)}var box=elem.getBoundingClientRect(),doc=elem.ownerDocument,body=doc.body,docElem=doc.documentElement,clientTop=docElem.clientTop||body.clientTop||0,clientLeft=docElem.clientLeft||body.clientLeft||0,top=box.top+(self.pageYOffset||jQuery.support.boxModel&&docElem.scrollTop||body.scrollTop)-clientTop,left=box.left+(self.pageXOffset||jQuery.support.boxModel&&docElem.scrollLeft||body.scrollLeft)-clientLeft;return{top:top,left:left}}}else{jQuery.fn.offset=function(options){var elem=this[0];if(options){return this.each(function(i){jQuery.offset.setOffset(this,options,i)})}if(!elem||!elem.ownerDocument){return null}if(elem===elem.ownerDocument.body){return jQuery.offset.bodyOffset(elem)}jQuery.offset.initialize();var offsetParent=elem.offsetParent,prevOffsetParent=elem,doc=elem.ownerDocument,computedStyle,docElem=doc.documentElement,body=doc.body,defaultView=doc.defaultView,prevComputedStyle=defaultView?defaultView.getComputedStyle(elem,null):elem.currentStyle,top=elem.offsetTop,left=elem.offsetLeft;while((elem=elem.parentNode)&&elem!==body&&elem!==docElem){if(jQuery.offset.supportsFixedPosition&&prevComputedStyle.position==="fixed"){break}computedStyle=defaultView?defaultView.getComputedStyle(elem,null):elem.currentStyle;top-=elem.scrollTop;left-=elem.scrollLeft;if(elem===offsetParent){top+=elem.offsetTop;left+=elem.offsetLeft;if(jQuery.offset.doesNotAddBorder&&!(jQuery.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(elem.nodeName))){top+=parseFloat(computedStyle.borderTopWidth)||0;left+=parseFloat(computedStyle.borderLeftWidth)||0}prevOffsetParent=offsetParent,offsetParent=elem.offsetParent}if(jQuery.offset.subtractsBorderForOverflowNotVisible&&computedStyle.overflow!=="visible"){top+=parseFloat(computedStyle.borderTopWidth)||0;left+=parseFloat(computedStyle.borderLeftWidth)||0}prevComputedStyle=computedStyle}if(prevComputedStyle.position==="relative"||prevComputedStyle.position==="static"){top+=body.offsetTop;left+=body.offsetLeft}if(jQuery.offset.supportsFixedPosition&&prevComputedStyle.position==="fixed"){top+=Math.max(docElem.scrollTop,body.scrollTop);left+=Math.max(docElem.scrollLeft,body.scrollLeft)}return{top:top,left:left}}}jQuery.offset={initialize:function(){var body=document.body,container=document.createElement("div"),innerDiv,checkDiv,table,td,bodyMarginTop=parseFloat(jQuery.curCSS(body,"marginTop",true))||0,html="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";jQuery.extend(container.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"});container.innerHTML=html;body.insertBefore(container,body.firstChild);innerDiv=container.firstChild;checkDiv=innerDiv.firstChild;td=innerDiv.nextSibling.firstChild.firstChild;this.doesNotAddBorder=(checkDiv.offsetTop!==5);this.doesAddBorderForTableAndCells=(td.offsetTop===5);checkDiv.style.position="fixed",checkDiv.style.top="20px";this.supportsFixedPosition=(checkDiv.offsetTop===20||checkDiv.offsetTop===15);checkDiv.style.position=checkDiv.style.top="";innerDiv.style.overflow="hidden",innerDiv.style.position="relative";this.subtractsBorderForOverflowNotVisible=(checkDiv.offsetTop===-5);this.doesNotIncludeMarginInBodyOffset=(body.offsetTop!==bodyMarginTop);body.removeChild(container);body=container=innerDiv=checkDiv=table=td=null;jQuery.offset.initialize=jQuery.noop},bodyOffset:function(body){var top=body.offsetTop,left=body.offsetLeft;jQuery.offset.initialize();if(jQuery.offset.doesNotIncludeMarginInBodyOffset){top+=parseFloat(jQuery.curCSS(body,"marginTop",true))||0;left+=parseFloat(jQuery.curCSS(body,"marginLeft",true))||0}return{top:top,left:left}},setOffset:function(elem,options,i){if(/static/.test(jQuery.curCSS(elem,"position"))){elem.style.position="relative"}var curElem=jQuery(elem),curOffset=curElem.offset(),curTop=parseInt(jQuery.curCSS(elem,"top",true),10)||0,curLeft=parseInt(jQuery.curCSS(elem,"left",true),10)||0;if(jQuery.isFunction(options)){options=options.call(elem,i,curOffset)}var props={top:(options.top-curOffset.top)+curTop,left:(options.left-curOffset.left)+curLeft};if("using"in options){options.using.call(elem,props)}else{curElem.css(props)}}};jQuery.fn.extend({position:function(){if(!this[0]){return null}var elem=this[0],offsetParent=this.offsetParent(),offset=this.offset(),parentOffset=/^body|html$/i.test(offsetParent[0].nodeName)?{top:0,left:0}:offsetParent.offset();offset.top-=parseFloat(jQuery.curCSS(elem,"marginTop",true))||0;offset.left-=parseFloat(jQuery.curCSS(elem,"marginLeft",true))||0;parentOffset.top+=parseFloat(jQuery.curCSS(offsetParent[0],"borderTopWidth",true))||0;parentOffset.left+=parseFloat(jQuery.curCSS(offsetParent[0],"borderLeftWidth",true))||0;return{top:offset.top-parentOffset.top,left:offset.left-parentOffset.left}},offsetParent:function(){return this.map(function(){var offsetParent=this.offsetParent||document.body;while(offsetParent&&(!/^body|html$/i.test(offsetParent.nodeName)&&jQuery.css(offsetParent,"position")==="static")){offsetParent=offsetParent.offsetParent}return offsetParent})}});jQuery.each(["Left","Top"],function(i,name){var method="scroll"+name;jQuery.fn[method]=function(val){var elem=this[0],win;if(!elem){return null}if(val!==undefined){return this.each(function(){win=getWindow(this);if(win){win.scrollTo(!i?val:jQuery(win).scrollLeft(),i?val:jQuery(win).scrollTop())}else{this[method]=val}})}else{win=getWindow(elem);return win?("pageXOffset"in win)?win[i?"pageYOffset":"pageXOffset"]:jQuery.support.boxModel&&win.document.documentElement[method]||win.document.body[method]:elem[method]}}});function getWindow(elem){return("scrollTo"in elem&&elem.document)?elem:elem.nodeType===9?elem.defaultView||elem.parentWindow:false}jQuery.each(["Height","Width"],function(i,name){var type=name.toLowerCase();jQuery.fn["inner"+name]=function(){return this[0]?jQuery.css(this[0],type,false,"padding"):null};jQuery.fn["outer"+name]=function(margin){return this[0]?jQuery.css(this[0],type,false,margin?"margin":"border"):null};jQuery.fn[type]=function(size){var elem=this[0];if(!elem){return size==null?null:this}if(jQuery.isFunction(size)){return this.each(function(i){var self=jQuery(this);self[type](size.call(this,i,self[type]()))})}return("scrollTo"in elem&&elem.document)?elem.document.compatMode==="CSS1Compat"&&elem.document.documentElement["client"+name]||elem.document.body["client"+name]:(elem.nodeType===9)?Math.max(elem.documentElement["client"+name],elem.body["scroll"+name],elem.documentElement["scroll"+name],elem.body["offset"+name],elem.documentElement["offset"+name]):size===undefined?jQuery.css(elem,type):this.css(type,typeof size==="string"?size:size+"px")}});window.jQuery=window.$=jQuery})(window);

/**
 * Cookie plugin r1 // 2008.1.26
 */
(function(window,undefined){jQuery.cookie=function(name,value,options){if(typeof value!='undefined'){options=options||{};if(value===null){value='';options.expires=-1}var expires='';if(options.expires&&(typeof options.expires=='number'||options.expires.toUTCString)){var date;if(typeof options.expires=='number'){date=new Date();date.setTime(date.getTime()+(options.expires*24*60*60*1000))}else{date=options.expires}expires='; expires='+date.toUTCString()}var path=options.path?'; path='+(options.path):'';var domain=options.domain?'; domain='+(options.domain):'';var secure=options.secure?'; secure':'';document.cookie=[name,'=',encodeURIComponent(value),expires,path,domain,secure].join('')}else{var cookieValue=null;if(document.cookie&&document.cookie!=''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break}}}return cookieValue}};})(window);

/**
 * jFeed plugin r1 // 2008.10.11
 * - add cache ajax option
 * - need to add in content:encoded and dc:creator vars
 */
(function(window,undefined){jQuery.getFeed=function(options){options=jQuery.extend({url:null,data:null,success:null,cache:true},options);if(options.url){$.ajax({type:'GET',url:options.url,cache:options.cache,data:options.data,dataType:'xml',success:function(xml){var feed=new JFeed(xml);if(jQuery.isFunction(options.success))options.success(feed)}})}};function JFeed(xml){if(xml)this.parse(xml)};JFeed.prototype={type:'',version:'',title:'',link:'',description:'',parse:function(xml){if(jQuery('channel',xml).length==1){this.type='rss';var feedClass=new JRss(xml)}else if(jQuery('feed',xml).length==1){this.type='atom';var feedClass=new JAtom(xml)}if(feedClass)jQuery.extend(this,feedClass)}};function JFeedItem(){};JFeedItem.prototype={title:'',link:'',description:'',updated:'',id:'',category:'',categorydomain:'',creator:'',content:''};function JAtom(xml){this._parse(xml)};JAtom.prototype={_parse:function(xml){var channel=jQuery('feed',xml).eq(0);this.version='1.0';this.title=jQuery(channel).find('title:first').text();this.link=jQuery(channel).find('link:first').attr('href');this.description=jQuery(channel).find('subtitle:first').text();this.language=jQuery(channel).attr('xml:lang');this.updated=jQuery(channel).find('updated:first').text();this.items=new Array();var feed=this;jQuery('entry',xml).each(function(){var item=new JFeedItem();item.title=jQuery(this).find('title').eq(0).text();item.link=jQuery(this).find('link').eq(0).attr('href');item.description=jQuery(this).find('content').eq(0).text();item.updated=jQuery(this).find('updated').eq(0).text();item.id=jQuery(this).find('id').eq(0).text();feed.items.push(item)})}};function JRss(xml){this._parse(xml)};JRss.prototype={_parse:function(xml){if(jQuery('rss',xml).length==0)this.version='1.0';else this.version=jQuery('rss',xml).eq(0).attr('version');var channel=jQuery('channel',xml).eq(0);this.title=jQuery(channel).find('title:first').text();this.link=jQuery(channel).find('link:first').text();this.description=jQuery(channel).find('description:first').text();this.language=jQuery(channel).find('language:first').text();this.updated=jQuery(channel).find('lastBuildDate:first').text();this.items=new Array();var feed=this;jQuery('item',xml).each(function(){var item=new JFeedItem();item.title=jQuery(this).find('title').eq(0).text();item.link=jQuery(this).find('link').eq(0).text();item.description=jQuery(this).find('description').eq(0).text();item.updated=jQuery(this).find('pubDate').eq(0).text();item.id=jQuery(this).find('guid').eq(0).text();item.category=jQuery(this).find('category').eq(0).text();item.categorydomain=jQuery(this).find('category').eq(0).attr('domain');item.creator=jQuery(this).find('dc\\:creator').eq(0).text();item.content=jQuery(this).find('content\\:encoded').eq(0).text();feed.items.push(item)})}}})(window);


(function(window,undefined){jQuery.fn.extend({insertAtCaret: function(myValue){return this.each(function(i) {if (document.selection) {this.focus();sel = document.selection.createRange();sel.text = myValue;this.focus();}else if (this.selectionStart || this.selectionStart == '0') {var startPos = this.selectionStart;var endPos = this.selectionEnd;var scrollTop = this.scrollTop;this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);this.focus();this.selectionStart = startPos + myValue.length;this.selectionEnd = startPos + myValue.length;this.scrollTop = scrollTop;} else {this.value += myValue;this.focus();}})}});})(window);

/**
* hoverIntent r5 // 2007.03.27 // jQuery 1.1.2+
*/
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY;};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev]);}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob);},cfg.interval);}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev]);};var handleHover=function(e){var p=(e.type=="mouseover"?e.fromElement:e.toElement)||e.relatedTarget;while(p&&p!=this){try{p=p.parentNode;}catch(e){p=this;}}if(p==this){return false;}var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);}if(e.type=="mouseover"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob);},cfg.interval);}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob);},cfg.timeout);}}};return this.mouseover(handleHover).mouseout(handleHover);};})(jQuery);

/**
 * timeago: a jQuery plugin, version: 0.9.3 (2011-01-21)
 */
(function($){$.timeago=function(timestamp){if(timestamp instanceof Date){return inWords(timestamp)}else if(typeof timestamp==="string"){return inWords($.timeago.parse(timestamp))}else{return inWords($.timeago.datetime(timestamp))}};var $t=$.timeago;$.extend($.timeago,{settings:{refreshMillis:60000,allowFuture:false,strings:{prefixAgo:null,prefixFromNow:null,suffixAgo:"ago",suffixFromNow:"from now",seconds:"less than a minute",minute:"about a minute",minutes:"%d minutes",hour:"about an hour",hours:"about %d hours",day:"a day",days:"%d days",month:"about a month",months:"%d months",year:"about a year",years:"%d years",numbers:[]}},inWords:function(distanceMillis){var $l=this.settings.strings;var prefix=$l.prefixAgo;var suffix=$l.suffixAgo;if(this.settings.allowFuture){if(distanceMillis<0){prefix=$l.prefixFromNow;suffix=$l.suffixFromNow}distanceMillis=Math.abs(distanceMillis)}var seconds=distanceMillis/1000;var minutes=seconds/60;var hours=minutes/60;var days=hours/24;var years=days/365;function substitute(stringOrFunction,number){var string=$.isFunction(stringOrFunction)?stringOrFunction(number,distanceMillis):stringOrFunction;var value=($l.numbers&&$l.numbers[number])||number;return string.replace(/%d/i,value)}var words=seconds<45&&substitute($l.seconds,Math.round(seconds))||seconds<90&&substitute($l.minute,1)||minutes<45&&substitute($l.minutes,Math.round(minutes))||minutes<90&&substitute($l.hour,1)||hours<24&&substitute($l.hours,Math.round(hours))||hours<48&&substitute($l.day,1)||days<30&&substitute($l.days,Math.floor(days))||days<60&&substitute($l.month,1)||days<365&&substitute($l.months,Math.floor(days/30))||years<2&&substitute($l.year,1)||substitute($l.years,Math.floor(years));return $.trim([prefix,words,suffix].join(" "))},parse:function(iso8601){var s=$.trim(iso8601);s=s.replace(/\.\d\d\d+/,"");s=s.replace(/-/,"/").replace(/-/,"/");s=s.replace(/T/," ").replace(/Z/," UTC");s=s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2");return new Date(s)},datetime:function(elem){var isTime=$(elem).get(0).tagName.toLowerCase()==="time";var iso8601=isTime?$(elem).attr("datetime"):$(elem).attr("title");return $t.parse(iso8601)}});$.fn.timeago=function(){var self=this;self.each(refresh);var $s=$t.settings;if($s.refreshMillis>0){setInterval(function(){self.each(refresh)},$s.refreshMillis)}return self};function refresh(){var data=prepareData(this);if(!isNaN(data.datetime)){$(this).text(inWords(data.datetime))}return this}function prepareData(element){element=$(element);if(!element.data("timeago")){element.data("timeago",{datetime:$t.datetime(element)});var text=$.trim(element.text());if(text.length>0){element.attr("title",text)}}return element.data("timeago")}function inWords(date){return $t.inWords(distance(date))}function distance(date){return(new Date().getTime()-date.getTime())}}(jQuery));

/**
* jQuery miniColors: A small color selector Copyright 2011 Cory LaViska for A Beautiful Site, LLC. (http://abeautifulsite.net/)
*/
(function($){$.extend($.fn,{miniColors:function(o,data){var create=function(input,o,data){var color=cleanHex(input.val());if(!color)color='FFFFFF';var hsb=hex2hsb(color);var trigger=$('<a class="miniColors-trigger" style="background-color: #'+color+'" href="#"></a>');trigger.insertAfter(input);input.addClass('miniColors').attr('maxlength',7).attr('autocomplete','off');input.data('trigger',trigger);input.data('hsb',hsb);if(o.change)input.data('change',o.change);if(o.readonly)input.attr('readonly',true);if(o.disabled)disable(input);trigger.bind('click.miniColors',function(event){event.preventDefault();input.trigger('focus');});input.bind('focus.miniColors',function(event){show(input);});input.bind('blur.miniColors',function(event){var hex=cleanHex(input.val());input.val(hex?'#'+hex:'');});input.bind('keydown.miniColors',function(event){if(event.keyCode===9)hide(input);});input.bind('keyup.miniColors',function(event){var filteredHex=input.val().replace(/[^A-F0-9#]/ig,'');input.val(filteredHex);if(!setColorFromInput(input)){input.data('trigger').css('backgroundColor','#FFF');}});input.bind('paste.miniColors',function(event){setTimeout(function(){input.trigger('keyup');},5);});};var destroy=function(input){hide();input=$(input);input.data('trigger').remove();input.removeAttr('autocomplete');input.removeData('trigger');input.removeData('selector');input.removeData('hsb');input.removeData('huePicker');input.removeData('colorPicker');input.removeData('mousebutton');input.removeData('moving');input.unbind('click.miniColors');input.unbind('focus.miniColors');input.unbind('blur.miniColors');input.unbind('keyup.miniColors');input.unbind('keydown.miniColors');input.unbind('paste.miniColors');$(document).unbind('mousedown.miniColors');$(document).unbind('mousemove.miniColors');};var enable=function(input){input.attr('disabled',false);input.data('trigger').css('opacity',1);};var disable=function(input){hide(input);input.attr('disabled',true);input.data('trigger').css('opacity',.5);};var show=function(input){if(input.attr('disabled'))return false;hide();var selector=$('<div class="miniColors-selector"></div>');selector.append('<div class="miniColors-colors" style="background-color: #FFF;"><div class="miniColors-colorPicker"></div></div>');selector.append('<div class="miniColors-hues"><div class="miniColors-huePicker"></div></div>');selector.css({top:input.is(':visible')?input.offset().top+input.outerHeight():input.data('trigger').offset().top+input.data('trigger').outerHeight(),left:input.is(':visible')?input.offset().left:input.data('trigger').offset().left,display:'none'}).addClass(input.attr('class'));var hsb=input.data('hsb');selector.find('.miniColors-colors').css('backgroundColor','#'+hsb2hex({h:hsb.h,s:100,b:100}));var colorPosition=input.data('colorPosition');if(!colorPosition)colorPosition=getColorPositionFromHSB(hsb);selector.find('.miniColors-colorPicker').css('top',colorPosition.y+'px').css('left',colorPosition.x+'px');var huePosition=input.data('huePosition');if(!huePosition)huePosition=getHuePositionFromHSB(hsb);selector.find('.miniColors-huePicker').css('top',huePosition.y+'px');input.data('selector',selector);input.data('huePicker',selector.find('.miniColors-huePicker'));input.data('colorPicker',selector.find('.miniColors-colorPicker'));input.data('mousebutton',0);$('BODY').append(selector);selector.fadeIn(100);selector.bind('selectstart',function(){return false;});$(document).bind('mousedown.miniColors',function(event){input.data('mousebutton',1);if($(event.target).parents().andSelf().hasClass('miniColors-colors')){event.preventDefault();input.data('moving','colors');moveColor(input,event);}
if($(event.target).parents().andSelf().hasClass('miniColors-hues')){event.preventDefault();input.data('moving','hues');moveHue(input,event);}
if($(event.target).parents().andSelf().hasClass('miniColors-selector')){event.preventDefault();return;}
if($(event.target).parents().andSelf().hasClass('miniColors'))return;hide(input);});$(document).bind('mouseup.miniColors',function(event){input.data('mousebutton',0);input.removeData('moving');});$(document).bind('mousemove.miniColors',function(event){if(input.data('mousebutton')===1){if(input.data('moving')==='colors')moveColor(input,event);if(input.data('moving')==='hues')moveHue(input,event);}});};var hide=function(input){if(!input)input='.miniColors';$(input).each(function(){var selector=$(this).data('selector');$(this).removeData('selector');$(selector).fadeOut(100,function(){$(this).remove();});});$(document).unbind('mousedown.miniColors');$(document).unbind('mousemove.miniColors');};var moveColor=function(input,event){var colorPicker=input.data('colorPicker');colorPicker.hide();var position={x:event.clientX-input.data('selector').find('.miniColors-colors').offset().left+$(document).scrollLeft()-5,y:event.clientY-input.data('selector').find('.miniColors-colors').offset().top+$(document).scrollTop()-5};if(position.x<=-5)position.x=-5;if(position.x>=144)position.x=144;if(position.y<=-5)position.y=-5;if(position.y>=144)position.y=144;input.data('colorPosition',position);colorPicker.css('left',position.x).css('top',position.y).show();var s=Math.round((position.x+5)*.67);if(s<0)s=0;if(s>100)s=100;var b=100-Math.round((position.y+5)*.67);if(b<0)b=0;if(b>100)b=100;var hsb=input.data('hsb');hsb.s=s;hsb.b=b;setColor(input,hsb,true);};var moveHue=function(input,event){var huePicker=input.data('huePicker');huePicker.hide();var position={y:event.clientY-input.data('selector').find('.miniColors-colors').offset().top+$(document).scrollTop()-1};if(position.y<=-1)position.y=-1;if(position.y>=149)position.y=149;input.data('huePosition',position);huePicker.css('top',position.y).show();var h=Math.round((150-position.y-1)*2.4);if(h<0)h=0;if(h>360)h=360;var hsb=input.data('hsb');hsb.h=h;setColor(input,hsb,true);};var setColor=function(input,hsb,updateInputValue){input.data('hsb',hsb);var hex=hsb2hex(hsb);if(updateInputValue)input.val('#'+hex);input.data('trigger').css('backgroundColor','#'+hex);if(input.data('selector'))input.data('selector').find('.miniColors-colors').css('backgroundColor','#'+hsb2hex({h:hsb.h,s:100,b:100}));if(input.data('change')){input.data('change').call(input,'#'+hex,hsb2rgb(hsb));}};var setColorFromInput=function(input){var hex=cleanHex(input.val());if(!hex)return false;var hsb=hex2hsb(hex);var currentHSB=input.data('hsb');if(hsb.h===currentHSB.h&&hsb.s===currentHSB.s&&hsb.b===currentHSB.b)return true;var colorPosition=getColorPositionFromHSB(hsb);var colorPicker=$(input.data('colorPicker'));colorPicker.css('top',colorPosition.y+'px').css('left',colorPosition.x+'px');var huePosition=getHuePositionFromHSB(hsb);var huePicker=$(input.data('huePicker'));huePicker.css('top',huePosition.y+'px');setColor(input,hsb,false);return true;};var getColorPositionFromHSB=function(hsb){var x=Math.ceil(hsb.s/.67);if(x<0)x=0;if(x>150)x=150;var y=150-Math.ceil(hsb.b/.67);if(y<0)y=0;if(y>150)y=150;return{x:x-5,y:y-5};}
var getHuePositionFromHSB=function(hsb){var y=150-(hsb.h/2.4);if(y<0)h=0;if(y>150)h=150;return{y:y-1};}
var cleanHex=function(hex){hex=hex.replace(/[^A-Fa-f0-9]/,'');if(hex.length==3){hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];}
return hex.length===6?hex:null;};var hsb2rgb=function(hsb){var rgb={};var h=Math.round(hsb.h);var s=Math.round(hsb.s*255/100);var v=Math.round(hsb.b*255/100);if(s==0){rgb.r=rgb.g=rgb.b=v;}else{var t1=v;var t2=(255-s)*v/255;var t3=(t1-t2)*(h%60)/60;if(h==360)h=0;if(h<60){rgb.r=t1;rgb.b=t2;rgb.g=t2+t3;}
else if(h<120){rgb.g=t1;rgb.b=t2;rgb.r=t1-t3;}
else if(h<180){rgb.g=t1;rgb.r=t2;rgb.b=t2+t3;}
else if(h<240){rgb.b=t1;rgb.r=t2;rgb.g=t1-t3;}
else if(h<300){rgb.b=t1;rgb.g=t2;rgb.r=t2+t3;}
else if(h<360){rgb.r=t1;rgb.g=t2;rgb.b=t1-t3;}
else{rgb.r=0;rgb.g=0;rgb.b=0;}}
return{r:Math.round(rgb.r),g:Math.round(rgb.g),b:Math.round(rgb.b)};};var rgb2hex=function(rgb){var hex=[rgb.r.toString(16),rgb.g.toString(16),rgb.b.toString(16)];$.each(hex,function(nr,val){if(val.length==1)hex[nr]='0'+val;});return hex.join('');};var hex2rgb=function(hex){var hex=parseInt(((hex.indexOf('#')>-1)?hex.substring(1):hex),16);return{r:hex>>16,g:(hex&0x00FF00)>>8,b:(hex&0x0000FF)};};var rgb2hsb=function(rgb){var hsb={h:0,s:0,b:0};var min=Math.min(rgb.r,rgb.g,rgb.b);var max=Math.max(rgb.r,rgb.g,rgb.b);var delta=max-min;hsb.b=max;hsb.s=max!=0?255*delta/max:0;if(hsb.s!=0){if(rgb.r==max){hsb.h=(rgb.g-rgb.b)/delta;}else if(rgb.g==max){hsb.h=2+(rgb.b-rgb.r)/delta;}else{hsb.h=4+(rgb.r-rgb.g)/delta;}}else{hsb.h=-1;}
hsb.h*=60;if(hsb.h<0){hsb.h+=360;}
hsb.s*=100/255;hsb.b*=100/255;return hsb;};var hex2hsb=function(hex){var hsb=rgb2hsb(hex2rgb(hex));if(hsb.s===0)hsb.h=360;return hsb;};var hsb2hex=function(hsb){return rgb2hex(hsb2rgb(hsb));};switch(o){case'readonly':$(this).each(function(){$(this).attr('readonly',data);});return $(this);break;case'disabled':$(this).each(function(){if(data){disable($(this));}else{enable($(this));}});return $(this);case'value':$(this).each(function(){$(this).val(data).trigger('keyup');});return $(this);break;case'destroy':$(this).each(function(){destroy($(this));});return $(this);default:if(!o)o={};$(this).each(function(){if($(this)[0].tagName.toLowerCase()!=='input')return;if($(this).data('trigger'))return;create($(this),o,data);});return $(this);}}});})(jQuery);

//
//start your engines
//

function GM_wait() {
    if(typeof jQuery == 'undefined') {
		w.setTimeout(GM_wait,150);
    } else {
      letsJQuery();
  }
}
GM_wait();
function letsJQuery() {
	FireVortex.init();
}
