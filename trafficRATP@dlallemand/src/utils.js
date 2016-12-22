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
const GLib = imports.gi.GLib;
let settings;


function init() {

}

function execCommand() {
    Convenience.initTranslations();
    settings = Convenience.getSettings();
    let command = settings.get_string("command-on-status-change");
    if (command != null && command != "") {
        let [res, out, err, status] = GLib.spawn_command_line_async(command);

        if (status == 0) {
            global.log("Error on command execution : '" + command + "'");
        }
    }
}
