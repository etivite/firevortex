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
// @include       http://www.namotorsports.net/*


//TODO - add http://www.passatworld.com/forums/ (on vbul 4.18)
//TODO - add http://volkswagenownersclub.com/vw/
//TODO - add http://forums.generationdub.com/


// ==/UserScript==
//
// FireVortex
// Created 2007-01-25
// Updated 2012-06-05
// Copyright (c) 2007-11, Rich Fuller - rich@firevortex.net
// This work is licensed under a Attribution-Noncommercial-No Derivative Works 3.0 United States License
// http://creativecommons.org/licenses/by-nc-nd/3.0/us/
// --------------------------------------------------------------------

//set some constants
const VERSION = {
	fv : "2.2.06052012",
	created : new Date(2007, 01, 25),
	updated : new Date(2012, 06, 05),
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
String.prototype.sReplace = function(find, replace) { return this.split(find).join(replace); };
String.prototype.repeat = function(times) {	var rep = new Array(times + 1); return rep.join(this); };


//standard dom xpath
function xpath(query) { return document.evaluate(query, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); }

//escape our strings
function encode_utf8( s ) {	return unescape( encodeURIComponent( s ) ); }
function decode_utf8( s ) {	return decodeURIComponent( escape( s ) ); }

function addCSSFile( filename ) { var fileref=document.createElement("link"); fileref.setAttribute("rel", "stylesheet"); fileref.setAttribute("type", "text/css"); fileref.setAttribute("href", filename); document.getElementsByTagName("head")[0].appendChild(fileref); }
function is10( v ) {  return v == true ? '1': '0'; }

//https://gist.github.com/999065
function GM_XHR() {
    this.type = null;
    this.url = null;
    this.async = null;
    this.username = null;
    this.password = null;
    this.status = null;
    this.headers = {};
    this.readyState = null;

    this.abort = function() {
        this.readyState = 0;
    };

    this.getAllResponseHeaders = function(name) {
      if (this.readyState!=4) return "";
      return this.responseHeaders;
    };

    this.getResponseHeader = function(name) {
      var regexp = new RegExp('^'+name+': (.*)$','im');
      var match = regexp.exec(this.responseHeaders);
      if (match) { return match[1]; }
      return '';
    };

    this.open = function(type, url, async, username, password) {
        this.type = type ? type : null;
        this.url = url ? url : null;
        this.async = async ? async : null;
        this.username = username ? username : null;
        this.password = password ? password : null;
        this.readyState = 1;
    };
    
    this.setRequestHeader = function(name, value) {
        this.headers[name] = value;
    };

    this.send = function(data) {
        this.data = data;
        var that = this;
        // http://wiki.greasespot.net/GM_xmlhttpRequest
        GM_xmlhttpRequest({
            method: this.type,
            url: this.url,
            headers: this.headers,
            data: this.data,
            onload: function(rsp) {
                // Populate wrapper object with returned data
                // including the Greasemonkey specific "responseHeaders"
                for (k in rsp) {
                    that[k] = rsp[k];
                }
                // now we call onreadystatechange
                that.onreadystatechange();
            },
            onerror: function(rsp) {
                for (k in rsp) {
                    that[k] = rsp[k];
                }
            }
        });
    };
}

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
//TODO
function getParentForumId() {
		return null;
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
function setStorageObject(name, value) {
	w.localStorage.setItem(name, JSON.stringify(value));
}
function getStorageObject(name) {
	data = w.localStorage.getItem(name);
	
	if (data) {
		return JSON.parse(data);
	} else {
		return null;
	}

}
function setSessionObject(name, value) {
	w.sessionStorage.setItem(name, JSON.stringify(value));
}
function getSessionObject(name) {
	data = w.sessionStorage.getItem(name);
	
	if (data) {
		return JSON.parse(data);
	} else {
		return null;
	}

}


//nasty hack for chrome to grab some page vars - due to lack of unsafewindow sandbox access
function getChromePageVars() {
	jvars = $('head script:not([src])').text();
	
	var matchsecurity = /var SECURITYTOKEN = "([_0-9a-zA-Z-]+)";/i.exec(jvars)
	if (matchsecurity) w.SECURITYTOKEN = matchsecurity[1];

	var matchlogged = /var LOGGEDIN = ([_0-9]+) > 0 \? true : false;/i.exec(jvars)
	if (matchlogged) w.LOGGEDIN = matchlogged[1] > 0 ? true : false;

}

//work around for google chrome and opera for saving data
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
		
		if ( w.LOGGEDIN ) {
			FireVortex.Scripts.injectMyFireVortexPopupLink();
			FireVortex.Scripts.injectFireVortexSettingsPopupLink();
		}
		
		//bind 
		if ( FireVortex.Config.getKeyBindHidePage() ) FireVortex.Scripts.hidePage();
		
		//start background processes
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
		
		if ( domainKey == 1 || domainKey == 0 ) FireVortex.Scripts.injectWhatsGoingOnExtend();
		
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
	
			if ( isForumFirstPage() && FireVortex.Config.getForumLinkedClassifieds() && domainKey == 0 ) FireVortex.Scripts.injectForumLinkedClassifieds( forumId );
			
			if ( forumId == '5224' && w.LOGGEDIN && domainKey != 10  && isForumFirstPage() ) {
				
				var launchsb = getSessionObject( 'fv_launchshoutbox' );
				
				if (launchsb && launchsb.launch) FireVortex.Scripts.injectShoutBox();
			}
			
			if ( domainKey != 10 && isForumFirstPage() ) {
				FireVortex.Parsers.Search.init();
				FireVortex.Scripts.injectForumRecentProductSearches( forumId );
			}
	
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
			if ( w.LOGGEDIN && domainKey != 10) {
				
				FireVortex.Scripts.injectThreadQuickReplyMIUCSS();
				FireVortex.Scripts.injectThreadQuickReply();
				
				if ( FireVortex.Config.getEmoticons() ) FireVortex.UI.Emoticons.loadQRHtml();
			}
		}
		
		FireVortex.Scripts.trackThreadRecentViewed();
		
    },

    /**
     * Executed on thread reply page w/editor
     */
    newThreadPageProcessor: function() {
		
		if ( FireVortex.Config.getEmoticons() ) FireVortex.UI.Emoticons.init();
		FireVortex.Scripts.injectPageMaxWidth();
	},
    
    /**
     * Executed on thread reply page w/editor
     */
    newReplyPageProcessor: function() {
		
		if ( FireVortex.Config.getEmoticons() ) FireVortex.UI.Emoticons.init();
		FireVortex.Scripts.injectPageMaxWidth();
		
		if ( FireVortex.Config.getFullIgnoreUser() ) FireVortex.Scripts.injectKillIgnoredQuotesReply();
		
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
		
		GM_addStyle("#forumchoice { font-size: 120% ! important }");
		GM_addStyle("#forumchoice { width: 50% ! important }");
		
		FireVortex.Scripts.trackSearchesRecent();
		
	},

    searchMultipleContentTypePageProcessor: function() {
		FireVortex.Scripts.injectGoogleSearchTab();
	},

    logoutPageProcessor: function() {
		FireVortex.Scripts.logout();
	},

	//just for fun
    eggAddIgnorePageProcessor: function() {
		
		//ATL_Av8r
		if ( getUserId() == '72990' ) {
			$('.cp_content .blockrow').append('<span title="go gators!" style=" padding: 5px; color:red;">Ignoring the all knowing ATL_Av8r may cause unpredictable results on the forums. Proceed with caution.</span>');
		}
		//rich!
		if ( getUserId() == '233' ) {
			$('.cp_content .blockrow').append('<span title="go gators!" style=" padding: 5px; color:red;">Avoid ignoring the creator of FireVortex... who knows what might happen.</span>');
		}
		//skully
		if ( getUserId() == '208927' ) {
			$('.cp_content .blockrow').append('<span style=" padding: 5px; color:red;">Who else would love APR? Don\'t ignore this guy.</span>')
		}
	},
	
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

	injectMyFireVortexPopupLink: function() {
		if (domainKey != 10) $('div#toplinks ul.isuser li.item ul.popupbody').append('<li><a href="'+ SERVER_HOST +'/index.php#fv-my-page">My FireVortex</a></li');
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
			w.localStorage.removeItem('fv_recentviewedthreads');
			w.localStorage.removeItem('fv_recentsearches');
			w.localStorage.removeItem('fv_standardemoticonlist');
			w.localStorage.removeItem('fv_halloweenemoticonlist');
			w.localStorage.removeItem('fv_productsearch');
			w.localStorage.removeItem('fv_recentviewedproductsearch');
			
			w.sessionStorage.removeItem('fv_minmaxshoutbox');
			w.sessionStorage.removeItem('fv_launchshoutbox');
			
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
			newFooterDivElement.innerHTML = "<p class='fv-footertagline'><span style='color:#CE6D0D'>.:</span> Enhanced by <a href='http://firevortex.net/about/"+ VERSION.fv +"/'>FireVortex</a> (v."+ VERSION.fv +") <span style='color:#CE6D0D'>::</span> <a href='https://github.com/etivite/firevortex/issues'>Submit an Issue</a> <span style='color:#CE6D0D'>::</span> <a href='http://twitter.com/firevortex' target='_blank'>Twitter</a> <span style='color:#CE6D0D'>::</span> <a title='SHOUTbox!' id='fv-footer-sb' href='forumdisplay.php?5224'>SHOUTbox</a> <span style='color:#CE6D0D'>:.</span></p><p id='fv-timer'></p>";

			newFooterContDivElement.appendChild(newFooterDivElement);
			body.insertBefore(newFooterContDivElement, body.nextChild);
			
			$("#fv-footer-sb").click(function(){
	
				var sb = { updated: new Date(), launch: true };
				setSessionObject( 'fv_launchshoutbox', sb );
	
			});
			

		}
		
	},
	
	injectFireVortexTitle: function() {
		$(document).attr('title', $(document)[0].title + ' - Enhanced by FireVortex (v.'+VERSION.fv+')' );
	},

	injectMyPageRefresh: function( rate ) {
		
		var countDownInterval = 60 * rate;
		var countDownTime = countDownInterval + 1;

		w.refreshTimer = function() {
			countDownTime--;
			if (countDownTime <=0){
				countDownTime = countDownInterval;
				clearTimeout(counter);
				//ajax would be cool but just refresh so we force our background updates
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
				html += '<li class="fvsubscriptionitemlist"><h3><a href="'+ SERVER_HOST +'/showthread.php?'+ sublist.threadids[i] +'">'+ sublist.titles[i] +'</a></h3><p>'+ sublist.descriptions[i] +'</p></li>';
			}			
		} else {
			html += '<li><h3><a href="#">No subscribed topics</a></h3></li>';
		}
		html += '<li><h3><a href="'+ SERVER_HOST +'/subscription.php?do=viewsubscription&daysprune=-1&folderid=all">View All</a></h3></li>';
		$('div#fv-threadsubscriptionlist div.feed-content').html( '<ul>'+ html +'</ul>' );

		//embed objects screws up preview
		$('div#fv-threadsubscriptionlist div.feed-content li.fvsubscriptionitemlist p object').remove();


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
					
					//iframes screws up our hidden div preview...
					$('div#fv-forumsubscriptionlist div.feed-content p.fv-forumfeed-description iframe').remove();
					
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
		

		//
		//recent viewed threads
		//
		var sublist = getStorageObject( 'fv_recentviewedthreads' );
		
		if ( sublist ) {
					
			$('#fv-my-page div.floatcontainer').append( '<div class="wgo_subblock" id="fv-fv_recentviewedthreadslist"><h3>Recently View Threads - fetched <time class="timeago" datetime="'+ sublist.updated +'"></time></h3><div class="feed-content">loading...</div></div>' );

			var html = '';

			sublist.titles.reverse();
			sublist.threadids.reverse();
			
			for ( var i = 0; i < sublist.threadids.length && i < parseInt( FireVortex.Config.getMyPageItemsRecentThreads() ); i++ ) {
				html += '<li><h3><a href="'+ SERVER_HOST +'/showthread.php?'+ sublist.threadids[i] +'&goto=newpost">'+ sublist.titles[i] +'</a></h3></li>';
			}			

			$('div#fv-fv_recentviewedthreadslist div.feed-content').html( '<ul>'+ html +'</ul>' );
		}		

		//
		//recent searches
		//
		var sublist = getStorageObject( 'fv_recentsearches' );
		
		if ( sublist ) {
					
			$('#fv-my-page div.floatcontainer').append( '<div class="wgo_subblock" id="fv-fv_recentsearcheslist"><h3>Recent Searches - fetched <time class="timeago" datetime="'+ sublist.updated +'"></time></h3><div class="feed-content">loading...</div></div>' );

			var html = '';

			sublist.serialized.reverse();
			sublist.query.reverse();

			for ( var i = 0; i < sublist.query.length && i < parseInt( FireVortex.Config.getMyPageItemsRecentSearches() ); i++ ) {
				html += '<li><h3><a href="'+ SERVER_HOST +'/search.php?'+ sublist.serialized[i] +'">'+ sublist.query[i] +'</a></h3></li>';
			}

			$('div#fv-fv_recentsearcheslist div.feed-content').html( '<ul>'+ html +'</ul>' );
		}	
		
		//register updated ago timestamp
		$("time.timeago").timeago();
		
	},

	injectWhatsGoingOnExtend: function() {
		
		//http://www.vwvortex.com/artman/publish/rss.xml
		//http://fourtitude.com/feed/
		
			$('#wgo div.floatcontainer').append('<div class="wgo_subblock" id="fv-vmgbloglist"><h3>VMG Blogs</h3><div class="feed-content">loading...</div></div>' );
		
			$.getFeed({
		        url: SERVER_HOST +'/blog_external.php?type=RSS2',
		        cache: false,
		        success: function(feed) {
		
					var html = '';
		
					if ( !$(feed.items).length ) {
						html = 'No news items found';
					}
		
					$(feed.items).each(function() {
						var $item = $(this);
						html += '<li><h3><a href ="' + $item.attr("link") + '">' + $item.attr("title") + '</a></h3></li>';
					});
		
					$('div#fv-vmgbloglist div.feed-content').html( '<ul>'+ html +'</ul>' );
					
		        }
		    });


		//if vwvortex domain

		    
		//if fourtitude domain
		
	},

	injectForumRefresh: function( rate, isUserCP ) {
		
		//increase the page refresh when the SB is activated to save the server
		if ( getChildForumId() == '5224' ) {
			var launchsb = getSessionObject( 'fv_launchshoutbox' );
			if (launchsb && launchsb.launch) rate = rate * 3;
		}
		
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

	injectPageMaxWidth: function() {
		$('.vbform').css("max-width", "none");
		$('.vbform .actionbuttons .group').css("max-width", "none");
		$('.vbform #title').css("width", "88%");
		$('.vbform #subject').css("width", "88%");
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


	injectThreadQuickReplyMIUCSS: function() {
		
		//
		// add markItUp! style information (including base64 images).
		// converted by Stephen Cronin
		//
		GM_addStyle(".markItUp .markItUpButton1 a { background-image:url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJhJREFUeNpi/P//PwM1AeOogQzy8todQKocSegeEL8HYmMofw8QVzx8ePUsNgOZsIhVoPFnAbEJ1CAQcAHiVbhcyESCb/YgsZWoYSAuw8kyUBCIQ5HDEJdCFiIMS4MaZgwNz7NQTLaBIEM6gfgM1HBYGFZQGoarkdjl1I6U99Qw0AWJ3UlKGHbgiZQ9UK/PGi1thpCBAAEGAD4NOJFka9ORAAAAAElFTkSuQmCC); } \
		.markItUp .markItUpButton2 a { background-image:url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJJJREFUeNpi/P//PwM1ARMDlcHgN5AFXUBeXhubOhcgXgXEgkhis0D44cOrZ/EaiAOcRePvAeJ0Srychua6TkrDMA2JfQ/qQrINBBmmRIzriDUwFIn9HhoZZBvoAsVEuY4YA0lyHSEDldAiYzXUULINTEPjd1KS9QSxuO4euQaCwm03WkJWQuPjBIyj5SHFACDAAM9KHVhO5CUgAAAAAElFTkSuQmCC); } \
		.markItUp .markItUpButton3 a { background-image:url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAIdJREFUeNpi/P//PwM1ARMDlcHgN5AFm6C8vHYHkCpHEjoLxBVA7IImvhok/vDh1XuEXFiBxgdp3INFfBYQ3xvhkTJqIAo4S4T+s6QY2InEdkGjYWnwPVE5BSkxhwFxGhAbA/FuIFaCumo1moVwwEjt4gunCxkZGQnaBHQMI81dOPjTIUCAAQAIjSGekQMQ6QAAAABJRU5ErkJggg==); } \
		.markItUp .markItUpButton4 a { 	background-image:url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAwpJREFUeNqslV9IVHkUxz/3zh3vOH+yScsdR53MyhhT0djYipbYnirMdpdeiih68KkoiOo9giB6KWrZfOipfYilXpaEDMuFXbYoUirMMndkmspBC+eP4+jcmel37XfDShyKDnzh/n7n9/vec773nHMVQBGwCai8t5xAViDP/DbnPU1u6gLF8jkjMCVJ5zOTyC5hvjxt3tOkwyEwKg/WCKQk6Xxml0GE5XqxGYw2K/wZa29vD/EF1tHRYT2a2aHJ3M00qwVZeNPBi0wZ7zcduSR54xHPpnOUxqYILFtFUi0nkbShiSRt2gfSGsmR06RW5mLSdGYFU06gxBnGyFwhnY+z0buWmPsx3Q/OsFitpcL3I9OeRnGwzorOkiirSkGtKHEINWPJYfqenCQ6eRmPf4ihsS5x1E1z1Q6aaraRiPfw4PFRUumcRWh9xLz6qSblTgiU96OoDzHGStDjQZJ5Dy8jLup968iknEQn3lC5VKfEYXymqfbpRqUg9DhS6A3fMznsJ313BUr2Je7AJA8jF+i7P0hl9Wo2NLXx/+CdOWvpI3O7soSib8kqTny1fiLJMDev/E6wpZj+0Xu4yjQa9LWMdr7leehcYcLB11dJj0dIjqh0/dtNxP0XRy5VcfuP39jiO4waCnKr9x5LWnysb9xZmHBNVRuK/Tsq1Z8Jlm3GPeHCe2Mvw10hXg8kOLDvBLt/3c7I+H801bYW1lC36fzSsAdDs2PQyJbmNmyxUQYOxdh/vB5/rYcKNlEWF+VjdxQm7B05yyKPi1jsBZlpF0vc9SS9/5BWNXqudZL1hpnyx0m/Mhjsj85JqMwaEPz99BQTShRdtLoREwUmvEU2Oy3Hmrn+52n6FkLdD6LgHolqnqncdquvzZUye9o4TU+rVkNvagwjsBpddWK8eYrhDVC6dZyfdtnJDRURnFjEyuUZnuUTnH8+E1ixJJw2oysS8AqMyOHAVw4Hc9rELcIFs8ZXtezrTAEuKytrOpUJJBSpoy5noiKJMrK/5zNLKrvsYzMIU/Jv+wt4J8AAvHIR1a+b5bYAAAAASUVORK5CYII=); } \
		.markItUp .markItUpButton5 a { background-image:url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA9RJREFUeNqslFtIHFcYx/+zbvaqayJe1sZLrEaj0NoEsiWFuqKhsS2pJIJIwDyYB1+0PrQPbSFPheCLDyGUQilCoQ1todj0wRrSpNJL0CSrho2rca2rmb27uzq7OzPO7O58ndm2D8o+9MEP/t85M/zP71w+zmGICIcZei1tbfrzHwZGB52slHvTXM9TMdy5JPpPhwW2Vq/LsG36k4tOU+vsq032Gf2RohgvZPNj6k/U7AMy2go1oJlhIIhK97dJ3+h8Wag3ZItAvx2GUTAgIa0hG2iB8cHbaC1J3Pnw6vFbdXb7/aQgFQaGXgTB81L3OPf7jXCzxWGDGfyaG+fkd2HabUIgkUQwyIMNZLG2GUONIfDoi4/aPmloqLp/rLJ8H1CnpRzlyn9x02iJZHXo+TgYnx9v6S+h1tqCIkaESTLAqpQgdelXFL/OwrNW5bh++89RXtitOHiGeeC6n+/x8Ybe9tw7OBWx4yTzEup1DSji98CbRHC2GPxv/AElk4FtuR36Thfu2b7qvffw2XsFgc825c6MZEKSJ7SkLqCO6UBUFMAJQFqWsN24DtPzKti+uQDOvA7x3G/IWGKYWpk/X7DKL6LS6Wj5KgyUw9Hdelj5MsiUAS8qkOIl2JMNCCsp8E0JRM78BJI5IMVgOew5WxC4cWy5dqk3Cbt0FMefsmj0XoRiBHgpg/SOWrSyGFjnKnYUFrlAGGBz6tJFiDuJ+oLATLnMBhSuYs9shFgtQPd8EabgCaREQMjugbn7GigeBLVGocQlKDEeSMrQG4xbBYGnqHjx53XXGaFUxkbZEYScd2HdtsH25BUYluvBcTJSKjAX2oYSVEAJFcil0VRZ97gg0Gl+efazjZlr6VofzPFSpIyEXYsP4bmHMLmrIUt7yHpTUGoyUIo2wcgyKApUWMlbsMpnGxpmzoeb72T+8kKK+iF/70LVwDzGu3rw4IdRBLxf4sbQm3i/rQNfX7kJ9805rHz3GIqUvs4wzOV9RO2mxMIRLM15uhs/vjKPT1uppKqUWJalsbExam9vp+HhYYrH47SwsED9/f3kcDhoZGQk79G8GuM/5dOmjwUXiuHJvLvb+cHQj0NDQ8RxHP0zn+ZiaGpqimZnZ/P/Pr91+6LayppH8xYEakqEY+r2AhUWizWluQYHB6mi0k5Op5Pcbje5XC7q6uqi6upqobm5OT/Zv979wINS43JfXx95PB7yer00PT1NExMTFIlE8pDV1VWanJykgYEBzTz+f4BaaM/II4vFsqUevKz2tYouFRcXZ1XF1f6Kqo6DY5nDfrF1OOT4W4ABALmZWEszk1O1AAAAAElFTkSuQmCC); } \
		.markItUp .markItUpButton6 a { background-image:url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAZdJREFUeNpiNDY2ZqAEnD17FoXPxEBlQBcDS4H4HhD/J4DvQdWiABY0fqOBgUFdU1MTg5SUFF6XPHv2TLGurq7r////fOfOnauDWsLAiBQpbKysrD+3bdvGICgoSJT33r9/z+Dj48Pw/Plz/vv3739Cd6GEsLAw3DD02EMHIIeA1ILwmzdvQN75DHIlCz4NxIJ///4x4wpDnOkLn4XAcGQEBR/VXIgvlslyIVEGkutC5IT99NWrVwwvXrwgWjNILUgPME0+g6VDZAP/AmOrsqioiOH06dOgmMMXq2A1ILU/fvzo/P79+w9sCRumOJyRkTELiK2BXHhyUFFRYVixYgUDMFcwZGdngww68evXrwXXrl1bCZT+AsR/sIbh+fPnVwGptVA5EGbU1NTUBtLHHz9+zFBeXs7w8ePH3OvXry8FioFc9hvkO5h+RiIDX05CQuIhMGsy3Lt3r+HSpUsTQK4C6v2LnhpYiAz/R8BwV/jz5w/X5cuXH4BcBTKMpGSDkRyYmB4CDWOEJqn/JCdsHGnzPyE1AAEGAKxottsv9Gk8AAAAAElFTkSuQmCC); } \
		.markItUp .markItUpButton7 a { background-image:url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAXFJREFUeNpi/P//PwM1ARMDlcHgN5ABFIbIGBuQk9MqB+L/QBwK5e8G4ndArIRuDrEuTAPih48eXbstKipnAGS7/Pv3dyeQzw1ks5HkZairlH7//rkWSP/i5OSJAIn/+PH1AJD6ABJDVs+I7k1GRkaQIYJA5jsiXe8KdOkemDm4XOhCZPg/ARr2BsjkJeTlPUCFgt++fcoAcX7//jEJyDcE0RDvfikD8R8/vu4L9fJnmEYWbKYBFb8HUsxcXHyKEAO+nQBSz1hZOaxB4fbq1aPdQPoBNAwZ8IahvLy2MZA6Q4SPQZYqQy1nwBeGRIXf379/zgANkwH5hJiELSYpqTQRlJhFRGTSgXwDGRn1E0D+Rw4OHjsQH4oV0M1hweGAV8DwigUl5jdvnpyUlFTmZWJiNgcm5hXACAF58RrIkUTnZaBLQDlDEJiY14NikZWVPQYk/vXrx03QiPhLTl4WhnpLDMqXhfK58JnDOPIKWIAAAwAnPss5qGhPqAAAAABJRU5ErkJggg==); } \
		.markItUp .clean a { background-image:url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAVlJREFUeNpi/P//PwM1ARMDlQELjGFiYoJN3gWId0PZjCDizJkzFLmwg5peLgfiPUh8Y0oMFIQagGyg4FmGMwyMwJABYhcg/g/FYDFCBoJcNwvNQKKCgglHRKRBXViOxct4g4IJh+tAnuiE4veEggJFNyhhgzFQIRD/3ysgsAsuBsTGxsa7gfj/cjGxuyD5GqnmTLBKY5AkGLuA+DD1cBeaGBuHzpSSYnD68MH1EwtLOzRtglxrnPr8OUPEq1dKTZI1v1oka/hwBAWaCxEurQO5BIh7kPD/iWJ5d4EuUQJnVYgL30FdWI7sQkwDUQ0F47UCQbtAGuGaIAbuhhq4G6uX0ZzdBCTrQcxlQlFHgpXXuoICH5jeBJEizhjJy6G4vYzFhWA+NnVYME7DTnGbzq+TavwPwiA+iEaKWQyM3UCEy+qIEsfrQgaGELyaEIaG4DOQcdCX2AABBgB8o4DsVd/qggAAAABJRU5ErkJggg==); } \
		.markItUp * { \
			margin:0px; padding:0px; \
			outline:none; \
		} \
		.markItUp a:link, \
		.markItUp a:visited { \
			color:#000; \
			text-decoration:none; \
		} \
		.markItUp  { \
			width:100% !important; \
			margin:5px 0 5px 0; \
			border:5px solid #F5F5F5; \
		} \
		.markItUpContainer  { \
			border:1px solid #3C769D; \
			background:#FFF url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAF0CAYAAAAq4bmZAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAANZJREFUeJzt1TEOhDAMAMEE7v9vpaZIKO8BjmTLGnpGdgSbudbaI/BckZfHGOO3d2iAAhN0ANZayRPkA/ln8DxPCIj/C3POZOC6YlsUWOG+7+QJwofYAMj/DsIrvO8bA6JJCwcFAAAAjgHhKuevAAAAAIBKgIsFAAAAKgGqDAAAAP9HEwEAQCNA0gAAQCNA0gAAQB1AkQAAQB1AkQAAwDFAUAAAQCNA0gAAQB1AkQAAQCNA0gAAAOAgIKoAAABwEBBVAAAAABwFXCwAAAAAAFQD3M6AJsAH/AsxPEZfFjgAAAAASUVORK5CYII=) repeat-x top left; \
			padding:5px 5px 2px 5px; \
			font:1em Verdana, Arial, Helvetica, sans-serif; \
		} \
		.markItUpEditor { \
			font:12px 'Courier New', Courier, monospace; \
			padding:5px 5px 5px 5px !important; \
			border:3px solid #3C769D; \
			width:99% !important; \
			height:320px; \
			background-repeat:no-repeat; \
			clear:both; display:block; \
			line-height:18px; \
			overflow:auto; \
		} \
		.markItUpFooter { \
			width:100%; \
			cursor:n-resize; \
		} \
		.markItUpResizeHandle { \
			overflow:hidden; \
			width:22px; height:5px; \
			margin-left:auto; \
			margin-right:auto; \
			background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAGAgMAAABROz0wAAAAA3NCSVQICAjb4U/gAAAADFBMVEWwuL/////39/eyub9nsXv9AAAABHRSTlP/AP//07BylAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNy8yMS8wN4dieEgAAAAfdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIDi1aNJ4AAAAMElEQVQImWNwDBF1DGFgaIwQbYxgYFgaFbo0yoEhlDUglNWBIYw1IQxETc0Mm+oAANc3CrOvsJfnAAAAAElFTkSuQmCC); \
			cursor:n-resize; \
		} \
		.markItUpHeader ul li	{ \
			list-style:none; \
			float:left; \
			position:relative; \
		} \
		.markItUpHeader ul li ul{ \
			display:none; \
		} \
		.markItUpHeader ul li:hover > ul{ \
			display:block; \
		} \
		.markItUpHeader ul .markItUpDropMenu { \
			background:transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABh0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzT7MfTgAAAG9JREFUGJW10DEKwlAURNETUbEWEUGwtv/7X8KswA1YayCCxbeJ8BXBNJlqHlwuj+lqraZmMZmcFV6+SyllhQtOX8wdhyRDa37ijNt4d3jgmGSArl2jlAIbXLHGPkn/8+ckRtsOW/SN5NP8L/NN9wKnXh+mOmZQKgAAAABJRU5ErkJggg==) no-repeat 115% 50%; \
			margin-right:5px; \
		} \
		.markItUpHeader ul .markItUpDropMenu li { \
			margin-right:0px; \
		} \
		.markItUpHeader ul .markItUpSeparator { \
			margin:0 10px; \
			width:1px; \
			height:16px; \
			overflow:hidden; \
			background-color:#CCC; \
		} \
		.markItUpHeader ul ul .markItUpSeparator { \
			width:auto; height:1px; \
			margin:0px; \
		} \
		/* next rows of buttons */ \
		.markItUpHeader ul ul { \
			display:none; \
			position:absolute; \
			top:18px; left:0px; \
			background:#F5F5F5; \
			border:1px solid #3C769D; \
			height:inherit; \
		} \
		.markItUpHeader ul ul li { \
			float:none; \
			border-bottom:1px solid #3C769D; \
		} \
		.markItUpHeader ul ul .markItUpDropMenu { \
			background:#F5F5F5 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACCSURBVHjaYvz//z8DsQAggJjQBUxMTLhwKQYIICYsYi+AGniwKQYIIGyKeYH4FTYNAAHEhMNGTqgGdmRBgADCpRjk6x9A/AdZECCAcCn+AMQSZ86c+YssCBBA2BQ/gCr8hS4BEEAMoHBGxsbGxizoYjAMEECMpEQKQAAxMZAAAAIMAGsVNanzZRR/AAAAAElFTkSuQmCC) no-repeat 100% 50%; \
		} \
		/* next rows of buttons */  \
		.markItUpHeader ul ul ul { \
			position:absolute; \
			top:-1px; left:150px; \
		} \
		.markItUpHeader ul ul ul li { \
			float:none; \
		} \
		.markItUpHeader ul a { \
			display:block; \
			width:16px; height:16px; \
			text-indent:-10000px; \
			background-repeat:no-repeat; \
			padding:3px; \
			margin:0px; \
		} \
		.markItUpHeader ul ul a { \
			display:block; \
			padding-left:0px; \
			text-indent:0; \
			width:120px;  \
			padding:5px 5px 5px 25px; \
			background-position:2px 50%; \
		} \
		.markItUpHeader ul ul a:hover  { \
			color:#FFF; \
			background-color:#3C769D; \
		} \
		");
		
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
			
			var newQR = '<form name="vbform" method="post" action="newreply.php?do=postreply&amp;t='+ threadId +'" class="block fv-vbform"><h2 class="blockhead"><strong>F</strong>ire<strong>V</strong>ortex <strong>Q</strong>uick<strong>R</strong>eply - <span class="toggle-markitup">Show bbCode Markup</span></h2><div class="wysiwyg_block"><div class="blockbody formcontrols"><div class="section"><div class="blockrow texteditor" id="vB_Editor_001"><div class="editor_textbox"><textarea dir="ltr" tabindex="1" cols="80" rows="8" id="vB_Editor_001_textarea" name="message"></textarea></div></div><div class="actionbuttons"><div class="group"><a id="fvqr-emoticons-btn"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAABGdBTUEAAK%2FINwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJnSURBVDjLpZPNS9RhEMc%2Fz29t1d1tfSmhCAwjioqoKNYuYkRRFB300MWT3eooeMn6C4TunYoiOgSKkGAUhh0SjJCwsBdtfQMN17Ta2v39nueZ6WBtktGh5jLDMPPhC%2FMdo6r8T5T93nCPTUqVDhVOi5BRBRVGRBhQ4drGc5pfO2%2FWKnCPTbMKN0x9Z4OpzqDxWlCPFnL45VHCd91ZEdprWnRoHcANmhatbu4JtrShiSr8t9dIuIS6IpgKgoqdGBsQztwj%2FDDUWndee0sAO2hqVZmO7b%2BbkuAzvpgF%2BwVxIeqLqxBRTHk9sfL9fBq%2BkBdh%2B9Y2%2FRgAqNARbO9KaRwkzIL7ymBfDiQCH%2FHkIYjN4z6P4cNJEnu6UuLpAAgARDhrahqRYhZ1BVQsx85UomJRb2lqzqMSojaPW3lOWfUuxHN2LWAv5WnErZSWVCzqItRHP2qL%2BggJc0CI9zSUACoU1BXBOx71PmXq7dzqorc%2Fcsj05BKDD%2BZQsaCKCLFfCjxZbAGIc7R5N%2B9ezTI7uYD6EBXLTHaZiTfLZBrTmCCB%2BDJsyETJSCL029zowaC6nkRynqNNDYw9m2L8xSx4S7LSkMlUkUzEKEsfoJCbxkb0l8643GPqRHifarydEvsGnx9HohXUhYj7eUaIJXdi0qeYvn8x7yw7Dl3WxQCgplUXRWj%2FNnELdBuxdCMmVouKgihBfDMb6k6gieMsvezDRrQfuqyL66w8f8ecFM%2F15N7OhvimfQQbAhCHCz1f59%2ByMNyddZZLh6%2FowB9%2FAWD2pkmJp1OE096TcRE4y4izDDhL95Grf3mmf4nvrQOLvcb%2FmlMAAAAASUVORK5CYII%3D" border="0"/></a><label for="subscribe"><input type="checkbox" value="1" class="dep_ctrl" tabindex="2" name="subscribe" id="subscribe"> Subscribe to this thread</label> <input type="submit" tabindex="1" accesskey="s" value="Submit Reply" id="vB_Editor_001_save" name="sbutton" class="button"></div></div></div><div id="fvqr-emoticons-panel"></div></div><input type="hidden" value="FV-QR" id="title" name="title"><input type="hidden" value="" name="s"><input type="hidden" value="'+ w.SECURITYTOKEN +'" name="securitytoken"><input type="hidden" value="postreply" name="do"><input type="hidden" value="'+ threadId +'" name="t"><input type="hidden" value="0" name="specifiedpost"><input type="hidden" value="" name="posthash"><input type="hidden" value="" name="poststarttime"><input type="hidden" value="'+ userID +'" name="loggedinuser"><input type="hidden" value="" id="multiquote_empty_input" name="multiquoteempty"><input type="hidden" id="cb_parseurl" value="1" name="parseurl"><input type="hidden" id="htmloption" value="on_nl2br" name="htmlstate"><input type="hidden" name="emailupdate" value="0"><input type="hidden" value="'+ postId +'" name="p"><input type="hidden" id="cb_signature" name="signature" value="1"></div></form>';
			$('#below_postlist').append( newQR );
			
			if ( !FireVortex.Config.getEmoticons() ) $('#fvqr-emoticons-btn').remove();
			
			var threadlist = getStorageObject( 'fv_threadsubscriptionlist' );
			if ( threadlist && threadlist.threadids.length ) {
				if ( $.inArray( parseInt(threadId), threadlist.threadids) != -1 ) $('input[name=subscribe]').attr('checked', true);
			}
			
			//MARKITUP
			// http://userscripts.org/scripts/review/69807 - modified
			var sjcOpen = 0;
			
			// The main code
			$('#vB_Editor_001_textarea').addClass('sjcmarkItUp');
			
			$('span.toggle-markitup').live('click', function() {
			
				if (sjcOpen == 1) {
					$('.sjcmarkItUp').markItUpRemove();
					$(this).text('Show bbCode Markup');
					sjcOpen = 0;
				} else {
					$('.sjcmarkItUp').markItUp( myBbcodeSettings );
					$(this).text('Hide bbCode Markup');
					sjcOpen = 1;
				}
			
			}).css( 'cursor', 'pointer');
			
			// ----------------------------------------------------------------------------
			// markItUp!
			// ----------------------------------------------------------------------------
			// Copyright (C) 2008 Jay Salvat
			// http://markitup.jaysalvat.com/
			// ----------------------------------------------------------------------------
			myBbcodeSettings = {
			  nameSpace: "bbcode", // Useful to prevent multi-instances CSS conflict
			  markupSet: [
			      {name:'Bold', key:'B', openWith:'[b]', closeWith:'[/b]'}, 
			      {name:'Italic', key:'I', openWith:'[i]', closeWith:'[/i]'}, 
			      {name:'Underline', key:'U', openWith:'[u]', closeWith:'[/u]'}, 
			      {separator:'---------------' },
			      {name:'Picture', key:'P', replaceWith:'[img][![Url]!][/img]'}, 
			      {name:'Link', key:'L', openWith:'[url=[![Url]!]]', closeWith:'[/url]', placeHolder:'Your text to link here...'}, 
			      {separator:'---------------' },
			      {name:'Quotes', openWith:'[quote]', closeWith:'[/quote]'}, 
			      {name:'Code', openWith:'[code]', closeWith:'[/code]'}, 
			      {separator:'---------------' },
			      {name:'Clean', className:"clean", replaceWith:function(h) { return h.selection.replace(/\[(.*?)\]/g, "") } },
			   ]
			};
			
		}
	},
	
	
	/**
	 * log x amount of recently viewed threads into db
	 * TODO - clean this up
	 */
	trackThreadRecentViewed: function() {
	
		var link     = $('#pagetitle h1 a').attr('href');
		var threadId = $("input[name='searchthreadid']").val();
		var title    = $('#pagetitle h1 a').text();
	
		//pull tracked thread list
		var recentThreads = getStorageObject('fv_recentviewedthreads');
	
		if ( recentThreads && recentThreads.threadids && recentThreads.titles ) {
				
			var i = $.inArray( threadId , recentThreads.threadids );
			
			if ( i != -1 ) {
				recentThreads.threadids.splice(i, 1);
				recentThreads.titles.splice(i, 1);
			}
			
			if ( recentThreads.threadids.length > 34 ) {
				recentThreads.threadids.shift();
				recentThreads.titles.shift();
			}
			
			recentThreads.threadids.push( threadId );
			recentThreads.titles.push( title );
			recentThreads.updated = new Date();
		
			setStorageObject('fv_recentviewedthreads' , recentThreads);
			
		} else {
		
			recentlist = { "updated" : new Date(), "threadids" : new Array(), "titles" : new Array() };
			recentlist.threadids.push( threadId );
			recentlist.titles.push( title );
				
			setStorageObject('fv_recentviewedthreads' , recentlist);
			
		}
		
	},
	
	trackSearchesRecent: function() {
		
		$('#searchform').submit(function() {
			
		    var $inputs = $('#searchform :input');

		    var svalues = {};
		    $inputs.each(function() {
				svalues[this.name] = $(this).val();
		    });

		    //exclude the security token
		    var values = $("#searchform :input[value][name!='securitytoken']").serialize();

			var recentSearches = getStorageObject('fv_recentsearches');
		
			if ( recentSearches && recentSearches.query ) {
				
				if ( recentSearches.query.length > 34 ) {
					recentSearches.serialized.shift();
					recentSearches.query.shift();
				}
				
				recentSearches.serialized.push( values );
				recentSearches.query.push( svalues.query );
				recentSearches.updated = new Date();
			
				setStorageObject('fv_recentsearches' , recentSearches );
				
			} else {
			
				recentlist = { "updated" : new Date(), "query" : new Array(), "serialized" : new Array() };
				recentlist.serialized.push( values );
				recentlist.query.push( svalues.query );
					
				setStorageObject('fv_recentsearches' , recentlist);
				
			}
			
		});
		
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
			if (id) {
				id = id.substring(13); //thread_title_<threadid>
				$(this).prepend('<span class="fv-preview-p-btn" id="'+ id +'">[p]</span> - ').css( 'cursor', 'pointer');
			}
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

	injectKillIgnoredQuotesReply: function() {
		
		var ignorelist = getStorageObject( 'fv_ignorelist' );

		if (ignorelist && ignorelist.usernames.length ) {
			GM_addStyle(".isignored { background-color: "+ FireVortex.Config.getThreadUserHighlightColorIgnore() +" !important; }");
			
			//loop over quotes
			$("ul#postlist div.bbcode_postedby strong").each(function (i) {
				var usern = $(this).text();

				if ( $.inArray( usern, ignorelist.usernames) != -1 ) {
					$(this).parent().parent().parent().addClass('isignored');
					$(this).parent().next().addClass('fv-ignored-quote').hide();	
				}
			});
			
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
				"2":"808,809", "3":"810,811", "4":"812,813", "5":"824,825", "7":"818,819", "9":"838,839", "6":"820,821", "8":"826,827", "10":"531,899", "11":"802,807", "13":"832,833", "25":"812,813", "26":"529,903", "39":"828,829", "71":"834,835", "112":"1133,1135,", "142":"816,817", "145":"814,815", "152":"836,837", "549":"530,904",  "550":"529,903", "728":"822,823", "731":"855,907", "786":"984,985", "865":"1056,1057", "970":"1150,1151", "1149":"1152,1153", "1062":"1179,1180", "1061":"1181,1182", "1136": "1188,1189", "1051":"1071,1072", "548":"532,902", "870":"1049,1050", "5310":"5313,5314", "1190":"5323,5324", "5309":"5333,5334", "5001":"5317,5318"
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
	
//TODO - needs to be forum level
	injectForumRecentProductSearches: function(id) {
		
		var standardlist = getStorageObject( 'fv_productsearch' );

		if ( standardlist ) {

			if ( standardlist.forums[ id ] ) {
			
				$('<div id="fv-recentproductsearch" class="forum_info"><div class="collapse"><h4 class="forumoptiontitle"><span class="optiontitle">Recent Product Searches</span></h4></div><div class="forum_info_block"><div class="forum_info_subblock" id="fv-recentproductsearchlist"><div class="feed-content">loading...</div></div></div></div>').insertBefore('#breadcrumb_two');
	
				var sublist = getStorageObject( 'fv_recentviewedproductsearch' );
				html = '';
				if ( sublist ) {
	
					for ( var i = sublist.urls.length - 1; i >= 0; i-- ) {
						html += '<li><h3><a href ="' + sublist.urls[i] + '">'+ sublist.titles[i] +'</a></h3></li>';		
					}
					
						
				} else {
					html = '<li>No recent searches</li>';
				}
				
				$('div#fv-recentproductsearch div.feed-content').html( '<ul>'+ html +'</ul>' );
				
			}
		}

		
	},
	
	
	injectShoutBox: function() {
		
		GM_addStyle('#fv-ot-yshout *{margin:0;padding:0}#fv-ot-yshout a{text-decoration:none;color:#588fb9}#fv-ot-yshout a:hover{color:#3d464d}#fv-ot-yshout a:active{color:#282e33}#fv-ot-yshout{margin:0 auto;width:100%;position:relative;max-height:350px;overflow:auto;font:11px/1.4 Arial,Helvetica,sans-serif}#fv-ot-yshout #fv-ot-ys-posts{position:relative;background:#fff}#fv-ot-yshout .ys-post{border-bottom:1px solid #f7f7f7;margin:0 5px;padding:5px;position:relative;overflow:hidden}#fv-ot-yshout .ys-admin-post .ys-post-nickname{padding-left:10px;background:url(http://style.firevortex.net/icons/bullet_star.png) 0 2px no-repeat}#fv-ot-yshout .ys-post-timestamp{color:#b3b3b3}#fv-ot-yshout .ys-post-nickname{color:#1a1a1a}#fv-ot-yshout .ys-post-message{color:#595959}#fv-ot-yshout .ys-banned-post .ys-post-nickname,#fv-ot-yshout .ys-banned-post .ys-post-message,#fv-ot-yshout .ys-banned-post{color:#b3b3b3 !important}#fv-ot-yshout #ys-banned{position:absolute;z-index:75;width:500px;height:100%;_height:430px;top:0;left:0;margin:0 5px;background:#fff}#fv-ot-yshout #ys-banned span{position:absolute;display:block;height:20px;margin-top:-10px;top:50%;padding:0 20px;color:#666;text-align:center;font-size:13px;z-index:80}#fv-ot-yshout #ys-banned a{color:#999}#fv-ot-yshout #ys-banned a:hover{color:#666}#fv-ot-yshout .ys-post-actions{display:none;position:absolute;top:0;right:0;padding:5px;font-size:11px;z-index:50;background:#fff;color:#b3b3b3}#fv-ot-yshout .ys-post-actions a{color:#7a8c99}#fv-ot-yshout .ys-post-actions a:hover{color:#3d464d}#fv-ot-yshout .ys-post:hover .ys-post-actions{display:block}#fv-ot-yshout .ys-post-info{color:#595959}#fv-ot-yshout .ys-post-info em{font-style:normal;color:#1a1a1a}#fv-ot-yshout .ys-info-overlay{display:none;position:absolute;z-index:45;top:0;left:0;width:100%;height:100%;background:#fff;padding:5px}#fv-ot-yshout .ys-info-inline{display:none;margin-top:2px;padding-top:3px;border-top:1px solid #f2f2f2}#fv-ot-yshout #ys-post-form{height:40px;line-height:40px;background:#ebebeb}#fv-ot-yshout #ys-input-nickname,#fv-ot-yshout #ys-input-message{font-size:11px;padding:2px;background:#fff;border:1px solid #c3c3c3}#fv-ot-yshout #ys-post-form fieldset{_position:absolute;border:none;padding:0 10px;_margin-top:10px}#fv-ot-yshout #ys-input-nickname{width:105px;margin-left:5px}#fv-ot-yshout #ys-input-message{margin-left:5px;width:50%}#fv-ot-yshout #ys-input-submit{font-size:11px;width:64px;margin-left:5px}#fv-ot-yshout #ys-input-submit:hover{cursor:pointer}#fv-ot-yshout .ys-before-focus{color:#b3b3b3}#fv-ot-yshout .ys-after-focus{color:#000}#fv-ot-yshout .ys-input-invalid{}#fv-ot-yshout .ys-post-form-link{margin-left:5px}#ys-overlay{position:fixed;_position:absolute;z-index:100;width:100%;height:100%;top:0;left:0;background-color:#000;filter:alpha(opacity=60);-moz-opacity:0.6;opacity:0.6}* html body{height:100%;width:100%}#ys-closeoverlay-link,#ys-switchoverlay-link{display:block;font-weight:bold;height:13px;font:11px/1 Arial,Helvetica,sans-serif;color:#fff;text-decoration:none;margin-bottom:1px;outline:none;float:left}#ys-switchoverlay-link{float:right}.ys-window{z-index:102;position:fixed;_position:absolute;top:50%;left:50%}#ys-cp{margin-top:-220px;margin-left:-310px;width:620px}#ys-yshout{margin-top:-250px;margin-left:-255px;width:500px}#ys-history{margin-top:-220px;margin-left:-270px;width:540px}#ys-help{margin-top:-220px;margin-left:-270px;width:540px}#fv-ot-yshout .ys-browser{border:none !important;outline:none !important;z-index:102;overflow:auto;background:transparent !important}#fv-ot-yshout-browser{height:580px;width:510px}#cp-browser{height:440px;width:620px;_height:450px;_width:440px}#history-browser{height:440px;width:540px;border-top:1px solid #545454;border-left:1px solid #545454;border-bottom:1px solid #444;border-right:1px solid #444}');
		
		$('#threadlist').before('<div id="fv-ot-yshout">loading sb...</div>');
		//$('#threadlist').before('<div id="debug"></div>');
		
		new YShout({
				yPath: 'http://shout.firevortex.net/',
				log: 2
		});

		var minmax = getSessionObject('fv_minmaxshoutbox' );
		
		if ( minmax && !minmax.open) {
			$('#fv-ot-yshout').animate({height:'84px'}, 500);
		} else {
			var minmax = { open: true };
			setSessionObject('fv_minmaxshoutbox', minmax);
		}


//TODO - jquery it
			w.insertIt = function (tagOpen,tagClose) {

			  var ta = document.getElementById('ys-input-message');
			  var st = ta.scrollTop;
			  
			  if (ta.value == 'Just Shout... someone must be here.') {
				//ta.value = '';
				$(ta).removeClass('ys-before-focus').addClass( 'ys-after-focus').val('');
			  }

			  if (ta.selectionStart | ta.selectionStart == 0) {

				// work around Mozilla Bug #190382
				if (ta.selectionEnd > ta.value.length) { 
				ta.selectionEnd = ta.value.length; 
				}

				// decide where to add it and then add it
				var firstPos = ta.selectionStart;
				var secondPos = ta.selectionEnd + tagOpen.length;

				ta.value = ta.value.slice(0,firstPos) + tagOpen + ta.value.slice(firstPos);
				ta.value = ta.value.slice(0,secondPos) + tagClose + ta.value.slice(secondPos);

				// reset selection & focus... after the first tag and before the second 
				ta.selectionStart = firstPos + tagOpen.length;
				ta.selectionEnd = secondPos;

				ta.focus();

				ta.scrollTop = st;

			  } 

			}
			
			w.linkImg = function () {
			  var myImg = prompt("Enter Image URL:","http://");
			  if (myImg != null) {
				w.insertIt(' [img]'+ myImg +'[/img] ','');
			  }

			}
			w.linkIt = function () {
			  var myLink = prompt("Enter URL:","http://");

			  if (myLink != null) {
				w.insertIt(' [url]',''+ myLink +'[/url] ');
			  }

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
			if ( userid ) userid = parseInt( userid.replace('buddylist_user','') ); //buddylist_user208927
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
			if ( userid ) userid = parseInt( userid.replace('user','') ); //user16242
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

FireVortex.Parsers.Search = {

//TODO
//need to list each site w/uncheck option (store in current storage or create another in preferences?)
//add button for qrmods/garage of cars
//move into json request at fv - return dataset for each forum (check/load at product search link open)
//recent searches - add search term/forum combo; add forum id as array so we can display a list for each active forum. (right now, all searches)

	init: function() {
		
		this.loadTESTData();
		this.loadHtml();
		
	},
	
	loadHtml: function() {
	
		//load only once
		var standardlist = getStorageObject( 'fv_productsearch' );

		if ( standardlist ) {

			if ( standardlist.forums[ getChildForumId() ] ) {
				
				GM_addStyle('#fv-productsearch {width:98%;padding-left:5px;margin-top:10px;} #fv-productsearch-results {max-height:450px; overflow:auto;margin-top: 10px;} #fv-productsearch-results img { max-width: 100px; } #fv-productsearch-results .left { margin-top: 10px; margin-right: 10px; width: 100px; max-width: 100px; float:left; } #fv-productsearch-results .price { color: red; font-weight: bold; } #fv-query { width: 65%; } #fv-productsearch-form .button { padding: 3.5px 6px ! important } #fv-productsearch-form input { margin-right: 10px; font-size: 18px ! important; } #fv-productsearch h3 { font-size: 12px; font-weight: bold; } #fv-productsearch-results h2 {margin-top 8px; margin-bottom: 5px} #fv-productsearch h2 { font-size: 14px; font-weight: bold; } #fv-productsearch h1 { color: #333; font-size: 18px; font-weight: bold; margin-bottom: 8px;} #fv-productsearch-search li { display: inline; list-style-type: none; padding-right: 20px; margin-bottom: 8px;} ');
			
				$('#forumdisplaypopups').prepend('<li id="fv-productsearchtools" class="popupmenu nohovermenu"><h6><a class="popupctrl" href="javascript://">Product Search <span style="color:#CE6D0D">[beta]</span></a></h6></li>');
			
				$('#threadlist').before('<div id="fv-productsearch" class="threadlist"></div>');
				$('#fv-productsearch').hide();
				
				//inputbox to captures form - clear out existing product results div onsubmit
				$('#fv-productsearch').append('<div id="fv-productsearch-search"><form class="" id="fv-productsearch-form" name="fv-productsearch-form" action=""><div class="section"><div class="blockrow"><input type="text" value="" tabindex="1" id="fv-query" name="fv-query" class="textbox primary"><input type="submit" accesskey="s" tabindex="1" value="Search for Products" name="dosearch" class="button"></div></div></form></div>');
				$('#fv-productsearch').append('<div id="fv-productsearch-companies"><div class="section"><div class="blockrow">sites: </div></div></div>');
				$('#fv-productsearch').append('<div id="fv-productsearch-results"></div>');
				
				
				var standardlist = getStorageObject( 'fv_productsearch' );
				var sites = standardlist.forums[ getChildForumId() ];
		
				if ( sites && sites.length ) {
					for ( var i = 0; i < sites.length; i++ ) {
						$('#fv-productsearch-companies .blockrow').append('<i>'+ sites[i].name +'('+ sites[i].label +')</i> ');
					}
				}
				
				
				$('#fv-productsearchtools h6 a').bind('click', function( e ){
					$('#fv-productsearch').slideToggle('slow');
					e.stopPropagation();
				});
	
				this.parseTESTSearches( sites );
				
			}
		}
	
	},


	parseTESTSearches: function( sites ) {


		$('#fv-productsearch-form').submit(function(e) {
	
			$('#fv-productsearch-results').remove();
			$('#fv-productsearch').append('<div id="fv-productsearch-results"></div>');
	
		    var query = $('#fv-query').val();
	
			//check if empty
			if (!query || query == '') {
				
				alert('enter something...');
				
				e.preventDefault();
				e.stopPropagation();
				return false;
				
			}
			
			query = encodeURIComponent( query );
	
			if ( sites && sites.length ) {
				for ( var i = 0; i < sites.length; i++ ) {
										
					if ( sites[i].type == 'GET' && sites[i].fullaction ) {
						theaction = sites[i].action.replace( sites[i].argname +'=', sites[i].argname +'='+ query );
						dataform = null;
					} else {
						theaction = sites[i].action;
						dataform = sites[i].argname +'='+ query;
						if ( sites[i].serializedinputs ) dataform = sites[i].serializedinputs +'&'+ dataform;	
					}
					
					$('#fv-productsearch-results').append('<div class="section"><div class="blockrow"><h1><a class="fv-productsearchurl" href="'+ sites[i].url +'">'+ sites[i].name +'</a> ('+ sites[i].label +') >> <a href="'+ theaction +'">Full Search</a></h1><ol class="fv-productsearch-company" id="fv-productsearch-results-'+ i +'"><li id="loading-'+ i +'">loading search results...</li></ol></div></div>');
					
					
//console.log('---');
//console.log('FIREVORTEX: Ajax: ('+ i +') type: '+ sites[i].type +' url:'+ theaction +' data:'+ dataform );
//console.log('---');
					
					$.ajax({
						cache: false,
						type: sites[i].type,
						url: theaction,
						dataType: 'html',
						xhr: function() { return new GM_XHR(); },
						data: dataform,
						success: FireVortex.Parsers.Search.updateTESTSearchResults( i, sites[i] ),
						error: function(xhr) {
							alert ("Oopsie: " + xhr.statusText);
						}
			
					});
				}
			}
			
			e.preventDefault();
			e.stopPropagation();
			return false;
			
		});

	},

	updateTESTSearchResults: function(loop_index, loop_site) {
	
	    return function( html_data ) {
	    
//console.log('---');
//console.log('FIREVORTEX: index: '+ loop_index );
//console.log('FIREVORTEX: site: '+ loop_site.name );
			
			$('#loading-'+ loop_index).remove();
			
			listobj = $(html_data).find( loop_site.selector.loop );
			
			//loop over dom set
			$.each(listobj, function() {
				var desc  = $(this).find( loop_site.selector.description ).text();
				var link  = $(this).find( loop_site.selector.link ).attr('href');
				if ( !link.startsWith('http://') ) {
					if ( link.startsWith == '/' ) {
						link = loop_site.url + link;
					} else {
						link = loop_site.url +'/'+ link;
					}
				}
				var price = $(this).find( loop_site.selector.price ).text();
				var thumb = $(this).find( loop_site.selector.thumb ).attr('src');
				
				if (thumb) {
				
					if ( !thumb.startsWith('http://') ) {
						if ( thumb.startsWith == '/' ) {
							thumb = loop_site.url + thumb;
						} else {
							thumb = loop_site.url +'/'+ thumb;
						}
					}
				
					thumb = '<img src="'+ thumb +'"/>';
					
				} else {
					thumb = '';
				}
			
				results = '<a href="'+ link +'">'+ desc +'</a><br/><span class="price">'+ price +'</span>';
				
				$('#fv-productsearch-results-'+ loop_index).append('<li class="fv-productsearch-results-item"><div id="wrap" style="width:100%"><div class="left">'+ thumb +'</div><div class="right">'+ results +'</div></div><div style="clear:both;"></div></li>');
				
				//this might be shitty in jquery land to re-add the same selector - since we have a loop for each sites
				
				
			});
			
			$('.fv-productsearch-results-item a').live('click', function() {
				
					var url     = $(this).attr('href');
					var title    = $(this).text();
					var price = $(this).parent().parent().find( 'span.price' ).text();
					title = title + ' :: <span class="price">'+ price +'</span>';
				
					//pull tracked thread list
					var recentProducts = getStorageObject('fv_recentviewedproductsearch');
				
					if ( recentProducts && recentProducts.urls && recentProducts.titles ) {
							
						var i = $.inArray( url , recentProducts.urls );
						
						if ( i != -1 ) {
							recentProducts.urls.splice(i, 1);
							recentProducts.titles.splice(i, 1);
						}
						
						if ( recentProducts.urls.length > 34 ) {
							recentProducts.urls.shift();
							recentProducts.titles.shift();
						}
						
						recentProducts.urls.push( url );
						recentProducts.titles.push( title );
						recentProducts.updated = new Date();
					
						setStorageObject('fv_recentviewedproductsearch' , recentProducts);
						
					} else {
					
						recentlist = { "updated" : new Date(), "urls" : new Array(), "titles" : new Array() };
						recentlist.urls.push( url );
						recentlist.titles.push( title );
							
						setStorageObject('fv_recentviewedproductsearch' , recentlist);
						
					}
				
			}).css( 'cursor', 'pointer');
			
			
	    };
		
	},
	
	loadTESTData: function() {
		
		//load only once
		var standardlist = getStorageObject( 'fv_productsearch' );

		if ( !standardlist ) {

			var searches = { "updated" : null, "version" : "120528", "forums" : null };

			var forums = {};

			//
			//our test data structure. 
			//
			
			var NAMselector = { "loop": ".itemDisplay", "description": ".details p a", "price": ".addtoCart p.large", "link": ".details p a", "thumb": ".imagebox a img" };
			var NGPselector = { "loop": ".product-container", "description": "a.product-title", "price": "div.product-prices span.price span.price", "link": "a.product-title", "thumb": ".product-item-image a img" };

			//golf iii
			var sites = new Array();
			
			var site = { "cid": 5, "label": "Golf/Jetta", "name": "NGP Racing", "logourl": "http://www.ngpracing.com/store/skins/default_blue/customer/images/ngp-logo.gif", "url": "http://www.ngpracing.com", "fullaction" : true, "type": "GET", "action":"http://www.ngpracing.com/store/index.php?subcats=Y&type=extended&status=A&pshort=Y&pfull=Y&pname=Y&pkeywords=Y&search_performed=Y&cid=1&q=&dispatch=products.search&sort_by=position&sort_order=desc", "serializedinputs": null, "argname": "q", "selector": NGPselector };
			sites.push(site);
			
			forums['3'] = sites;

			//golf iv
			var sites = new Array();
			
			var site = { "cid": 6, "label": "Golf/GTI", "name": "North American Motorsports", "logourl": "http://www.namotorsports.net/images/nam.gif", "url": "http://www.namotorsports.net", "fullaction" : true, "type": "GET", "action":"http://www.namotorsports.net/Keyword=&refine=y&Makemodel=Volkswagen-Golf/GTI-IV", "serializedinputs": null, "argname": "Keyword", "selector": NAMselector };
			sites.push(site);

			var site = { "cid": 6, "label": "Jetta", "name": "North American Motorsports", "logourl": "http://www.namotorsports.net/images/nam.gif", "url": "http://www.namotorsports.net", "fullaction" : true, "type": "GET", "action":"http://www.namotorsports.net/Keyword=&refine=y&Makemodel=Volkswagen-Jetta-IV", "serializedinputs": null, "argname": "Keyword", "selector": NAMselector };
			sites.push(site);
			
			var site = { "cid": 5, "label": "Golf/Jetta", "name": "NGP Racing", "logourl": "http://www.ngpracing.com/store/skins/default_blue/customer/images/ngp-logo.gif", "url": "http://www.ngpracing.com", "fullaction" : true, "type": "GET", "action":"http://www.ngpracing.com/store/index.php?subcats=Y&type=extended&status=A&pshort=Y&pfull=Y&pname=Y&pkeywords=Y&search_performed=Y&cid=7&q=&dispatch=products.search&sort_by=position&sort_order=desc", "serializedinputs": null, "argname": "q", "selector": NGPselector };
			sites.push(site);
			
			forums['4'] = sites;

			//golf iv r32
			var sites = new Array();
			
			var site = { "cid": 6, "label": "Golf R32", "name": "North American Motorsports", "logourl": "http://www.namotorsports.net/images/nam.gif", "url": "http://www.namotorsports.net", "fullaction" : true, "type": "GET", "action":"http://www.namotorsports.net/Keyword=&refine=y&Makemodel=Volkswagen-R32-(MKIV)&Year=2004", "serializedinputs": null, "argname": "Keyword", "selector": NAMselector };
			sites.push(site);
			
			forums['145'] = sites;


			//golf jetta v
			var sites = new Array();
			
			var site = { "cid": 6, "label": "Golf/GTI", "name": "North American Motorsports", "logourl": "http://www.namotorsports.net/images/nam.gif", "url": "http://www.namotorsports.net", "fullaction" : true, "type": "GET", "action":"http://www.namotorsports.net/Keyword=&refine=y&Makemodel=Volkswagen-GTI-V", "serializedinputs": null, "argname": "Keyword", "selector": NAMselector };
			sites.push(site);
			
			var site = { "cid": 6, "label": "Jetta", "name": "North American Motorsports", "logourl": "http://www.namotorsports.net/images/nam.gif", "url": "http://www.namotorsports.net", "fullaction" : true, "type": "GET", "action":"http://www.namotorsports.net/Keyword=&refine=y&Makemodel=Volkswagen-Jetta-V", "serializedinputs": null, "argname": "Keyword", "selector": NAMselector };
			sites.push(site);

			var site = { "cid": 5, "label": "Golf/Jetta", "name": "NGP Racing", "logourl": "http://www.ngpracing.com/store/skins/default_blue/customer/images/ngp-logo.gif", "url": "http://www.ngpracing.com", "fullaction" : true, "type": "GET", "action":"http://www.ngpracing.com/store/index.php?subcats=Y&type=extended&status=A&pshort=Y&pfull=Y&pname=Y&pkeywords=Y&search_performed=Y&cid=8&q=&dispatch=products.search&sort_by=position&sort_order=desc", "serializedinputs": null, "argname": "q", "selector": NGPselector };
			sites.push(site);
			
			forums['142'] = sites;
			
			
			//golf vi
			var sites = new Array();
			
			var site = { "cid": 6, "label": "Golf", "name": "North American Motorsports", "logourl": "http://www.namotorsports.net/images/nam.gif", "url": "http://www.namotorsports.net", "fullaction" : true, "type": "GET", "action":"http://www.namotorsports.net/Keyword=&refine=y&Makemodel=Volkswagen-Golf/GTI-VI", "serializedinputs": null, "argname": "Keyword", "selector": NAMselector };
			sites.push(site);
			
			var site = { "cid": 5, "label": "Golf", "name": "NGP Racing", "logourl": "http://www.ngpracing.com/store/skins/default_blue/customer/images/ngp-logo.gif", "url": "http://www.ngpracing.com", "fullaction" : true, "type": "GET", "action":"http://www.ngpracing.com/store/index.php?subcats=Y&type=extended&status=A&pshort=Y&pfull=Y&pname=Y&pkeywords=Y&search_performed=Y&cid=2015&q=&dispatch=products.search&sort_by=position&sort_order=desc", "serializedinputs": null, "argname": "q", "selector": NGPselector };
			sites.push(site);
			
			forums['1136'] = sites;


			//jetta vi
			var sites = new Array();
			
			var site = { "cid": 6, "label": "Jetta", "name": "North American Motorsports", "logourl": "http://www.namotorsports.net/images/nam.gif", "url": "http://www.namotorsports.net", "fullaction" : true, "type": "GET", "action":"http://www.namotorsports.net/Keyword&refine=y&Makemodel=Volkswagen-Jetta-VI", "serializedinputs": null, "argname": "Keyword", "selector": NAMselector };
			sites.push(site);
			
			var site = { "cid": 5, "label": "Jetta", "name": "NGP Racing", "logourl": "http://www.ngpracing.com/store/skins/default_blue/customer/images/ngp-logo.gif", "url": "http://www.ngpracing.com", "fullaction" : true, "type": "GET", "action":"http://www.ngpracing.com/store/index.php?subcats=Y&type=extended&status=A&pshort=Y&pfull=Y&pname=Y&pkeywords=Y&search_performed=Y&cid=2015&q=&dispatch=products.search&sort_by=position&sort_order=desc", "serializedinputs": null, "argname": "q", "selector": NGPselector };
			sites.push(site);
			
			forums['5310'] = sites;
			
			searches.forums = forums;

			searches.updated = new Date();
			setStorageObject('fv_productsearch' , searches);

		}
		
	},
	
};

FireVortex.UI = {
	
};

FireVortex.UI.Emoticons = {

	init: function() {
		//this.loadData();
		this.loadStandardData();
		this.loadHalloweenData();
		
		this.loadHtml();
	},
	
	loadHtml: function() {
		
		var d = new Date();
		
		GM_addStyle('#fv-emoticons {width:83%;max-height:75px; overflow:auto;padding-left:5px;margin-top: 10px;} #fv-emoticons-add {margin-top: 5px;margin-bottom:5px;} #fv-emoticonlist li { display: inline; list-style-type: none; padding-right: 20px; margin-bottom: 8px;} ');
		
		$("#vB_Editor_001").parent().append('<div id="fv-emoticons"><div><ul id="fv-emoticonlist"></ul></div></div>');
		
		
		var emoticonlist = getStorageObject( 'fv_emoticonlist' );

		if ( emoticonlist && emoticonlist.emoticons.length ) {
			for ( var i = 0; i < emoticonlist.emoticons.length; i++ ) {
				$("#fv-emoticonlist").append('<li><a href="" class="fv-emoticon-item"><img src="'+ emoticonlist.emoticons[i].url +'" rel="'+ emoticonlist.emoticons[i].url +'" border="0"/></a></li>');
			}			
		} else {
			$("#fv-emoticons").append('<div id="fv-emoticons-add"><a href="'+ SERVER_HOST +'/profile.php?do=editfirevortex">Add more emoticons via the FireVortex Settings.</a></div>');
		}
		
		//standard selection
		var semoticonlist = getStorageObject( 'fv_standardemoticonlist' );
		if ( semoticonlist && semoticonlist.emoticons.length ) {
			for ( var i = 0; i < semoticonlist.emoticons.length; i++ ) {
				$("#fv-emoticonlist").append('<li><a href="" class="fv-emoticon-item"><img src="'+ semoticonlist.emoticons[i].url +'" rel="'+ semoticonlist.emoticons[i].url +'" border="0"/></a></li>');
			}			
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

		GM_addStyle('#fv-emoticons-add {margin-top: 5px;margin-bottom:5px;} #fv-emoticonlist li { display: inline; list-style-type: none; padding-right: 20px; } ');
		
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
					$("#fvqr-emoticons-panel").append('<div id="fv-emoticons-add"><a href="'+ SERVER_HOST +'/profile.php?do=editfirevortex">Add more emoticons via the FireVortex Settings.</a></div>');
				}
				
				//standard selection
				var semoticonlist = getStorageObject( 'fv_standardemoticonlist' );
				if ( semoticonlist && semoticonlist.emoticons.length ) {
					for ( var i = 0; i < semoticonlist.emoticons.length; i++ ) {
						$("#fv-emoticonlist").append('<li><a href="" class="fv-emoticon-item"><img src="'+ semoticonlist.emoticons[i].url +'" rel="'+ semoticonlist.emoticons[i].url +'" border="0"/></a></li>');
					}			
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


	loadStandardData: function() {

		//load only once
		var standardlist = getStorageObject( 'fv_standardemoticonlist' );

		if ( !standardlist ) {

			var thelist = ["004","006","007","032","036","022","047","057","049","053","055","059","065","071","039","074","128","091","105","111","118","070","119","003" ];

			var emoticonlist = { "updated" : null, "emoticons" : new Array() };

			for ( var i = 0; i < thelist.length; i++ ) {
				var emoticon = { "fvstandard" : false, "shortcode" : false, "url" : "http://e.tinytex.com/g/" + thelist[i] + ".gif", "added" : new Date() };		
				emoticonlist.emoticons.push(emoticon);
			}

			emoticonlist.updated = new Date();
			setStorageObject('fv_standardemoticonlist' , emoticonlist);
		}
		
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
		
		
		$('body').append('<div id="fv-panel" class="fv-panel"><h3>FireVortex</h3><div style="clear:both;"></div><div id="fv-panel-data" rel="loading"><div id="fv-panel-loading-msg">loading data...</div></div><div style="clear:both;"></div><div id="fv-panel-meta"><a title="FireVortex About" href="http://firevortex.net/about/'+ VERSION.fv +'/">About</a> | <a title="FireVortex Settings" href="'+ SERVER_HOST +'/profile.php?do=editfirevortex">Settings</a> | <a title="Donate! Daddy needs diapers" href="http://firevortex.net/donate/" target="_blank">Donate</a> | <a title="SHOUTbox!" id="fv-panel-sb" href="/forumdisplay.php?5224">SB</a></div></div><a class="fv-panel-trigger" href="#">FV</a>');
		
		
		$(".fv-panel-trigger").click(function(){
			
			if ( $("#fv-panel-data").attr("rel") == 'loading' ) {
				
				FireVortex.UI.Panel.createSubscribedForumsList();
				FireVortex.UI.Panel.createSubscribedNewThreadsList();
				FireVortex.UI.Panel.createSubscribedThreadsList();
				FireVortex.UI.Panel.createRecentlyViewedThreadsList();
				FireVortex.UI.Panel.createRecentSearchesList();
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
		
		$("#fv-panel-sb").click(function(){

			var sb = { updated: new Date(), launch: true };
			setSessionObject( 'fv_launchshoutbox', sb );

		});
		
		//TODO - need to make sure only instance is open - so maybe localstorage and kill when unload happens?
				
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

	createRecentlyViewedThreadsList: function() {

		$("#fv-panel-data").append('<dl id="fv-panel-recentthreads-dd" class="dropdown"><dt><a id="fv-panel-recentthreads-select" href="#"><span>Recently Viewed</span></a></dt><dd><ul id="fv-panel-recentthreads-list"></ul></dd></dl>');
		
		var sublist = getStorageObject( 'fv_recentviewedthreads' );

		if ( sublist ) {
			for ( var i = sublist.threadids.length - 1; i >= 0; i-- ) {
				$("#fv-panel-recentthreads-list").append('<li><a href="'+ SERVER_HOST +'/showthread.php?'+ sublist.threadids[i] +'&goto=newpost">'+ sublist.titles[i].substring(0, 50) +'</a></li>');
			}			
		} else {
			$("#fv-panel-recentthreads-list").append('<li><a href="#">No recently viewed topics</a></li>');
		}
		
		$("a#fv-panel-recentthreads-select").click(function() {
			if ( !$("#fv-panel-recentthreads-list").is(":visible") ) $(".dropdown dd ul").hide();
			$("#fv-panel-recentthreads-list").toggle();
			return false;
		});
		
	},

	createRecentSearchesList: function() {

		$("#fv-panel-data").append('<dl id="fv-panel-recentsearches-dd" class="dropdown"><dt><a id="fv-panel-recentsearches-select" href="#"><span>Recent Searches</span></a></dt><dd><ul id="fv-panel-recentsearches-list"></ul></dd></dl>');
		
		var sublist = getStorageObject( 'fv_recentsearches' );

		if ( sublist ) {
			for ( var i = sublist.query.length - 1; i >= 0; i-- ) {
				$("#fv-panel-recentsearches-list").append('<li><a href="'+ SERVER_HOST +'/search.php?'+ sublist.serialized[i] +'">'+ sublist.query[i] +'</a></li>');
			}			
		} else {
			$("#fv-panel-recentsearches-list").append('<li><a href="/search.php?search_type=1">No recent searches</a></li>');
		}
		
		$("a#fv-panel-recentsearches-select").click(function() {
			if ( !$("#fv-panel-recentsearches-list").is(":visible") ) $(".dropdown dd ul").hide();
			$("#fv-panel-recentsearches-list").toggle();
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
			$("time.timeago").timeago();
		}
	},
	
	loadHtml: function() {
		
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=bbcode.css,editor.css,popupmenu.css,reset-fonts.css,vbulletin.css,vbulletin-chrome.css,vbulletin-formcontrols.css');
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=attachments.css,forumbits.css,forumdisplay.css,postlist.css,projecttools.css,threadlist.css,usercp.css');
		addCSSFile(SERVER_HOST +'/css.php?styleid=1&langid=1&d=1303830532&td=ltr&sheet=additional.css');
		
		GM_addStyle('.formcontrols .blockrow { height:auto !important; } #fv-edit-emoticonlist-panel { display: none; padding:5px; max-height: 400px; margin: 0px; overflow: auto; width: 100%; } img.ep { max-width: 100px; max-height: 100px;}'); 
		GM_addStyle('.miniColors-trigger{height:22px;width:22px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw%2FeHBhY2tldCBiZWdpbj0i77u%2FIiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8%2BIDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjU3RTU1MzIzNERFMTFFMDg1NENGREUxMTA5MjQ5M0QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjU3RTU1MzMzNERFMTFFMDg1NENGREUxMTA5MjQ5M0QiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4OEQxNkIyMTM0REUxMUUwODU0Q0ZERTExMDkyNDkzRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4OEQxNkIyMjM0REUxMUUwODU0Q0ZERTExMDkyNDkzRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI%2FPiDK9P0AAAHySURBVHjarJVBasJAFIYnyVgXtrorusgdXOrWZaHgFbooegv1EoI7j%2BAtXLsXFFy0FFRs0LYxmXT%2BYV6YxIgpzcDzJcN73%2Fz5M06s4XD4zBhrsGLHGxdCNEaj0aRI6mAw6AFs4SaKokKglmUxMHkYhgqKaDabvf9AF4vFBBwwAbbkCgpcqVTYfD7%2FkjWnjD6BB9MZEeocyLhrt9suOBhgJhRXq1WmodsrMBNo5gfZ65KdpFhBsVqtVmO6MLwBEkYdwkZvAhwEgUXgUqmEeV%2FGzw1Q%2Bl71EhhMpRhQBOcc8986TAgWg%2FdHfU3zaiPIuEev4XFSsQYfNSTUC3xq38WVzQCZPnoTivGTUnzScE9nkWOnCVMxgdNWAPiht1HekQZnWrHNAeXaArIiurDifD7Hih3HYTmgzng8floul%2FXEpOwlxWAmFGtwwlN5%2BqkwX9ZqtarLg2aCt28OWADGtZcnTGhGVn4C4vt%2B5iEUW0GKbduOwSmVMRj1qKOe2WzGNpsNc12XdbtdNa9q0las12uRBaWBfxjqqEeeiGy326lMh5lS7HmeTYcQlEyn09dbe4sUI6C01WqpTHNg8v1%2Bb5PH%2FX4%2F95cE%2FtIu6HQ68TUymPxwODh4tHK5%2FKevCHr0LrqYB9OSwBf5aI9FfvOk6vdfAQYA4jTPF9eEdoEAAAAASUVORK5CYII%3D)center no-repeat;vertical-align:middle;margin:0.25em;display:inline-block;outline:none}.miniColors-selector{position:absolute;width:175px;height:150px;background:#FFF;border:solid 1px#BBB;-moz-box-shadow:0 0 6px rgba(0,0,0,.25);-webkit-box-shadow:0 0 6px rgba(0,0,0,.25);box-shadow:0 0 6px rgba(0,0,0,.25);-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5px;padding:5px;z-index:999999}.miniColors-selector.black{background:#000;border-color:#000}.miniColors-colors{position:absolute;top:5px;left:5px;width:150px;height:150px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHotAACAlQAA%2BNcAAIhSAABxRQAA6mYAADkHAAAh%2BQMnhVYAACf5SURBVHja7H3LjuRIkqQaJ%2Be0wB72T%2Fs7%2Bw%2FqOKduoLBd3ZVZmeEP0z0UjSUUiqqpuUf1AoMJIBDuTjrdwyhUERVVMzZ3%2Fy8z%2B99m9jAz33%2F7%2Fhs97vb7zzv7qff54n7HNncv7Vc9nnjuf%2FIxsv2i7y%2F328eii%2FEMP9vd5fjvr3cc4%2FFa793dvffe%2B%2FP57Pf73b99%2B9b%2F8pe%2F9C%2B99%2F9jZv9rB8Dsn3kWT9RsQCIgzE7Us3r8le%2BIg%2FfqMRKAp8cAEPAY4%2FGy93l2cY393P0J%2B%2FnYBtvH8%2Be%2BrfXe246cBr%2F%2BeDz68%2Fm0%2B%2F3uHx8f9v37d%2Fv69av9%2FPPP%2FtNPP9lf%2F%2FpX%2B9J7f%2BygenzCSfPZgLxz0l48oeEvXKVv7fPisU4%2Fv28yM7O2%2F5q7t%2BA5P3Y8hvq772%2Fu3nYQjdePfXbgbDuYxmv%2BfD7t%2BXza4%2FGwx%2BPh9%2Fvdbreb3W43%2F%2F79u%2F3666%2F2z3%2F%2B0%2F72t7%2F5Tz%2F9ZN%2B%2BfbMv8A%2BVfmj%2FZmZtf63hgLXWVo7z0ueOgQ0enwY9%2BMH9Kp99%2BVw8wcG2bQc%2B7%2BcF8BgcC4957EevNwDRRgByAFYbQILIdIDI3e35fFrvvY2%2Fj8ejPR6P7X6%2F%2B%2B1284%2BPj%2Fbjxw%2F79u1b%2B%2FXXX9s%2F%2FvGP9ve%2F%2F91%2B%2Fvnn9ng82pfe%2B8qJ5YH1FeAEJ28KEPpsg5NyArEA3%2BlEtdaOE8MXQvBZDBKbAYv3w%2BPhNnhsapu7W2tt671ba63vf1vvPQQWRaUjUu2%2FB9D2c34C0YhSO5B8j1B9%2F9uez2e73%2B%2B2%2F247BfrXr1%2FtX%2F%2F6l%2F3yyy%2F2yy%2B%2F%2BNevX%2B35fNoUWDAwKZCKESYEZyGCpSdeAEnRTRW4YSQKgJQBy%2BHxRkHUOZrtwEGAMICOY%2FwRhE60NsDTB7DGMZHuzMx778Zgcnd7PB4DWPZ8Pn0A6na79dvtZvf7fbvf7%2Fbbb78dwPr111%2Ft69ev%2Fttvv1nvfQqs8Y%2F5Im2VIluR3sag%2BuQ7toDi5PcQ39FEVLqALgNW8HgDJPWE0i5gIp00ANSZ0sxs0BkCyDBCjef7376%2FNgT51ns%2FIhYCCzXV%2FX63j48P%2F%2FHjR%2F%2F4%2BGj3%2B719%2B%2FbNxu%2F379%2F9drv9DqwoUlQBpehnIk6jSOSr%2Bir4jnysCCDZ%2B46T1FrDk%2B2tNcOLESN6AKzTRwFQZsByEteK7hrS3R6ZBngaRizQUcfj5%2FPZdh01QDWe266p2uPxsPv93m632%2Fi179%2B%2Ft99%2B%2B619fHwMrdV%2B%2FPjRbrebPR6PZmZaY1WFNdFkKwCqLYjriI48SCAqkU5RldJEXtBLBhGpR8AiACGNdd4v0EuH%2BGZggd7aRJTqCKRBhyN6YYQaVLhrqra%2FtokscEQs%2B%2Fj4sG%2Ffvg0hbz9%2B%2FLDb7eaPx8Pc%2FUKFHlz1L9GkONk%2BiXQZ9UnwKKApQNIxWyGVtxkV9t7bHsGOyBYAq%2B3jzGDCCHWIa6C%2BJva9ZHs7tWEE25D6CEwDaObu2wDW8%2Fn0XVPZ4%2FFAkLUBKgTWANK3b9%2F6x8fHtuuwASy%2FUOEMT8paSFJzn2WEETjpODK4Bd6PR1GVhT1mZgIUjhdYkt35hOKG3cD7oDVw8pYYdOOYw7AkXXWiwmEbDDpES2Hoqp3ybKfAE%2F09n8%2B2R6p2v9%2FbrrdOVIiPPz4%2B2sfHhz0ej%2B3xePQRGTliTb2fLErR1e0FjeQB2CLqi7Ix3keefBF5HPZzYQd4JNCVfzRokSmTQDYcbtZU214iMQBiI5G%2BDaug%2F%2F5zimSwDS2Ek0AHj2oYn0dk6r0fgn3XVna%2F3%2F1%2Bv%2Ffn87kNU3QI%2BX2bff%2F%2Bvd%2Fvd3s8HkekvGisiVGYgSoDVEsiT2iyigzsopeQgnbvx%2FGqx%2BPTtgiATQBGelCUwTUGDBxzUxkd6qMByID6DEouaG6iN9VRoO9AQyBhJriBV3VQ4W6EbgJYdr%2Ff%2B%2BPx2G63G2aJvgNxZJI%2BwH0CFmc8k2wrjXJIQXBCj9d3s%2FL0VgDJBcScKJzMIG0BuNJ5FKkuEXCAqxClsowuMi3VYxbiJ62EYAIgDVrrHLH2KIXaagBpRCnctiGwBqD2yLXtUWgAaQAMjdIDgB8fHw4R96yxXgBV5rAfJ1fQravPGumyos8MaALUlwwPwYRCXgGNdZWyDlico%2FYR9oADAE7uusr20DkHf8r2E8flmAFMh%2BcbRqjn83lsez6f296NcESpkQkOnXS%2F3we42g6utkerfr%2FffddhbQflQaPj89y9lahwxesKKC0T4XiVSwOTNJLyiDLt1DIdJQS82rYSlSLfaRNU2MAaQOd9i7K9AUb0o0a0IothwzLN8%2Fkc20YmeGis%2FbUTre1Z4TYi1g4wu91uDr6X7zRruw5rkgoDEKlolUWKCCAVoEURxZSQJ8CYMk5VticikQEFSkc9K%2F4yeJSOQ0obQh6jFdoSqLcITJ0tBQTT0FXjdbQUIAvsz%2BezuXvbW1%2Bs9953CtzAbrDb7dZHlENb4na79cfjsaFFMT5jnI%2BS3VDcJwJPRG2evB%2BBEkU4BTKPaJIozIPOAUWBzlEIvxcBS%2B2LOglFuTM4oeRy2m8%2FYRdLAbRVH71S6LSzdwUdC0iPB609Hg9398NuGIVnduL3bUcHBEdPM%2BvTiFWNYBOgWGYh0L6H97MQiZTx6YHYNnDLEUwciYztAlWjE%2FttlME5ZXlHJBrWA9b5JhGLHfROADuAhNFrWAoAtpHFdXcfAh47Ghr0YA09tqGRumutkwE7LA4z2xBYUQmkUqbxLCIJY1JRIeopT7SUKUCojI7KMxYArqExySZn1gfFAAs01sm7wmwPTE9JjQCyEaUYZNu%2B30AYgqcrd33fZxuFZtZYe4RyyBjb7XbroMl8aCoE6gDr%2BO5fVIE0A0zv3aGJ7wjp%2B2tH9rJbB6ayqQb%2BAz8fINn7jxToOCPzSG8RxTXhtl%2FcdwCnTwT7MR4ELG6oc5HtObnpp%2F4poJWTFTGi0XjfSO%2FJAPVdQw2v6jnApOyGYTOAI98AiIdbPxx4LFbvugw7Kw5cfBGV%2Bik1BtX6qB32orH4GIKO0ZJQ1MmRT1Irl0w4SkJDnZHmMWETXLwxtgYIdJjhdUGF3IhnAJgjGRj6CemPxLtDG8ygvw6txdtOhaOp73gO9oPt4NqGyN8j0jaAOOgSW5VHZOMCOFPhTF8p51s994QOmfqUPvJApB%2FutqBJRX0bTBy4RC%2Fx%2FGRaMkgmlsJF3KOFEBidbG4iNSItbnDS0EbAks62U1pD8xTAZgAutBs6UJ7v%2B2yot0D0H%2FqLitqnwvnQsFVgqZpd9FxZES0CUKSjqLxigYnJ2VhEmS6EOReAT811rL8WgLXh8Vg3ofWwA%2BmSNQLINmExdDBFEWRSvA%2FAjegzBHvkY8H%2Bp6gEYv6IbFjGuUQsprAqLSYgs4mQtwmNeUCfyvl2bo6j6KLc9YstwPvS%2B0xYAxcdFbjsjaLVoHjpvKPdgJoKAMcaC2fXODbwPZ9PN7OGzvjYd4js4aADiNpuJRwZ6PCp0LLgRIUK7meNNfOZEjBkJRaOVJdSSkSTIqM7rgZBca5qjMpZh6Jw5%2BiV1fJWtqFews8D7WSsozgqiVrhAEDn%2FSBadSjpDCAeVEjUeNo2DFLY5rhtHHOPdCNK%2BU6XGwD%2FbDfMIlY1WhE4PHHNI4A1dYxAU4XHUIYoHwMjmSpCZ6BT9Dd6pLDTYUxcIJpE6uukqzpMdjhto8cdvKpOvesH3cF%2Bh%2FOOtIglHnDtj5LOHgEdmgZP%2ByEFAtuUqLAFnQtyP8iyuMB8WBJgR1yyxgGAkakFwLlENkFpRkLc4AQbgc0n%2B51oblAOfO4lewQKc4peWFh2ENzOzXy4DaIWuutO7cdD6xx0ho%2BHVTDEOLxnFKbZUjg04E6Bg2o9MIevdgObo4UIFWmrBuhN9QtrGQQI%2BEPsVXUVEVkHBd7UpeeKIo8JbYXFYRP2ggmLAT2ok8M%2BohmA01QkwuiFpihEqUYRa2Mq3CMNUmFjWtyp7JQtDsCOrHAHU8dmweGZjYwSorSdSjpF6otqgCXARTQ5iUycBQ7dwVkh7yd9LAYaG6WTDHD6GgOL%2FKqTjUBA6kpjsa1AuoofH5kgPwbnHUE3PCoGXaPCNb5%2FdDQ4jLFjQpSJ9xmwLAFVn4AtAowFYPGkM8ECC8Gw15wzFirhOLnkTdT4PAIbFIgjMDkbqUizkN1dtou%2B9Q7PO2WGG7bGoI8VAM0hCrGYd0oAnH0rBBOiKrUbkozPFwA3jWbZZwsgeTKBIXL2I%2Bq1RNzPgHbyvYbmEdmeilJOFsXIFk009xnPA6TuBnyM2grfh1rqpLmoHnn6HlBQvui28b7xOWKisIxYF7tAgKklloGanOBFoLRk1ktEY5445JZkf1GdEBfQkBYD1sXIp7pQoXjM2R33sOO%2BLcoKdzBjScfJee9QG%2BSscPRnjcenyIbvo3LQhiCmHvsOLTMW2g0TuptFuAs4lI5SACRwc8lF%2BVZNUaYQ9TMtZYGQb0Hr8Ba0w1QfH5po2ApCsGMJp2OGBuDBiIVA29DvejwekgrBQkCN5ZCVnqgOaRLXi4DEb5yDlApLYCIxHwnxVyjPgga8GXg8oEDuS3dM8xNKPOk9thCGTqJJppbQX4Pow%2FsZ2wtAPyb621FjOTb3DbpCehs2whhLbPaDx2pSa4eGANSXijFi8f4GmEyUY6Jow3pHinoB1Ma1uARIDF6mxVeimQVCHP0tg8LyicbAuzpFL9jviF7Q%2FtKhsH0yQckQ7QAiJyo8KA0jFACpg9vuoiLg6MqTIXpcV6tUaNEMYUVbKu2f7RcBSWR%2FGTVeQJFto8euwMRZ57hyx7iRWMcGvosgB7P40GVDXOMx0I8S1Gg4E4eywE1RIWaFBJDDx%2BLskUE2to3pZSozBJDNs8IJpZ0a%2F9TJ3534sV9pG9sNTE0U9bB%2FyYVRe9nGrcojonDNUVkUUTSb6SoCz0Ws4zGSbQg6zgLlNnTY99c6l35GZCI6RN13lG6gG3YjmwGXw6xHrGx71uxHK6ZY5G5Tx4EFUUxFPVetLcEyQKps48JB5%2B%2BEeuJSHcBtrLfAjmg41ii8iU6noKOuBuPno8MBvC%2BMbidLAnSd4TR%2FZWUgaOm8vq6xotphdKJFS0oTGaAFYLKgCM0n10UHQ0aLbFq66HDwaMlF9Rqk2a40VqCrsCW57ye0K%2FCwxsIeLKKtC90hLY7C86DXPZrhhAvH%2Fi%2B0Mjh6EQ2ySeqr4l3ZCGo61ax3KrMfPNFHHmgsfu%2BlyMxLA0WinCjPlaNOkQdLMZfIQ89PugomWaDzPhz1LTipJ10FNgQ%2Bb1w7xONNjn8CJOspFvNUysEVoXONNel8UK3HvmAtmABGRrGtCC7V0WDsSzHdcQE9mFjBFoKiTAvsBiedhfbCKVoCHbH9cBLwAU3iMRCIbCOw%2FjqKyWhhiPmQp%2ByXHPe8VhgBYCWyiQxy9tcUpTGNFo7VAi2XUiE77qp7Qbjrp3mHSGdAb5sAlQQFWgoYXiArRKrifixTVoTICtFuONEpRCaHibK8aK7D3Mlxg4JtSbwHLTGhXprNoIkiV9BLlQEwshRc1ASjKV3Sn1JCP8r8gomopuwGKuEgWNhtv1Am05aIRsP34udHBgfgQQCdgKkoEj0tBJT9cVMEEzdPuFLhrDwza%2FKLAEZzDUfjXybW8X1oSRj3rcMqNU10MKi7MrRoHiF3JYCzfsr88H1oVSC10usnpx7pMrMb4DV23Q93HVeiYRrjKfmDEqF33Uk3Oq0WqHrcj4xY0KCmwqh9Zva3oNOauEOCV8Q7ao%2FEL1MWA9Of6njgRj4X7cdGRWjpwuNECIpUHkS%2BjQDNrTKYKXJDIEYsIz8Ko9RGbcUYlRymxWON0Fig49pb4pYpuEqhpsKqYRqUbFINlYh8SXcBeCzyoQJH3YLGPksoMivjXPQW7XeiuERHZRHqoEVw0Lnxj%2B2Fk%2FOO1IeuOWZ36HGx5hL7bwxAPK0DjO8AK1vJxSagU4150eKwFpRvLlYA2xFKZwn91YLPOhWTsYwzsxTgdiJhNIs0G0QJg5PEpRvOItEcPYEJdJPNwMMrKw8A9T%2FC0waAOmmeEcna7%2BWXksaKIs4sml0AtmgjqC4GGcnUcRSlUshW7noDB91EZuk0%2BcEFxbONEIl%2BZyCJ%2FYymrV9KQ%2BTOG82W9ijikuNvgcbEi%2Bk%2FMPJyVeEljVWIYiH4koJxtmZV1sulsj3LqFFEM349ctRN0aJ6zuBlW6FChaKDAd9zoSRhYLLxqaIXZ5ONi9M4NY1tDl5c1%2FJb6r0NrOo2bpO53CcmAODqtkukigCnthGNZVEJqaHT%2B0KNhdqJhbly14nqTpYFLfxh7HFRDfGizSjCskiX20TUisCV2w3FTFD2ZbGPla02o3rXZ9FsITNUjX6RQGeLIRL6FkyYcCXsxW1LVCZ4cegJOMYOvIq%2B2Iajoi5aHXa%2BodPlQsXvwKsfTvR3q4p3dsSz5j%2B%2B8SJ%2FKZt0Mlh0jCgaTWgwms4VaQwP9mui%2FyqNRASyTLybcNeV3trIGe9KwON%2BogUGC9enY1BN8RSFqIpwMUrtfOfY17LCpI041EbBzGSV0cmisOipsgJFqrZi9X%2BkuinTYgJA8jhMd7iUJMyQOQGVTzIDieyGkz4iUc%2FOe4dVbzZBh05FZ4%2FoTznxEljD5c6iUmQrDGc9obGmoh4CZEzFh8YyC3wsizI3Me39otPIdc78rBBYTBViZo4pK0LNI6RtRgC69E%2BhpQDH3sR0fKepXXwHi4bgIMA79Iixj4WPOxWjrxqrUjuMSjdqra2kPhjZBvgdwvmEAd15ZoKSpSAb1hD4Qo%2B5yh4ZmFFEEyCRjjyPI%2Ftg4II3QZenLJPAPsZno2LypXKA27MVHVliKLshKwRPxbuKSgkoZRdnRndCw10ojyOiaitOIl00jT6kPWE%2FlEDF2eOgrsBuiKyHjagLb9WLJR0T9oOLzPVEjQN8SnO11oab31prDu77MErnGqvappzMPK4CzZXADmwJi6Z8BdrsYpAGNcx3gSXFexVkILw70h2e%2BKGbRNaIgn0LANRoRcBO%2B25KN4F%2B6sQiKFcODyu1G16xHxIDVa1Eo1aJ8cmxs2JytGJfVIy2aA6hinJEd0p%2F%2BcwgnbjrJhoDjaZfScCDFJH%2FB72u5kBmcxPUvAE1sfi0ul8UseQUeBLtbRKFZhNTLZh5YyrDg5MrJ66Kx9Iby05M9lwtYzSJYivg2qA%2BN8vSkO4syBJNUSG56CzAnZr1Tlnh6Mfax%2BJ4PBr9IKot%2BVgVSyFccDaqNRZn9yhATgGzAKooWqkZOjh3sAUa5ZLdLYLM1DHIrnBlEzAQry93pNcGqwaeqBZ1GtCcUfXkdFqXqTCYfm6VVWMyAEZrZgWWRhM9QKlrn0U1sbAarzBzWbVPTNBwtSQR2wsq26YSUGQtyP0R5ERxFyqcPVa2h8iYnTLSU8Mle5IV5z2cqJoJ74Du1H6WzGbOKLMUkYIZzp5Qps9Ee0XMs3e1Eqn4GJn7zk2EahtMyjhFupHBcXZKrceZu47UucmI9Q4VfvJfZSuE0Yw0oCXlnFRDrWx7RU%2BxF5WBh%2BwG1Dboe3UwP7swQtuMFvE1BAr2YkU%2FqMHUtjKwVrRWBArVnCeOO41YybZoTXYLANlIY83mH34KsKIINekm5ULxBvTEBucmOhTYYO2Be99QsEcRKrMjXrIbXphqP5soMRXyiZg3RasqokW99up4yj4Q%2FfIl2syi1mT%2F6cSKV6IprlHBvmCwOLGpIKDmRXCTXykrnAjyCyWpGdAV0CjjM3hPGKHQkpjMal61Ilql0BzpLdHa0oniD8oTC3Hw1HY%2BtjJSp1SGnQ404%2FmwFPx8oy2eMCF11ytUyECyqp8ljhFRYaWmmIl4FxHKkt72ioeljMRNZamRcBelGgWWLTBfsU345C0xILhZT0THxmUdpZlGnRCSNxf2g9Rd7zjvLeppd73YbATIMt0FlDa1FqJIJ%2BqRlixZxHXFavuyqYwz6Yl3VYxG519M0PDo%2ByYTPGZlL3nBk9OeUWWJCtMidAYK9cWSfipTglropdPxsZk%2FMTgtG8hKJlh9raK5YKVlhzIQrliTaS%2BMKEq8MzU20eqy8RQuFO%2BRG09rjI5WmRaI95LznkYo3xdPE6CoUKFHi3cosKjOhYjiou%2FAV3kCqtmV3agzIQNXqxSnDe7uEGilMLsTq7%2BEoEt0Fy9LEFkNNko6YVY4A9ZouptRGO8HzxtZ%2F5dUO4lYYRbHa55y8Ve1xwRTuySgKDJmIMzmFWYTYC8aCBaNVYYrg0KKegJPn2Sfl%2FYZO995TYEQI5W9bDcks3iiKFJp%2BrPA85rpNBOTMyT1ZdqJVgEMPS7XyyCFES1q3OMEYFbsTioIVun7Clx1NYMZP2cjAW%2FBxInNzjekr9sNb04Bk6I5ocJSVHKx0GxgP6T%2FC1JhJGgrmip4LqMIZoUFw3QaibDLAxYekTqKoq3KJi%2FRS0yOUKUcL1PhZ80trHphKvIks3iiWUItiy4V8LzTUrPw%2Bibm53G%2FuSfU52w9FKiQPSZTAl2BhyZHRHXCnAor0%2BSjSDHRR%2BE6Ddl0MY5Y1W0ZZfp16e1wichkgZGs5TmkqmSbqwkbLC9YqwoAnjRitE1Eqct71HlJlgNQoG7u%2FjsVvhOhViOYJ2tofWbEUgD8jIj1KlVSppVGpUm2p7apblZ0wtMoJaZ0WVILtGRq%2FVljfTKwShpL2As%2BmZg6O36a7U2cd59NvCj6XS3SWMpVT7LHkOKo5SUCYIOJppca6OwYag4h02miuUIqjIDliRHqlanzZEOEWWHi9l8ilrp5wMTNP9FJkFm2QlaYeWxhVljVbOJ3KSuEC5QjVsggOzi6KMifzldrrSeF6OWI1SbT6ytZoru%2Bl2BGhe0zIpZoRmwTz6tNJhfMjiGn2WfbJkDjyNRmVMhzBFgrCfozmEvITvvJfE1o8o%2Bs0Oc3DLBocY%2BCeJ%2FtF3VFmOijT8V61NEgDNCmJmEm8w3D4nIwuZUjVIkKwc2faSk1u4n3a5GjruhOtQ2prJDbygVNloDVBAVeXo8yPdHWosxNTzLElgl2MfO5VP5h2npFyE8ojW%2FFYolgj3RYKwj2BnP9VGRrQv031Fi4YiECRL0naJHREWumsWbZnOtbyVXc9WxF5iZmgmRWwgWoCb2qmUVRd4NP9JYHzr4pLRY0FFo0z4%2BzWnH%2FaY9aeFTHBHZJiHmBPjQwfz6v3Ke%2B47LGyiJV0CLsSYdpEyvMRCc%2B%2BtzmwXpbijYnAJveVzoo8zTuREhotWXGaBKxGBRIbU3onsox25giDxNlT5ke9MM3YbC2SdRa0lih2A5626OZzjZZlC1qObaJWPcos0sshmmbdHEGUNgZkfTYN%2BWiD6AyVRKgZsKedZSzrlLgEZJBaimIXNENBNbtBhfLDlWjmxdX96uUgsS8xjbRZekcxSBCSr00KVaXgTabdDKZDGIqeqpedLXOgud3SruMu6JBoj2nx8t2w2UtiFdn6aw%2BT2ZYS4DNTlTyOWHr8gs98j6ZNCspTFBatB2bBi9ZZXRRctZo55uKXgzW3Xf8%2FcXf9VdUoLYMWDNB7QUd5olm8SjqqTbjZJ0IOWs6Wj0mWg9iZZbQqxljYkmE0VNZA5HGUtsYJGSOKpo8ZYEIJlHCacqFh225xsoMUdN3hOeTnE4sLYhxD45XmXoW%2BVHHohXQWhvdE3oGKmcdmCxkEiYK1QQAszkRsXwCzBZotsu5YC2Fj1U7MtwPqZ%2BA5fkNAaKsrBK50tVrZms3JAuLyAgQbTO9Zle4hGREw4XJr6WW5yxdp0bJTApEU%2BV4llKLLq7J3ED%2BXkc7DGfe8LOV7IZK94Ja4sjyNbCmvV8RKAmIrThP0YNo5gVwHItf0KSNbCGT2WODe0TPoll2T%2BpTdiZ0WESFFwolf8wpU22ZnhJF6andICNUEm0yYW%2FZdHkFSl7hRZmZ6vssAHC6yFtkJ7ygv0K7wa73f7yARzy%2BlIjUeWMqBM3UAr01Lib2uKaUKrLDuvMujE6vrOOQTXCd7avmrLlYzJ9S3Wx57xBkQdboonzkgQ2hwDKL0O76lnd8k%2FaQwuiejyEVqpJWQGkRDVZ%2F1px3RnoAlnQlwEADhTOdg2wuA4O6430YRZJk4aXF3Cy%2FeVQKas7qmJJEs1%2Fo8NNYuIp6UbSEJQqixr6WWA2SCmW5xvRdvGS0CGgypEX6otFM53BFP%2FE%2BlXmqyNGoU7KtmLaFRU3k8YN9WpDVZced0mTCBsp6uFBxpOdIXzXx2vZqEfpIkyEMZ9nd6R8e97UjUSp77llEi6jHt%2BxNbyhgtM57Eh0vjXmV8g%2FeQKE6jS6iyaizZDETHrZKmHTtjX3KcR%2FfoQdO%2BxoVFhr6mpiXl7YsGy3g7ws3MVflC4%2BX4bbAT4vuPOHqs5NJIWGPF2dukT8nwOau762YabNwfATItqxDlywEFYk2%2Fr8m0WuLgFWxGUoAFNGsfC8dNTMoygotuZcOR6wCjdmsnvnqJF%2FqXvWZLlNue0WjTVqUXF1QykIItke9WgbA2krAssLdVhO9ZUJQZ9tkCSiaK8hRrgCeyv2r24y%2BkszykqREyxREYprXlA%2FGP5y0IRItj7ZlIFNRifcTrTdaY0WaqkJzE701NUhnJ00lCQEwsruQtaQtR1GiKX0XZcSq3x9Ape6tqDJbaTvw%2B7m7IehAiNgntCCqVkRQOWhlKpwAa%2BVWKFlkakmWWB5wC27bG2SIL93Z1ea3zCttq1wkynmPji0incxARWRSkccCZ139fZkKU8c40UcZ3aQDLpz%2FsLZXAJm6OtOLYWX5gJVtxRM%2FpdkK3RFlVujfo0SENNccWEkEyoCQvged%2BeL0MC%2BK2PTkUEZ5cuOD%2BYvRhaHc9ugv949faI7oFFN5eZfXzPkOdFgUwdOCd8AW2b4hZVbshupKyZXV%2FppK%2BUUnwZQu%2BOQVqGsq7JPoMt03atku7hutKJ2uv5pF90CUl6IeZ3wiK6zQYY0KZzbDRD%2BF1FeJNsWsLdNA4Y2eIkG%2BAKQl8BSpMFpLtfRX7R9kdDITRCciyvyULvtsYL26nQvXK6DhbC2LSrLSb%2FmtVyyLhivabEWjTcpIUaG%2FVTUTue8ntx3%2FCuB07l6ZAQp7tsysZRortQsyWgw0i7%2BwXxrBJkapnASQNPXNXn%2F17%2BzzKxNIZEeE0l7B9LqNvtcmXHd83zaZO5h1Pcw1lriyohM9i0rT6MXiepH%2BlujzE%2BjulUXnymAU9cyZxOA%2B9EaNchcao6zPIvqLsmwKEKi%2F%2FiOkwkRHVeiwqrlUCC6DJaHLyrpdHvRNyWiyApwsSnv9tjBLEVFNfXshqjrNxpK0V9Bfsd1QHUhlAUyc33DwTawFUb3iA41Volo66ThnsXxh8ISRzC2HDojliykzgCsXjZr8gdO2ZvT6VqPf7MQWoluoubIu0iwardb4qE1aDlRB21T2LS%2FtZGICb9Jq3YQf5rNxy8xhQXkyYwyikE0MUrtErGwyRdKk5wG4wmn4BX1mBZqcgilq3KPHFwO18v6F5QeyMcnqmCt%2BXoUaS9osiXQp0FJgsTgfwvH3fjyb9rejm7yH%2BSk1BS65Rc452gCT99nEeA09rFmf%2F4rVUJUT1WJ81vxXKIJ70KDHTn8nK2IWnaJt799hddaxUNFfq1d7YOAp8LcJrVc1nK1GjVmnwCSNXynuz8Y9M2952wYRp3x88Tn5vXQy8R2d8IS2ImBYRI8FqktnoVQj0qSNZOkkW2Eyb2G%2FENAe30CrelFENGkzGgz0Va6xFoBlBdMzsx%2BsAMw2%2B8ez42VC3q7rPFgFdK%2B8JjRlJTpbpbtDXAipPgoqDyFIFsAUAat9mWUxFe0xEdvlq3ySGEyv6iIgLSiCX6h1ov2y%2FWRL9IsXxiXlL1BuutbF7DiJLVFx3%2BtUOANJAZAvAUFllJOBtSJNlibmJu8vj0ehM6Q6HlaRDOyoT4Dq3NIjHHULMsQocmkqTNLRWYSJ%2FpmVfavcz5liBRQrYCtnigWQTcfrxfctA%2BmNCzKjWN7%2Bh92QDeCLUWsm6itXepT1hSvYvXhS1bHlehKFx%2Br%2FqZysGeVYVqoqHqN8Yb1QeJ5TYeWERf1Z1cczWqtQwgsAj56Xv8vKZ70g9g26S18Z5yVGwGhXAL0XBXxKhauRoBTiI4p9ZUCKgLQKgF8By%2BLjy8JmwRKas%2FF4aayidbImGiuqF8p1Q98GVvZPRxMpOPNKsrCLo6s4vBgRo8FV6028FfU%2B8z0JMK3yv2ZjIKKTPJYAzyyKaWAVwrP0qWb7FY8XtuNUo1oVeFWRXDhRSyd0Ieq%2BStcWRN9IXL%2BroS4rKb%2BssYoRbAVAFaBcwLUIIp8BYuVkV9qBXvn%2F3rhIOBq98v%2BFUWghQtWpcAYYE1O7FgfOViJCcHWWBi%2FL0lYo6819qxdgCZQTvfbKxcUyJKPEGQBjKlxMQzM6e2dQl04AaUr1vALiFcCvnECbXQR0wlqwQNzKBZPNE1QgerfB7xRcoog1PakU%2FlKAvHuyiiG9fKzZSXklYolWlYo9sxLVo%2FPwKcCOnos7U2QUOaXCtL3lVXAt%2FOP2Zw3UKuheeT4By2dfiC9duG%2BMXUv01RxYBYpLwQZNf2NVvsNRV8%2FVe2YDhfuLIvClKEz2gnz%2BDrDwlmxOt2hzccu2NwE6u1iWLnjTyxGkIAqAlmusd8Bm8U0yj31oichsUZHsua1ShSooF6l%2FetUnd%2BIwS%2BY8zjLOYvTl%2F1U%2BV3qouNpQVXed7QabtKysgE3RpLqSKldb9SpNTpjP3le1WCqvBRfa7AKogPnVqJXtUx7HSrQ6LW6b1KaWgFR9TXzJV8BTeQ3D%2ByVqBO9NFxyrjo8ARBlwn%2FjadHwqF%2BKCthqvnanwzcFcAZeKaMvgLAz0pbRUOAGlzymcQCu44y9fNCsAiFzyBQC9Yje0acRaOLnLJz07cew7rZ7kyeBZdVALBfmXx2p1TFZBTp5eNbq%2FPFbGq828GKHSiLQKxhWQUSZnnzAgqwBafv2dC1QIeV%2BJrquRsxC9PImAVyqcXYkjZVb7i22n9hnYdnHXs22RNmOHXXzfYQGE08f3z22R6SeuePx8qTnE6%2BG2JFJE52TFTa9E42XqK7zn7LxPIlBkCagaVmWbXL5xEsGq0c3oam9R1lNJ6YvR6E%2FZlnhOKxGqHKWK22ZRrE6FVeAFYCiD5Z3BenfQKlfjnzk2s%2FcuXmjLY%2Ffu2EyBNRmg0vY3BupdMK0O2lIPeqXHXLnwq%2FtkOq0KpM%2B4EBcuuHgyxeIAzsBV3mcCwqV9XgBrKwJ6%2BeSJIndqylYnRiwAwQoXin%2FGPvSzXeyGPwsUk5NVOWHVaPUpA754oqvezn%2FLsQr7sQJgrUwtaoXBWBmUTxucKh28eZVWLsK3x2oFlCsR992xsqi74QWP6t0r8933rAz4CkDfeU8LLJeq1qy8b%2BWiWAFGaHu8eAG2jArfAcorJ3%2F1arIXrqxXr8iXxPtqlMre9xkX0rvRbAG8ORV%2BEsBWuNzeHbDPHLw35cFnSIG3xuGViPxJ0bAOLFrd7%2BDVVwZahPxy2UCl68k%2BlcHzxYFtK%2F%2FfZHw%2BPZH4BEB68XNnwGpf3g3vq1ffK0nBm9T06VfuvzGb%2FLOBtGwzFT%2B3fem9f%2Fn%2F%2Bc%2F8Gwa%2B2X%2Fzn38DSFd%2F%2FvNL7%2F3%2FmtnD%2Fufnf34%2B7%2Bdf%2F28AkXg9KZ7Ze3oAAAAASUVORK5CYII%3D)center no-repeat;cursor:crosshair}.miniColors-hues{position:absolute;top:5px;left:160px;width:20px;height:150px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAACWCAIAAABRkz%2BJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw%2FeHBhY2tldCBiZWdpbj0i77u%2FIiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8%2BIDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0FDOTcyRjQzNEFFMTFFMDg1NENGREUxMTA5MjQ5M0QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0FDOTcyRjUzNEFFMTFFMDg1NENGREUxMTA5MjQ5M0QiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3QUM5NzJGMjM0QUUxMUUwODU0Q0ZERTExMDkyNDkzRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3QUM5NzJGMzM0QUUxMUUwODU0Q0ZERTExMDkyNDkzRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI%2FPnzKFbcAAAcCSURBVHjanFnbcttGDMVZsbVlp0knb52%2B9%2F8%2Fqh%2FQNrElpxVR7B3YxVJOlExCUQviDhyA%2BPOPTyfsoPhh5vQ%2FIf2h8k3%2BZwDyI1DvMN0obL%2FTG%2FFO4yeeH79WDuX5jI3oM5Eizg%2FXXPoT0s3yiHhSiD8RdiJ7VDMRAk3WDwgxPsbntOfpT4A6ytOBSPyh02F4Bso%2FXAQlsBKMROxnpR4XQqBf98PGAUlnPCuelJ5dlWxHy7W1f%2BRcxKbRYN1CnPmoi0YcnpNVtbawMmZzotu1yiI6nwufrsygKo0%2F1YeK2E%2FFk01zLIIEKk7i%2BUgsnENXj6y2TYD8dO153pO1u2F1GLFRfn4chHN4jJyZfJvn82GMrejRfU86y5cw8KtWoEoZJoOFSPyYxA7KKzacMNm%2FPEKIQ%2BJcMtGm1BCVQYlTXaV0DiqMoNO4Kd8sL38j53OUGZOd5q%2FmgrOrHovCQw3pF9kWqnx1P2fOzbxBx7YNDMM%2Fi00PFE69vmk7B1W6eIoEZM4xPK2EONSZtM6ROPQIYZtcNpN6egrxjoeA0PUE%2BR8MD%2BJdxL4SnZrx29Nh8pobZ1XCpFxvV24alxLG7JVh2xR2TsQX5mxr1rnIo4V6gUg%2F7Yl%2Be0vcYMXT9bt5qpTAeiBzppZT3d5syrFWuNklchbiQKqKsAoSnmtYfVrjHKDsVLU31rYtIN%2BJnK8SH6oVS6seUwAqtZUeSeydA3oCsS0n3RA89psktliLVVx7tV6naTNNJH7JOu%2BJGDVOJptn5NH9nM6In9HhhxtVbJu0%2BmyvPEVfrWI8N3wYg2%2Bvka%2ByBdPywlxHI0fOcEsfe%2BGhwljkE86mqvmfhRTR2rpyur1q1L8aL3LOMTCgoHaTFLYZjm1fvdTV4anTbbDJ9pJShBXu0dczpOipImJ%2FmTm44TFFiNzfvmTc5QIXT2BWyCNxttk3aq57Loy%2Ft3%2BAG4MNFLZgCE7PyYVeSi8XWi6JBbJAnXqesnXKFqHrFEJsI5K1HdAh5bb%2FPIbuUPxYFT1YYLzRWSaPZVCvYrxE2P7AujzpMJ5doNM%2B5jOfTa43AGzEHqo%2FcrETsH6e4DIvEtuYJpbFRLwqBvNXOzgoziuz0CR2Mxg9dujoVxMeG1W1mOj8dFB%2BDr2WdIYD6t%2FncSHmOg554q3URmxWSWd4R%2FnenUQMAxB5crXr9ogrkMQO%2FP1Gi929%2Bhmr4WmN6XbtZ1fIVdhy9vND0tnpRuoazjiXxU6uCjhqbq44RmxMYvNhbHc%2FBzoCB3PO7UXnWkiPbcvT5uLGifNJKTYHKRaRc2s6Y3Iv1onNzWDbjU78HYnVXRWnmwuxVboBxgPJ9zIaXYvcDVoMVb%2FVXtbLE%2BF8U8T8vkq%2F94SuxDxhgWGfZLZN%2BXTWmcIIh2CjmedFQiZma7DWFIfg5EkXbpxbfDLTMsVG7YX4rSwElmpzx2Lm1yh2gq7jqA4zJ7ECNax3Brjk8m8GRj1wr4BWNZgqoHrJxDCzZQM1BbsUg2HcoQxzvoYsbZhkqsRubHgDtJopIucXszpyNpZeryl7Enrtk%2FfdZISecTkZbJZ2XtjMw3tssSI2T6WTbW3BVJXr6vKrOT3X6gmKtDMSJC%2BqP9u5j21U98QsAF90%2FqrmiaGAkGvlirGRxd4XOyWL1sdVSdy4%2Fp22zPeqD6vZvngriNh%2FxRE1DNMC%2Bz2K9U3Jh9d1u8HhaLuXTdhBJByF3OZnLN9DRmrltd7buR2rSrR9JvrXzhg4RLA5lITnT0L8m3mXcK%2B%2Fq6lL6Ldftf3ttMt2eczzOPhx2gS4WB9ebmy%2F2CjsxKqQs9qf9HxHJmbP1RMUNGVqT2I%2Fz4CCj2CFKiRCPHHGEMU%2BAkzjYAS9YewtZpBFH7kApbno%2FKG998ilXr8DodFCw%2Fi2naFEdper3tI5d5HtadoEz0M62x1khdvCua370d8sEdaDluZ8bpl1dyJxrJ0LyQF2XCwjo9hPKJt8fwFl%2Fdz3T3G4oe2xLdPt3hUDUICt3HvaPp651j%2BowNIYZGqxGYVEsWUmO7UcgvfGyEZbfg3BCesng3FZrPtZ5cVMAvpZZ4wjRu5k%2FoatqnXLnE%2Fwqgyc6UafiTqHb%2FFNxLuAPtunyJiANwU9ecL1q75TZoyrwa3LKXg25y0Tz6t1WkyUA2dcCWG9pFg0fOQdYBsxlmK7snSd1Vu2OyOwT%2BzisKPXoWnjiuuPLVky54tX7vhwos5QVYhlSkC4h0DceHN0dlcy3uSPovOcMjjcUzWDGZ158dp5seraCg5zXYL1VgzN2uEQOy3addq4XhbrBdDxkisW%2FTZi3EFArs64eGF8sPBAx82JM99bXS72H0nnY6S53rwkzu%2BpG16vT%2BHJP5RVWLmK3pEkQnz9zzZ3OCUacBwhvep%2FAQYA%2FfsCsjFZHQIAAAAASUVORK5CYII%3D)center no-repeat;cursor:crosshair}.miniColors-colorPicker{position:absolute;width:11px;height:11px;background:url(data:image/gif;base64,R0lGODlhCwALAJECAAAAAP%2F%2F%2F%2F%2F%2F%2FwAAACH5BAEAAAIALAAAAAALAAsAAAIflINoG%2BAeGFgGxEaXxVns2X2dh4CZJXBadDxQlihGAQA7)center no-repeat}.miniColors-huePicker{position:absolute;left:-3px;width:26px;height:3px;background:url(data:image/gif;base64,R0lGODlhGgADAIAAAP%2F%2F%2FwAAACH%2FC1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3QUM5NzJGODM0QUUxMUUwODU0Q0ZERTExMDkyNDkzRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3QUM5NzJGOTM0QUUxMUUwODU0Q0ZERTExMDkyNDkzRCI%2BIDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjdBQzk3MkY2MzRBRTExRTA4NTRDRkRFMTEwOTI0OTNEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjdBQzk3MkY3MzRBRTExRTA4NTRDRkRFMTEwOTI0OTNEIi8%2BIDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY%2BIDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8%2BAf%2F%2B%2Ffz7%2Bvn49%2Fb19PPy8fDv7u3s6%2Brp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M%2FOzczLysnIx8bFxMPCwcC%2Fvr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ%2BenZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8%2BPTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAAAAAAAsAAAAABoAAwAAAguEj6ka7Q%2BjW7SeAgA7)center no-repeat}');
		
		GM_addStyle('#fv-edit-emoticonlist-panel p { margin:10px 0; } #fv-edit-emoticonlist-panel p:first-child span.emoticon-remove { display:none; } .emoticon-preview{ padding-left: 5px;padding-right:3px; } .emoticon-remove { color:red; cursor:pointer;} .emoticon-add { color:green; cursor:pointer;}');
		
		$('body').prepend('<div class="above_body"></div><div class="body_wrapper"><div class="breadcrumb"id="breadcrumb"><ul class="floatcontainer"><li class="navbithome"><a accesskey="1"href="index.php"><img alt="Home"src="/images/vmg/misc/navbit-home.png"title="Home"></a></li><li class="navbit"><a href="usercp.php">Settings</a></li><li class="navbit lastnavbit"><span>Edit FireVortex</span></li></ul><hr></div><br style="clear:both;"/><div id="usercp_content"><div class="cp_content"><form id="profileform"class="block"><h2 class="blockhead">Edit FireVortex Settings</h2><div class="blockbody formcontrols settings_form_border"><h3 class="blocksubhead">General</h3><div class="section"><div class="blockrow"><label for="myPage">My FireVortex</label><div class="rightcol"><select tabindex="1" id="myPage" class="primary" name="myPage"><option value="1">Enable</option><option value="0">Disable</option></select></div><div class="rightcol"><label for="myPageItemsNewPostThreadSubscriptions">New Post Items</label><select tabindex="1" id="myPageItemsNewPostThreadSubscriptions" name="myPageItemsNewPostThreadSubscriptions"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option><option value="35">35</option></select></div><div class="rightcol"><label for="myPageItemsThreadSubscriptions">Thread Subscription Items</label><select tabindex="1" id="myPageItemsThreadSubscriptions" name="myPageItemsThreadSubscriptions"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option><option value="35">35</option></select></div><div class="rightcol"><label for="myPageItemsRecentThreads">Recently Viewed Threads Items</label><select tabindex="1" id="myPageItemsRecentThreads" name="myPageItemsRecentThreads"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option><option value="35">35</option></select></div><div class="rightcol"><label for="myPageItemsRecentSearches">Recent Search Items</label><select tabindex="1" id="myPageItemsRecentSearches" name="myPageItemsRecentSearches"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option><option value="35">35</option></select></div><p class="description">Displays New Posts, Subscribed Topics, and Subcribed Forums feeds on forum homepage when logged in.</p></div><div class="blockrow"><label for="fullIgnoreUser">Extend Ignore Users</label><div class="rightcol"><select tabindex="1"id="fullIgnoreUser"class="primary"name="fullIgnoreUser"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Removes threads started by,quotes,and removes vBulletins ignore user message post.</p></div><div class="blockrow"><label for="keyBindHidePage">Hide Page</label><div class="rightcol"><select tabindex="3"id="keyBindHidePage"class="primary"name="keyBindHidePage"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Use the keyboard shortcut:alt+z which toggles page blank.</p></div><div class="blockrow"><label for="superSizeMe">SuperSize Forums</label><div class="rightcol"><select tabindex="2"id="superSizeMe"class="primary"name="superSizeMe"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Removes all extra whitespace,banners,header and footer.<a href="http://adblockplus.org/en/">Adblock Plus</a> (available for Chrome too) is recommended to increase browsing performance. Enter this filter subscription url: http:\/\/update.firevortex.net\/abp\/vmg.supersizeme.txt</p><p class="description">You can add filter subscriptions by opening Adblock Plus preferences.Then add a new subscription by going to menu Filters/Add filter subscription.Once you are done with your changes click OK.</p></div></div><h3 class="blocksubhead">Forums</h3><div class="section"><div class="blockrow"><label for="forumKillThreads">Kill a Thread</label><div class="rightcol"><select tabindex="4"id="forumKillThreads"class="primary"name="forumKillThreads"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Removed selected threads from view within a forum category</p></div><div class="blockrow"><label for="forumKillAllStickies">Kill Stickies</label><div class="rightcol"><select tabindex="5"id="forumKillAllStickies"class="primary"name="forumKillAllStickies"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove stickies</p></div><div class="blockrow"><label for="forumKillAllLocks">Kill Locked</label><div class="rightcol"><select tabindex="6"id="forumKillAllLocks"class="primary"name="forumKillAllLocks"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove locked threads</p></div><div class="blockrow"><label for="previewHover">Preview Posts</label><div class="rightcol"><select tabindex="7"id="previewHover"class="primary"name="previewHover"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Preview the first or last post for a given thread.</p></div><div class="blockrow"><label for="forumThreadsPreview">Preview Topics</label><div class="rightcol"><select tabindex="7"id="forumThreadsPreview"class="primary"name="forumThreadsPreview"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Preview new topics for a given forum.</p></div><div class="blockrow"><label for="forumLinkedClassifieds">Linked Classifieds</label><div class="rightcol"><select tabindex="7" id="forumLinkedClassifieds" class="primary" name="forumLinkedClassifieds"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Display new topics feeds for linked Parts and Cars classifieds in a sub model forum</p></div><div class="blockrow"><label>Page Refresh Timer</label><div class="rightcol"><label for="forumRefresh"></label><select tabindex="4"id="forumRefresh"class="primary"name="forumRefresh"><option value="1">Enable</option><option value="0">Disable</option></select></div><div class="rightcol"><label for="forumRefreshRate">Rate(Minutes)</label><select tabindex="1"id="forumRefreshRate"name="forumRefreshRate"><option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option></select></div><p class="description">Auto-refresh a forum category and my post pages.</p></div></div><h3 class="blocksubhead">Topics</h3><div class="section"><div class="blockrow"><label for="threadQuickReply">Quick Reply</label><div class="rightcol"><select tabindex="1"id="threadQuickReply"class="primary"name="threadQuickReply"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description"></p></div><div class="blockrow"><label for="threadFirstPostExcerpt">View First Post Excerpt</label><div class="rightcol"><select tabindex="2"id="threadFirstPostExcerpt"class="primary"name="threadFirstPostExcerpt"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Displays the excerpt of the first post on each page.</p></div><div class="blockrow"><label for="threadKillQuotedImages">Remove Quoted Images</label><div class="rightcol"><select tabindex="3"id="threadKillQuotedImages"class="primary"name="threadKillQuotedImages"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove(replaced with a link)images within quoted posts.</p></div><div class="blockrow"><label for="threadKillQuoteInSigs">Remove Quotes in Signatures</label><div class="rightcol"><select tabindex="3"id="threadKillQuoteInSigs"class="primary"name="threadKillQuoteInSigs"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove quotes within signatues.</p></div><div class="blockrow"><label for="threadKillItalicQuotesText">Remove Italic text in Quotes</label><div class="rightcol"><select tabindex="3" id="threadKillItalicQuotesText" class="primary" name="threadKillItalicQuotesText"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Remove the italics font from quoted text</p></div><div class="blockrow"><label for="emoticons">Enable Emoticons</label><div class="rightcol"><select tabindex="3" id="emoticons" class="primary" name="emoticons"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description">Enable custom emoticons on thread reply/post/quick reply.</p></div><div class="blockrow singlebutton"><label>Emoticons:</label><div class="rightcol"><a id="fv-edit-emoticonlist" class="button">Edit Emoticon List</a></div><div id="fv-edit-emoticonlist-panel"></div><p class="description">Add your own emoticon image links (use full url, ie http://somedomain.com/someonestolenimage.gif ).</p></div></div><h3 class="blocksubhead">Highlight</h3><div class="section"><div class="blockrow"><label for="threadUserHighlight">User Highlight</label><div class="rightcol"><select tabindex="3"id="threadUserHighlight"class="primary"name="threadUserHighlight"><option value="1">Enable</option><option value="0">Disable</option></select></div><p class="description"></p></div><fieldset class="blockrow"><legend>Highlight Colors</legend><ul class="group"><li><select tabindex="3" id="threadUserHighlightOwn" class="primary" name="threadUserHighlightOwn"><option value="1">Enable</option><option value="0">Disable</option></select><label for="threadUserHighlightColorOwn">Self:</label><input type="hidden" value="" name="threadUserHighlightColorOwn" id="threadUserHighlightColorOwn" class="colors"></li><li><select tabindex="3" id="threadUserHighlightAdvertisers" class="primary" name="threadUserHighlightAdvertisers"><option value="1">Enable</option><option value="0">Disable</option></select></li><li><label for="threadUserHighlightColorBanner">Banner Advertiser:</label><input type="hidden" value="" name="threadUserHighlightColorBanner" id="threadUserHighlightColorBanner" class="colors"></li><li><label for="threadUserHighlightColorClassified">Classified Advertiser:</label><input type="hidden" value="" name="threadUserHighlightColorClassified" id="threadUserHighlightColorClassified" class="colors"></li><li><label for="threadUserHighlightColorForum">Forum Advertiser:</label><input type="hidden" value="" name="threadUserHighlightColorForum" id="threadUserHighlightColorForum" class="colors"></li><li><select tabindex="3" id="threadUserHighlightVMG" class="primary" name="threadUserHighlightVMG"><option value="1">Enable</option><option value="0">Disable</option></select></li><li><label for="threadUserHighlightColorVMG">VMG Staff, Moderators, Admins</label><input type="hidden" value="" name="threadUserHighlightColorVMG" id="threadUserHighlightColorVMG" class="colors"></li><li><label for="threadUserHighlightColorFV">FireVortex Admin</label><input type="hidden" value="" name="threadUserHighlightColorFV" id="threadUserHighlightColorFV" class="colors"></li><li><select tabindex="3" id="threadUserHighlightIgnore" class="primary" name="threadUserHighlightIgnore"><option value="1">Enable</option><option value="0">Disable</option></select><label for="threadUserHighlightColorIgnore">Ignored Users</label><input type="hidden" value="" name="threadUserHighlightColorIgnore" id="threadUserHighlightColorIgnore" class="colors"></li><li><select tabindex="3" id="threadUserHighlightBuddy" class="primary" name="threadUserHighlightBuddy"><option value="1">Enable</option><option value="0">Disable</option></select><label for="threadUserHighlightColorBuddy">Friends and Following</label><input type="hidden" value="" name="threadUserHighlightColorBuddy" id="threadUserHighlightColorBuddy" class="colors"></li><li><select tabindex="3" id="forumSubscriptionHighlight" class="primary" name="forumSubscriptionHighlight"><option value="1">Enable</option><option value="0">Disable</option></select><label for="forumSubscriptionHighlightColor">Subscribed Forums</label><input type="hidden" value="" name="forumSubscriptionHighlightColor" id="forumSubscriptionHighlightColor" class="colors"></li><li><select tabindex="3" id="threadSubscriptionHighlight" class="primary" name="threadSubscriptionHighlight"><option value="1">Enable</option><option value="0">Disable</option></select><label for="threadSubscriptionHighlightColor">Subscribed Topics</label><input type="hidden" value="" name="threadSubscriptionHighlightColor" id="threadSubscriptionHighlightColor" class="colors"></li></ul><p class="description"></p></fieldset></div></div><div class="blockfoot actionbuttons settings_form_border"><div class="group"><input id="savefvsettings"type="submit"accesskey="s"tabindex="1"value="Save Changes"class="button"></div><div class="confirm"></div></div></form></div></div><div id="usercp_nav"><div class="block"></div></div></div>');
		
		$('#fv-footer').append('<p style="margin-top:10px;"><a href="'+ SERVER_HOST +'/profile.php?do=debugfirevortex"">Debug FireVortex Data and Settings</a></p><p>FireVortex was Created <time class="timeago" datetime="Sun Feb 25 2007 22:14:53">Sun Feb 25 2007</time></p>');
		
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
		$('#myPageItemsRecentThreads option[value="'+ FireVortex.Config.getMyPageItemsRecentThreads() +'"]').attr("selected",true);
		$('#myPageItemsRecentSearches option[value="'+ FireVortex.Config.getMyPageItemsRecentSearches() +'"]').attr("selected",true);
		
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
			FireVortex.Config.setMyPageItemsRecentThreads( $('#myPageItemsRecentThreads :selected').attr('value') );
			FireVortex.Config.setMyPageItemsRecentSearches( $('#myPageItemsRecentSearches :selected').attr('value') );

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

		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Recently Viewed Thread List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_recentviewedthreads' ) ) +"</code></p></div>" );

		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Recent Searches List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject('fv_recentsearches') ) +"</code></p></div>" );
		
		$('.cp_content').append( "<div style='margin-bottom:25px;'><h2>Recent Product Searches List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject('fv_recentviewedproductsearch') ) +"</code></p></div>" );
		
		$('.cp_content').append( "<div><h2>Emoticon List</h2><p style='margin-top:5px;'><code>"+ JSON.stringify( getStorageObject( 'fv_emoticonlist' ) ) +"</code></p></div>" );

datalength = 1024 * 1024 * 5 - unescape( encodeURIComponent( JSON.stringify( w.localStorage ) ) ).length;
		$('.cp_content').append( "<div style='margin-top:25px;'><h2>Storage</h2><p style='margin-top:5px;'><code>"+ datalength +" / 5242880 (5MB) </code> - <a style='color:red' id='fv-debug-resetalldata' href='"+ SERVER_HOST +"/profile.php?do=debugfirevortex'>Delete all saved data</a></p></div>" );
		
		$('#fv-debug-resetalldata').click(function(e) {

			var r = confirm("This will reset all data storage");
		
			if ( r == true ) {
				FireVortex.Scripts.logout();
				
				w.localStorage.removeItem('fv_emoticonlist');
				
			} else {
				
			}
			
		});
		
		
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
		this._booleanProperty("myPageItemsRecentThreads", '15');
		this._booleanProperty("myPageItemsRecentSearches", '15');

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


//yShout

var YShout = function() {
	var self = this;
	var args = arguments;

	self.init.apply(self, args);
};

var yShout;

YShout.prototype = {
	animSpeed: 300,
	p: [],
		
	init: function(options) {
		yShout = this;
		var self = this;
		
		this.initializing = true;
		
		var dOptions = {
			yPath: 'http://shout.firevortex.net/',
			log: 2
		};

		this.options = jQuery.extend(dOptions, options);

		this.postNum = 0;
		this.floodAttempt = 0;
		
		this.load();

	},
	
	load: function(hidden) {
		if ( $('#fv-ot-yshout').length == 0 ) return;

		if (hidden) $('#fv-ot-yshout').css('display', 'none');
		
		this.ajax(this.initialLoad, { 
			reqType: 'init',
			yPath: this.options.yPath,
			log: this.options.log
		});
	},
	
	initialLoad: function(updates) {
		if (updates.yError) alert('There appears to be a problem: \n' + updates.yError);
		this.d('In initialLoad');
		var self = this;
		
		this.prefs = jQuery.extend(updates.prefs, this.options.prefs);
		this.initForm();
		this.initRefresh();
		this.initLinks();
		
		if (this.prefs.flood) this.initFlood();

		if (updates)
			this.updates(updates);
		
		if ( !this.prefs.doTruncate ) {
			$('#fv-ot-ys-posts').css('height', $('#fv-ot-ys-posts').height + 'px');
		}

		if (!this.prefs.inverse) {
			var postsDiv = $('#fv-ot-ys-posts')[0];
			postsDiv.scrollTop = postsDiv.scrollHeight;
		}

		this.markEnds();
		
		this.initializing = false;
	},

	initForm: function() {
		this.d('In initForm');

		var postForm = 
			'<form id="ys-post-form"' + (this.prefs.inverse ? 'class="ys-inverse"' : '' ) + '><fieldset><input id="ys-input-message" value="' + this.prefs.defaultMessage + '" type="text" accesskey="M" maxlength="' + this.prefs.messageLength + '" spellcheck="true" class="ys-before-focus" />' +
				(this.prefs.showSubmit ? '<input id="ys-input-submit" value="' + this.prefs.defaultSubmit + '" accesskey="S" type="submit" />' : '') +
				'<a href=\"javascript:linkIt()\" title ="Create Link"><img border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAASAAAAEgARslrPgAAA09JREFUeNpNk81PHHUAhp+Z2WV2YT/Y8lVZF0xpClWkSqhtwmKCUoVQY5pUwagx4eTF8B948oIXjYlejErSxGq91INiIFgMxRQDpjRCEVAKZXe7bNldFmZ2Pn4z40FteM9PnryXR/I8j6MbnRvpAd4DzgJ1gA/YB+Y91/vsk56vfjrKS/8LRudGfMA4cPmVRJ8aC9ZR0qvQLRCOgSDLdGZCOMKZEsJ5/YuBbw4fCUbnRvzAja7ap7pfSvRSMlRMLDZKEhWeyp7u4gmLIDoZc5aF9MIdYYvnv37t+r7835PxzppT3cnGLvKOhS1LCCFTFhXoVJA3VXaNIDv7fppCz9F1vLXDMu2rAErhwnYS+PDNUxeVPxyNDGXKruDQCJE3/ZQMWE8dsK9pqLE9pOg652vbmF757cSV+fEl5dzIsx+93HiuXVKCZGQBXj2POSEWswplQ2YldYgbKKA2/4kZWSfnFvAVHNprEvLivdVjPuBsIhLntp4mF5B5UmnBRbC1a2EYZaLHPUrHJtlwi2B6VAuV9ZxJ3xOd2KZ42gfUVPqq2NLT7Jo64coTFK0whYJLtM6gPqaTc56hZC6hegccPNwjX6wkFAxjW6La53meJHlgmSU8Evj8DhO3bKRgiMyGQPYiNNaVCR/0UErZGCxgW5vgeQghJJ8j3HzJKsVrlGrCgTNspVykrVVaeMjj9TWs3sxwhzZsWXDGXaatqYV0NsD87F1c0yv5hC1+v5ffjp+sTDCVmkX79ZDOYJyhobfRNI2WnR18s/NoNrwzfJlAhZ9MJsPi4iLRTMxUOoZO7y3vbr4xeDIp35iaJrYb4uKrl3j/48+5fvUKm5t/09IUx9zP8fP0NNe+u0ZBz9Dbc4HCdtEvfzn47aRl2j9OrvxCeC9INBwFoPr8ALphMjw8TDKZZGBggP7+fgyzjNJq/MtEq2UfgG3ab82s375ZS6SDXBYA/db3SJ7L2NgYVVVVAGiahufC0sR9ffBdKlOplPEopv5PXwjrKeOHyF+x5IvdfVI8nsAvK2SzWdbW1lBVlebmZhoaGrCFXdy5v8PMzMwD6WjOra2tSn1v7WjoQeSDxvrGgFqhShISd6XloqM4m+2i47SEhGmaTjqdzmmadukf+rikqtXp4HYAAAAielRYdFNvZnR3YXJlAAB42nNMyU9KVfDMTUxPDUpNTKkEAC+cBdSuDKlNAAAAAElFTkSuQmCC"></a>&nbsp;<a href=\"javascript:linkImg()\" title ="Insert Image"><img border ="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAArwAAAK8AFCrDSYAAAB8UlEQVR42qWTPWtUQRSGnzP33r33Zhd2IRvDRqIkAcEiiKmM/gELCxurpLCQ9AEbf4S/QUxnoZWFWBj/QUCwCISIoOaLfGw2m+zcnTljEbNmN0GEDNPNOc855533SAiBq5wYYOn9yktVmTsuNLPukqiBGkkMWcKrZ49nFmMADTL/6MH4SJZlIhL9s2JHwbsu7z6tPQVOAcdW0zTNZOnzPh12ackqE6Pb5EkTF5S9w5yva1WGwm1ihnn+ZAKvIr0RCgfGRBiBwmwyUd8mLX2naVs474jTlMnxBt/Wy9RKdVQHNABQwBjBhh1KyT4HJ02s71A4hwtt0jSlbXOGc0Mg9ITpB4gQnGJ9l46znHQthTq8AtIlqCc2wvmfMz2hwykgY4RWu0wgwarHOo9IiXarQqU0RhQZCHJxhBBOR6hE1/m5uUU122CobEjFcbQ3xNZmg0Z1ktj8Te4BwnlAco2x/C4/VpapVX4h3pN0RrgxNU8la+BV+2zR18Hq7gJeFa/KLbvD7PhNFFjf2OLD0Qv0UFFV4ONAByEgwMOZxd5DNH3AcXuXbOML9fsLzEVJnzPPdIwB5BK/+ryGz2vY+tQlfhwQMUukiXard0bvgcgfVDi7F5KdK4gjCT1AKZY3b5fXZwsfpv9nOeMIEsNrALnqOv8GBm/ak/c4FDIAAAAuelRYdFNvZnR3YXJlAAB42vNNTC7Kz01NyUxUcMssSi3PL8ouVvCNUDAyMDABAJYuCXpmsVrSAAAAAElFTkSuQmCC"></a>&nbsp;<span style="float:right;"><a title="Min" style="font-size: 120%" id="fv-ys-togglesb">-</a>&nbsp;|&nbsp;<a href="/forumdisplay.php?5224" id="fv-ys-closesb">Close</a></span></fieldset></form>';

		var postsDiv = '<div id="fv-ot-ys-posts"></div>';

		if (this.prefs.inverse) $('#fv-ot-yshout').html(postForm + postsDiv);
		else $('#fv-ot-yshout').html(postsDiv + postForm);
		
		$('#fv-ot-ys-posts').before('<div id="ys-before-posts"></div>').after('<div id="ys-after-posts"></div>');
		
		$('#ys-post-form').before('<div id="ys-before-post-form"></div>').after('<div id="ys-after-post-form"></div>');
		
		var self = this;

		var defaults = { 
			'ys-input-message': self.prefs.defaultMessage
		};

		var keypress = function(e) { 
			var key = window.event ? e.keyCode : e.which; 
			if (key == 13 || key == 3) {
				self.send.apply(self);
				return false;
			}
		};

		var focus = function() { 
			if (this.value == defaults[this.id])
				$(this).removeClass('ys-before-focus').addClass( 'ys-after-focus').val('');
		};

		var blur = function() { 
			if (this.value == '')
				$(this).removeClass('ys-after-focus').addClass('ys-before-focus').val(defaults[this.id]); 
		};

		$('#ys-input-message').keypress(keypress).focus(focus).blur(blur);

		$('#ys-input-submit').click(function(){ self.send.apply(self) });
		$('#ys-post-form').submit(function(){ return false });
		
		$("#fv-ys-closesb").click(function(){
			w.sessionStorage.removeItem('fv_launchshoutbox' );
			w.sessionStorage.removeItem('fv_minmaxshoutbox' );
		});
		
		$('#fv-ys-togglesb').click(function() {
			
			var minmax = getSessionObject('fv_minmaxshoutbox' );
			
			if ( minmax.open ) {
				minmax = { open: false };

				$(this).attr('title','Max').text('+');
				
				$('#fv-ot-yshout').animate({height:'84px'}, 500);
				
			} else {
				minmax = { open: true };
				
				$(this).attr('title','Min').text('-');
				
				$('#fv-ot-yshout').animate({height:'350px'}, 500);
				
			}
			
			setSessionObject('fv_minmaxshoutbox' , minmax);
			
			return false;
			
		}).css( 'cursor', 'pointer');
		
		
	},

	initRefresh: function() {
		var self = this;
		if (this.refreshTimer) clearInterval(this.refreshTimer)
		this.refreshTimer = setInterval(function() {
			self.ajax(self.updates, { reqType: 'refresh' });
		}, this.prefs.refresh); // ! 3000..?
	},

	initFlood: function() {
		this.d('in initFlood');
		var self = this;
		this.floodCount = 0;
		this.floodControl = false;

		this.floodTimer = setInterval(function() {
			self.floodCount = 0;
		}, this.prefs.floodTimeout);
	},

	initLinks: function() {
		if ($.browser.msie) return;
		
		var self = this;

	},
	
	send: function() {
		if (!this.validate()) return;
		if (this.prefs.flood && this.floodControl) return;

		var postNickname = loggedin_username();
		var postMessage = $('#ys-input-message').val();

		this.ajax(this.updates, {
			reqType: 'post',
			nickname: postNickname,
			message: postMessage
		});

		$('#ys-input-message').val('')

		if (this.prefs.flood) this.flood();
	},

	validate: function() {
		var nickname = loggedin_username,
				message = $('#ys-input-message').val(),
				error = false;

		var showInvalid = function(input) {
			$(input).removeClass('ys-input-valid').addClass('ys-input-invalid')[0].focus();
			error = true;
		}

		var showValid = function(input) {
			$(input).removeClass('ys-input-invalid').addClass('ys-input-valid');
		}

		if (nickname == '' || nickname == this.prefs.defaultNickname) error = true;

		if (message == '' || message == this.prefs.defaultMessage)
			showInvalid('#ys-input-message');
		else
			showValid('#ys-input-message');

		return !error;
	},

	flood: function() {
		var self = this;
		this.d('in flood');
		if (this.floodCount < this.prefs.floodMessages) {
			this.floodCount++;
			return;
		}

		this.floodAttempt++;
		this.disable();

		if (this.floodAttempt == this.prefs.autobanFlood)
			this.banSelf('You have been banned for flooding the shoutbox!');
			
		setTimeout(function() {
			self.floodCount = 0;
			self.enable.apply(self);
		}, this.prefs.floodDisable);
	},

	disable: function () {
		$('#ys-input-submit')[0].disabled = true;
		this.floodControl = true;
	},

	enable: function () {
		$('#ys-input-submit')[0].disabled = false;
		this.floodControl = false;
	},
	
	findBySame: function(ip) {
		if (!$.browser.safari) return;
		
		var same = [];
		for (var i = 0; i < this.p.length; i++)
			if (this.p[i].adminInfo.ip == ip) 
				same.push(this.p[i]);
		
		for (var i = 0; i < same.length; i++) {
			$('#' + same[i].id).fadeTo(this.animSpeed, .8).fadeTo(this.animSpeed, 1);
		}
	},
	
	updates: function(updates) {
		if (!updates) return;
		if (updates.prefs) this.prefs = updates.prefs;
		if (updates.posts) this.posts(updates.posts);
		if (updates.banned) this.banned();
	},

	banned: function() {
		var self = this;
		clearInterval(this.refreshTimer);
		clearInterval(this.floodTimer);
		if (this.initializing) {
			$('#ys-post-form').css('display', 'none');
		} else {
			$('#ys-post-form').fadeOut(this.animSpeed);
		}
		
		if ($('#ys-banned').length == 0) {
			$('#ys-input-message')[0].blur();
			$('#fv-ot-ys-posts').append('<div id="ys-banned"><span>You\'re banned for some silly reason but don\'t fear, just send me an IM and say please! (rich!) <a href="#" id="ys-unban-self">:</a></span></div>');

			$('#ys-banned-cp-link').click(function() {
				self.openCP.apply(self);
				return false;
			});
			
			$('#ys-unban-self').click(function() {
				self.ajax(function(json) {
					if (!json.error)
						self.unbanned();
					 else if (json.error == 'admin')
						alert('You can only unban yourself if you\'re an admin.');
				}, { reqType: 'unbanself' });
				return false;
			});
		}		
	},

	unbanned: function() {
		var self = this;
		$('#ys-banned').fadeOut(function() { $(this).remove(); });
		
		this.initRefresh();
		
		$('#ys-post-form').css('display', 'block').fadeIn(this.animSpeed, function(){
			self.reload();
		});
	},
	
	posts: function(p) {
		for (var i = 0; i < p.length; i++) {
			this.post(p[i]);
		}
		
		this.truncate();
		
		if (!this.prefs.inverse) {
			var postsDiv = $('#fv-ot-ys-posts')[0];
			postsDiv.scrollTop = postsDiv.scrollHeight;
		}
	},

	post: function(post) {
		var self = this;
	
		var pad = function(n) { return n > 9 ? n : '0' + n; };
		var date = function(ts) { return new Date(ts * 1000); };
		var time = function(ts) { 
			var d = date(ts);
			var h = d.getHours(), m = d.getMinutes();

			if (self.prefs.timestamp == 12) {
				h = (h > 12 ? h - 12 : h);
				if (h == 0) h = 12;
			}

			return pad(h) + ':' + pad(m);
		};

		var dateStr = function(ts) {
			var t = date(ts);

		  var Y = t.getFullYear();
		  var M = t.getMonth();
		  var D = t.getDay();
		  var d = t.getDate();
		  var day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][D];
		  var mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][M];

		  return day + ' ' + mon + '. ' + d + ', ' + Y;
		};

		var self = this;

		this.postNum++;
		var id = 'ys-post-' + this.postNum;
		post.id = id;
		
		post.message = this.links(post.message);
		post.message = this.colors(post.message);
		post.message = this.images(post.message);
		post.message = this.bbcode(post.message);
		post.message = this.greensmileys(post.message);
		post.message = this.greensmileysmisc(post.message);
		post.message = this.fvsmileysmisc(post.message);
		post.message = this.membersmileys(post.message);
		
		var html = 
			'<div id="' + id + '" class="ys-post' + (post.admin ? ' ys-admin-post' : '') + (post.banned ? ' ys-banned-post' : '') + '">' +
				(this.prefs.timestamp> 0 ? '<span class="ys-post-timestamp">' + time(post.timestamp) + '</span> ' : '') +
				'<span class="ys-post-nickname">' + post.nickname + this.prefs.nicknameSeparator + '</span> ' +
				'<span class="ys-post-message">' + post.message + '</span> ' +
				'<span class="ys-post-info' + (this.prefs.info == 'overlay' ? ' ys-info-overlay' : ' ys-info-inline') + '">' + (post.adminInfo ? '<em>IP:</em> ' + post.adminInfo.ip + ', ' : '') + '<em>Posted:</em> ' + dateStr(post.timestamp) + ' at ' + time(post.timestamp)  + '.</span>' +
				'<span class="ys-post-actions"><a title="Show post information" class="ys-info-link" href="#">I</a>'  + (post.adminInfo ? ' | <a title="Delete post" class="ys-delete-link" href="#">D</a> | ' + (post.banned ? '<a title="Unban user" class="ys-ban-link" href="#">UB</a>' : '<a title="Ban user" class="ys-ban-link" href="#">B</a>') : '') + '</span>' +
			'</div>';
		if (this.prefs.inverse) $('#fv-ot-ys-posts').prepend(html);
		else $('#fv-ot-ys-posts').append(html);
		
		this.p.push(post);

		$('#' + id)
			.find('.ys-post-nickname').click(function() {
				if (post.adminInfo)
					self.findBySame(post.adminInfo.ip);
			}).end()
			.find('.ys-info-link').toggle(
				function() { self.showInfo.apply(self, [id, this]); return false; },
				function() { self.hideInfo.apply(self, [id, this]); return false; })
			.end()
			.find('.ys-ban-link').click(
				function() { self.ban.apply(self, [post, id]); return false; })
			.end()
			.find('.ys-delete-link').click(
				function() { self.del.apply(self, [post, id]); return false; });
			
	},
	
	showInfo: function(id, el) {
		var jEl = $('#' + id + ' .ys-post-info');
		if (this.prefs.info == 'overlay')
			jEl.css('display', 'block').fadeIn(this.animSpeed);
		else
			jEl.slideDown(this.animSpeed);
		
		el.innerHTML ='Close Info'
		return false;
	},
	
	hideInfo: function(id, el) {
		var jEl = $('#' + id + ' .ys-post-info');
		if (this.prefs.info == 'overlay')
			jEl.fadeOut(this.animSpeed);
		else
			jEl.slideUp(this.animSpeed);
			
		el.innerHTML = 'I';
		return false;
	}, 
	
	ban: function(post, id) {
		var self = this;

		var link = $('#' + id).find('.ys-ban-link')[0];

		switch(link.innerHTML) {
			case 'B':
				var pars = {
					reqType: 'ban',
					ip: post.adminInfo.ip,
					nickname: post.nickname
				};

				this.ajax(function(json) {
					if (json.error) {
						switch (json.error) {
							case 'admin':
								self.error('You\'re not an admin.');
								break;
						}
						return;
					}
					//alert('p: ' + this.p + ' / ' + this.p.length);
					if (json.bannedSelf) {
						self.banned(); // ?
					} else { 						
						$.each(self.p, function(i) {
							if (this.adminInfo && this.adminInfo.ip == post.adminInfo.ip) 
									$('#' + this.id)
										.addClass('ys-banned-post')
										.find('.ys-ban-link').html('UB');
						});
					}
						
				}, pars);
				
				link.innerHTML = 'Banning...';
				return false;
				break;
			
			case 'Banning...':
				return false;
				break;
			
			case 'UB':
				var pars = {
					reqType: 'unban',
					ip: post.adminInfo.ip
				};
	
				this.ajax(function(json) {
					if (json.error) {
						switch(json.error) {
							case 'admin':
								self.error('You\'re not an admin.');
								return;
								break;
						}
					}
					
					$.each(self.p, function(i) {
						if (this.adminInfo && this.adminInfo.ip == post.adminInfo.ip) 
							$('#' + this.id).removeClass('ys-banned-post').find('.ys-ban-link').html('B');
					});
					
				}, pars);
	
				link.innerHTML = 'Unbanning...';
				return false;
				break;
				
			case 'Unbanning...':
				return false;
				break;
		}
	},
	
	del: function(post, id) {
		var self = this;
		var link = $('#' + id).find('.ys-delete-link')[0];

		if (link.innerHTML == 'Deleting...') return;
	
		var pars = {
			reqType: 'delete',
			uid: post.uid
		};

		self.ajax(function(json) {
			if (json.error) {
				switch(json.error) {
					case 'admin':
						self.error('You\'re not an admin.');
						return;
						break;
				}
			}
			self.reload();
		}, pars);

		link.innerHTML = 'Deleting...';
		return false;

	},
	
	banSelf: function(reason) {
		var self = this;

		this.ajax(function(json) {
			if (json.error == false)
				self.banned();
		}, {
			reqType: 'banself',
			nickname: $('#ys-input-nickname').val() 
		});
	},

	bbcode: function(s) {
		s = s.sReplace('[i]', '<i>');
		s = s.sReplace('[/i]', '</i>');

		s = s.sReplace('[b]', '<b>');
		s = s.sReplace('[/b]', '</b>');

		s = s.sReplace('[u]', '<u>');
		s = s.sReplace('[/u]', '</u>');
		
		s = s.sReplace('[s]', '<s>');
		s = s.sReplace('[/s]', '</s>');

		return s;
	},
	

	membersmileys: function(s) {
		var yp = this.options.yPath;
		
		var smile = function(str, smiley, image) {
			return str.sReplace(smiley, '<img src="http://shout.firevortex.net/images/members/' + image + '" />');
		};

		s = smile(s, ':jwalter613:',  'jwalter613.gif');
		s = smile(s, ':mintdub:',  'mintdub.gif');
		s = smile(s, ':gtigirl:',  'gtigirl.gif');
		s = smile(s, ':skully:',  'skully.gif');
		s = smile(s, ':jettadude101:',  'jettadude101.gif');
		s = smile(s, ':vwabbitman:',  'vwabbitman.gif');
		s = smile(s, ':anand:',  'anand.gif');
		s = smile(s, ':xjettx:',  'xjettx.gif');
		s = smile(s, ':blackrimmed23:',  'blackrimmed23.gif');
		s = smile(s, ':breane24:',  'breane24.gif');
		s = smile(s, ':evilrobot0:',  'evilrobot0.gif');
		s = smile(s, ':scuba2001:',  'scuba2001.gif');
		s = smile(s, ':johnxfaceless:',  'johnxfaceless.gif');
		s = smile(s, ':gogators:',  'gogators.gif');
		s = smile(s, ':buckeyes:',  'buckeyes.gif');
		s = smile(s, ':illini:',  'illini.png');
		s = smile(s, ':dubscout:',  'dubscout.png');

		return s;
	},
	
	smileys: function(s) {
		var yp = this.options.yPath;
		
		var smile = function(str, smiley, image) {
			return str.sReplace(smiley, '<img src="http://media.firevortex.net/icons/custom/standard/' + image + '" />');
		};

		s = smile(s, ':bomb:',  'bomb.png');
		s = smile(s, ':cake:',  'cake.png');
		s = smile(s, ':drink:',  'drink.png');
		s = smile(s, ':$:',  'money.png');
		s = smile(s, ':money:',  'money.png');
		s = smile(s, ':star:',  'star.png');
		s = smile(s, ':tup:',  'thumb_up.png');
		s = smile(s, ':thumbup:',  'thumb_up.png');
		s = smile(s, ':tud:',  'thumb_down.png');
		s = smile(s, ':thumbdown:',  'thumb_down.png');
		s = smile(s, ':grin:',  'emoticon_grin.png');
		s = smile(s, ':pm:',  'email.png');
		s = smile(s, ':rainbow:',  'rainbow.png');
		s = smile(s, ':wrench:',  'wrench.png');
		s = smile(s, ':8ball:',  'sport_8ball.png');
		s = smile(s, ':heart:',  'heart.png');
		s = smile(s, ':linux:',  'tux.png');
		s = smile(s, ':male:',  'male.png');
		s = smile(s, ':female:',  'female.png');
		s = smile(s, ':fv:',  'firevortex.png');
		s = smile(s, ':D',  'emoticon_happy.png');
		s = smile(s, ':P',  'emoticon_tongue.png');
		s = smile(s, ':(',  'emoticon_unhappy.png');
		s = smile(s, ':)',  'emoticon_smile.png');
		s = smile(s, ':o',  'emoticon_surprised.png');
		s = smile(s, ';)',  'emoticon_wink.png');


		return s;
	},

	greensmileys: function(s) {
		var yp = this.options.yPath;
		
		var smile = function(str, smiley, image) {
			return str.sReplace(smiley, '<img src="http://e.tinytex.com/g/' + image + '" />');
		};


		s = smile(s, ':2cents:',  '001.gif');
		s = smile(s, ':argue:',  '002.gif');
		s = smile(s, ':dance:',  '003.gif');
		s = smile(s, ':banghead:',  '004.gif');
		s = smile(s, ':puke:',  '005.gif');
		s = smile(s, ':idiot:',  '006.gif');
		s = smile(s, ':bat:',  '007.gif');
		s = smile(s, ':sex:',  '008.gif');
		s = smile(s, ':beer:',  '009.gif');
		s = smile(s, ':blush:',  '011.gif');
		s = smile(s, ':borat:',  '012.gif');
		s = smile(s, ':punch:', '013.gif');
		s = smile(s, ':cake:',  '014.gif');
		s = smile(s, ':fuck:', '015.gif');
		s = smile(s, ':clean:',  '017.gif');
		s = smile(s, ':read:',  '018.gif');
		s = smile(s, ':gm:',  '019.gif');
		s = smile(s, ':cold:',  '020.gif');
		s = smile(s, ':computer:',  '021.gif');
		s = smile(s, ':confused:',  '022.gif');
		s = smile(s, ':rockon:',  '023.gif');
		s = smile(s, ':shit:',  '024.gif');
		s = smile(s, ':retard:',  '025.gif');
		s = smile(s, ':crutch:',  '026.gif');
		s = smile(s, ':cry:',  '027.gif');
		s = smile(s, ':danke:',  '028.gif');
		s = smile(s, ':goodsir:',  '029.gif');
		s = smile(s, ':devil:',  '030.gif');
		s = smile(s, ':dinosaur:',  '031.gif');
		s = smile(s, ':doh:',  '032.gif');
		s = smile(s, ':drool:',  '033.gif');
		s = smile(s, ':tongue:',  '034.gif');
		s = smile(s, ':drink:',  '035.gif');
		s = smile(s, ':dunno:',  '036.gif');
		s = smile(s, ':eek:',  '037.gif');
		s = smile(s, ':evil:',  '038.gif');
		s = smile(s, ':excellent:',  '039.gif');
		s = smile(s, ':poke:',  '040.gif');
		s = smile(s, ':fart:',  '041.gif');
		s = smile(s, ':fly:',  '042.gif');
		s = smile(s, ':bug:',  '043.gif');
		s = smile(s, ':fu:',  '044.gif');
		s = smile(s, ':bye:',  '045.gif');
		s = smile(s, ':grill:',  '046.gif');
		s = smile(s, ':help:',  '47.gif');
		s = smile(s, ':handjob:',  '048.gif');
		s = smile(s, ':hmm:',  '049.gif');
		s = smile(s, ':attention:',  '050.gif');
		s = smile(s, ':hot:',  '051.gif');
		s = smile(s, ':hubba:',  '052.gif');
		s = smile(s, ':hug:',  '053.gif');
		s = smile(s, ':dinner:',  '054.gif');
		s = smile(s, ':yell:',  '055.gif');
		s = smile(s, ':firefox:',  '056.gif');
		s = smile(s, ':old:',  '057.gif');
		s = smile(s, ':lol:',  '058.gif');
		s = smile(s, ':haha:',  '059.gif');
		s = smile(s, ':king',  '060.gif');
		s = smile(s, ':liar:',  '061.gif');
		s = smile(s, ':idea:',  '062.gif');
		s = smile(s, ':wha:',  '063.gif');
		s = smile(s, ':angry:',  '065.gif');
		s = smile(s, ':mcd:',  '066.gif');
		s = smile(s, ':mow:',  '067.gif');
		s = smile(s, ':music:',  '068.gif');
		s = smile(s, ':ninja:',  '069.gif');
		s = smile(s, ':no:',  '070.gif');
		s = smile(s, ':nono:',  '071.gif');
		s = smile(s, ':noob:',  '072.gif');
		s = smile(s, ':nsfw:',  '073.gif');
		s = smile(s, ':crazy:',  '074.gif');
		s = smile(s, ':ahh:',  '077.gif');
		s = smile(s, ':stop:', '079.gif');
		s = smile(s, ':popcorn:',  '080.gif');
		s = smile(s, ':porn:',  '081.gif');
		s = smile(s, ':pot:',  '082.gif');
		s = smile(s, ':cheers:',  '083.gif');
		s = smile(s, ':shh:',  '084.gif');
		s = smile(s, ':rofl:',  '085.gif');
		s = smile(s, ':rolleyes:',  '086.gif');
		s = smile(s, ':run:',  '088.gif');
		s = smile(s, ':screwy:',  '090.gif');
		s = smile(s, ':shock:',  '091.gif');
		s = smile(s, ':sick:',  '092.gif');
		s = smile(s, ':sigh:',  '093.gif');
		s = smile(s, ':umm:',  '094.gif');
		s = smile(s, ':zzz:',  '095.gif');
		s = smile(s, ':stars:',  '096.gif');
		s = smile(s, ':vadar:',  '098.gif');
		s = smile(s, ':jedi:',  '099.gif');
		s = smile(s, ':boobs:',  '100.gif');
		s = smile(s, ':tea:',  '101.gif');
		s = smile(s, ':thankyou:',  '102.gif');
		s = smile(s, ':tup:',  '103.gif');
		s = smile(s, ':tud:',  '104.gif');
		s = smile(s, ':thumbs:',  '105.gif');
		s = smile(s, ':nana:',  '106.gif');
		s = smile(s, ':tv:', '108.gif');
		s = smile(s, ':ugly:',  '109.gif');
		s = smile(s, ':tos:',  '110.gif');
		s = smile(s, ':hi:',  '111.gif');
		s = smile(s, ':whip:',  '112.gif');
		s = smile(s, ':whistle:',  '113.gif');
		s = smile(s, ':wink:',  '114.gif');
		s = smile(s, ':work:',  '115.gif');
		s = smile(s, ':worship:',  '116.gif');
		s = smile(s, ':tired:',  '117.gif');
		s = smile(s, ':yes:',  '118.gif');
		s = smile(s, ':yippie:',  '119.gif');
		s = smile(s, ':kill:',  '121.gif');
		s = smile(s, ':spam:',  '124.gif');
		s = smile(s, ':suicide:',  '127.gif');
		s = smile(s, ':ack:',  '128.gif');

		return s;
	},

	greensmileysmisc: function(s) {
		var yp = this.options.yPath;
		
		var smile = function(str, smiley, image) {
			return str.sReplace(smiley, '<img src="http://e.tinytex.com/m/' + image + '" />');
		};

		s = smile(s, ':audi:',  '001.gif');
		s = smile(s, ':bagel:',  '002.gif');
		s = smile(s, ':woot:',  '003.gif');
		s = smile(s, ':banned:',  '004.gif');
		s = smile(s, ':ban:',  '005.gif');
		s = smile(s, ':clown:',  '006.gif');
		s = smile(s, ':blah:',  '007.gif');
		s = smile(s, ':drive:',  '010.gif');
		s = smile(s, ':obvious:',  '011.gif');
		s = smile(s, ':cartman:',  '012.gif');
		s = smile(s, ':cookie:',  '014.gif');
		s = smile(s, ':stare:',  '016.gif');
		s = smile(s, ':drphil:',  '017.gif');
		s = smile(s, ':dunkin:', '018.gif');
		s = smile(s, ':fap:',  '019.gif');
		s = smile(s, ':ffuu:',  '020.gif');
		s = smile(s, ':ikea:',  '021.gif');
		s = smile(s, ':lock:',  '023.gif');
		s = smile(s, ':lolwut:',  '024.gif');
		s = smile(s, ':never:',  '025.gif');
		s = smile(s, ':fight:',  '026.gif');
		s = smile(s, ':orly:',  '027.gif');
		s = smile(s, ':pedo:',  '028.gif');
		s = smile(s, ':pirate:',  '029.gif');
		s = smile(s, ':giggity:',  '030.gif');
		s = smile(s, ':rm:',  '031.gif');
		s = smile(s, ':serious:',  '032.gif');
		s = smile(s, ':starbucks:',  '034.gif');
		s = smile(s, ':tw:',  '035.gif');
		s = smile(s, ':vw:',  '036.gif');
		s = smile(s, ':beatit:',  '037.gif');
		s = smile(s, ':yarly:',  '038.gif');
		s = smile(s, ':yoda:',  '039.gif');
		s = smile(s, ':buckeyes:',  '040.gif');
		s = smile(s, ':gators:',  '041.gif');
		s = smile(s, ':illini:',  '042.gif');

		return s;
	},

	fvsmileysmisc: function(s) {
		var yp = this.options.yPath;
		
		var smile = function(str, smiley, image) {
			return str.sReplace(smiley, '<img src="http://e.tinytex.com/f/' + image + '" />');
		};

		s = smile(s, ':fv:',  'fv.png');
		s = smile(s, ':killthread:',  'kill.thread.sm.png');

		return s;
	},


	links: function(s) {
		return s.replace(/\[url\]((https|http):\/\/[\S]+)\[\/url\]/gi, '<a href="$1" target="_blank"><img src="http://style.firevortex.net/icons/link_go.png" width="16" height="16" border="0" title="View link!" /></a>');
	},

	colors: function(s) {
		return s.replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<span style="color: $1">$2</span>');
	},

	images: function(s) {
		return s.replace(/\[img\]((https|http):\/\/[\S]+)\[\/img\]/gi, '<a href="$1" target="_blank"><img src="http://style.firevortex.net/icons/image_link.png" width="16" height="16" border="0" title="View Image!" /></a>');
	},

	truncate: function(clearAll) {
		var truncateTo = clearAll ? 0 : this.prefs.truncate;
		var posts = $('#fv-ot-ys-posts .ys-post').length;
		if (posts <= truncateTo) return;
		//alert(this.initializing);
		if (this.prefs.doTruncate || this.initializing) {
			var diff = posts - truncateTo;
			for (var i = 0; i < diff; i++)
				this.p.shift();
			
			//	$('#fv-ot-ys-posts .ys-post:gt(' + truncateTo + ')').remove();

			if (this.prefs.inverse) {
				$('#fv-ot-ys-posts .ys-post:gt(' + (truncateTo - 1) + ')').remove();
			} else { 
				$('#fv-ot-ys-posts .ys-post:lt(' + (posts - truncateTo) + ')').remove();
			}
		}
		
		this.markEnds();		
	},
	
	markEnds: function() {
		$('#fv-ot-ys-posts').find('.ys-first').removeClass('ys-first').end().find('.ys-last').removeClass('ys-last');
			
		$('#fv-ot-ys-posts .ys-post:first-child').addClass('ys-first');
		$('#fv-ot-ys-posts .ys-post:last-child').addClass('ys-last');
	},
	
	reload: function(everything) {
		var self = this;
		this.initializing = true;
		
		if (everything) {
			this.ajax(function(json) { 
				$('#fv-ot-yshout').html(''); 
				clearInterval(this.refreshTimer);
				clearInterval(this.floodTimer);
				this.initialLoad(json); 
			}, { 
				reqType: 'init',
				yPath: this.options.yPath,
				log: this.options.log
			});
		} else {
			this.ajax(function(json) { this.truncate(true); this.updates(json); this.initializing = false; }, {
				reqType: 'reload'
			});
		}
	},

	error: function(str) {
		alert(str);
	},

	json: function(parse) {
		this.d('In json: ' + parse);
		//var json = JSON.parse( parse );
		//var json = eval('(' + parse + ')');
		if (!this.checkError(parse)) return parse;
		
		//if (!this.checkError(json)) return json;
	},

	checkError: function(json) {
		if (!json.yError) return false;

		this.d('Error: ' + json.yError);
		return true;
	},

	ajax: function(callback, pars, html) {
		pars = jQuery.extend({
			reqFor: 'shout'
		}, pars);

		var self = this;
		
		$.ajax({
			type: 'POST',
			url: this.options.yPath + 'yshout.php',
			xhr: function() { return new GM_XHR(); },
			data: pars,
			success: function(parse) {
					if (parse)
						if (html)
							callback.apply(self, [parse]);
						else
							callback.apply(self, [self.json(parse)]);
					else
						callback.apply(self);
				}
		});
		
		
	},

	d: function(message) {
		$('#debug').css('display', 'block').prepend('<p>' + message + '</p>');
		return message;
	}
};



//
// third party plugins
//

/*! jQuery v1.7.2 jquery.com | jquery.org/license */
(function(a,b){function cy(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cu(a){if(!cj[a]){var b=c.body,d=f("<"+a+">").appendTo(b),e=d.css("display");d.remove();if(e==="none"||e===""){ck||(ck=c.createElement("iframe"),ck.frameBorder=ck.width=ck.height=0),b.appendChild(ck);if(!cl||!ck.createElement)cl=(ck.contentWindow||ck.contentDocument).document,cl.write((f.support.boxModel?"<!doctype html>":"")+"<html><body>"),cl.close();d=cl.createElement(a),cl.body.appendChild(d),e=f.css(d,"display"),b.removeChild(ck)}cj[a]=e}return cj[a]}function ct(a,b){var c={};f.each(cp.concat.apply([],cp.slice(0,b)),function(){c[this]=a});return c}function cs(){cq=b}function cr(){setTimeout(cs,0);return cq=f.now()}function ci(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ch(){try{return new a.XMLHttpRequest}catch(b){}}function cb(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function ca(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function b_(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bD.test(a)?d(a,e):b_(a+"["+(typeof e=="object"?b:"")+"]",e,c,d)});else if(!c&&f.type(b)==="object")for(var e in b)b_(a+"["+e+"]",b[e],c,d);else d(a,b)}function b$(a,c){var d,e,g=f.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((g[d]?a:e||(e={}))[d]=c[d]);e&&f.extend(!0,a,e)}function bZ(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bS,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=bZ(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=bZ(a,c,d,e,"*",g));return l}function bY(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bO),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function bB(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=b==="width"?1:0,g=4;if(d>0){if(c!=="border")for(;e<g;e+=2)c||(d-=parseFloat(f.css(a,"padding"+bx[e]))||0),c==="margin"?d+=parseFloat(f.css(a,c+bx[e]))||0:d-=parseFloat(f.css(a,"border"+bx[e]+"Width"))||0;return d+"px"}d=by(a,b);if(d<0||d==null)d=a.style[b];if(bt.test(d))return d;d=parseFloat(d)||0;if(c)for(;e<g;e+=2)d+=parseFloat(f.css(a,"padding"+bx[e]))||0,c!=="padding"&&(d+=parseFloat(f.css(a,"border"+bx[e]+"Width"))||0),c==="margin"&&(d+=parseFloat(f.css(a,c+bx[e]))||0);return d+"px"}function bo(a){var b=c.createElement("div");bh.appendChild(b),b.innerHTML=a.outerHTML;return b.firstChild}function bn(a){var b=(a.nodeName||"").toLowerCase();b==="input"?bm(a):b!=="script"&&typeof a.getElementsByTagName!="undefined"&&f.grep(a.getElementsByTagName("input"),bm)}function bm(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bl(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bk(a,b){var c;b.nodeType===1&&(b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase(),c==="object"?b.outerHTML=a.outerHTML:c!=="input"||a.type!=="checkbox"&&a.type!=="radio"?c==="option"?b.selected=a.defaultSelected:c==="input"||c==="textarea"?b.defaultValue=a.defaultValue:c==="script"&&b.text!==a.text&&(b.text=a.text):(a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value)),b.removeAttribute(f.expando),b.removeAttribute("_submit_attached"),b.removeAttribute("_change_attached"))}function bj(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c,d,e,g=f._data(a),h=f._data(b,g),i=g.events;if(i){delete h.handle,h.events={};for(c in i)for(d=0,e=i[c].length;d<e;d++)f.event.add(b,c,i[c][d])}h.data&&(h.data=f.extend({},h.data))}}function bi(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function U(a){var b=V.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function T(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(O.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function S(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function K(){return!0}function J(){return!1}function n(a,b,c){var d=b+"defer",e=b+"queue",g=b+"mark",h=f._data(a,d);h&&(c==="queue"||!f._data(a,e))&&(c==="mark"||!f._data(a,g))&&setTimeout(function(){!f._data(a,e)&&!f._data(a,g)&&(f.removeData(a,d,!0),h.fire())},0)}function m(a){for(var b in a){if(b==="data"&&f.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function l(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(k,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNumeric(d)?+d:j.test(d)?f.parseJSON(d):d}catch(g){}f.data(a,c,d)}else d=b}return d}function h(a){var b=g[a]={},c,d;a=a.split(/\s+/);for(c=0,d=a.length;c<d;c++)b[a[c]]=!0;return b}var c=a.document,d=a.navigator,e=a.location,f=function(){function J(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(J,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,n=/^[\],:{}\s]*$/,o=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,p=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,q=/(?:^|:|,)(?:\s*\[)+/g,r=/(webkit)[ \/]([\w.]+)/,s=/(opera)(?:.*version)?[ \/]([\w.]+)/,t=/(msie) ([\w.]+)/,u=/(mozilla)(?:.*? rv:([\w.]+))?/,v=/-([a-z]|[0-9])/ig,w=/^-ms-/,x=function(a,b){return(b+"").toUpperCase()},y=d.userAgent,z,A,B,C=Object.prototype.toString,D=Object.prototype.hasOwnProperty,E=Array.prototype.push,F=Array.prototype.slice,G=String.prototype.trim,H=Array.prototype.indexOf,I={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=m.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.7.2",length:0,size:function(){return this.length},toArray:function(){return F.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?E.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),A.add(a);return this},eq:function(a){a=+a;return a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(F.apply(this,arguments),"slice",F.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:E,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;A.fireWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").off("ready")}},bindReady:function(){if(!A){A=e.Callbacks("once memory");if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",B,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",B),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&J()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a!=null&&a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return a==null?String(a):I[C.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;try{if(a.constructor&&!D.call(a,"constructor")&&!D.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||D.call(a,d)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw new Error(a)},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(n.test(b.replace(o,"@").replace(p,"]").replace(q,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(c){if(typeof c!="string"||!c)return null;var d,f;try{a.DOMParser?(f=new DOMParser,d=f.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(g){d=b}(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&e.error("Invalid XML: "+c);return d},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(w,"ms-").replace(v,x)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:G?function(a){return a==null?"":G.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?E.call(c,a):e.merge(c,a)}return c},inArray:function(a,b,c){var d;if(b){if(H)return H.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=F.call(arguments,2),g=function(){return a.apply(c,f.concat(F.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h,i){var j,k=d==null,l=0,m=a.length;if(d&&typeof d=="object"){for(l in d)e.access(a,c,l,d[l],1,h,f);g=1}else if(f!==b){j=i===b&&e.isFunction(f),k&&(j?(j=c,c=function(a,b,c){return j.call(e(a),c)}):(c.call(a,f),c=null));if(c)for(;l<m;l++)c(a[l],d,j?f.call(a[l],l,c(a[l],d)):f,i);g=1}return g?a:k?c.call(a):m?c(a[0],d):h},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=r.exec(a)||s.exec(a)||t.exec(a)||a.indexOf("compatible")<0&&u.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){I["[object "+b+"]"]=b.toLowerCase()}),z=e.uaMatch(y),z.browser&&(e.browser[z.browser]=!0,e.browser.version=z.version),e.browser.webkit&&(e.browser.safari=!0),j.test(" ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?B=function(){c.removeEventListener("DOMContentLoaded",B,!1),e.ready()}:c.attachEvent&&(B=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",B),e.ready())});return e}(),g={};f.Callbacks=function(a){a=a?g[a]||h(a):{};var c=[],d=[],e,i,j,k,l,m,n=function(b){var d,e,g,h,i;for(d=0,e=b.length;d<e;d++)g=b[d],h=f.type(g),h==="array"?n(g):h==="function"&&(!a.unique||!p.has(g))&&c.push(g)},o=function(b,f){f=f||[],e=!a.memory||[b,f],i=!0,j=!0,m=k||0,k=0,l=c.length;for(;c&&m<l;m++)if(c[m].apply(b,f)===!1&&a.stopOnFalse){e=!0;break}j=!1,c&&(a.once?e===!0?p.disable():c=[]:d&&d.length&&(e=d.shift(),p.fireWith(e[0],e[1])))},p={add:function(){if(c){var a=c.length;n(arguments),j?l=c.length:e&&e!==!0&&(k=a,o(e[0],e[1]))}return this},remove:function(){if(c){var b=arguments,d=0,e=b.length;for(;d<e;d++)for(var f=0;f<c.length;f++)if(b[d]===c[f]){j&&f<=l&&(l--,f<=m&&m--),c.splice(f--,1);if(a.unique)break}}return this},has:function(a){if(c){var b=0,d=c.length;for(;b<d;b++)if(a===c[b])return!0}return!1},empty:function(){c=[];return this},disable:function(){c=d=e=b;return this},disabled:function(){return!c},lock:function(){d=b,(!e||e===!0)&&p.disable();return this},locked:function(){return!d},fireWith:function(b,c){d&&(j?a.once||d.push([b,c]):(!a.once||!e)&&o(b,c));return this},fire:function(){p.fireWith(this,arguments);return this},fired:function(){return!!i}};return p};var i=[].slice;f.extend({Deferred:function(a){var b=f.Callbacks("once memory"),c=f.Callbacks("once memory"),d=f.Callbacks("memory"),e="pending",g={resolve:b,reject:c,notify:d},h={done:b.add,fail:c.add,progress:d.add,state:function(){return e},isResolved:b.fired,isRejected:c.fired,then:function(a,b,c){i.done(a).fail(b).progress(c);return this},always:function(){i.done.apply(i,arguments).fail.apply(i,arguments);return this},pipe:function(a,b,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[b,"reject"],progress:[c,"notify"]},function(a,b){var c=b[0],e=b[1],g;f.isFunction(c)?i[a](function(){g=c.apply(this,arguments),g&&f.isFunction(g.promise)?g.promise().then(d.resolve,d.reject,d.notify):d[e+"With"](this===i?d:this,[g])}):i[a](d[e])})}).promise()},promise:function(a){if(a==null)a=h;else for(var b in h)a[b]=h[b];return a}},i=h.promise({}),j;for(j in g)i[j]=g[j].fire,i[j+"With"]=g[j].fireWith;i.done(function(){e="resolved"},c.disable,d.lock).fail(function(){e="rejected"},b.disable,d.lock),a&&a.call(i,i);return i},when:function(a){function m(a){return function(b){e[a]=arguments.length>1?i.call(arguments,0):b,j.notifyWith(k,e)}}function l(a){return function(c){b[a]=arguments.length>1?i.call(arguments,0):c,--g||j.resolveWith(j,b)}}var b=i.call(arguments,0),c=0,d=b.length,e=Array(d),g=d,h=d,j=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred(),k=j.promise();if(d>1){for(;c<d;c++)b[c]&&b[c].promise&&f.isFunction(b[c].promise)?b[c].promise().then(l(c),j.reject,m(c)):--g;g||j.resolveWith(j,b)}else j!==a&&j.resolveWith(j,d?[a]:[]);return k}}),f.support=function(){var b,d,e,g,h,i,j,k,l,m,n,o,p=c.createElement("div"),q=c.documentElement;p.setAttribute("className","t"),p.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>",d=p.getElementsByTagName("*"),e=p.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};g=c.createElement("select"),h=g.appendChild(c.createElement("option")),i=p.getElementsByTagName("input")[0],b={leadingWhitespace:p.firstChild.nodeType===3,tbody:!p.getElementsByTagName("tbody").length,htmlSerialize:!!p.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,checkOn:i.value==="on",optSelected:h.selected,getSetAttribute:p.className!=="t",enctype:!!c.createElement("form").enctype,html5Clone:c.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,pixelMargin:!0},f.boxModel=b.boxModel=c.compatMode==="CSS1Compat",i.checked=!0,b.noCloneChecked=i.cloneNode(!0).checked,g.disabled=!0,b.optDisabled=!h.disabled;try{delete p.test}catch(r){b.deleteExpando=!1}!p.addEventListener&&p.attachEvent&&p.fireEvent&&(p.attachEvent("onclick",function(){b.noCloneEvent=!1}),p.cloneNode(!0).fireEvent("onclick")),i=c.createElement("input"),i.value="t",i.setAttribute("type","radio"),b.radioValue=i.value==="t",i.setAttribute("checked","checked"),i.setAttribute("name","t"),p.appendChild(i),j=c.createDocumentFragment(),j.appendChild(p.lastChild),b.checkClone=j.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=i.checked,j.removeChild(i),j.appendChild(p);if(p.attachEvent)for(n in{submit:1,change:1,focusin:1})m="on"+n,o=m in p,o||(p.setAttribute(m,"return;"),o=typeof p[m]=="function"),b[n+"Bubbles"]=o;j.removeChild(p),j=g=h=p=i=null,f(function(){var d,e,g,h,i,j,l,m,n,q,r,s,t,u=c.getElementsByTagName("body")[0];!u||(m=1,t="padding:0;margin:0;border:",r="position:absolute;top:0;left:0;width:1px;height:1px;",s=t+"0;visibility:hidden;",n="style='"+r+t+"5px solid #000;",q="<div "+n+"display:block;'><div style='"+t+"0;display:block;overflow:hidden;'></div></div>"+"<table "+n+"' cellpadding='0' cellspacing='0'>"+"<tr><td></td></tr></table>",d=c.createElement("div"),d.style.cssText=s+"width:0;height:0;position:static;top:0;margin-top:"+m+"px",u.insertBefore(d,u.firstChild),p=c.createElement("div"),d.appendChild(p),p.innerHTML="<table><tr><td style='"+t+"0;display:none'></td><td>t</td></tr></table>",k=p.getElementsByTagName("td"),o=k[0].offsetHeight===0,k[0].style.display="",k[1].style.display="none",b.reliableHiddenOffsets=o&&k[0].offsetHeight===0,a.getComputedStyle&&(p.innerHTML="",l=c.createElement("div"),l.style.width="0",l.style.marginRight="0",p.style.width="2px",p.appendChild(l),b.reliableMarginRight=(parseInt((a.getComputedStyle(l,null)||{marginRight:0}).marginRight,10)||0)===0),typeof p.style.zoom!="undefined"&&(p.innerHTML="",p.style.width=p.style.padding="1px",p.style.border=0,p.style.overflow="hidden",p.style.display="inline",p.style.zoom=1,b.inlineBlockNeedsLayout=p.offsetWidth===3,p.style.display="block",p.style.overflow="visible",p.innerHTML="<div style='width:5px;'></div>",b.shrinkWrapBlocks=p.offsetWidth!==3),p.style.cssText=r+s,p.innerHTML=q,e=p.firstChild,g=e.firstChild,i=e.nextSibling.firstChild.firstChild,j={doesNotAddBorder:g.offsetTop!==5,doesAddBorderForTableAndCells:i.offsetTop===5},g.style.position="fixed",g.style.top="20px",j.fixedPosition=g.offsetTop===20||g.offsetTop===15,g.style.position=g.style.top="",e.style.overflow="hidden",e.style.position="relative",j.subtractsBorderForOverflowNotVisible=g.offsetTop===-5,j.doesNotIncludeMarginInBodyOffset=u.offsetTop!==m,a.getComputedStyle&&(p.style.marginTop="1%",b.pixelMargin=(a.getComputedStyle(p,null)||{marginTop:0}).marginTop!=="1%"),typeof d.style.zoom!="undefined"&&(d.style.zoom=1),u.removeChild(d),l=p=d=null,f.extend(b,j))});return b}();var j=/^(?:\{.*\}|\[.*\])$/,k=/([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!m(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g,h,i,j=f.expando,k=typeof c=="string",l=a.nodeType,m=l?f.cache:a,n=l?a[j]:a[j]&&j,o=c==="events";if((!n||!m[n]||!o&&!e&&!m[n].data)&&k&&d===b)return;n||(l?a[j]=n=++f.uuid:n=j),m[n]||(m[n]={},l||(m[n].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?m[n]=f.extend(m[n],c):m[n].data=f.extend(m[n].data,c);g=h=m[n],e||(h.data||(h.data={}),h=h.data),d!==b&&(h[f.camelCase(c)]=d);if(o&&!h[c])return g.events;k?(i=h[c],i==null&&(i=h[f.camelCase(c)])):i=h;return i}},removeData:function(a,b,c){if(!!f.acceptData(a)){var d,e,g,h=f.expando,i=a.nodeType,j=i?f.cache:a,k=i?a[h]:h;if(!j[k])return;if(b){d=c?j[k]:j[k].data;if(d){f.isArray(b)||(b in d?b=[b]:(b=f.camelCase(b),b in d?b=[b]:b=b.split(" ")));for(e=0,g=b.length;e<g;e++)delete d[b[e]];if(!(c?m:f.isEmptyObject)(d))return}}if(!c){delete j[k].data;if(!m(j[k]))return}f.support.deleteExpando||!j.setInterval?delete j[k]:j[k]=null,i&&(f.support.deleteExpando?delete a[h]:a.removeAttribute?a.removeAttribute(h):a[h]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d,e,g,h,i,j=this[0],k=0,m=null;if(a===b){if(this.length){m=f.data(j);if(j.nodeType===1&&!f._data(j,"parsedAttrs")){g=j.attributes;for(i=g.length;k<i;k++)h=g[k].name,h.indexOf("data-")===0&&(h=f.camelCase(h.substring(5)),l(j,h,m[h]));f._data(j,"parsedAttrs",!0)}}return m}if(typeof a=="object")return this.each(function(){f.data(this,a)});d=a.split(".",2),d[1]=d[1]?"."+d[1]:"",e=d[1]+"!";return f.access(this,function(c){if(c===b){m=this.triggerHandler("getData"+e,[d[0]]),m===b&&j&&(m=f.data(j,a),m=l(j,a,m));return m===b&&d[1]?this.data(d[0]):m}d[1]=c,this.each(function(){var b=f(this);b.triggerHandler("setData"+e,d),f.data(this,a,c),b.triggerHandler("changeData"+e,d)})},null,c,arguments.length>1,null,!1)},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,b){a&&(b=(b||"fx")+"mark",f._data(a,b,(f._data(a,b)||0)+1))},_unmark:function(a,b,c){a!==!0&&(c=b,b=a,a=!1);if(b){c=c||"fx";var d=c+"mark",e=a?0:(f._data(b,d)||1)-1;e?f._data(b,d,e):(f.removeData(b,d,!0),n(b,c,"mark"))}},queue:function(a,b,c){var d;if(a){b=(b||"fx")+"queue",d=f._data(a,b),c&&(!d||f.isArray(c)?d=f._data(a,b,f.makeArray(c)):d.push(c));return d||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e={};d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),f._data(a,b+".run",e),d.call(a,function(){f.dequeue(a,b)},e)),c.length||(f.removeData(a,b+"queue "+b+".run",!0),n(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){var d=2;typeof a!="string"&&(c=a,a="fx",d--);if(arguments.length<d)return f.queue(this[0],a);return c===b?this:this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f.Callbacks("once memory"),!0))h++,l.add(m);m();return d.promise(c)}});var o=/[\n\t\r]/g,p=/\s+/,q=/\r/g,r=/^(?:button|input)$/i,s=/^(?:button|input|object|select|textarea)$/i,t=/^a(?:rea)?$/i,u=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,v=f.support.getSetAttribute,w,x,y;f.fn.extend({attr:function(a,b){return f.access(this,f.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,f.prop,a,b,arguments.length>1)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,g,h,i;if(f.isFunction(a))return this.each(function(b){f(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(p);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{g=" "+e.className+" ";for(h=0,i=b.length;h<i;h++)~g.indexOf(" "+b[h]+" ")||(g+=b[h]+" ");e.className=f.trim(g)}}}return this},removeClass:function(a){var c,d,e,g,h,i,j;if(f.isFunction(a))return this.each(function(b){f(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(p);for(d=0,e=this.length;d<e;d++){g=this[d];if(g.nodeType===1&&g.className)if(a){h=(" "+g.className+" ").replace(o," ");for(i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){f(this).toggleClass(a.call(this,c,this.className,b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(p);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(o," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e,g=this[0];{if(!!arguments.length){e=f.isFunction(a);return this.each(function(d){var g=f(this),h;if(this.nodeType===1){e?h=a.call(this,d,g.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.type]||f.valHooks[this.nodeName.toLowerCase()];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}if(g){c=f.valHooks[g.type]||f.valHooks[g.nodeName.toLowerCase()];if(c&&"get"in c&&(d=c.get(g,"value"))!==b)return d;d=g.value;return typeof d=="string"?d.replace(q,""):d==null?"":d}}}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,g=a.selectedIndex,h=[],i=a.options,j=a.type==="select-one";if(g<0)return null;c=j?g:0,d=j?g+1:i.length;for(;c<d;c++){e=i[c];if(e.selected&&(f.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!f.nodeName(e.parentNode,"optgroup"))){b=f(e).val();if(j)return b;h.push(b)}}if(j&&!h.length&&i.length)return f(i[g]).val();return h},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attr:function(a,c,d,e){var g,h,i,j=a.nodeType;if(!!a&&j!==3&&j!==8&&j!==2){if(e&&c in f.attrFn)return f(a)[c](d);if(typeof a.getAttribute=="undefined")return f.prop(a,c,d);i=j!==1||!f.isXMLDoc(a),i&&(c=c.toLowerCase(),h=f.attrHooks[c]||(u.test(c)?x:w));if(d!==b){if(d===null){f.removeAttr(a,c);return}if(h&&"set"in h&&i&&(g=h.set(a,d,c))!==b)return g;a.setAttribute(c,""+d);return d}if(h&&"get"in h&&i&&(g=h.get(a,c))!==null)return g;g=a.getAttribute(c);return g===null?b:g}},removeAttr:function(a,b){var c,d,e,g,h,i=0;if(b&&a.nodeType===1){d=b.toLowerCase().split(p),g=d.length;for(;i<g;i++)e=d[i],e&&(c=f.propFix[e]||e,h=u.test(e),h||f.attr(a,e,""),a.removeAttribute(v?e:c),h&&c in a&&(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(r.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},value:{get:function(a,b){if(w&&f.nodeName(a,"button"))return w.get(a,b);return b in a?a.value:null},set:function(a,b,c){if(w&&f.nodeName(a,"button"))return w.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,g,h,i=a.nodeType;if(!!a&&i!==3&&i!==8&&i!==2){h=i!==1||!f.isXMLDoc(a),h&&(c=f.propFix[c]||c,g=f.propHooks[c]);return d!==b?g&&"set"in g&&(e=g.set(a,d,c))!==b?e:a[c]=d:g&&"get"in g&&(e=g.get(a,c))!==null?e:a[c]}},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):s.test(a.nodeName)||t.test(a.nodeName)&&a.href?0:b}}}}),f.attrHooks.tabindex=f.propHooks.tabIndex,x={get:function(a,c){var d,e=f.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase()));return c}},v||(y={name:!0,id:!0,coords:!0},w=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&(y[c]?d.nodeValue!=="":d.specified)?d.nodeValue:b},set:function(a,b,d){var e=a.getAttributeNode(d);e||(e=c.createAttribute(d),a.setAttributeNode(e));return e.nodeValue=b+""}},f.attrHooks.tabindex.set=w.set,f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})}),f.attrHooks.contenteditable={get:w.get,set:function(a,b,c){b===""&&(b="false"),w.set(a,b,c)}}),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex);return null}})),f.support.enctype||(f.propFix.enctype="encoding"),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var z=/^(?:textarea|input|select)$/i,A=/^([^\.]*)?(?:\.(.+))?$/,B=/(?:^|\s)hover(\.\S+)?\b/,C=/^key/,D=/^(?:mouse|contextmenu)|click/,E=/^(?:focusinfocus|focusoutblur)$/,F=/^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,G=function(
a){var b=F.exec(a);b&&(b[1]=(b[1]||"").toLowerCase(),b[3]=b[3]&&new RegExp("(?:^|\\s)"+b[3]+"(?:\\s|$)"));return b},H=function(a,b){var c=a.attributes||{};return(!b[1]||a.nodeName.toLowerCase()===b[1])&&(!b[2]||(c.id||{}).value===b[2])&&(!b[3]||b[3].test((c["class"]||{}).value))},I=function(a){return f.event.special.hover?a:a.replace(B,"mouseenter$1 mouseleave$1")};f.event={add:function(a,c,d,e,g){var h,i,j,k,l,m,n,o,p,q,r,s;if(!(a.nodeType===3||a.nodeType===8||!c||!d||!(h=f._data(a)))){d.handler&&(p=d,d=p.handler,g=p.selector),d.guid||(d.guid=f.guid++),j=h.events,j||(h.events=j={}),i=h.handle,i||(h.handle=i=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.dispatch.apply(i.elem,arguments):b},i.elem=a),c=f.trim(I(c)).split(" ");for(k=0;k<c.length;k++){l=A.exec(c[k])||[],m=l[1],n=(l[2]||"").split(".").sort(),s=f.event.special[m]||{},m=(g?s.delegateType:s.bindType)||m,s=f.event.special[m]||{},o=f.extend({type:m,origType:l[1],data:e,handler:d,guid:d.guid,selector:g,quick:g&&G(g),namespace:n.join(".")},p),r=j[m];if(!r){r=j[m]=[],r.delegateCount=0;if(!s.setup||s.setup.call(a,e,n,i)===!1)a.addEventListener?a.addEventListener(m,i,!1):a.attachEvent&&a.attachEvent("on"+m,i)}s.add&&(s.add.call(a,o),o.handler.guid||(o.handler.guid=d.guid)),g?r.splice(r.delegateCount++,0,o):r.push(o),f.event.global[m]=!0}a=null}},global:{},remove:function(a,b,c,d,e){var g=f.hasData(a)&&f._data(a),h,i,j,k,l,m,n,o,p,q,r,s;if(!!g&&!!(o=g.events)){b=f.trim(I(b||"")).split(" ");for(h=0;h<b.length;h++){i=A.exec(b[h])||[],j=k=i[1],l=i[2];if(!j){for(j in o)f.event.remove(a,j+b[h],c,d,!0);continue}p=f.event.special[j]||{},j=(d?p.delegateType:p.bindType)||j,r=o[j]||[],m=r.length,l=l?new RegExp("(^|\\.)"+l.split(".").sort().join("\\.(?:.*\\.)?")+"(\\.|$)"):null;for(n=0;n<r.length;n++)s=r[n],(e||k===s.origType)&&(!c||c.guid===s.guid)&&(!l||l.test(s.namespace))&&(!d||d===s.selector||d==="**"&&s.selector)&&(r.splice(n--,1),s.selector&&r.delegateCount--,p.remove&&p.remove.call(a,s));r.length===0&&m!==r.length&&((!p.teardown||p.teardown.call(a,l)===!1)&&f.removeEvent(a,j,g.handle),delete o[j])}f.isEmptyObject(o)&&(q=g.handle,q&&(q.elem=null),f.removeData(a,["events","handle"],!0))}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){if(!e||e.nodeType!==3&&e.nodeType!==8){var h=c.type||c,i=[],j,k,l,m,n,o,p,q,r,s;if(E.test(h+f.event.triggered))return;h.indexOf("!")>=0&&(h=h.slice(0,-1),k=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if((!e||f.event.customEvent[h])&&!f.event.global[h])return;c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.isTrigger=!0,c.exclusive=k,c.namespace=i.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)"):null,o=h.indexOf(":")<0?"on"+h:"";if(!e){j=f.cache;for(l in j)j[l].events&&j[l].events[h]&&f.event.trigger(c,d,j[l].handle.elem,!0);return}c.result=b,c.target||(c.target=e),d=d!=null?f.makeArray(d):[],d.unshift(c),p=f.event.special[h]||{};if(p.trigger&&p.trigger.apply(e,d)===!1)return;r=[[e,p.bindType||h]];if(!g&&!p.noBubble&&!f.isWindow(e)){s=p.delegateType||h,m=E.test(s+h)?e:e.parentNode,n=null;for(;m;m=m.parentNode)r.push([m,s]),n=m;n&&n===e.ownerDocument&&r.push([n.defaultView||n.parentWindow||a,s])}for(l=0;l<r.length&&!c.isPropagationStopped();l++)m=r[l][0],c.type=r[l][1],q=(f._data(m,"events")||{})[c.type]&&f._data(m,"handle"),q&&q.apply(m,d),q=o&&m[o],q&&f.acceptData(m)&&q.apply(m,d)===!1&&c.preventDefault();c.type=h,!g&&!c.isDefaultPrevented()&&(!p._default||p._default.apply(e.ownerDocument,d)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)&&o&&e[h]&&(h!=="focus"&&h!=="blur"||c.target.offsetWidth!==0)&&!f.isWindow(e)&&(n=e[o],n&&(e[o]=null),f.event.triggered=h,e[h](),f.event.triggered=b,n&&(e[o]=n));return c.result}},dispatch:function(c){c=f.event.fix(c||a.event);var d=(f._data(this,"events")||{})[c.type]||[],e=d.delegateCount,g=[].slice.call(arguments,0),h=!c.exclusive&&!c.namespace,i=f.event.special[c.type]||{},j=[],k,l,m,n,o,p,q,r,s,t,u;g[0]=c,c.delegateTarget=this;if(!i.preDispatch||i.preDispatch.call(this,c)!==!1){if(e&&(!c.button||c.type!=="click")){n=f(this),n.context=this.ownerDocument||this;for(m=c.target;m!=this;m=m.parentNode||this)if(m.disabled!==!0){p={},r=[],n[0]=m;for(k=0;k<e;k++)s=d[k],t=s.selector,p[t]===b&&(p[t]=s.quick?H(m,s.quick):n.is(t)),p[t]&&r.push(s);r.length&&j.push({elem:m,matches:r})}}d.length>e&&j.push({elem:this,matches:d.slice(e)});for(k=0;k<j.length&&!c.isPropagationStopped();k++){q=j[k],c.currentTarget=q.elem;for(l=0;l<q.matches.length&&!c.isImmediatePropagationStopped();l++){s=q.matches[l];if(h||!c.namespace&&!s.namespace||c.namespace_re&&c.namespace_re.test(s.namespace))c.data=s.data,c.handleObj=s,o=((f.event.special[s.origType]||{}).handle||s.handler).apply(q.elem,g),o!==b&&(c.result=o,o===!1&&(c.preventDefault(),c.stopPropagation()))}}i.postDispatch&&i.postDispatch.call(this,c);return c.result}},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode);return a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,d){var e,f,g,h=d.button,i=d.fromElement;a.pageX==null&&d.clientX!=null&&(e=a.target.ownerDocument||c,f=e.documentElement,g=e.body,a.pageX=d.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=d.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?d.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0);return a}},fix:function(a){if(a[f.expando])return a;var d,e,g=a,h=f.event.fixHooks[a.type]||{},i=h.props?this.props.concat(h.props):this.props;a=f.Event(g);for(d=i.length;d;)e=i[--d],a[e]=g[e];a.target||(a.target=g.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey===b&&(a.metaKey=a.ctrlKey);return h.filter?h.filter(a,g):a},special:{ready:{setup:f.bindReady},load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=f.extend(new f.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?f.event.trigger(e,null,b):f.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},f.event.handle=f.event.dispatch,f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!(this instanceof f.Event))return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?K:J):this.type=a,b&&f.extend(this,b),this.timeStamp=a&&a.timeStamp||f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=K;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=K;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=K,this.stopPropagation()},isDefaultPrevented:J,isPropagationStopped:J,isImmediatePropagationStopped:J},f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c=this,d=a.relatedTarget,e=a.handleObj,g=e.selector,h;if(!d||d!==c&&!f.contains(c,d))a.type=e.origType,h=e.handler.apply(this,arguments),a.type=b;return h}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(){if(f.nodeName(this,"form"))return!1;f.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=f.nodeName(c,"input")||f.nodeName(c,"button")?c.form:b;d&&!d._submit_attached&&(f.event.add(d,"submit._submit",function(a){a._submit_bubble=!0}),d._submit_attached=!0)})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&f.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){if(f.nodeName(this,"form"))return!1;f.event.remove(this,"._submit")}}),f.support.changeBubbles||(f.event.special.change={setup:function(){if(z.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")f.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),f.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1,f.event.simulate("change",this,a,!0))});return!1}f.event.add(this,"beforeactivate._change",function(a){var b=a.target;z.test(b.nodeName)&&!b._change_attached&&(f.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&f.event.simulate("change",this.parentNode,a,!0)}),b._change_attached=!0)})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){f.event.remove(this,"._change");return z.test(this.nodeName)}}),f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){var d=0,e=function(a){f.event.simulate(b,a.target,f.event.fix(a),!0)};f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.fn.extend({on:function(a,c,d,e,g){var h,i;if(typeof a=="object"){typeof c!="string"&&(d=d||c,c=b);for(i in a)this.on(i,c,d,a[i],g);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=J;else if(!e)return this;g===1&&(h=e,e=function(a){f().off(a);return h.apply(this,arguments)},e.guid=h.guid||(h.guid=f.guid++));return this.each(function(){f.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){if(a&&a.preventDefault&&a.handleObj){var e=a.handleObj;f(a.delegateTarget).off(e.namespace?e.origType+"."+e.namespace:e.origType,e.selector,e.handler);return this}if(typeof a=="object"){for(var g in a)this.off(g,c,a[g]);return this}if(c===!1||typeof c=="function")d=c,c=b;d===!1&&(d=J);return this.each(function(){f.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){f(this.context).on(a,this.selector,b,c);return this},die:function(a,b){f(this.context).off(a,this.selector||"**",b);return this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length==1?this.off(a,"**"):this.off(b,a,c)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f._data(this,"lastToggle"+a.guid)||0)%d;f._data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.on(b,null,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0),C.test(b)&&(f.event.fixHooks[b]=f.event.keyHooks),D.test(b)&&(f.event.fixHooks[b]=f.event.mouseHooks)}),function(){function x(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}if(j.nodeType===1){g||(j[d]=c,j.sizset=h);if(typeof b!="string"){if(j===b){k=!0;break}}else if(m.filter(b,[j]).length>0){k=j;break}}j=j[a]}e[h]=k}}}function w(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}j.nodeType===1&&!g&&(j[d]=c,j.sizset=h);if(j.nodeName.toLowerCase()===b){k=j;break}j=j[a]}e[h]=k}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d="sizcache"+(Math.random()+"").replace(".",""),e=0,g=Object.prototype.toString,h=!1,i=!0,j=/\\/g,k=/\r\n/g,l=/\W/;[0,0].sort(function(){i=!1;return 0});var m=function(b,d,e,f){e=e||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return e;var i,j,k,l,n,q,r,t,u=!0,v=m.isXML(d),w=[],x=b;do{a.exec(""),i=a.exec(x);if(i){x=i[3],w.push(i[1]);if(i[2]){l=i[3];break}}}while(i);if(w.length>1&&p.exec(b))if(w.length===2&&o.relative[w[0]])j=y(w[0]+w[1],d,f);else{j=o.relative[w[0]]?[d]:m(w.shift(),d);while(w.length)b=w.shift(),o.relative[b]&&(b+=w.shift()),j=y(b,j,f)}else{!f&&w.length>1&&d.nodeType===9&&!v&&o.match.ID.test(w[0])&&!o.match.ID.test(w[w.length-1])&&(n=m.find(w.shift(),d,v),d=n.expr?m.filter(n.expr,n.set)[0]:n.set[0]);if(d){n=f?{expr:w.pop(),set:s(f)}:m.find(w.pop(),w.length===1&&(w[0]==="~"||w[0]==="+")&&d.parentNode?d.parentNode:d,v),j=n.expr?m.filter(n.expr,n.set):n.set,w.length>0?k=s(j):u=!1;while(w.length)q=w.pop(),r=q,o.relative[q]?r=w.pop():q="",r==null&&(r=d),o.relative[q](k,r,v)}else k=w=[]}k||(k=j),k||m.error(q||b);if(g.call(k)==="[object Array]")if(!u)e.push.apply(e,k);else if(d&&d.nodeType===1)for(t=0;k[t]!=null;t++)k[t]&&(k[t]===!0||k[t].nodeType===1&&m.contains(d,k[t]))&&e.push(j[t]);else for(t=0;k[t]!=null;t++)k[t]&&k[t].nodeType===1&&e.push(j[t]);else s(k,e);l&&(m(l,h,e,f),m.uniqueSort(e));return e};m.uniqueSort=function(a){if(u){h=i,a.sort(u);if(h)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},m.matches=function(a,b){return m(a,null,null,b)},m.matchesSelector=function(a,b){return m(b,null,null,[a]).length>0},m.find=function(a,b,c){var d,e,f,g,h,i;if(!a)return[];for(e=0,f=o.order.length;e<f;e++){h=o.order[e];if(g=o.leftMatch[h].exec(a)){i=g[1],g.splice(1,1);if(i.substr(i.length-1)!=="\\"){g[1]=(g[1]||"").replace(j,""),d=o.find[h](g,b,c);if(d!=null){a=a.replace(o.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},m.filter=function(a,c,d,e){var f,g,h,i,j,k,l,n,p,q=a,r=[],s=c,t=c&&c[0]&&m.isXML(c[0]);while(a&&c.length){for(h in o.filter)if((f=o.leftMatch[h].exec(a))!=null&&f[2]){k=o.filter[h],l=f[1],g=!1,f.splice(1,1);if(l.substr(l.length-1)==="\\")continue;s===r&&(r=[]);if(o.preFilter[h]){f=o.preFilter[h](f,s,d,r,e,t);if(!f)g=i=!0;else if(f===!0)continue}if(f)for(n=0;(j=s[n])!=null;n++)j&&(i=k(j,f,n,s),p=e^i,d&&i!=null?p?g=!0:s[n]=!1:p&&(r.push(j),g=!0));if(i!==b){d||(s=r),a=a.replace(o.match[h],"");if(!g)return[];break}}if(a===q)if(g==null)m.error(a);else break;q=a}return s},m.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)};var n=m.getText=function(a){var b,c,d=a.nodeType,e="";if(d){if(d===1||d===9||d===11){if(typeof a.textContent=="string")return a.textContent;if(typeof a.innerText=="string")return a.innerText.replace(k,"");for(a=a.firstChild;a;a=a.nextSibling)e+=n(a)}else if(d===3||d===4)return a.nodeValue}else for(b=0;c=a[b];b++)c.nodeType!==8&&(e+=n(c));return e},o=m.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!l.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&m.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!l.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&m.filter(b,a,!0)}},"":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("parentNode",b,f,a,d,c)},"~":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("previousSibling",b,f,a,d,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(j,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(j,"")},TAG:function(a,b){return a[1].replace(j,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||m.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&m.error(a[0]);a[0]=e++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(j,"");!f&&o.attrMap[g]&&(a[1]=o.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(j,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=m(b[3],null,null,c);else{var g=m.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(o.match.POS.test(b[0])||o.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!m(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=o.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||n([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}m.error(e)},CHILD:function(a,b){var c,e,f,g,h,i,j,k=b[1],l=a;switch(k){case"only":case"first":while(l=l.previousSibling)if(l.nodeType===1)return!1;if(k==="first")return!0;l=a;case"last":while(l=l.nextSibling)if(l.nodeType===1)return!1;return!0;case"nth":c=b[2],e=b[3];if(c===1&&e===0)return!0;f=b[0],g=a.parentNode;if(g&&(g[d]!==f||!a.nodeIndex)){i=0;for(l=g.firstChild;l;l=l.nextSibling)l.nodeType===1&&(l.nodeIndex=++i);g[d]=f}j=a.nodeIndex-e;return c===0?j===0:j%c===0&&j/c>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||!!a.nodeName&&a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=m.attr?m.attr(a,c):o.attrHandle[c]?o.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":!f&&m.attr?d!=null:f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=o.setFilters[e];if(f)return f(a,c,b,d)}}},p=o.match.POS,q=function(a,b){return"\\"+(b-0+1)};for(var r in o.match)o.match[r]=new RegExp(o.match[r].source+/(?![^\[]*\])(?![^\(]*\))/.source),o.leftMatch[r]=new RegExp(/(^(?:.|\r|\n)*?)/.source+o.match[r].source.replace(/\\(\d+)/g,q));o.match.globalPOS=p;var s=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(t){s=function(a,b){var c=0,d=b||[];if(g.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var e=a.length;c<e;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var u,v;c.documentElement.compareDocumentPosition?u=function(a,b){if(a===b){h=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(u=function(a,b){if(a===b){h=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,i=b.parentNode,j=g;if(g===i)return v(a,b);if(!g)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return v(e[k],f[k]);return k===c?v(a,f[k],-1):v(e[k],b,1)},v=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(o.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},o.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(o.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(o.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=m,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){m=function(b,e,f,g){e=e||c;if(!g&&!m.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return s(e.getElementsByTagName(b),f);if(h[2]&&o.find.CLASS&&e.getElementsByClassName)return s(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return s([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return s([],f);if(i.id===h[3])return s([i],f)}try{return s(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var k=e,l=e.getAttribute("id"),n=l||d,p=e.parentNode,q=/^\s*[+~]/.test(b);l?n=n.replace(/'/g,"\\$&"):e.setAttribute("id",n),q&&p&&(e=e.parentNode);try{if(!q||p)return s(e.querySelectorAll("[id='"+n+"'] "+b),f)}catch(r){}finally{l||k.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)m[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}m.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!m.isXML(a))try{if(e||!o.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return m(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;o.order.splice(1,0,"CLASS"),o.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?m.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?m.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:m.contains=function(){return!1},m.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var y=function(a,b,c){var d,e=[],f="",g=b.nodeType?[b]:b;while(d=o.match.PSEUDO.exec(a))f+=d[0],a=a.replace(o.match.PSEUDO,"");a=o.relative[a]?a+"*":a;for(var h=0,i=g.length;h<i;h++)m(a,g[h],e,c);return m.filter(f,e)};m.attr=f.attr,m.selectors.attrMap={},f.find=m,f.expr=m.selectors,f.expr[":"]=f.expr.filters,f.unique=m.uniqueSort,f.text=m.getText,f.isXMLDoc=m.isXML,f.contains=m.contains}();var L=/Until$/,M=/^(?:parents|prevUntil|prevAll)/,N=/,/,O=/^.[^:#\[\.,]*$/,P=Array.prototype.slice,Q=f.expr.match.globalPOS,R={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(T(this,a,!1),"not",a)},filter:function(a){return this.pushStack(T(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?Q.test(a)?f(a,this.context).index(this[0])>=0:f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h=1;while(g&&g.ownerDocument&&g!==b){for(d=0;d<a.length;d++)f(g).is(a[d])&&c.push({selector:a[d],elem:g,level:h});g=g.parentNode,h++}return c}var i=Q.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(i?i.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a)return this[0]&&this[0].parentNode?this.prevAll().length:-1;if(typeof a=="string")return f.inArray(this[0],f(a));return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(S(c[0])||S(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c);L.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!R[a]?f.unique(e):e,(this.length>1||N.test(d))&&M.test(a)&&(e=e.reverse());return this.pushStack(e,a,P.call(arguments).join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var V="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",W=/ jQuery\d+="(?:\d+|null)"/g,X=/^\s+/,Y=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,Z=/<([\w:]+)/,$=/<tbody/i,_=/<|&#?\w+;/,ba=/<(?:script|style)/i,bb=/<(?:script|object|embed|option|style)/i,bc=new RegExp("<(?:"+V+")[\\s/>]","i"),bd=/checked\s*(?:[^=]|=\s*.checked.)/i,be=/\/(java|ecma)script/i,bf=/^\s*<!(?:\[CDATA\[|\-\-)/,bg={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bh=U(c);bg.optgroup=bg.option,bg.tbody=bg.tfoot=bg.colgroup=bg.caption=bg.thead,bg.th=bg.td,f.support.htmlSerialize||(bg._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){return f.access(this,function(a){return a===b?f.text(this):this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=f.isFunction(a);return this.each(function(c){f(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f
.clean(arguments);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,f.clean(arguments));return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){return f.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return c.nodeType===1?c.innerHTML.replace(W,""):null;if(typeof a=="string"&&!ba.test(a)&&(f.support.leadingWhitespace||!X.test(a))&&!bg[(Z.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Y,"<$1></$2>");try{for(;d<e;d++)c=this[d]||{},c.nodeType===1&&(f.cleanData(c.getElementsByTagName("*")),c.innerHTML=a);c=0}catch(g){}}c&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bd.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bi(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,function(a,b){b.src?f.ajax({type:"GET",global:!1,url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bf,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)})}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i,j=a[0];b&&b[0]&&(i=b[0].ownerDocument||b[0]),i.createDocumentFragment||(i=c),a.length===1&&typeof j=="string"&&j.length<512&&i===c&&j.charAt(0)==="<"&&!bb.test(j)&&(f.support.checkClone||!bd.test(j))&&(f.support.html5Clone||!bc.test(j))&&(g=!0,h=f.fragments[j],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean(a,i,e,d)),g&&(f.fragments[j]=h?e:1);return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d,e,g,h=f.support.html5Clone||f.isXMLDoc(a)||!bc.test("<"+a.nodeName+">")?a.cloneNode(!0):bo(a);if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bk(a,h),d=bl(a),e=bl(h);for(g=0;d[g];++g)e[g]&&bk(d[g],e[g])}if(b){bj(a,h);if(c){d=bl(a),e=bl(h);for(g=0;d[g];++g)bj(d[g],e[g])}}d=e=null;return h},clean:function(a,b,d,e){var g,h,i,j=[];b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||b[0]&&b[0].ownerDocument||c);for(var k=0,l;(l=a[k])!=null;k++){typeof l=="number"&&(l+="");if(!l)continue;if(typeof l=="string")if(!_.test(l))l=b.createTextNode(l);else{l=l.replace(Y,"<$1></$2>");var m=(Z.exec(l)||["",""])[1].toLowerCase(),n=bg[m]||bg._default,o=n[0],p=b.createElement("div"),q=bh.childNodes,r;b===c?bh.appendChild(p):U(b).appendChild(p),p.innerHTML=n[1]+l+n[2];while(o--)p=p.lastChild;if(!f.support.tbody){var s=$.test(l),t=m==="table"&&!s?p.firstChild&&p.firstChild.childNodes:n[1]==="<table>"&&!s?p.childNodes:[];for(i=t.length-1;i>=0;--i)f.nodeName(t[i],"tbody")&&!t[i].childNodes.length&&t[i].parentNode.removeChild(t[i])}!f.support.leadingWhitespace&&X.test(l)&&p.insertBefore(b.createTextNode(X.exec(l)[0]),p.firstChild),l=p.childNodes,p&&(p.parentNode.removeChild(p),q.length>0&&(r=q[q.length-1],r&&r.parentNode&&r.parentNode.removeChild(r)))}var u;if(!f.support.appendChecked)if(l[0]&&typeof (u=l.length)=="number")for(i=0;i<u;i++)bn(l[i]);else bn(l);l.nodeType?j.push(l):j=f.merge(j,l)}if(d){g=function(a){return!a.type||be.test(a.type)};for(k=0;j[k];k++){h=j[k];if(e&&f.nodeName(h,"script")&&(!h.type||be.test(h.type)))e.push(h.parentNode?h.parentNode.removeChild(h):h);else{if(h.nodeType===1){var v=f.grep(h.getElementsByTagName("script"),g);j.splice.apply(j,[k+1,0].concat(v))}d.appendChild(h)}}}return j},cleanData:function(a){var b,c,d=f.cache,e=f.event.special,g=f.support.deleteExpando;for(var h=0,i;(i=a[h])!=null;h++){if(i.nodeName&&f.noData[i.nodeName.toLowerCase()])continue;c=i[f.expando];if(c){b=d[c];if(b&&b.events){for(var j in b.events)e[j]?f.event.remove(i,j):f.removeEvent(i,j,b.handle);b.handle&&(b.handle.elem=null)}g?delete i[f.expando]:i.removeAttribute&&i.removeAttribute(f.expando),delete d[c]}}}});var bp=/alpha\([^)]*\)/i,bq=/opacity=([^)]*)/,br=/([A-Z]|^ms)/g,bs=/^[\-+]?(?:\d*\.)?\d+$/i,bt=/^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,bu=/^([\-+])=([\-+.\de]+)/,bv=/^margin/,bw={position:"absolute",visibility:"hidden",display:"block"},bx=["Top","Right","Bottom","Left"],by,bz,bA;f.fn.css=function(a,c){return f.access(this,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)},a,c,arguments.length>1)},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=by(a,"opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d,h==="string"&&(g=bu.exec(d))&&(d=+(g[1]+1)*+g[2]+parseFloat(f.css(a,c)),h="number");if(d==null||h==="number"&&isNaN(d))return;h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(by)return by(a,c)},swap:function(a,b,c){var d={},e,f;for(f in b)d[f]=a.style[f],a.style[f]=b[f];e=c.call(a);for(f in b)a.style[f]=d[f];return e}}),f.curCSS=f.css,c.defaultView&&c.defaultView.getComputedStyle&&(bz=function(a,b){var c,d,e,g,h=a.style;b=b.replace(br,"-$1").toLowerCase(),(d=a.ownerDocument.defaultView)&&(e=d.getComputedStyle(a,null))&&(c=e.getPropertyValue(b),c===""&&!f.contains(a.ownerDocument.documentElement,a)&&(c=f.style(a,b))),!f.support.pixelMargin&&e&&bv.test(b)&&bt.test(c)&&(g=h.width,h.width=c,c=e.width,h.width=g);return c}),c.documentElement.currentStyle&&(bA=function(a,b){var c,d,e,f=a.currentStyle&&a.currentStyle[b],g=a.style;f==null&&g&&(e=g[b])&&(f=e),bt.test(f)&&(c=g.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),g.left=b==="fontSize"?"1em":f,f=g.pixelLeft+"px",g.left=c,d&&(a.runtimeStyle.left=d));return f===""?"auto":f}),by=bz||bA,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){if(c)return a.offsetWidth!==0?bB(a,b,d):f.swap(a,bw,function(){return bB(a,b,d)})},set:function(a,b){return bs.test(b)?b+"px":b}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return bq.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=f.isNumeric(b)?"alpha(opacity="+b*100+")":"",g=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&f.trim(g.replace(bp,""))===""){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bp.test(g)?g.replace(bp,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){return f.swap(a,{display:"inline-block"},function(){return b?by(a,"margin-right"):a.style.marginRight})}})}),f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style&&a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)}),f.each({margin:"",padding:"",border:"Width"},function(a,b){f.cssHooks[a+b]={expand:function(c){var d,e=typeof c=="string"?c.split(" "):[c],f={};for(d=0;d<4;d++)f[a+bx[d]+b]=e[d]||e[d-2]||e[0];return f}}});var bC=/%20/g,bD=/\[\]$/,bE=/\r?\n/g,bF=/#.*$/,bG=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bH=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bI=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,bJ=/^(?:GET|HEAD)$/,bK=/^\/\//,bL=/\?/,bM=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bN=/^(?:select|textarea)/i,bO=/\s+/,bP=/([?&])_=[^&]*/,bQ=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bR=f.fn.load,bS={},bT={},bU,bV,bW=["*/"]+["*"];try{bU=e.href}catch(bX){bU=c.createElement("a"),bU.href="",bU=bU.href}bV=bQ.exec(bU.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bR)return bR.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bM,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bN.test(this.nodeName)||bH.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bE,"\r\n")}}):{name:b.name,value:c.replace(bE,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.on(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?b$(a,f.ajaxSettings):(b=a,a=f.ajaxSettings),b$(a,b);return a},ajaxSettings:{url:bU,isLocal:bI.test(bV[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":bW},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:bY(bS),ajaxTransport:bY(bT),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a>0?4:0;var o,r,u,w=c,x=l?ca(d,v,l):b,y,z;if(a>=200&&a<300||a===304){if(d.ifModified){if(y=v.getResponseHeader("Last-Modified"))f.lastModified[k]=y;if(z=v.getResponseHeader("Etag"))f.etag[k]=z}if(a===304)w="notmodified",o=!0;else try{r=cb(d,x),w="success",o=!0}catch(A){w="parsererror",u=A}}else{u=w;if(!w||a)w="error",a<0&&(a=0)}v.status=a,v.statusText=""+(c||w),o?h.resolveWith(e,[r,w,v]):h.rejectWith(e,[v,w,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.fireWith(e,[v,w]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f.Callbacks("once memory"),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bG.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.add,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bF,"").replace(bK,bV[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bO),d.crossDomain==null&&(r=bQ.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bV[1]&&r[2]==bV[2]&&(r[3]||(r[1]==="http:"?80:443))==(bV[3]||(bV[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),bZ(bS,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bJ.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bL.test(d.url)?"&":"?")+d.data,delete d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bP,"$1_="+x);d.url=y+(y===d.url?(bL.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", "+bW+"; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=bZ(bT,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){if(s<2)w(-1,z);else throw z}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)b_(g,a[g],c,e);return d.join("&").replace(bC,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var cc=f.now(),cd=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+cc++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=typeof b.data=="string"&&/^application\/x\-www\-form\-urlencoded/.test(b.contentType);if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(cd.test(b.url)||e&&cd.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(cd,l),b.url===j&&(e&&(k=k.replace(cd,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var ce=a.ActiveXObject?function(){for(var a in cg)cg[a](0,1)}:!1,cf=0,cg;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ch()||ci()}:ch,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,ce&&delete cg[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n);try{m.text=h.responseText}catch(a){}try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++cf,ce&&(cg||(cg={},f(a).unload(ce)),cg[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var cj={},ck,cl,cm=/^(?:toggle|show|hide)$/,cn=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,co,cp=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],cq;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(ct("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),(e===""&&f.css(d,"display")==="none"||!f.contains(d.ownerDocument.documentElement,d))&&f._data(d,"olddisplay",cu(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(ct("hide",3),a,b,c);var d,e,g=0,h=this.length;for(;g<h;g++)d=this[g],d.style&&(e=f.css(d,"display"),e!=="none"&&!f._data(d,"olddisplay")&&f._data(d,"olddisplay",e));for(g=0;g<h;g++)this[g].style&&(this[g].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(ct("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){function g(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o,p,q;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]);if((k=f.cssHooks[g])&&"expand"in k){l=k.expand(a[g]),delete a[g];for(i in l)i in a||(a[i]=l[i])}}for(g in a){h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(!f.support.inlineBlockNeedsLayout||cu(this.nodeName)==="inline"?this.style.display="inline-block":this.style.zoom=1))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)j=new f.fx(this,b,i),h=a[i],cm.test(h)?(q=f._data(this,"toggle"+i)||(h==="toggle"?d?"show":"hide":0),q?(f._data(this,"toggle"+i,q==="show"?"hide":"show"),j[q]()):j[h]()):(m=cn.exec(h),n=j.cur(),m?(o=parseFloat(m[2]),p=m[3]||(f.cssNumber[i]?"":"px"),p!=="px"&&(f.style(this,i,(o||1)+p),n=(o||1)/j.cur()*n,f.style(this,i,n+p)),m[1]&&(o=(m[1]==="-="?-1:1)*o+n),j.custom(n,o,p)):j.custom(n,h,""));return!0}var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return e.queue===!1?this.each(g):this.queue(e.queue,g)},stop:function(a,c,d){typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]);return this.each(function(){function h(a,b,c){var e=b[c];f.removeData(a,c,!0),e.stop(d)}var b,c=!1,e=f.timers,g=f._data(this);d||f._unmark(!0,this);if(a==null)for(b in g)g[b]&&g[b].stop&&b.indexOf(".run")===b.length-4&&h(this,g,b);else g[b=a+".run"]&&g[b].stop&&h(this,g,b);for(b=e.length;b--;)e[b].elem===this&&(a==null||e[b].queue===a)&&(d?e[b](!0):e[b].saveState(),c=!0,e.splice(b,1));(!d||!c)&&f.dequeue(this,a)})}}),f.each({slideDown:ct("show",1),slideUp:ct("hide",1),slideToggle:ct("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";d.old=d.complete,d.complete=function(a){f.isFunction(d.old)&&d.old.call(this),d.queue?f.dequeue(this,d.queue):a!==!1&&f._unmark(this)};return d},easing:{linear:function(a){return a},swing:function(a){return-Math.cos(a*Math.PI)/2+.5}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,c,d){function h(a){return e.step(a)}var e=this,g=f.fx;this.startTime=cq||cr(),this.end=c,this.now=this.start=a,this.pos=this.state=0,this.unit=d||this.unit||(f.cssNumber[this.prop]?"":"px"),h.queue=this.options.queue,h.elem=this.elem,h.saveState=function(){f._data(e.elem,"fxshow"+e.prop)===b&&(e.options.hide?f._data(e.elem,"fxshow"+e.prop,e.start):e.options.show&&f._data(e.elem,"fxshow"+e.prop,e.end))},h()&&f.timers.push(h)&&!co&&(co=setInterval(g.tick,g.interval))},show:function(){var a=f._data(this.elem,"fxshow"+this.prop);this.options.orig[this.prop]=a||f.style(this.elem,this.prop),this.options.show=!0,a!==b?this.custom(this.cur(),a):this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f._data(this.elem,"fxshow"+this.prop)||f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b,c,d,e=cq||cr(),g=!0,h=this.elem,i=this.options;if(a||e>=i.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),i.animatedProperties[this.prop]=!0;for(b in i.animatedProperties)i.animatedProperties[b]!==!0&&(g=!1);if(g){i.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){h.style["overflow"+b]=i.overflow[a]}),i.hide&&f(h).hide();if(i.hide||i.show)for(b in i.animatedProperties)f.style(h,b,i.orig[b]),f.removeData(h,"fxshow"+b,!0),f.removeData(h,"toggle"+b,!0);d=i.complete,d&&(i.complete=!1,d.call(h))}return!1}i.duration==Infinity?this.now=e:(c=e-this.startTime,this.state=c/i.duration,this.pos=f.easing[i.animatedProperties[this.prop]](this.state,c,0,1,i.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){var a,b=f.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||f.fx.stop()},interval:13,stop:function(){clearInterval(co),co=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=a.now+a.unit:a.elem[a.prop]=a.now}}}),f.each(cp.concat.apply([],cp),function(a,b){b.indexOf("margin")&&(f.fx.step[b]=function(a){f.style(a.elem,b,Math.max(0,a.now)+a.unit)})}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cv,cw=/^t(?:able|d|h)$/i,cx=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?cv=function(a,b,c,d){try{d=a.getBoundingClientRect()}catch(e){}if(!d||!f.contains(c,a))return d?{top:d.top,left:d.left}:{top:0,left:0};var g=b.body,h=cy(b),i=c.clientTop||g.clientTop||0,j=c.clientLeft||g.clientLeft||0,k=h.pageYOffset||f.support.boxModel&&c.scrollTop||g.scrollTop,l=h.pageXOffset||f.support.boxModel&&c.scrollLeft||g.scrollLeft,m=d.top+k-i,n=d.left+l-j;return{top:m,left:n}}:cv=function(a,b,c){var d,e=a.offsetParent,g=a,h=b.body,i=b.defaultView,j=i?i.getComputedStyle(a,null):a.currentStyle,k=a.offsetTop,l=a.offsetLeft;while((a=a.parentNode)&&a!==h&&a!==c){if(f.support.fixedPosition&&j.position==="fixed")break;d=i?i.getComputedStyle(a,null):a.currentStyle,k-=a.scrollTop,l-=a.scrollLeft,a===e&&(k+=a.offsetTop,l+=a.offsetLeft,f.support.doesNotAddBorder&&(!f.support.doesAddBorderForTableAndCells||!cw.test(a.nodeName))&&(k+=parseFloat(d.borderTopWidth)||0,l+=parseFloat(d.borderLeftWidth)||0),g=e,e=a.offsetParent),f.support.subtractsBorderForOverflowNotVisible&&d.overflow!=="visible"&&(k+=parseFloat(d.borderTopWidth)||0,l+=parseFloat(d.borderLeftWidth)||0),j=d}if(j.position==="relative"||j.position==="static")k+=h.offsetTop,l+=h.offsetLeft;f.support.fixedPosition&&j.position==="fixed"&&(k+=Math.max(c.scrollTop,h.scrollTop),l+=Math.max(c.scrollLeft,h.scrollLeft));return{top:k,left:l}},f.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){f.offset.setOffset(this,a,b)});var c=this[0],d=c&&c.ownerDocument;if(!d)return null;if(c===d.body)return f.offset.bodyOffset(c);return cv(c,d,d.documentElement)},f.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=cx.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!cx.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,c){var d=/Y/.test(c);f.fn[a]=function(e){return f.access(this,function(a,e,g){var h=cy(a);if(g===b)return h?c in h?h[c]:f.support.boxModel&&h.document.documentElement[e]||h.document.body[e]:a[e];h?h.scrollTo(d?f(h).scrollLeft():g,d?g:f(h).scrollTop()):a[e]=g},a,e,arguments.length,null)}}),f.each({Height:"height",Width:"width"},function(a,c){var d="client"+a,e="scroll"+a,g="offset"+a;f.fn["inner"+a]=function(){var a=this[0];return a?a.style?parseFloat(f.css(a,c,"padding")):this[c]():null},f.fn["outer"+a]=function(a){var b=this[0];return b?b.style?parseFloat(f.css(b,c,a?"margin":"border")):this[c]():null},f.fn[c]=function(a){return f.access(this,function(a,c,h){var i,j,k,l;if(f.isWindow(a)){i=a.document,j=i.documentElement[d];return f.support.boxModel&&j||i.body&&i.body[d]||j}if(a.nodeType===9){i=a.documentElement;if(i[d]>=i[e])return i[d];return Math.max(a.body[e],i[e],a.body[g],i[g])}if(h===b){k=f.css(a,c),l=parseFloat(k);return f.isNumeric(l)?l:k}f(a).css(c,h)},c,a,arguments.length,null)}}),a.jQuery=a.$=f,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return f})})(window);

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

/**
 *  markItUp! Universal MarkUp Engine, JQuery plugin 
* v 1.1.12
* Dual licensed under the MIT and GPL licenses.
* Copyright (C) 2007-2011 Jay Salvat
* http://markitup.jaysalvat.com/
*/
(function($){$.fn.markItUp=function(settings,extraSettings){var options,ctrlKey,shiftKey,altKey;ctrlKey=shiftKey=altKey=false;options={id:'',nameSpace:'',root:'',previewInWindow:'',previewAutoRefresh:true,previewPosition:'after',previewTemplatePath:'~/templates/preview.html',previewParser:false,previewParserPath:'',previewParserVar:'data',resizeHandle:true,beforeInsert:'',afterInsert:'',onEnter:{},onShiftEnter:{},onCtrlEnter:{},onTab:{},markupSet:[{}]};$.extend(options,settings,extraSettings);if(!options.root){$('script').each(function(a,tag){miuScript=$(tag).get(0).src.match(/(.*)jquery\.markitup(\.pack)?\.js$/);if(miuScript!==null){options.root=miuScript[1]}})}return this.each(function(){var $$,textarea,levels,scrollPosition,caretPosition,caretOffset,clicked,hash,header,footer,previewWindow,template,iFrame,abort;$$=$(this);textarea=this;levels=[];abort=false;scrollPosition=caretPosition=0;caretOffset=-1;options.previewParserPath=localize(options.previewParserPath);options.previewTemplatePath=localize(options.previewTemplatePath);function localize(data,inText){if(inText){return data.replace(/("|')~\//g,"$1"+options.root)}return data.replace(/^~\//,options.root)}function init(){id='';nameSpace='';if(options.id){id='id="'+options.id+'"'}else if($$.attr("id")){id='id="markItUp'+($$.attr("id").substr(0,1).toUpperCase())+($$.attr("id").substr(1))+'"'}if(options.nameSpace){nameSpace='class="'+options.nameSpace+'"'}$$.wrap('<div '+nameSpace+'></div>');$$.wrap('<div '+id+' class="markItUp"></div>');$$.wrap('<div class="markItUpContainer"></div>');$$.addClass("markItUpEditor");header=$('<div class="markItUpHeader"></div>').insertBefore($$);$(dropMenus(options.markupSet)).appendTo(header);footer=$('<div class="markItUpFooter"></div>').insertAfter($$);if(options.resizeHandle===true&&$.browser.safari!==true){resizeHandle=$('<div class="markItUpResizeHandle"></div>').insertAfter($$).bind("mousedown",function(e){var h=$$.height(),y=e.clientY,mouseMove,mouseUp;mouseMove=function(e){$$.css("height",Math.max(20,e.clientY+h-y)+"px");return false};mouseUp=function(e){$("html").unbind("mousemove",mouseMove).unbind("mouseup",mouseUp);return false};$("html").bind("mousemove",mouseMove).bind("mouseup",mouseUp)});footer.append(resizeHandle)}$$.keydown(keyPressed).keyup(keyPressed);$$.bind("insertion",function(e,settings){if(settings.target!==false){get()}if(textarea===$.markItUp.focused){markup(settings)}});$$.focus(function(){$.markItUp.focused=this})}function dropMenus(markupSet){var ul=$('<ul></ul>'),i=0;$('li:hover > ul',ul).css('display','block');$.each(markupSet,function(){var button=this,t='',title,li,j;title=(button.key)?(button.name||'')+' [Ctrl+'+button.key+']':(button.name||'');key=(button.key)?'accesskey="'+button.key+'"':'';if(button.separator){li=$('<li class="markItUpSeparator">'+(button.separator||'')+'</li>').appendTo(ul)}else{i++;for(j=levels.length-1;j>=0;j--){t+=levels[j]+"-"}li=$('<li class="markItUpButton markItUpButton'+t+(i)+' '+(button.className||'')+'"><a href="" '+key+' title="'+title+'">'+(button.name||'')+'</a></li>').bind("contextmenu",function(){return false}).click(function(){return false}).bind("focusin",function(){$$.focus()}).mouseup(function(){if(button.call){eval(button.call)()}setTimeout(function(){markup(button)},1);return false}).hover(function(){$('> ul',this).show();$(document).one('click',function(){$('ul ul',header).hide()})},function(){$('> ul',this).hide()}).appendTo(ul);if(button.dropMenu){levels.push(i);$(li).addClass('markItUpDropMenu').append(dropMenus(button.dropMenu))}}});levels.pop();return ul}function magicMarkups(string){if(string){string=string.toString();string=string.replace(/\(\!\(([\s\S]*?)\)\!\)/g,function(x,a){var b=a.split('|!|');if(altKey===true){return(b[1]!==undefined)?b[1]:b[0]}else{return(b[1]===undefined)?"":b[0]}});string=string.replace(/\[\!\[([\s\S]*?)\]\!\]/g,function(x,a){var b=a.split(':!:');if(abort===true){return false}value=prompt(b[0],(b[1])?b[1]:'');if(value===null){abort=true}return value});return string}return""}function prepare(action){if($.isFunction(action)){action=action(hash)}return magicMarkups(action)}function build(string){var openWith=prepare(clicked.openWith);var placeHolder=prepare(clicked.placeHolder);var replaceWith=prepare(clicked.replaceWith);var closeWith=prepare(clicked.closeWith);var openBlockWith=prepare(clicked.openBlockWith);var closeBlockWith=prepare(clicked.closeBlockWith);var multiline=clicked.multiline;if(replaceWith!==""){block=openWith+replaceWith+closeWith}else if(selection===''&&placeHolder!==''){block=openWith+placeHolder+closeWith}else{string=string||selection;var lines=selection.split(/\r?\n/),blocks=[];for(var l=0;l<lines.length;l++){line=lines[l];var trailingSpaces;if(trailingSpaces=line.match(/ *$/)){blocks.push(openWith+line.replace(/ *$/g,'')+closeWith+trailingSpaces)}else{blocks.push(openWith+line+closeWith)}}block=blocks.join("\n")}block=openBlockWith+block+closeBlockWith;return{block:block,openWith:openWith,replaceWith:replaceWith,placeHolder:placeHolder,closeWith:closeWith}}function markup(button){var len,j,n,i;hash=clicked=button;get();$.extend(hash,{line:"",root:options.root,textarea:textarea,selection:(selection||''),caretPosition:caretPosition,ctrlKey:ctrlKey,shiftKey:shiftKey,altKey:altKey});prepare(options.beforeInsert);prepare(clicked.beforeInsert);if((ctrlKey===true&&shiftKey===true)||button.multiline===true){prepare(clicked.beforeMultiInsert)}$.extend(hash,{line:1});if((ctrlKey===true&&shiftKey===true)){lines=selection.split(/\r?\n/);for(j=0,n=lines.length,i=0;i<n;i++){if($.trim(lines[i])!==''){$.extend(hash,{line:++j,selection:lines[i]});lines[i]=build(lines[i]).block}else{lines[i]=""}}string={block:lines.join('\n')};start=caretPosition;len=string.block.length+(($.browser.opera)?n-1:0)}else if(ctrlKey===true){string=build(selection);start=caretPosition+string.openWith.length;len=string.block.length-string.openWith.length-string.closeWith.length;len=len-(string.block.match(/ $/)?1:0);len-=fixIeBug(string.block)}else if(shiftKey===true){string=build(selection);start=caretPosition;len=string.block.length;len-=fixIeBug(string.block)}else{string=build(selection);start=caretPosition+string.block.length;len=0;start-=fixIeBug(string.block)}if((selection===''&&string.replaceWith==='')){caretOffset+=fixOperaBug(string.block);start=caretPosition+string.openWith.length;len=string.block.length-string.openWith.length-string.closeWith.length;caretOffset=$$.val().substring(caretPosition,$$.val().length).length;caretOffset-=fixOperaBug($$.val().substring(0,caretPosition))}$.extend(hash,{caretPosition:caretPosition,scrollPosition:scrollPosition});if(string.block!==selection&&abort===false){insert(string.block);set(start,len)}else{caretOffset=-1}get();$.extend(hash,{line:'',selection:selection});if((ctrlKey===true&&shiftKey===true)||button.multiline===true){prepare(clicked.afterMultiInsert)}prepare(clicked.afterInsert);prepare(options.afterInsert);if(previewWindow&&options.previewAutoRefresh){refreshPreview()}shiftKey=altKey=ctrlKey=abort=false}function fixOperaBug(string){if($.browser.opera){return string.length-string.replace(/\n*/g,'').length}return 0}function fixIeBug(string){if($.browser.msie){return string.length-string.replace(/\r*/g,'').length}return 0}function insert(block){if(document.selection){var newSelection=document.selection.createRange();newSelection.text=block}else{textarea.value=textarea.value.substring(0,caretPosition)+block+textarea.value.substring(caretPosition+selection.length,textarea.value.length)}}function set(start,len){if(textarea.createTextRange){if($.browser.opera&&$.browser.version>=9.5&&len==0){return false}range=textarea.createTextRange();range.collapse(true);range.moveStart('character',start);range.moveEnd('character',len);range.select()}else if(textarea.setSelectionRange){textarea.setSelectionRange(start,start+len)}textarea.scrollTop=scrollPosition;textarea.focus()}function get(){textarea.focus();scrollPosition=textarea.scrollTop;if(document.selection){selection=document.selection.createRange().text;if($.browser.msie){var range=document.selection.createRange(),rangeCopy=range.duplicate();rangeCopy.moveToElementText(textarea);caretPosition=-1;while(rangeCopy.inRange(range)){rangeCopy.moveStart('character');caretPosition++}}else{caretPosition=textarea.selectionStart}}else{caretPosition=textarea.selectionStart;selection=textarea.value.substring(caretPosition,textarea.selectionEnd)}return selection}function preview(){if(!previewWindow||previewWindow.closed){if(options.previewInWindow){previewWindow=window.open('','preview',options.previewInWindow);$(window).unload(function(){previewWindow.close()})}else{iFrame=$('<iframe class="markItUpPreviewFrame"></iframe>');if(options.previewPosition=='after'){iFrame.insertAfter(footer)}else{iFrame.insertBefore(header)}previewWindow=iFrame[iFrame.length-1].contentWindow||frame[iFrame.length-1]}}else if(altKey===true){if(iFrame){iFrame.remove()}else{previewWindow.close()}previewWindow=iFrame=false}if(!options.previewAutoRefresh){refreshPreview()}if(options.previewInWindow){previewWindow.focus()}}function refreshPreview(){renderPreview()}function renderPreview(){var phtml;if(options.previewParser&&typeof options.previewParser==='function'){var data=options.previewParser($$.val());writeInPreview(localize(data,1))}else if(options.previewParserPath!==''){$.ajax({type:'POST',dataType:'text',global:false,url:options.previewParserPath,data:options.previewParserVar+'='+encodeURIComponent($$.val()),success:function(data){writeInPreview(localize(data,1))}})}else{if(!template){$.ajax({url:options.previewTemplatePath,dataType:'text',global:false,success:function(data){writeInPreview(localize(data,1).replace(/<!-- content -->/g,$$.val()))}})}}return false}function writeInPreview(data){if(previewWindow.document){try{sp=previewWindow.document.documentElement.scrollTop}catch(e){sp=0}previewWindow.document.open();previewWindow.document.write(data);previewWindow.document.close();previewWindow.document.documentElement.scrollTop=sp}}function keyPressed(e){shiftKey=e.shiftKey;altKey=e.altKey;ctrlKey=(!(e.altKey&&e.ctrlKey))?(e.ctrlKey||e.metaKey):false;if(e.type==='keydown'){if(ctrlKey===true){li=$('a[accesskey="'+String.fromCharCode(e.keyCode)+'"]',header).parent('li');if(li.length!==0){ctrlKey=false;setTimeout(function(){li.triggerHandler('mouseup')},1);return false}}if(e.keyCode===13||e.keyCode===10){if(ctrlKey===true){ctrlKey=false;markup(options.onCtrlEnter);return options.onCtrlEnter.keepDefault}else if(shiftKey===true){shiftKey=false;markup(options.onShiftEnter);return options.onShiftEnter.keepDefault}else{markup(options.onEnter);return options.onEnter.keepDefault}}if(e.keyCode===9){if(shiftKey==true||ctrlKey==true||altKey==true){return false}if(caretOffset!==-1){get();caretOffset=$$.val().length-caretOffset;set(caretOffset,0);caretOffset=-1;return false}else{markup(options.onTab);return options.onTab.keepDefault}}}}init()})};$.fn.markItUpRemove=function(){return this.each(function(){var $$=$(this).unbind().removeClass('markItUpEditor');$$.parent('div').parent('div.markItUp').parent('div').replaceWith($$)})};$.markItUp=function(settings){var options={target:false};$.extend(options,settings);if(options.target){return $(options.target).each(function(){$(this).focus();$(this).trigger('insertion',[options])})}else{$('textarea').trigger('insertion',[options])}}})(jQuery);

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
