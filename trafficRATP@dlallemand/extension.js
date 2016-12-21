// Docker menu extension
// @author Didier LALLEMAND <didier.lallemand@gmail.com>

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

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TrafficRatpMenu = Me.imports.src.trafficRatpMenu;
const RatpAPI = Me.imports.src.ratpAPI;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Convenience = Me.imports.lib.convenience;
const Moment = Me.imports.lib.moment;


let mainloop;

let compteur = 0;

let lastStatus = "";

let currentLine;

let settings;


function mainloopInit() {
    mainloop = Mainloop.timeout_add_seconds(30, Lang.bind(this, updateStatus));
}


function trace(text) {
    global.log("[TraficRATP] " + text);
}

function updateMessage(json) {
    if (json != null) {
        if (lastStatus !== json.response.slug) {
            _indicator.changeIconStatus(json.response.slug);
            let debug = "";//  (" + compteur + ") - date : " + new Date();
            let locale = 'fr';
            let dd = Moment.moment(json._meta.date).locale(locale).format('llll'); // December 21st 2016, 5:46:27 pm
            _indicator.setMessage(dd + "\n-" + "\nTrafic ligne " + currentLine + " : " + json.response.title + "\n" + json.response.message + debug);
        }

        lastStatus = "line_" + currentLine + "_" + json.response.slug;

    } else {
        _indicator.changeIconStatus("");
        _indicator.setMessage(null);
    }
}

function updateStatus() {
    settings = Convenience.getSettings();
    currentLine = settings.get_string('line');
    let lineType = settings.get_string('line-type');
    trace("call RatpAPI begin...");
    RatpAPI.getTraffic(lineType, currentLine, updateMessage);
    trace("call RatpAPI end.");
    return true;
}

function mainloopStop() {
    if (mainloop) {
        Mainloop.source_remove(mainloop);
        this.mainloop = null;
    }
}

// Triggered when extension has been initialized
function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

    Convenience.initTranslations();

}

// The ratp indicator
let _indicator;

// Triggered when extension is enabled
function enable() {
    _indicator = new TrafficRatpMenu.TrafficRatpMenu(updateStatus);
    Main.panel.addToStatusArea('traffic-ratp-menu', _indicator);
    updateStatus();
    mainloopInit();
}

// Triggered when extension is disabled
function disable() {
    mainloopStop();
    _indicator.destroy();
}