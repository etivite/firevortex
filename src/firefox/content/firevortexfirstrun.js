var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var obsSvc = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);



var FireVortexWelcomeOverlay = {

	init: function() {
		try {
			// Firefox 4 and later; Mozilla 2 and later
			Components.utils.import("resource://gre/modules/AddonManager.jsm");
			AddonManager.getAddonByID("{50ba92ba-8f28-11dc-8314-0800200c9a66}", function(addon) {
				FireVortexWelcomeOverlay.checkFirstRun( addon.version );
			});
		} catch (ex) {
			// Firefox 3.6 and before; Mozilla 1.9.2 and before
			var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
			var addon = em.getItemForID("{50ba92ba-8f28-11dc-8314-0800200c9a66}");
			FireVortexWelcomeOverlay.checkFirstRun( addon.version );
		}
	},

	checkFirstRun: function(currentVer) {
		var ver = "-1", firstrun = true;
			
		try {
			//get our pref	
			firstrun = pref.getBoolPref("firevortex.app.firstrun");
			ver = pref.getCharPref("firevortex.app.version");
		} catch(e) {
			//nothing
		} finally {
		
			if (firstrun) {
				pref.setBoolPref("firevortex.app.firstrun",false);
				pref.setCharPref("firevortex.app.version",currentVer);
				
				//FireVortexWelcomeOverlay.PrepareToLaunchWelcome(true,currentVer);
				FireVortexWelcomeOverlay.tryLaunchWelcome(true,currentVer);
				
			}		
		  
			if (ver!=currentVer && !firstrun){ // !firstrun ensures that this section does not get loaded if its a first run.

				pref.setCharPref("firevortex.app.version",currentVer);
				
				//FireVortexWelcomeOverlay.PrepareToLaunchWelcome(false,currentVer);
				FireVortexWelcomeOverlay.tryLaunchWelcome(false,currentVer);
			}
			
		}

		window.removeEventListener("load",function(){ FireVortexWelcomeOverlay.init(); },true);
	},

	PrepareToLaunchWelcome: function (first,currentVer) {
		sessionRestoreObserve = {
			observe: function(subject, topic, data) {
				FireVortexWelcomeOverlay.tryLaunchWelcome(first,currentVer); 
			}
		};
		
		obsSvc.addObserver( sessionRestoreObserve,  "sessionstore-windows-restored" , false);
		
	},
	
	tryLaunchWelcome: function (first,currentVer) {

		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var mainWindow = wm.getMostRecentWindow("navigator:browser");
		var content = mainWindow.getBrowser();

		if (first) {
			window.setTimeout(function() { content.selectedTab = content.addTab("http://firevortex.net/welcome/"+currentVer+"/"); }, 1500); //Firefox 2 fix - or else tab will get closed
		} else {
			window.setTimeout(function() { content.selectedTab = content.addTab("http://firevortex.net/welcome/upgrade/"+currentVer+"/"); }, 1500); //Firefox 2 fix - or else tab will get closed
		}
	},

};

window.addEventListener("load",function(){ FireVortexWelcomeOverlay.init(); },true);
	
