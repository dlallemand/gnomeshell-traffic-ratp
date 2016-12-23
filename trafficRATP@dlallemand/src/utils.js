// Traffic RATP Gnome Extension
// @author Didier LALLEMAND <didier.lallemand@free.fr>

/**
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

'use strict';

const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.lib.convenience;
const Moment = Me.imports.lib.moment;
const GLib = imports.gi.GLib;
let settings;



function log(text) {
    global.log("[TrafficRATP] " + Moment.moment().locale(getLocale()).format('YYYY-MM-DD HH:mm:SS') + " "+ text);
}

function execCommand() {
    Convenience.initTranslations();
    settings = Convenience.getSettings();
    let command = settings.get_string("command-on-status-change");
    if (command != null && command != "") {
        let [res, out, err, status] = GLib.spawn_command_line_async(command);

        if (status == 0) {
            log("Error on command execution : '" + command + "'");
        }
    }
}


function getLocale(){
    //TODO : find a way to get from system !(?)
    return "fr";
}


function versionIsAtLeast(currentVersion, thresholdVersion) {
        currentVersion = currentVersion.split('.');
        thresholdVersion = thresholdVersion.split('.');

        // iterate over three version levels ("major.minor.patch")
        for( var i = 0 ; i < 3 ; ++i ) {
                // sanitize version levels
                currentVersion[i] = currentVersion[i] || 0;
                thresholdVersion[i] = thresholdVersion[i] || 0;

                if( currentVersion[i] > thresholdVersion[i] ) {
                        return true;
                }
                else if( currentVersion[i] < thresholdVersion[i] ) {
                        return false;
                }
                // otherwise the current level is equal and therefor we need to check the next level
        }

        // in this case all version levels are equal, we consider this as a match
        return true;
}

