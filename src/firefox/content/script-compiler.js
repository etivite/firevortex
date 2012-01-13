var firevortex_gmCompiler={

// getUrlContents adapted from Greasemonkey Compiler
// http://www.letitblog.com/code/python/greasemonkey.py.txt
// used under GPL permission
//
// most everything else below based heavily off of Greasemonkey
// http://greasemonkey.devjavu.com/
// used under GPL permission

getUrlContents: function(aUrl){
	var	ioService=Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	var	scriptableStream=Components
		.classes["@mozilla.org/scriptableinputstream;1"]
		.getService(Components.interfaces.nsIScriptableInputStream);
	var unicodeConverter=Components
		.classes["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	unicodeConverter.charset="UTF-8";

	var	channel=ioService.newChannel(aUrl, "UTF-8", null);
	var	input=channel.open();
	scriptableStream.init(input);
	var	str=scriptableStream.read(input.available());
	scriptableStream.close();
	input.close();

	try {
		return unicodeConverter.ConvertToUnicode(str);
	} catch (e) {
		return str;
	}
},

isGreasemonkeyable: function(url) {
	var scheme=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).extractScheme(url);
	
	//return ( scheme == "http" || scheme == "https" );
	
	switch (scheme) {
	    case "http" : return true;
	    case "https" : return true;
		case "about": return false;
	}
	
	return false;
},

isDomainCheck: function( host ) {
	
	switch( "http://"+ host ) {
		case "http://forums.vwvortex.com":  return true;
		case "http://forums.fourtitude.com":  return true;
		case "http://forums.thecarlounge.com":  return true;
		case "http://forums.thecarlounge.net":  return true;
		case "http://forums.subdriven.com":  return true;
		case "http://forums.swedespeed.com":  return true;
		case "http://forums.mwerks.com":  return true;
		case "http://forums.triplezoom.com":  return true;
		case "http://forums.speedarena.com":  return true;
		case "http://forums.motivemag.com":  return true;
		case "http://forums.kilometermagazine.com":  return true;
		case "http://audizine.com":  return true;
		case "http://www.audizine.com":  return true;
	}
	
	return false;
},

contentLoad: function(e) {
	var unsafeWin=e.target.defaultView;
	if (unsafeWin.wrappedJSObject) unsafeWin=unsafeWin.wrappedJSObject;
//var url = wrappedContentWin.document.location.href;

	var unsafeLoc=new XPCNativeWrapper(unsafeWin, "location").location;
	var href=new XPCNativeWrapper(unsafeLoc, "href").href;

var host=new XPCNativeWrapper(unsafeLoc, "host").host;

//&& ( /^http:\/\/forums\.vwvortex\.com\/.*$/.test(href) || /^http:\/\/forums\.fourtitude\.com\/.*$/.test(href) || /^http:\/\/forums\.thecarlounge\.net\/.*$/.test(href) || /^http:\/\/forums\.thecarlounge\.com\/.*$/.test(href) || /^http:\/\/forums\.subdriven\.com\/.*$/.test(href) || /^http:\/\/forums\.swedespeed\.com\/.*$/.test(href) || /^http:\/\/forums\.mwerks\.com\/.*$/.test(href) || /^http:\/\/forums\.triplezoom\.com\/.*$/.test(href) || /^http:\/\/forums\.speedarena\.com\/.*$/.test(href) || /^http:\/\/forums\.motivemag\.com\/.*$/.test(href) || /^http:\/\/forums\.turbonines\.com\/.*$/.test(href) || /^http:\/\/forums\.kilometermagazine\.com\/.*$/.test(href) || /^http:\/\/www\.audizine\.com\/forum\/.*$/.test(href) || /^http:\/\/audizine\.com\/forum\/.*$/.test(href) )

	if (
		firevortex_gmCompiler.isGreasemonkeyable(href) && firevortex_gmCompiler.isDomainCheck(host)
		&& !( /^http:\/\/ads2\.vortexmediagroup\.com\/.*$/.test(href) || /^http:\/\/www\.google-analytics\.com\/.*$/.test(href) || /^http:\/\/prstats\.postrelease\.com\/.*$/.test(href) || /^http:\/\/.*\.gmodules\.com\/.*$/.test(href) || /^http:\/\/.*\.googlesyndication\.com\/.*$/.test(href) || /^http:\/\/pagead2\.googlesyndication\.com\/.*$/.test(href) || /^http:\/\/.*\.vortexmediagroup\.com\/.*$/.test(href) || /^http:\/\/googleads\.g\.doubleclick\.net\/.*$/.test(href) || /^http:\/\/.*\.doubleclick\.net\/.*$/.test(href) || /^http:\/\/ad\.linksynergy\.com\/.*$/.test(href) || /^http:\/\/click\.linksynergy\.com\/.*$/.test(href) || /^http:\/\/stats\.big-boards\.com\/.*$/.test(href) || /^http:\/\/.*\.youtube\.com\/.*$/.test(href) || /^http:\/\/youtube\.com\/.*$/.test(href) || /^http:\/\/.*\.archive\.org\/.*$/.test(href) || /^http:\/\/vwvortex\.jbrlsr\.com\/.*$/.test(href) || /^http:\/\/la\.jbrlsr\.com\/.*$/.test(href) || /^http:\/\/www\.stumbleupon\.com\/.*$/.test(href) || /^http:\/\/http\.cdnlayer\.com\/.*$/.test(href) || /^http:\/\/ads\.adbrite\.com\/.*$/.test(href) || /^http:\/\/.*\.adbrite\.com\/.*$/.test(href) || /^http:\/\/ad\.technoratimedia\.com\/.*$/.test(href) || /^http:\/\/ad-cdn\.technoratimedia\.com\/.*$/.test(href) || /^http:\/\/.*\.technoratimedia\.com\/.*$/.test(href) || /^http:\/\/.*\.turn\.com\/.*$/.test(href) || /^http:\/\/.*\.yieldmanager\.com\/.*$/.test(href) || /^http:\/\/.*\.scorecardresearch\.com\/.*$/.test(href) || /^http:\/\/edge\.quantserve\.com\/.*$/.test(href) || /^http:\/\/api\.viglink\.com\/.*$/.test(href) || /^http:\/\/.*\.realmedia\.com\/.*$/.test(href) || /^http:\/\/m\.audizine\.com\/.*$/.test(href) )
	) {
		var script=firevortex_gmCompiler.getUrlContents('chrome://firevortex/content/firevortex.js');
		firevortex_gmCompiler.injectScript(script, href, unsafeWin);
	}
},

injectScript: function(script, url, unsafeContentWin) {
	var sandbox, script, logger, storage, xmlhttpRequester;
	var safeWin=new XPCNativeWrapper(unsafeContentWin);

	sandbox=new Components.utils.Sandbox(safeWin);

	var storage=new firevortex_ScriptStorage();
	xmlhttpRequester=new firevortex_xmlhttpRequester(
		unsafeContentWin, window//appSvc.hiddenDOMWindow
	);

	sandbox.window=safeWin;
	sandbox.document=sandbox.window.document;
	sandbox.unsafeWindow=unsafeContentWin;

	// patch missing properties on xpcnw
	sandbox.XPathResult=Components.interfaces.nsIDOMXPathResult;

	// add our own APIs
	sandbox.GM_addStyle=function(css) { firevortex_gmCompiler.addStyle(sandbox.document, css) };
	sandbox.GM_setValue=firevortex_gmCompiler.hitch(storage, "setValue");
	sandbox.GM_getValue=firevortex_gmCompiler.hitch(storage, "getValue");
	sandbox.GM_openInTab=firevortex_gmCompiler.hitch(this, "openInTab", unsafeContentWin);
	sandbox.GM_xmlhttpRequest=firevortex_gmCompiler.hitch(
		xmlhttpRequester, "contentStartRequest"
	);
	//unsupported
	sandbox.GM_registerMenuCommand=function(){};
	sandbox.GM_log=function(){};
	sandbox.GM_getResourceURL=function(){};
	sandbox.GM_getResourceText=function(){};

	sandbox.__proto__=sandbox.window;

	try {
		this.evalInSandbox(
			"(function(){"+script+"})()",
			url,
			sandbox);
	} catch (e) {
		//var e2=new Error(typeof e=="string" ? e : e.message);
		//e2.fileName=script.filename;
		//e2.lineNumber=0;
		//GM_logError(e2);
		//alert(e2);
		Components.utils.reportError(e);
	}
},

evalInSandbox: function(code, codebase, sandbox) {
	if (Components.utils && Components.utils.Sandbox) {
		// DP beta+
		Components.utils.evalInSandbox(code, sandbox);
	} else if (Components.utils && Components.utils.evalInSandbox) {
		// DP alphas
		Components.utils.evalInSandbox(code, codebase, sandbox);
	} else if (Sandbox) {
		// 1.0.x
		evalInSandbox(code, sandbox, codebase);
	} else {
		throw new Error("Could not create sandbox.");
	}
},

openInTab: function(unsafeContentWin, url) {
	var tabBrowser = getBrowser(), browser, isMyWindow = false;
	for (var i = 0; browser = tabBrowser.browsers[i]; i++)
		if (browser.contentWindow == unsafeContentWin) {
			isMyWindow = true;
			break;
		}
	if (!isMyWindow) return;
 
	var loadInBackground, sendReferrer, referrer = null;
	loadInBackground = tabBrowser.mPrefs.getBoolPref("browser.tabs.loadInBackground");
	sendReferrer = tabBrowser.mPrefs.getIntPref("network.http.sendRefererHeader");
	if (sendReferrer) {
		var ios = Components.classes["@mozilla.org/network/io-service;1"]
							.getService(Components.interfaces.nsIIOService);
		referrer = ios.newURI(content.document.location.href, null, null);
	 }
	 tabBrowser.loadOneTab(url, referrer, null, null, loadInBackground);
 },
 
 hitch: function(obj, meth) {
	var unsafeTop = new XPCNativeWrapper(unsafeContentWin, "top").top;

	for (var i = 0; i < this.browserWindows.length; i++) {
		this.browserWindows[i].openInTab(unsafeTop, url);
	}
},

apiLeakCheck: function(allowedCaller) {
	var stack=Components.stack;

	var leaked=false;
	do {
		if (2==stack.language) {
			if ('chrome'!=stack.filename.substr(0, 6) &&
				allowedCaller!=stack.filename 
			) {
				leaked=true;
				break;
			}
		}

		stack=stack.caller;
	} while (stack);

	return leaked;
},

hitch: function(obj, meth) {
	if (!obj[meth]) {
		throw "method '" + meth + "' does not exist on object '" + obj + "'";
	}

	var hitchCaller=Components.stack.caller.filename;
	var staticArgs = Array.prototype.splice.call(arguments, 2, arguments.length);

	return function() {
		if (firevortex_gmCompiler.apiLeakCheck(hitchCaller)) {
			return;
		}
		
		// make a copy of staticArgs (don't modify it because it gets reused for
		// every invocation).
		var args = staticArgs.concat();

		// add all the new arguments
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		// invoke the original function with the correct this obj and the combined
		// list of static and dynamic arguments.
		return obj[meth].apply(obj, args);
	};
},

addStyle:function(doc, css) {
	var head, style;
	head = doc.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = doc.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
},

onLoad: function() {
	var	appcontent=window.document.getElementById("appcontent");
	if (appcontent && !appcontent.greased_firevortex_gmCompiler) {
		appcontent.greased_firevortex_gmCompiler=true;
		appcontent.addEventListener("DOMContentLoaded", firevortex_gmCompiler.contentLoad, false);
	}
},

onUnLoad: function() {
	//remove now unnecessary listeners
	window.removeEventListener('load', firevortex_gmCompiler.onLoad, false);
	window.removeEventListener('unload', firevortex_gmCompiler.onUnLoad, false);
	window.document.getElementById("appcontent")
		.removeEventListener("DOMContentLoaded", firevortex_gmCompiler.contentLoad, false);
},

}; //object firevortex_gmCompiler


function firevortex_ScriptStorage() {
	this.prefMan=new firevortex_PrefManager();
}
firevortex_ScriptStorage.prototype.setValue = function(name, val) {
	this.prefMan.setValue(name, val);
}
firevortex_ScriptStorage.prototype.getValue = function(name, defVal) {
	return this.prefMan.getValue(name, defVal);
}


window.addEventListener('load', firevortex_gmCompiler.onLoad, false);
window.addEventListener('unload', firevortex_gmCompiler.onUnLoad, false);
