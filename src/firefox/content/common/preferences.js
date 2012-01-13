var firevortex_preferencesService = null;

// Gets a boolean preference, returning false if the preference is not set
function firevortex_getBooleanPreference(preference, userPreference) {
    // If the preference is set
    if(preference) {
        // If not a user preference or a user preference is set
        if(!userPreference || firevortex_isPreferenceSet(preference)) {
            try {
                return firevortex_getPreferencesService().getBoolPref(preference);
            } catch(exception) {
                // Do nothing
            }
        }
    }
    
    return false;
}

// Gets the preferences service
function firevortex_getPreferencesService() {
    // If the preferences service is not set
    if(!firevortex_preferencesService) {
        firevortex_preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    }
    
    return firevortex_preferencesService;
}

// Is a preference set
function firevortex_isPreferenceSet(preference) {

    // If the preference is set
    if(preference) {
        return firevortex_getPreferencesService().prefHasUserValue(preference);
    }
    
    return false;
}
